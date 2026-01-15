import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import {
  deleteNote,
  getNotes,
  getSubjects,
  getTags,
  createSubject,
  createTag,
  fetchWikipediaSummary,
  updateNote,
} from '../api.js';

function NotesList() {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [selectedNote, setSelectedNote] = useState(null);
  const [filterSubject, setFilterSubject] = useState('');
  const [filterTag, setFilterTag] = useState('');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [newSubject, setNewSubject] = useState('');
  const [newTag, setNewTag] = useState('');
  const [creatingSubject, setCreatingSubject] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);
  const [editAttachmentFile, setEditAttachmentFile] = useState(null);
  const [editAttachmentInfo, setEditAttachmentInfo] = useState('');
  const [editAttachmentError, setEditAttachmentError] = useState('');
  const [editUploading, setEditUploading] = useState(false);
  const [wikiTitle, setWikiTitle] = useState('');
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiError, setWikiError] = useState('');
  const [viewNote, setViewNote] = useState(null);

  const buildTagLabel = (noteTags) => {
    if (!noteTags || noteTags.length === 0) {
      return '';
    }
    return noteTags.map((tag) => tag.name).join(', ');
  };

  const toEditableNote = (note) => {
    if (!note) return null;
    return {
      ...note,
      tagIds: (note.tags || []).map((tag) => tag.tagId),
    };
  };

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
        if (isMounted) setError(err.message || 'Nu s-au putut incarca filtrele.');
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

  useEffect(() => {
    if (!viewNote) return;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = '';
    };
  }, [viewNote]);

  const loadNotes = async () => {
    setError('');
    setLoading(true);
    try {
      const data = await getNotes({
        subjectId: filterSubject || undefined,
        tagId: filterTag || undefined,
        q: search || undefined,
        includeSubject: true,
        includeTags: true,
      });
      setNotes(data || []);
      if (selectedNote) {
        const updated = data.find((note) => note.noteId === selectedNote.noteId);
        setSelectedNote(toEditableNote(updated));
      }
    } catch (err) {
      setError(err.message || 'Nu s-au putut incarca notitele.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotes();
  }, [filterSubject, filterTag, search]);

  const onSelect = (note) => {
    setSelectedNote(toEditableNote(note));
  };

  const onToggleTag = (tagId) => {
    setSelectedNote((prev) => {
      if (!prev) return prev;
      const currentIds = prev.tagIds || [];
      const nextIds = currentIds.includes(tagId)
        ? currentIds.filter((id) => id !== tagId)
        : [...currentIds, tagId];
      return { ...prev, tagIds: nextIds };
    });
  };

  const onUpdate = async () => {
    if (!selectedNote) return;
    setError('');
    if (!selectedNote.title?.trim() || !selectedNote.content?.trim()) {
      setError('Titlul si continutul sunt obligatorii.');
      return;
    }
    try {
      setSaving(true);
      const updated = await updateNote(selectedNote.noteId, {
        title: selectedNote.title,
        content: selectedNote.content,
        subjectId: selectedNote.subjectId || null,
        tagIds: selectedNote.tagIds || [],
      });
      const resolvedTags = (selectedNote.tagIds || [])
        .map((id) => tags.find((tag) => tag.tagId === id))
        .filter(Boolean);
      const resolvedSubject = subjects.find(
        (subject) => subject.subjectId === selectedNote.subjectId
      );
      const updatedNote = {
        ...selectedNote,
        ...updated,
        subject: resolvedSubject,
        tags: resolvedTags,
      };
      setNotes((prev) =>
        prev.map((note) => (note.noteId === updated.noteId ? updatedNote : note))
      );
      setSelectedNote(toEditableNote(updatedNote));
    } catch (err) {
      setError(err.message || 'Nu s-a putut actualiza notita.');
    } finally {
      setSaving(false);
    }
  };

  const onCreateSubject = async () => {
    const name = newSubject.trim();
    if (!name) return;
    setError('');
    try {
      setCreatingSubject(true);
      const created = await createSubject({ name });
      setSubjects((prev) => [...prev, created]);
      setNewSubject('');
      setSelectedNote((prev) =>
        prev ? { ...prev, subjectId: created.subjectId } : prev
      );
    } catch (err) {
      setError(err.message || 'Nu s-a putut crea materia.');
    } finally {
      setCreatingSubject(false);
    }
  };

  const onCreateTag = async () => {
    const name = newTag.trim();
    if (!name) return;
    setError('');
    try {
      setCreatingTag(true);
      const created = await createTag({ name });
      setTags((prev) => [...prev, created]);
      setNewTag('');
    } catch (err) {
      setError(err.message || 'Nu s-a putut crea tag-ul.');
    } finally {
      setCreatingTag(false);
    }
  };

  const onDelete = async () => {
    if (!selectedNote) return;
    setError('');
    try {
      await deleteNote(selectedNote.noteId);
      setNotes((prev) => prev.filter((note) => note.noteId !== selectedNote.noteId));
      setSelectedNote(null);
    } catch (err) {
      setError(err.message || 'Nu s-a putut sterge notita.');
    }
  };

  const getImageDataUrl = (file) =>
    new Promise((resolve, reject) => {
      console.log('[notes-edit] read image start', { name: file?.name, size: file?.size, type: file?.type });
      const reader = new FileReader();
      reader.onload = () => {
        console.log('[notes-edit] read image success', { name: file?.name, size: file?.size });
        resolve(reader.result);
      };
      reader.onerror = () => {
        console.error('[notes-edit] read image error', reader.error);
        reject(new Error('Nu s-a putut citi imaginea.'));
      };
      reader.readAsDataURL(file);
    });

  const compressImage = (dataUrl, maxSize = 1280, quality = 0.8) =>
    new Promise((resolve, reject) => {
      console.log('[notes-edit] compress image start', { maxSize, quality });
      const img = new Image();
      img.onload = () => {
        console.log('[notes-edit] compress image loaded', { width: img.width, height: img.height });
        const scale = Math.min(1, maxSize / Math.max(img.width, img.height));
        const width = Math.round(img.width * scale);
        const height = Math.round(img.height * scale);
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          console.error('[notes-edit] compress image error: no ctx');
          reject(new Error('Nu s-a putut procesa imaginea.'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);
        const output = canvas.toDataURL('image/jpeg', quality);
        console.log('[notes-edit] compress image done', { width, height, length: output?.length });
        resolve(output);
      };
      img.onerror = () => {
        console.error('[notes-edit] compress image error: load fail');
        reject(new Error('Nu s-a putut procesa imaginea.'));
      };
      img.src = dataUrl;
    });

  const onUploadEditAttachment = async () => {
    setEditAttachmentError('');
    setEditAttachmentInfo('');
    if (!selectedNote?.noteId) {
      setEditAttachmentError('Selectati o notita mai intai.');
      return;
    }
    if (!editAttachmentFile) {
      setEditAttachmentError('Selectati un fisier.');
      return;
    }
    if (!editAttachmentFile.type.startsWith('image/')) {
      setEditAttachmentError('Sunt permise doar imagini.');
      return;
    }
    if (editAttachmentFile.size > 5 * 1024 * 1024) {
      setEditAttachmentError('Imaginea este prea mare (max 5MB).');
      return;
    }
    try {
      setEditUploading(true);
      console.log('[notes-edit] add image start', { name: editAttachmentFile.name, size: editAttachmentFile.size });
      const dataUrl = await getImageDataUrl(editAttachmentFile);
      const finalDataUrl =
        editAttachmentFile.size <= 500 * 1024 ? dataUrl : await compressImage(dataUrl);
      const snippet = `\n\n![${editAttachmentFile.name}](${finalDataUrl})\n`;
      setSelectedNote((prev) =>
        prev ? { ...prev, content: `${prev.content || ''}${snippet}` } : prev
      );
      setEditAttachmentFile(null);
      setEditAttachmentInfo('Imaginea a fost adaugata in notita.');
      console.log('[notes-edit] add image done', { length: finalDataUrl?.length });
    } catch (err) {
      console.error('[notes-edit] add image error', err);
      setEditAttachmentError(err.message || 'Nu s-a putut adauga imaginea.');
    } finally {
      setEditUploading(false);
    }
  };

  const onImportWiki = async () => {
    setWikiError('');
    if (!selectedNote) {
      setWikiError('Selectati o notita mai intai.');
      return;
    }
    if (!wikiTitle.trim()) {
      setWikiError('Introduceti un titlu Wikipedia.');
      return;
    }
    try {
      setWikiLoading(true);
      const data = await fetchWikipediaSummary(wikiTitle.trim());
      const snippet = `\n\n# ${data.title}\n\n${data.extract}\n\nSursa: ${data.url}\n`;
      setSelectedNote((prev) =>
        prev ? { ...prev, content: `${prev.content || ''}${snippet}` } : prev
      );
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
          <h1>Notes</h1>
          <p>Vizualizeaza si organizeaza notitele existente.</p>
        </div>
        <Link className="primary" to="/notes/new">
          Create note
        </Link>
      </header>

      <section className="section-card">
        <h2>Filters</h2>
        <div className="filters-row">
          <input
            type="text"
            placeholder="Search by title"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <select value={filterSubject} onChange={(event) => setFilterSubject(event.target.value)}>
            <option value="">All subjects</option>
            {subjects.map((subject) => (
              <option key={subject.subjectId} value={subject.subjectId}>
                {subject.name}
              </option>
            ))}
          </select>
          <select value={filterTag} onChange={(event) => setFilterTag(event.target.value)}>
            <option value="">All tags</option>
            {tags.map((tag) => (
              <option key={tag.tagId} value={tag.tagId}>
                {tag.name}
              </option>
            ))}
          </select>
          <button className="ghost" type="button" onClick={loadNotes}>
            Apply
          </button>
        </div>
        {loading && <div className="page-info">Loading notes...</div>}
        {error && <div className="page-error">{error}</div>}
      </section>

      <div className="notes-layout">
        <div className="section-card">
          <h2>Your notes</h2>
          <div className="notes-grid notes-grid--compact">
            {notes.map((note) => (
              <article
                className={`note-card ${selectedNote?.noteId === note.noteId ? 'active' : ''}`}
                key={note.noteId}
                onClick={() => onSelect(note)}
              >
                <div className="note-meta">
                  <span className="note-subject">
                    {note.subject?.name ||
                      (note.subjectId ? `Subject ${note.subjectId}` : 'General')}
                  </span>
                  {note.tags?.length > 0 && (
                    <span className="note-tags">- {buildTagLabel(note.tags)}</span>
                  )}
                </div>
                <h3>{note.title}</h3>
                <div className="note-preview">
                  <MDEditor.Markdown source={note.content || ''} />
                </div>
                <div className="note-actions">
                  <button
                    className="ghost"
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      setViewNote(note);
                    }}
                  >
                    View note
                  </button>
                </div>
              </article>
            ))}
          </div>
          {!loading && notes.length === 0 && <div className="page-empty">No notes found.</div>}
        </div>

        <div className="side-panel">
          <div className="section-card">
            <h2>Edit note</h2>
            {!selectedNote && <div className="page-empty">Select a note to edit.</div>}
            {selectedNote && (
              <>
                <div className="field">
                  <label>Title</label>
                  <input
                    value={selectedNote.title}
                    onChange={(event) =>
                      setSelectedNote((prev) => ({ ...prev, title: event.target.value }))
                    }
                  />
                </div>
                <div className="field">
                  <label>Subject</label>
                  <div className="inline-inputs">
                    <select
                      value={selectedNote.subjectId || ''}
                      onChange={(event) =>
                        setSelectedNote((prev) => ({
                          ...prev,
                          subjectId: event.target.value ? Number(event.target.value) : null,
                        }))
                      }
                    >
                      <option value="">General</option>
                      {subjects.map((subject) => (
                        <option key={subject.subjectId} value={subject.subjectId}>
                          {subject.name}
                        </option>
                      ))}
                    </select>
                    <input
                      value={newSubject}
                      onChange={(event) => setNewSubject(event.target.value)}
                      placeholder="Materie noua"
                    />
                    <button
                      className="ghost"
                      type="button"
                      onClick={onCreateSubject}
                      disabled={creatingSubject}
                    >
                      {creatingSubject ? 'Adding...' : 'Add'}
                    </button>
                  </div>
                </div>
                <div className="field">
                  <label>Tags</label>
                  <div className="inline-inputs">
                    <input
                      value={newTag}
                      onChange={(event) => setNewTag(event.target.value)}
                      placeholder="Tag nou"
                    />
                    <button
                      className="ghost"
                      type="button"
                      onClick={onCreateTag}
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
                          checked={(selectedNote.tagIds || []).includes(tag.tagId)}
                          onChange={() => onToggleTag(tag.tagId)}
                        />
                        <span>{tag.name}</span>
                      </label>
                    ))}
                    {tags.length === 0 && <span className="muted">No tags available.</span>}
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
                    value={selectedNote.content}
                    onChange={(value) =>
                      setSelectedNote((prev) => ({ ...prev, content: value || '' }))
                    }
                    height={isFullscreen ? 560 : 280}
                    preview="edit"
                  />
                </div>
                <div className="field attachment-field">
                  <label>Imagine in notita (doar imagini, max 5MB)</label>
                  <div className="attachment-row">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => setEditAttachmentFile(event.target.files?.[0] || null)}
                    />
                    <button
                      className="ghost"
                      type="button"
                      onClick={onUploadEditAttachment}
                      disabled={editUploading}
                    >
                      {editUploading ? 'Adding...' : 'Add image'}
                    </button>
                  </div>
                  {editAttachmentError && <div className="page-error">{editAttachmentError}</div>}
                  {!editAttachmentError && (
                    <div className="page-info">Imaginile mari sunt comprimate automat.</div>
                  )}
                  {editAttachmentInfo && <div className="page-info">{editAttachmentInfo}</div>}
                </div>
                <div className="field attachment-field">
                  <label>Import extern</label>
                  <div className="attachment-row">
                    <input
                      type="text"
                      placeholder="Wikipedia title"
                      value={wikiTitle}
                      onChange={(event) => setWikiTitle(event.target.value)}
                    />
                    <button
                      className="ghost"
                      type="button"
                      onClick={onImportWiki}
                      disabled={wikiLoading}
                    >
                      {wikiLoading ? 'Importing...' : 'Import'}
                    </button>
                  </div>
                  {wikiError && <div className="page-error">{wikiError}</div>}
                </div>
                <div className="notes-actions">
                  <button className="primary" type="button" onClick={onUpdate} disabled={saving}>
                    {saving ? 'Saving...' : 'Save changes'}
                  </button>
                  <button className="ghost" type="button" onClick={onDelete}>
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      {viewNote && (
        <div className="modal-backdrop" onClick={() => setViewNote(null)}>
          <div className="modal-content" onClick={(event) => event.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h2>{viewNote.title}</h2>
                <p className="muted">
                  {viewNote.subject?.name ||
                    (viewNote.subjectId ? `Subject ${viewNote.subjectId}` : 'General')}
                </p>
              </div>
              <button className="ghost" type="button" onClick={() => setViewNote(null)}>
                Close
              </button>
            </div>
            <div className="modal-body">
              <MDEditor.Markdown source={viewNote.content || ''} />
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default NotesList;
