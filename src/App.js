import React, { useEffect } from 'react';
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import HomePage from './components/HomePage';
import TemplateWorkspace from './components/TemplateWorkspace';
import ContentPage from './components/ContentPage';
import { TEMPLATES } from './components/ResumeTemplates';
import { CONTENT_PAGES } from './seo/contentPages.mjs';
import { SUPPORT_EMAIL } from './constants';

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

  // The resume builder needs the full viewport for the live preview, so the
  // footer only shows on the landing page, the templates gallery and the
  // static content pages. The site is served with trailing slashes
  // (/templates/), so normalise before matching.
  const path = location.pathname.replace(/\/+$/, '') || '/';
  const showFooter =
    path === '/' ||
    path === '/templates' ||
    CONTENT_PAGES.some((page) => page.path === path);

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-container">
          {/* The wordmark used to be an <h1>, which gave every page a second,
              site-wide heading competing with its real one. A <div> keeps the
              styling and leaves one <h1> per page for search engines. */}
          <NavLink to="/" className="logo-link">
            <div className="logo">HatchResume</div>
          </NavLink>
          <nav className="nav-menu">
            <NavLink to="/" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Home
            </NavLink>
            <NavLink to="/templates" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Templates
            </NavLink>
            <Link to="/#feedback" className="nav-link">
              Feedback
            </Link>
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
          {CONTENT_PAGES.map((page) => (
            <Route key={page.path} path={page.path} element={<ContentPage pagePath={page.path} />} />
          ))}
        </Routes>
      </main>
      {showFooter && (
        <footer className="App-footer">
          <div className="footer-content">
            {/* Every page links to the content pages: it is how crawlers find
                them, and how the brand name gets repeated site-wide. */}
            <nav className="footer-nav" aria-label="Footer">
              <Link to="/templates">Resume Templates</Link>
              {CONTENT_PAGES.map((page) => (
                <Link key={page.path} to={page.path}>
                  {page.navLabel}
                </Link>
              ))}
            </nav>
            <p className="footer-blurb">
              HatchResume is a free online resume builder with 25+ ATS-friendly
              templates — no sign-up, no watermark, and your data never leaves
              your browser.
            </p>
            <p>
              Contact us at: <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>
            </p>
            <p>
              Have a suggestion or found a bug?{' '}
              <Link to="/#feedback">Let us know</Link>.
            </p>
            <p>&copy; 2026 HatchResume. All rights reserved.</p>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
