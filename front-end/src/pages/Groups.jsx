import { useEffect, useState } from 'react';
import {
  acceptGroupInvite,
  createGroup,
  declineGroupInvite,
  getGroupInvites,
  getGroupMembers,
  getGroups,
  inviteGroupMember,
} from '../api.js';

function Groups() {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [creating, setCreating] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUserId, setInviteUserId] = useState('');
  const [inviteGroupId, setInviteGroupId] = useState('');
  const [inviteError, setInviteError] = useState('');
  const [inviteSuccess, setInviteSuccess] = useState('');
  const [members, setMembers] = useState([]);
  const [membersGroupId, setMembersGroupId] = useState('');
  const [membersError, setMembersError] = useState('');
  const [invites, setInvites] = useState([]);
  const [invitesError, setInvitesError] = useState('');

  useEffect(() => {
    let isMounted = true;
    Promise.all([getGroups(), getGroupInvites()])
      .then(([groupsData, invitesData]) => {
        if (isMounted) {
          setGroups(groupsData || []);
          setInvites(invitesData || []);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Nu s-au putut incarca grupurile.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const onCreate = async () => {
    setError('');
    if (!name.trim()) {
      setError('Numele grupului este obligatoriu.');
      return;
    }
    try {
      setCreating(true);
      const created = await createGroup({ name: name.trim() });
      setGroups((prev) => [created, ...prev]);
      setName('');
    } catch (err) {
      setError(err.message || 'Nu s-a putut crea grupul.');
    } finally {
      setCreating(false);
    }
  };

  const onInvite = async () => {
    setInviteError('');
    setInviteSuccess('');
    const groupId = Number.parseInt(inviteGroupId, 10);
    if (!groupId) {
      setInviteError('Selectati un grup.');
      return;
    }
    if (!inviteEmail.trim() && !inviteUserId.trim()) {
      setInviteError('Introduceti email sau userId.');
      return;
    }
    if (inviteEmail.trim() && !/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(inviteEmail.trim())) {
      setInviteError('Email invalid.');
      return;
    }
    if (inviteUserId.trim() && Number.parseInt(inviteUserId, 10) <= 0) {
      setInviteError('userId invalid.');
      return;
    }
    const payload = inviteEmail.trim()
      ? { email: inviteEmail.trim() }
      : { userId: Number.parseInt(inviteUserId, 10) };
    try {
      await inviteGroupMember(groupId, payload);
      setInviteSuccess('Invitatia a fost trimisa.');
      setInviteEmail('');
      setInviteUserId('');
      setInviteGroupId('');
    } catch (err) {
      setInviteError(err.message || 'Nu s-a putut invita membrul.');
    }
  };

  const loadMembers = async (groupId) => {
    setMembersError('');
    setMembersGroupId(groupId);
    try {
      const data = await getGroupMembers(groupId);
      setMembers(data || []);
    } catch (err) {
      setMembersError(err.message || 'Nu s-au putut incarca membrii.');
    }
  };

  const onAcceptInvite = async (inviteId) => {
    try {
      await acceptGroupInvite(inviteId);
      setInvites((prev) => prev.filter((inv) => inv.inviteId !== inviteId));
    } catch (err) {
      setInvitesError(err.message || 'Nu s-a putut accepta invitatia.');
    }
  };

  const onDeclineInvite = async (inviteId) => {
    try {
      await declineGroupInvite(inviteId);
      setInvites((prev) => prev.filter((inv) => inv.inviteId !== inviteId));
    } catch (err) {
      setInvitesError(err.message || 'Nu s-a putut respinge invitatia.');
    }
  };

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>Study Groups</h1>
          <p>Invite classmates and share notes.</p>
        </div>
        <button className="primary" type="button" onClick={onCreate} disabled={creating}>
          {creating ? 'Creating...' : 'Create group'}
        </button>
      </header>
      <div className="group-create">
        <input
          placeholder="Group name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <button className="primary" type="button" onClick={onCreate} disabled={creating}>
          {creating ? 'Creating...' : 'Create'}
        </button>
      </div>
      {loading && <div className="page-info">Loading groups...</div>}
      {error && <div className="page-error">{error}</div>}
      {!loading && !error && groups.length === 0 && (
        <div className="page-empty">No groups yet.</div>
      )}
      <div className="group-list">
        {groups.map((group) => (
          <div className="group-card" key={group.groupId}>
            <div>
              <h3>{group.name}</h3>
              <p>Owner #{group.ownerId}</p>
            </div>
            <div className="group-actions">
              <button
                className="ghost"
                type="button"
                onClick={() => setInviteGroupId(group.groupId)}
              >
                Invite
              </button>
              <button className="ghost" type="button" onClick={() => loadMembers(group.groupId)}>
                Members
              </button>
            </div>
          </div>
        ))}
      </div>
      <section className="members-panel">
        <h2>Group members</h2>
        {!membersGroupId && <div className="page-empty">Select a group to view members.</div>}
        {membersError && <div className="page-error">{membersError}</div>}
        {membersGroupId && members.length === 0 && !membersError && (
          <div className="page-empty">No members found.</div>
        )}
        {members.length > 0 && (
          <div className="members-list">
            {members.map((member) => (
              <div key={member.userId} className="member-pill">
                {member.username || member.email || `User #${member.userId}`}
              </div>
            ))}
          </div>
        )}
      </section>
      <section className="invite-panel">
        <h2>Pending invites</h2>
        {invites.length === 0 ? (
          <div className="page-empty">No pending invites.</div>
        ) : (
          <div className="invite-list">
            {invites.map((invite) => (
              <div key={invite.inviteId} className="group-card">
                <div>
                  <h3>{invite.group?.name || `Group #${invite.groupId}`}</h3>
                  <p>Invited by {invite.invitedBy?.username || invite.invitedByUserId}</p>
                </div>
                <div className="group-actions">
                  <button className="ghost" type="button" onClick={() => onAcceptInvite(invite.inviteId)}>
                    Accept
                  </button>
                  <button className="ghost" type="button" onClick={() => onDeclineInvite(invite.inviteId)}>
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
        {invitesError && <div className="page-error">{invitesError}</div>}
      </section>
      <section className="invite-panel">
        <h2>Invite member</h2>
        <div className="invite-row">
          <select value={inviteGroupId} onChange={(event) => setInviteGroupId(event.target.value)}>
            <option value="">Select group</option>
            {groups.map((group) => (
              <option key={group.groupId} value={group.groupId}>
                {group.name}
              </option>
            ))}
          </select>
          <input
            type="email"
            placeholder="Email"
            value={inviteEmail}
            onChange={(event) => setInviteEmail(event.target.value)}
          />
          <input
            type="number"
            min="1"
            placeholder="User ID"
            value={inviteUserId}
            onChange={(event) => setInviteUserId(event.target.value)}
          />
          <button className="ghost" type="button" onClick={onInvite}>
            Send invite
          </button>
        </div>
        {inviteError && <div className="page-error">{inviteError}</div>}
        {inviteSuccess && <div className="page-info">{inviteSuccess}</div>}
      </section>
    </section>
  );
}

export default Groups;
