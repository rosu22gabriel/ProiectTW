import { NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';

function Layout({ children }) {
  const navigate = useNavigate();
  const [notesOpen, setNotesOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">NoteFlow</div>
        <nav className="nav">
          <button
            type="button"
            className="nav-toggle"
            onClick={() => setNotesOpen((prev) => !prev)}
          >
            Notes
            <span className="nav-caret">{notesOpen ? '?' : '?'}</span>
          </button>
          {notesOpen && (
            <div className="nav-sub">
              <NavLink to="/notes">View notes</NavLink>
              <NavLink to="/notes/new">Create note</NavLink>
            </div>
          )}
          <NavLink to="/groups">Groups</NavLink>
          <NavLink to="/settings">Settings</NavLink>
          <button type="button" className="nav-logout" onClick={handleLogout}>
            Logout
          </button>
        </nav>
      </aside>
      <main className="main">{children}</main>
    </div>
  );
}

export default Layout;
