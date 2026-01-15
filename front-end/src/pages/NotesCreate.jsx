import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import {
  createAttachment,
  createNote,
  createSubject,
  createTag,
  fetchWikipediaSummary,
  getAttachmentsMetadata,
  getNotes,
  getSubjects,
  getTags,
} from '../api.js';

function NotesCreate() {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [draft, setDraft] = useState('');
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [tagName, setTagName] = useState('');
  const [manageError, setManageError] = useState('');
  const [manageInfo, setManageInfo] = useState('');
  const [wikiTitle, setWikiTitle] = useState('');
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiError, setWikiError] = useState('');
  const [attachmentFile, setAttachmentFile] = useState(null);
  const [attachmentNoteId, setAttachmentNoteId] = useState('');
  const [attachmentInfo, setAttachmentInfo] = useState('');
  const [attachmentError, setAttachmentError] = useState('');

  useEffect(() => {
    let isMounted = true;
    Promise.all([getNotes(), getSubjects(), getTags(), getAttachmentsMetadata()])
      .then(([notesData, subjectsData, tagsData, attachmentsData]) => {
        if (isMounted) {
          setNotes(notesData || []);
          setSubjects(subjectsData || []);
          setTags(tagsData || []);
          setAttachments(attachmentsData || []);
        }
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Nu s-au putut incarca datele.');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const onSave = async () => {
    setError('');
    if (!title.trim() || !draft.trim()) {
      setError('Titlul si continutul sunt obligatorii.');
      return;
    }
    try {
      setSaving(true);
      const tagIds = selectedTags.map((value) => Number.parseInt(value, 10)).filter(Boolean);
      const created = await createNote({
        title: title.trim(),
        content: draft,
        subjectId: subjectId ? Number.parseInt(subjectId, 10) : undefined,
        tagIds,
      });
      setNotes((prev) => [created, ...prev]);
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

  const onCreateSubject = async () => {
    setManageError('');
    setManageInfo('');
    if (!subjectName.trim() || !subjectDescription.trim()) {
      setManageError('Numele si descrierea materiei sunt obligatorii.');
      return;
    }
    try {
      const created = await createSubject({
        name: subjectName.trim(),
        description: subjectDescription.trim(),
      });
      setSubjects((prev) => [...prev, created]);
      setSubjectName('');
      setSubjectDescription('');
      setManageInfo('Materia a fost adaugata.');
    } catch (err) {
      setManageError(err.message || 'Nu s-a putut crea materia.');
    }
  };

  const onCreateTag = async () => {
    setManageError('');
    setManageInfo('');
    if (!tagName.trim()) {
      setManageError('Numele etichetei este obligatoriu.');
      return;
    }
    try {
      const created = await createTag({ name: tagName.trim() });
      setTags((prev) => [...prev, created]);
      setTagName('');
      setManageInfo('Eticheta a fost adaugata.');
    } catch (err) {
      setManageError(err.message || 'Nu s-a putut crea eticheta.');
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

  const onUploadAttachment = async () => {
    setAttachmentError('');
    setAttachmentInfo('');
    const noteId = Number.parseInt(attachmentNoteId, 10);
    if (!noteId) {
      setAttachmentError('Selectati o notita valida.');
      return;
    }
    if (!attachmentFile) {
      setAttachmentError('Selectati un fisier.');
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const base64 = reader.result.split(',')[1];
        const created = await createAttachment({
          noteId,
          filename: attachmentFile.name,
          mimeType: attachmentFile.type || 'application/octet-stream',
          dataBase64: base64,
        });
        setAttachments((prev) => [created, ...prev]);
        setAttachmentFile(null);
        setAttachmentNoteId('');
        setAttachmentInfo('Atasamentul a fost incarcat.');
      } catch (err) {
        setAttachmentError(err.message || 'Nu s-a putut incarca atasamentul.');
      }
    };
    reader.readAsDataURL(attachmentFile);
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
      <div className="notes-layout">
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
          <div className="notes-selectors">
            <div className="field">
              <label>Materie</label>
              <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
                <option value="">Select subject</option>
                {subjects.map((subject) => (
                  <option key={subject.subjectId} value={subject.subjectId}>
                    {subject.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Etichete</label>
              <select
                multiple
                value={selectedTags}
                onChange={(event) =>
                  setSelectedTags(Array.from(event.target.selectedOptions, (opt) => opt.value))
                }
              >
                {tags.map((tag) => (
                  <option key={tag.tagId} value={tag.tagId}>
                    {tag.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <MDEditor value={draft} onChange={setDraft} height={260} preview="edit" />
          <div className="notes-actions">
            <button className="primary" type="button" onClick={onSave} disabled={saving}>
              {saving ? 'Saving...' : 'Save note'}
            </button>
          </div>
          {error && <div className="page-error">{error}</div>}
        </div>
        <div className="side-panel">
          <div className="section-card">
            <h3>Import extern</h3>
            <p className="muted">Adauga rapid un rezumat Wikipedia.</p>
            <div className="external-row">
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
          <div className="section-card">
            <h3>Attachments</h3>
            <div className="field">
              <label>Notita</label>
              <select
                value={attachmentNoteId}
                onChange={(event) => setAttachmentNoteId(event.target.value)}
              >
                <option value="">Select note</option>
                {notes.map((note) => (
                  <option key={note.noteId} value={note.noteId}>
                    {note.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Fisier</label>
              <input type="file" onChange={(event) => setAttachmentFile(event.target.files?.[0] || null)} />
            </div>
            <button className="ghost" type="button" onClick={onUploadAttachment}>
              Upload
            </button>
            {attachmentError && <div className="page-error">{attachmentError}</div>}
            {attachmentInfo && <div className="page-info">{attachmentInfo}</div>}
          </div>
        </div>
      </div>
      <section className="section-card">
        <h2>Manage subjects & tags</h2>
        <div className="manage-grid">
          <div>
            <h3>Add subject</h3>
            <input
              type="text"
              placeholder="Subject name"
              value={subjectName}
              onChange={(event) => setSubjectName(event.target.value)}
            />
            <input
              type="text"
              placeholder="Description"
              value={subjectDescription}
              onChange={(event) => setSubjectDescription(event.target.value)}
            />
            <button className="ghost" type="button" onClick={onCreateSubject}>
              Add subject
            </button>
          </div>
          <div>
            <h3>Add tag</h3>
            <input
              type="text"
              placeholder="Tag name"
              value={tagName}
              onChange={(event) => setTagName(event.target.value)}
            />
            <button className="ghost" type="button" onClick={onCreateTag}>
              Add tag
            </button>
          </div>
        </div>
        {manageError && <div className="page-error">{manageError}</div>}
        {manageInfo && <div className="page-info">{manageInfo}</div>}
      </section>
      <section className="section-card">
        <h2>Attachments</h2>
        <div className="attachments-grid">
          {attachments.map((attachment) => (
            <div key={attachment.attachmentId} className="note-card">
              <h3>{attachment.filename}</h3>
              <p>{attachment.mimeType}</p>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

export default NotesCreate;
