import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Layout from './components/Layout';
import AnimatedPage from './components/AnimatedPage';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Faculty from './pages/Faculty';
import Profile from './pages/Profile';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import { useAuth } from './contexts/AuthContext';

function RequireAuth({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  const location = useLocation();
  const { user } = useAuth();

  // Redirect to dashboard if logged in user tries to access login page
  if (user && location.pathname === '/login') {
    return <Navigate to="/" replace />;
  }

  return (
    <AnimatedPage>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={
          <RequireAuth>
            <Layout />
          </RequireAuth>
        }>
          <Route index element={<Dashboard />} />
          <Route path="students" element={<Students />} />
          <Route path="faculty" element={<Faculty />} />
          <Route path="profile" element={<Profile />} />
          <Route path="reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </AnimatedPage>
  );
}

export default App;