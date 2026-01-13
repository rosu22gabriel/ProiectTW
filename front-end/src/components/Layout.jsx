import { NavLink, useNavigate } from 'react-router-dom';

function Layout({ children }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">NoteFlow</div>
        <nav className="nav">
          <NavLink to="/" end>
            Notes
          </NavLink>
          <NavLink to="/groups">Groups</NavLink>
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
