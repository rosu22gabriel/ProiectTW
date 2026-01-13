import { useEffect, useState } from 'react';
import { getGroups } from '../api.js';

function Groups() {
  const [groups, setGroups] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    getGroups()
      .then((data) => {
        if (isMounted) {
          setGroups(data || []);
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

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>Study Groups</h1>
          <p>Invite classmates and share notes.</p>
        </div>
        <button className="primary">Create group</button>
      </header>
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
            <button className="ghost">Invite</button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default Groups;
