import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import NotesList from './pages/NotesList.jsx';
import NotesCreate from './pages/NotesCreate.jsx';
import Groups from './pages/Groups.jsx';
import Settings from './pages/Settings.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <Layout>
              <NotesList />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes/new"
        element={
          <ProtectedRoute>
            <Layout>
              <NotesCreate />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/groups"
        element={
          <ProtectedRoute>
            <Layout>
              <Groups />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <Layout>
              <Settings />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/notes" replace />} />
      <Route path="*" element={<Navigate to="/notes" replace />} />
    </Routes>
  );
}

export default App;
