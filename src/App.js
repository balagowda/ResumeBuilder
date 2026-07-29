import React, { useEffect } from 'react';
import { Routes, Route, NavLink, useLocation } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import TemplateWorkspace from './components/TemplateWorkspace';
import { TEMPLATES } from './components/ResumeTemplates';

function App() {
  const location = useLocation();

  // The old sign-up flow kept account records — including plaintext passwords —
  // in localStorage. The feature is gone, so purge any leftovers from browsers
  // that used it before.
  useEffect(() => {
    localStorage.removeItem('registeredUsers');
    localStorage.removeItem('currentUser');
  }, []);

  const isFullWidthPage = location.pathname === '/' ||
                          location.pathname.startsWith('/template');

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-container">
          <NavLink to="/" className="logo-link">
            <h1 className="logo">resumebuilder</h1>
          </NavLink>
          <nav className="nav-menu">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Home
            </NavLink>
            <NavLink to="/templates" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Templates
            </NavLink>
            <NavLink to="/templates" className="nav-btn-build">
              Build My Resume
            </NavLink>
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
        </Routes>
      </main>
      <footer className="App-footer">
        <div className="footer-content">
          <p>
            Contact us at: <a href="mailto:support@hatchresume.com">support@hatchresume.com</a>
          </p>
          <p>&copy; 2026 resumebuilder. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
