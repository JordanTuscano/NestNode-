import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './AuthContext';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Notes from './pages/Notes';
import Dashboard from './pages/Dashboard';

// Only logged-in users can see the app; everyone else goes to /login
function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="center-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Auth mode="login" />} />
      <Route path="/register" element={<Auth mode="register" />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route index element={<Notes />} />
        <Route path="archive" element={<Notes archived />} />
        <Route path="dashboard" element={<Dashboard />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
