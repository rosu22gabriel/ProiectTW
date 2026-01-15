import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import MDEditor from '@uiw/react-md-editor';
import {
  deleteNote,
  getNotes,
  getSubjects,
  getTags,
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
        setSelectedNote(updated || null);
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
    setSelectedNote({ ...note });
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
      });
      setNotes((prev) => prev.map((note) => (note.noteId === updated.noteId ? updated : note)));
      setSelectedNote((prev) => (prev ? { ...prev, ...updated } : prev));
    } catch (err) {
      setError(err.message || 'Nu s-a putut actualiza notita.');
    } finally {
      setSaving(false);
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
          <div className="notes-grid">
            {notes.map((note) => (
              <article
                className={`note-card ${selectedNote?.noteId === note.noteId ? 'active' : ''}`}
                key={note.noteId}
                onClick={() => onSelect(note)}
              >
                <div className="note-meta">
                  {note.subject?.name || (note.subjectId ? `Subject ${note.subjectId}` : 'General')}
                </div>
                <h3>{note.title}</h3>
                <p>{note.content?.slice(0, 120) || ''}</p>
                <div className="tag-row">
                  {(note.tags || []).map((tag) => (
                    <span key={tag.tagId} className="tag-pill">
                      {tag.name}
                    </span>
                  ))}
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
                </div>
                <MDEditor
                  value={selectedNote.content}
                  onChange={(value) =>
                    setSelectedNote((prev) => ({ ...prev, content: value || '' }))
                  }
                  height={220}
                  preview="edit"
                />
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
    </section>
  );
}

export default NotesList;
