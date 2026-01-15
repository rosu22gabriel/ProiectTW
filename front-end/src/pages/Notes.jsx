import { useEffect, useState } from 'react';
import MDEditor from '@uiw/react-md-editor';
import {
  createAttachment,
  createNote,
  downloadAttachment,
  fetchWikipediaSummary,
  getAttachmentsMetadata,
  getNotes,
  getSharedByMe,
  getSharedNotes,
  getSubjects,
  getTags,
  revokeShare,
  shareNote,
  createSubject,
  createTag,
} from '../api.js';

function Notes() {
  const [notes, setNotes] = useState([]);
  const [sharedNotes, setSharedNotes] = useState([]);
  const [sharedByMe, setSharedByMe] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [attachments, setAttachments] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState('');
  const [title, setTitle] = useState('');
  const [subjectId, setSubjectId] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [shareUserId, setShareUserId] = useState('');
  const [shareEmail, setShareEmail] = useState('');
  const [shareNoteId, setShareNoteId] = useState('');
  const [saving, setSaving] = useState(false);
  const [shareError, setShareError] = useState('');
  const [revokeError, setRevokeError] = useState('');
  const [revokeInfo, setRevokeInfo] = useState('');
  const [subjectName, setSubjectName] = useState('');
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
    Promise.all([
      getNotes(),
      getSharedNotes(),
      getSharedByMe(),
      getSubjects(),
      getTags(),
      getAttachmentsMetadata(),
    ])
      .then(([own, shared, sharedMine, subjectsData, tagsData, attachmentsData]) => {
        if (isMounted) {
          setNotes(own || []);
          setSharedNotes(shared || []);
          setSharedByMe(sharedMine || []);
          setSubjects(subjectsData || []);
          setTags(tagsData || []);
          setAttachments(attachmentsData || []);
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
    const userId = shareUserId ? Number.parseInt(shareUserId, 10) : null;
    if (!noteId) {
      setShareError('Selectati o notita valida.');
      return;
    }
    if (shareEmail.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shareEmail.trim())) {
      setShareError('Email invalid.');
      return;
    }
    if (!shareEmail.trim() && (!userId || userId <= 0)) {
      setShareError('Introduceti email sau userId valid.');
      return;
    }
    try {
      const payload = shareEmail.trim()
        ? { email: shareEmail.trim() }
        : { sharedWithUserId: userId };
      await shareNote(noteId, payload);
      setShareNoteId('');
      setShareUserId('');
      setShareEmail('');
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
    if (!subjectName.trim()) {
      setManageError('Numele materiei este obligatoriu.');
      return;
    }
    try {
      const created = await createSubject({
        name: subjectName.trim(),
      });
      setSubjects((prev) => [...prev, created]);
      setSubjectName('');
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

  const onDownloadAttachment = async (attachment) => {
    try {
      const blob = await downloadAttachment(attachment.attachmentId);
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = attachment.filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      setAttachmentError(err.message || 'Nu s-a putut descarca atasamentul.');
    }
  };

  return (
    <section className="page" data-color-mode="light">
      <header className="page-header">
        <div>
          <h1>Notes</h1>
          <p>Scrie rapid, organiza pe materii si distribuie colegilor.</p>
        </div>
        <button className="primary" type="button" onClick={onSave} disabled={saving}>
          {saving ? 'Saving...' : 'Save note'}
        </button>
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
            <h3>Share note</h3>
            <div className="field">
              <label>Notita</label>
              <select value={shareNoteId} onChange={(event) => setShareNoteId(event.target.value)}>
                <option value="">Select note</option>
                {notes.map((note) => (
                  <option key={note.noteId} value={note.noteId}>
                    {note.title}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>User ID</label>
              <input
                type="number"
                min="1"
                placeholder="User ID"
                value={shareUserId}
                onChange={(event) => setShareUserId(event.target.value)}
              />
            </div>
            <div className="field">
              <label>Email</label>
              <input
                type="email"
                placeholder="Email"
                value={shareEmail}
                onChange={(event) => setShareEmail(event.target.value)}
              />
            </div>
            <button className="ghost" type="button" onClick={onShare}>
              Share
            </button>
            {shareError && <div className="page-error">{shareError}</div>}
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
        <h2>Your notes</h2>
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
      <section className="section-card">
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
      <section className="section-card">
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
      <section className="section-card">
        <h2>Attachments</h2>
        <div className="attachments-grid">
          {attachments.map((attachment) => (
            <div key={attachment.attachmentId} className="note-card">
              <h3>{attachment.filename}</h3>
              <p>{attachment.mimeType}</p>
              <button className="ghost" type="button" onClick={() => onDownloadAttachment(attachment)}>
                Download
              </button>
            </div>
          ))}
        </div>
      </section>
    </section>
  );
}

export default Notes;
