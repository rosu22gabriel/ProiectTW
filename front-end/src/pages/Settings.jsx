import { useEffect, useState } from 'react';
import { getMe } from '../api.js';

function Settings() {
  const [profile, setProfile] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let isMounted = true;
    getMe()
      .then((data) => {
        if (isMounted) setProfile(data);
      })
      .catch((err) => {
        if (isMounted) setError(err.message || 'Nu s-a putut incarca profilul.');
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="page">
      <header className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Profile information</p>
        </div>
      </header>
      {error && <div className="page-error">{error}</div>}
      {!error && !profile && <div className="page-info">Loading profile...</div>}
      {profile && (
        <div className="note-card">
          <h3>{profile.username}</h3>
          <p>{profile.email}</p>
          <p>Role: {profile.role || 'reader'}</p>
        </div>
      )}
    </section>
  );
}

export default Settings;
