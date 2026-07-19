import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import TemplateWorkspace from './components/TemplateWorkspace';
import { TEMPLATES } from './components/ResumeTemplates';
import SignIn from './components/SignIn';
import SignUp from './components/SignUp';

function App() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Load current user on component mount
  useEffect(() => {
    const sessionUser = localStorage.getItem('currentUser');
    if (sessionUser) {
      try {
        setUser(JSON.parse(sessionUser));
      } catch (e) {
        localStorage.removeItem('currentUser');
      }
    }
  }, []);

  const handleSignOut = () => {
    localStorage.removeItem('currentUser');
    setUser(null);
    navigate('/');
  };

  const isFullWidthPage = location.pathname === '/' || 
                          location.pathname === '/signin' || 
                          location.pathname === '/signup' ||
                          location.pathname.startsWith('/template');

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-container">
          <NavLink to="/" className="logo-link">
            <h1 className="logo">resumebuilder</h1>
          </NavLink>
          <nav className="nav-menu">
            <NavLink to="/" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Home
            </NavLink>
            {user ? (
              <div className="user-profile">
                <span className="welcome-text">Hi, {user.name}</span>
                <button className="signout-btn" onClick={handleSignOut}>
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="auth-links">
                <NavLink to="/signin" className={({ isActive }) => (isActive ? 'nav-link active auth-link' : 'nav-link auth-link')}>
                  Sign In
                </NavLink>
                <NavLink to="/signup" className="nav-btn-signup">
                  Sign Up
                </NavLink>
              </div>
            )}
          </nav>
        </div>
      </header>
      <main className={isFullWidthPage ? "App-main-full" : "App-main"}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/templates" element={<HomePage />} />
          {TEMPLATES.map((t) => (
            <Route key={t.id} path={`/template${t.id}`} element={<TemplateWorkspace templateId={t.id} />} />
          ))}
          <Route path="/signin" element={<SignIn setUser={setUser} />} />
          <Route path="/signup" element={<SignUp setUser={setUser} />} />
        </Routes>
      </main>
      <footer className="App-footer">
        <div className="footer-content">
          <p>
            Contact us at: <a href="mailto:support@resumebuilder.com">support@resumebuilder.com</a>
          </p>
          <p>&copy; 2026 resumebuilder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;