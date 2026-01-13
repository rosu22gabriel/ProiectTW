import { useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import { getNotes } from '../api.js';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    let isMounted = true;
    getNotes()
      .then((data) => {
        if (isMounted) {
          setNotes(data || []);
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

  return (
    <section className="page" data-color-mode="light">
      <header className="page-header">
        <div>
          <h1>Notes</h1>
          <p>Capture and organize your coursework.</p>
        </div>
        <button className="primary">New note</button>
      </header>
      <div className="notes-editor">
        <div>
          <h2>Quick draft</h2>
          <p className="muted">Write in markdown to capture class notes.</p>
        </div>
        <MDEditor value={draft} onChange={setDraft} height={260} preview="edit" />
      </div>
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
    </section>
  );
}

export default Notes;
