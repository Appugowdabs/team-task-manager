import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import Projects from './components/Projects';
import ProjectDetail from './components/ProjectDetail';
import Navbar from './components/Navbar';

function App() {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token_v2'));

  useEffect(() => {
    if (token) {
      fetchUser();
    }
  }, [token]);

  const fetchUser = async () => {
    try {
      const response = await fetch('https://team-task-manager-6e7h.onrender.com/api/v2/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        localStorage.removeItem('token_v2');
        setToken(null);
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token_v2');
    setToken(null);
    setUser(null);
  };

  return (
    <BrowserRouter>
      {user && <Navbar user={user} onLogout={handleLogout} />}
      <div className="min-h-screen bg-gray-100">
        <Routes>
          <Route path="/login" element={
            !user ? <Login setToken={setToken} setUser={setUser} /> : <Navigate to="/dashboard" />
          } />
          <Route path="/signup" element={
            !user ? <Signup /> : <Navigate to="/dashboard" />
          } />
          <Route path="/dashboard" element={
            user ? <Dashboard token={token} /> : <Navigate to="/login" />
          } />
          <Route path="/projects" element={
            user ? <Projects token={token} /> : <Navigate to="/login" />
          } />
          <Route path="/projects/:id" element={
            user ? <ProjectDetail token={token} /> : <Navigate to="/login" />
          } />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;