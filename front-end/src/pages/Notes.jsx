import { useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import {
  createNote,
  getNotes,
  getSharedByMe,
  getSharedNotes,
  createSubject,
  createTag,
  getSubjects,
  getTags,
  revokeShare,
  fetchWikipediaSummary,
  shareNote,
} from '../api.js';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [sharedByMe, setSharedByMe] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [shareUserId, setShareUserId] = useState('');
  const [shareNoteId, setShareNoteId] = useState('');
  const [saving, setSaving] = useState(false);
  const [shareError, setShareError] = useState('');
  const [revokeError, setRevokeError] = useState('');
  const [revokeInfo, setRevokeInfo] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [subjectDescription, setSubjectDescription] = useState('');
  const [tagName, setTagName] = useState('');
  const [manageError, setManageError] = useState('');
  const [manageInfo, setManageInfo] = useState('');
  const [wikiTitle, setWikiTitle] = useState('');
  const [wikiLoading, setWikiLoading] = useState(false);
  const [wikiError, setWikiError] = useState('');

  useEffect(() => {
    let isMounted = true;
    Promise.all([getNotes(), getSharedNotes(), getSharedByMe(), getSubjects(), getTags()])
      .then(([own, shared, sharedMine, subjectsData, tagsData]) => {
        if (isMounted) {
          setNotes(own || []);
          setSharedNotes(shared || []);
          setSharedByMe(sharedMine || []);
          setSubjects(subjectsData || []);
          setTags(tagsData || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Nu s-au putut incarca notitele.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
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

  const onShare = async () => {
    setShareError('');
    const noteId = Number.parseInt(shareNoteId, 10);
    const userId = Number.parseInt(shareUserId, 10);
    if (!noteId || !userId) {
      setShareError('Selectati o notita si un userId valid.');
      return;
    }
    if (userId <= 0) {
      setShareError('userId invalid.');
      return;
    }
    try {
      await shareNote(noteId, userId);
      setShareNoteId('');
      setShareUserId('');
    } catch (err) {
      setShareError(err.message || 'Nu s-a putut partaja notita.');
    }
  };

  const onRevoke = async (noteId, userId) => {
    setRevokeError('');
    setRevokeInfo('');
    try {
      await revokeShare(noteId, userId);
      setSharedByMe((prev) =>
        prev.map((note) =>
          note.noteId === noteId
            ? { ...note, users: note.users.filter((user) => user.userId !== userId) }
            : note,
        ),
      );
      setRevokeInfo('Partajarea a fost revocata.');
    } catch (err) {
      setRevokeError(err.message || 'Nu s-a putut revoca partajarea.');
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

  return (
    <section className="page" data-color-mode="light">
      <header className="page-header">
        <div>
          <h1>Notes</h1>
          <p>Capture and organize your coursework.</p>
        </div>
        <button className="primary" type="button" onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save note'}
        </button>
      </header>
      <div className="notes-editor">
        <div>
          <h2>Quick draft</h2>
          <p className="muted">Write in markdown to capture class notes.</p>
        </div>
        <input
          className="notes-title"
          placeholder="Note title"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
        />
        <div className="notes-selectors">
          <select value={subjectId} onChange={(event) => setSubjectId(event.target.value)}>
            <option value="">Select subject</option>
            {subjects.map((subject) => (
              <option key={subject.subjectId} value={subject.subjectId}>
                {subject.name}
              </option>
            ))}
          </select>
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
        <MDEditor value={draft} onChange={setDraft} height={260} preview="edit" />
        <div className="notes-actions">
          <button className="primary" type="button" onClick={onSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save note'}
          </button>
        </div>
      </div>
      <section className="external-panel">
        <h2>Import from Wikipedia</h2>
        <div className="share-row">
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
      </section>
      <section className="manage-panel">
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
      {loading && <div className="page-info">Loading notes...</div>}
      {error && <div className="page-error">{error}</div>}
      {!loading && !error && notes.length === 0 && (
        <div className="page-empty">No notes yet.</div>
      )}
      <div className="notes-grid">
        {notes.map((note) => (
          <article className="note-card" key={note.noteId}>
            <div className="note-meta">{note.subjectId ? `Subject ${note.subjectId}` : 'General'}</div>
            <h3>{note.title}</h3>
            <p>{note.content?.slice(0, 140) || ''}</p>
          </article>
        ))}
      </div>
      <section className="share-panel">
        <h2>Share a note</h2>
        <div className="share-row">
          <select value={shareNoteId} onChange={(event) => setShareNoteId(event.target.value)}>
            <option value="">Select note</option>
            {notes.map((note) => (
              <option key={note.noteId} value={note.noteId}>
                {note.title}
              </option>
            ))}
          </select>
          <input
            type="number"
            min="1"
            placeholder="User ID"
            value={shareUserId}
            onChange={(event) => setShareUserId(event.target.value)}
          />
          <button className="ghost" type="button" onClick={onShare}>
            Share
          </button>
        </div>
        {shareError && <div className="page-error">{shareError}</div>}
      </section>
      <section className="shared-notes">
        <h2>Shared with you</h2>
        {sharedNotes.length === 0 ? (
          <div className="page-empty">No shared notes yet.</div>
        ) : (
          <div className="notes-grid">
            {sharedNotes.map((note) => (
              <article className="note-card" key={`shared-${note.noteId}`}>
                <div className="note-meta">Shared</div>
                <h3>{note.title}</h3>
                <p>{note.content?.slice(0, 140) || ''}</p>
              </article>
            ))}
          </div>
        )}
      </section>
      <section className="shared-notes">
        <h2>Shared by you</h2>
        {sharedByMe.length === 0 ? (
          <div className="page-empty">No notes shared by you.</div>
        ) : (
          <div className="notes-grid">
            {sharedByMe.map((note) => (
              <article className="note-card" key={`shared-by-me-${note.noteId}`}>
                <div className="note-meta">Shared by you</div>
                <h3>{note.title}</h3>
                <p>{note.content?.slice(0, 140) || ''}</p>
                <div className="share-users">
                  {(note.users || []).length === 0 && <span>No recipients</span>}
                  {(note.users || []).map((user) => (
                    <button
                      key={user.userId}
                      type="button"
                      className="ghost"
                      onClick={() => onRevoke(note.noteId, user.userId)}
                    >
                      Revoke {user.username || user.userId}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
        {revokeError && <div className="page-error">{revokeError}</div>}
        {revokeInfo && <div className="page-info">{revokeInfo}</div>}
      </section>
    </section>
  );
}

export default Notes;
