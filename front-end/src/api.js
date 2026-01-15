const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  let payload = null;
  if (response.status !== 204) {
    const text = await response.text();
    payload = text ? JSON.parse(text) : null;
  }

  if (!response.ok) {
    const message = payload?.message || 'Request failed.';
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }

  return payload;
}

async function requestBinary(path, { method = 'GET', auth = true } = {}) {
  const headers = {};
  if (auth) {
    const token = getToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${API_URL}${path}`, { method, headers });
  if (!response.ok) {
    const message = `Request failed with ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    throw error;
  }
  return response.blob();
}

async function login(email, password) {
  return request('/api/auth/login', {
    method: 'POST',
    body: { email, password },
    auth: false,
  });
}

async function register({ username, email, password }) {
  return request('/api/auth/register', {
    method: 'POST',
    body: { username, email, password },
    auth: false,
  });
}

async function getMe() {
  return request('/api/auth/me');
}

async function getNotes({ subjectId, tagId, q, includeSubject = true, includeTags = true } = {}) {
  const params = new URLSearchParams();
  if (subjectId) params.set('subjectId', subjectId);
  if (tagId) params.set('tagId', tagId);
  if (q) params.set('q', q);
  if (includeSubject) params.set('includeSubject', 'true');
  if (includeTags) params.set('includeTags', 'true');
  const query = params.toString();
  return request(`/api/notes${query ? `?${query}` : ''}`);
}

async function createNote({ title, content, subjectId, tagIds }) {
  return request('/api/notes', {
    method: 'POST',
    body: { title, content, subjectId, tagIds },
  });
}

async function getNote(noteId) {
  return request(`/api/notes/${noteId}`);
}

async function updateNote(noteId, payload) {
  return request(`/api/notes/${noteId}`, {
    method: 'PUT',
    body: payload,
  });
}

async function deleteNote(noteId) {
  return request(`/api/notes/${noteId}`, { method: 'DELETE' });
}

async function getSharedNotes() {
  return request('/api/notes/shared');
}

async function shareNote(noteId, payload) {
  return request(`/api/notes/${noteId}/share`, {
    method: 'POST',
    body: payload,
  });
}

async function getSharedByMe() {
  return request('/api/notes/shared-by-me');
}

async function revokeShare(noteId, userId) {
  return request(`/api/notes/${noteId}/share/${userId}`, {
    method: 'DELETE',
  });
}

async function getGroups() {
  return request('/api/groups');
}

async function createGroup({ name }) {
  return request('/api/groups', {
    method: 'POST',
    body: { name },
  });
}

async function inviteGroupMember(groupId, payload) {
  return request(`/api/groups/${groupId}/invite`, {
    method: 'POST',
    body: payload,
  });
}

async function getGroupMembers(groupId) {
  return request(`/api/groups/${groupId}/members`);
}

async function getGroupInvites() {
  return request('/api/groups/invites');
}

async function acceptGroupInvite(inviteId) {
  return request(`/api/groups/invites/${inviteId}/accept`, { method: 'POST' });
}

async function declineGroupInvite(inviteId) {
  return request(`/api/groups/invites/${inviteId}/decline`, { method: 'POST' });
}

async function getSubjects() {
  return request('/api/subjects');
}

async function getTags() {
  return request('/api/tags');
}

async function createSubject({ name, description }) {
  return request('/api/subjects', {
    method: 'POST',
    body: { name, description },
  });
}

async function createTag({ name }) {
  return request('/api/tags', {
    method: 'POST',
    body: { name },
  });
}

async function createAttachment({ noteId, filename, mimeType, dataBase64 }) {
  return request('/api/attachments', {
    method: 'POST',
    body: { noteId, filename, mimeType, dataBase64 },
  });
}

async function getAttachmentsMetadata() {
  return request('/api/attachments/metadata');
}

async function downloadAttachment(attachmentId) {
  return requestBinary(`/api/attachments/${attachmentId}/download`);
}

async function fetchWikipediaSummary(title) {
  const encoded = encodeURIComponent(title);
  return request(`/api/external/wikipedia?title=${encoded}`, { auth: false });
}

export {
  login,
  register,
  getMe,
  getNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  getSharedNotes,
  shareNote,
  getSharedByMe,
  revokeShare,
  getGroups,
  createGroup,
  inviteGroupMember,
  getGroupMembers,
  getGroupInvites,
  acceptGroupInvite,
  declineGroupInvite,
  getSubjects,
  getTags,
  createSubject,
  createTag,
  createAttachment,
  getAttachmentsMetadata,
  downloadAttachment,
  fetchWikipediaSummary,
};
