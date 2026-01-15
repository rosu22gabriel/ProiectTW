import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import {
  createNote,
  createSubject,
  createTag,
  fetchWikipediaSummary,
  getSubjects,
  getTags,
} from '../api.js';

function NotesCreate() {
  const [subjects, setSubjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [draft, setDraft] = useState('');
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [newSubjectName, setNewSubjectName] = useState('');
  const [newTagName, setNewTagName] = useState('');
  const [creatingSubject, setCreatingSubject] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [editorAttachmentFile, setEditorAttachmentFile] = useState(null);
  const [editorAttachmentInfo, setEditorAttachmentInfo] = useState('');
  const [editorAttachmentError, setEditorAttachmentError] = useState('');
  const [editorUploading, setEditorUploading] = useState(false);
  const [wikiTitle, setWikiTitle] = useState('');
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiError, setWikiError] = useState('');

  useEffect(() => {
    let isMounted = true;
    Promise.all([getSubjects(), getTags()])
      .then(([subjectsData, tagsData]) => {
        if (isMounted) {
          setSubjects(subjectsData || []);
          setTags(tagsData || []);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Nu s-au putut incarca datele.');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isFullscreen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [isFullscreen]);

  const onSave = async () => {
    setError('');
    if (!title.trim() || !draft.trim()) {
      setError('Titlul si continutul sunt obligatorii.');
      return;
    }
    try {
      setSaving(true);
      const created = await createNote({
        title: title.trim(),
        content: draft,
        subjectId: subjectId ? Number.parseInt(subjectId, 10) : undefined,
        tagIds: selectedTags,
      });
      setTitle('');
      setDraft('');
      setSubjectId('');
      setSelectedTags([]);
    } catch (err) {
      setError(err.message || 'Nu s-a putut salva notita.');
    } finally {
      setSaving(false);
    }
  };

  const getImageDataUrl = (file) =>
    new Promise((resolve, reject) => {
      console.log('[notes-create] read image start', { name: file?.name, size: file?.size, type: file?.type });
      const reader = new FileReader();
      reader.onload = () => {
        console.log('[notes-create] read image success', { name: file?.name, size: file?.size });
        resolve(reader.result);
      };
      reader.onerror = () => {
        console.error('[notes-create] read image error', reader.error);
        reject(new Error('Nu s-a putut citi imaginea.'));
      };
      reader.readAsDataURL(file);
    });

  const compressImage = (dataUrl, maxSize = 1280, quality = 0.8) =>
    new Promise((resolve, reject) => {
      console.log('[notes-create] compress image start', { maxSize, quality });
      const img = new Image();
      img.onload = () => {
        console.log('[notes-create] compress image loaded', { width: img.width, height: img.height });
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('[notes-create] compress image error: no ctx');
          reject(new Error('Nu s-a putut procesa imaginea.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const output = canvas.toDataURL('image/jpeg', quality);
        console.log('[notes-create] compress image done', { width, height, length: output?.length });
        resolve(output);
      };
      img.onerror = () => {
        console.error('[notes-create] compress image error: load fail');
        reject(new Error('Nu s-a putut procesa imaginea.'));
      };
      img.src = dataUrl;
    });

  const onUploadEditorAttachment = async () => {
    setEditorAttachmentError('');
    setEditorAttachmentInfo('');
    if (!editorAttachmentFile) {
      setEditorAttachmentError('Selectati un fisier.');
      return;
    }
    if (!editorAttachmentFile.type.startsWith('image/')) {
      setEditorAttachmentError('Sunt permise doar imagini.');
      return;
    }
    if (editorAttachmentFile.size > 5 * 1024 * 1024) {
      setEditorAttachmentError('Imaginea este prea mare (max 5MB).');
      return;
    }
    try {
      setEditorUploading(true);
      console.log('[notes-create] add image start', { name: editorAttachmentFile.name, size: editorAttachmentFile.size });
      const dataUrl = await getImageDataUrl(editorAttachmentFile);
      const finalDataUrl =
        editorAttachmentFile.size <= 500 * 1024 ? dataUrl : await compressImage(dataUrl);
      const snippet = `\n\n![${editorAttachmentFile.name}](${finalDataUrl})\n`;
      setDraft((prev) => `${prev}${snippet}`);
      setEditorAttachmentFile(null);
      setEditorAttachmentInfo('Imaginea a fost adaugata in notita.');
      console.log('[notes-create] add image done', { length: finalDataUrl?.length });
    } catch (err) {
      console.error('[notes-create] add image error', err);
      setEditorAttachmentError(err.message || 'Nu s-a putut adauga imaginea.');
    } finally {
      setEditorUploading(false);
    }
  };

  const onToggleTag = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((id) => id !== tagId) : [...prev, tagId]
    );
  };

  const onCreateSubjectInline = async () => {
    const name = newSubjectName.trim();
    if (!name) return;
    setError('');
    try {
      setCreatingSubject(true);
      const created = await createSubject({ name });
      setSubjects((prev) => [...prev, created]);
      setNewSubjectName('');
      setSubjectId(String(created.subjectId));
    } catch (err) {
      setError(err.message || 'Nu s-a putut crea materia.');
    } finally {
      setCreatingSubject(false);
    }
  };

  const onCreateTagInline = async () => {
    const name = newTagName.trim();
    if (!name) return;
    setError('');
    try {
      setCreatingTag(true);
      const created = await createTag({ name });
      setTags((prev) => [...prev, created]);
      setNewTagName('');
      setSelectedTags((prev) => [...prev, created.tagId]);
    } catch (err) {
      setError(err.message || 'Nu s-a putut crea eticheta.');
    } finally {
      setCreatingTag(false);
    }
  };

  const onImportWiki = async () => {
    setWikiError('');
    if (!wikiTitle.trim()) {
      setWikiError('Introduceti un titlu Wikipedia.');
      return;
    }
    try {
      setWikiLoading(true);
      const data = await fetchWikipediaSummary(wikiTitle.trim());
      const snippet = `\n\n# ${data.title}\n\n${data.extract}\n\nSursa: ${data.url}\n`;
      setDraft((prev) => `${prev}${snippet}`);
      setWikiTitle('');
    } catch (err) {
      setWikiError(err.message || 'Nu s-a putut importa continutul.');
    } finally {
      setWikiLoading(false);
    }
  };

  return (
    <section className="page" data-color-mode="light">
      <header className="page-header">
        <div>
          <h1>Create note</h1>
          <p>Adauga o notita noua si organizeaz-o imediat.</p>
        </div>
        <Link className="ghost" to="/notes">
          Back to notes
        </Link>
      </header>
      <div className="notes-layout notes-layout--create">
        <div className="section-card">
          <div className="section-header">
            <div>
              <h2>Editor</h2>
              <p className="muted">Scrie in markdown pentru notite clare.</p>
            </div>
          </div>
          <div className="field">
            <label htmlFor="note-title">Titlu</label>
            <input
              id="note-title"
              className="notes-title"
              placeholder="Note title"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
            />
          </div>
          <div className="notes-selectors notes-selectors--stacked">
            <div className="field">
              <label>Materie</label>
              <div className="inline-inputs">
                <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
                  <option value="">Select subject</option>
                  {subjects.map((subject) => (
                    <option key={subject.subjectId} value={subject.subjectId}>
                      {subject.name}
                    </option>
                  ))}
                </select>
                <input
                  value={newSubjectName}
                  onChange={(event) => setNewSubjectName(event.target.value)}
                  placeholder="Materie noua"
                />
                <button
                  className="ghost"
                  type="button"
                  onClick={onCreateSubjectInline}
                  disabled={creatingSubject}
                >
                  {creatingSubject ? 'Adding...' : 'Add'}
                </button>
              </div>
            </div>
            <div className="field">
              <label>Etichete</label>
              <div className="inline-inputs inline-inputs--compact">
                <input
                  value={newTagName}
                  onChange={(event) => setNewTagName(event.target.value)}
                  placeholder="Tag nou"
                />
                <button
                  className="ghost"
                  type="button"
                  onClick={onCreateTagInline}
                  disabled={creatingTag}
                >
                  {creatingTag ? 'Adding...' : 'Add'}
                </button>
              </div>
              <div className="tag-select">
                {tags.map((tag) => (
                  <label className="tag-check" key={tag.tagId}>
                    <input
                      type="checkbox"
                      checked={selectedTags.includes(tag.tagId)}
                      onChange={() => onToggleTag(tag.tagId)}
                    />
                    <span>{tag.name}</span>
                  </label>
                ))}
                {tags.length === 0 && <span className="muted">No tags available.</span>}
              </div>
            </div>
          </div>
          <div className={`editor-shell ${isFullscreen ? 'editor-shell--fullscreen' : ''}`}>
            <div className="editor-actions">
              <button
                className="ghost"
                type="button"
                onClick={() => setIsFullscreen((prev) => !prev)}
              >
                {isFullscreen ? 'Exit fullscreen' : 'Fullscreen'}
              </button>
            </div>
            <MDEditor
              value={draft}
              onChange={setDraft}
              height={isFullscreen ? 560 : 260}
              preview="edit"
            />
          </div>
          <div className="field attachment-field">
            <label>
              Imagine in notita (doar imagini, max 5MB, imaginile mari sunt comprimate automat)
            </label>
            <div className="attachment-row">
              <input
                type="file"
                accept="image/*"
                onChange={(event) => setEditorAttachmentFile(event.target.files?.[0] || null)}
              />
              <button
                className="ghost"
                type="button"
                onClick={onUploadEditorAttachment}
                disabled={editorUploading}
              >
                {editorUploading ? 'Adding...' : 'Add image'}
              </button>
            </div>
            {editorAttachmentError && <div className="page-error">{editorAttachmentError}</div>}
            {editorAttachmentInfo && <div className="page-info">{editorAttachmentInfo}</div>}
          </div>
          <div className="field attachment-field">
            <label>Import extern (Wikipedia)</label>
            <div className="attachment-row">
              <input
                type="text"
                placeholder="Wikipedia title"
                value={wikiTitle}
                onChange={(event) => setWikiTitle(event.target.value)}
              />
              <button className="ghost" type="button" onClick={onImportWiki} disabled={wikiLoading}>
                {wikiLoading ? 'Importing...' : 'Import'}
              </button>
            </div>
            {wikiError && <div className="page-error">{wikiError}</div>}
          </div>
          <div className="notes-actions">
            <button className="primary" type="button" onClick={onSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save note'}
            </button>
          </div>
          {error && <div className="page-error">{error}</div>}
        </div>
      </div>
    </section>
  );
}

export default NotesCreate;
