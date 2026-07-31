import React, { Suspense, lazy, useEffect } from 'react';
import { Routes, Route, NavLink, Link, useLocation } from 'react-router-dom';
import './App.css';
import LandingPage from './components/LandingPage';
import ContentPage from './components/ContentPage';
// Metadata only — importing TEMPLATES from ResumeTemplates would pull all 25
// template renderers into the landing page's bundle just to declare routes.
import { TEMPLATES } from './components/templateMeta.mjs';
import { CONTENT_PAGES } from './seo/contentPages.mjs';
import { EXAMPLE_RESUMES } from './seo/exampleResumes.mjs';
import { SUPPORT_EMAIL } from './constants';

// Everything below the landing page loads on demand. The editor alone pulls in
// jsPDF and html2canvas, and the gallery pulls in every template renderer —
// neither belongs in the bundle a first-time visitor waits for.
const HomePage = lazy(() => import('./components/HomePage'));
const TemplateWorkspace = lazy(() => import('./components/TemplateWorkspace'));
const TemplateDetail = lazy(() => import('./components/TemplateDetail'));
const AtsChecker = lazy(() => import('./components/AtsChecker'));
const ExamplesHub = lazy(() =>
  import('./components/ResumeExamples').then((m) => ({ default: m.ExamplesHub }))
);
const ExampleDetail = lazy(() =>
  import('./components/ResumeExamples').then((m) => ({ default: m.ExampleDetail }))
);

const RouteFallback = () => (
  <div className="route-fallback" role="status" aria-live="polite">
    <span className="route-spinner" aria-hidden="true"></span>
    <span className="sr-only">Loading</span>
  </div>
);

function App() {
  const location = useLocation();

  // The old sign-up flow kept account records — including plaintext passwords —
  // in localStorage. The feature is gone, so purge any leftovers from browsers
  // that used it before.
  useEffect(() => {
    localStorage.removeItem('registeredUsers');
    localStorage.removeItem('currentUser');
  }, []);

  // The site is served with trailing slashes (/templates/), so normalise once.
  const path = location.pathname.replace(/\/+$/, '') || '/';

  // Only the landing page and the editor need the full viewport; the editor
  // paths are /template<id>, distinct from the /templates/<slug> content pages.
  const isFullWidthPage = path === '/' || /^\/template\d+$/.test(path);

  // The editor has no room for a footer next to its live preview; every other
  // page gets one.
  const showFooter = !/^\/template\d+$/.test(path);

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
            <NavLink to="/templates" end className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Templates
            </NavLink>
            <NavLink to="/examples" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              Examples
            </NavLink>
            <NavLink to="/ats-resume-checker" className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}>
              ATS Checker
            </NavLink>
            <NavLink to="/templates" className="nav-btn-build">
              Build My Resume
            </NavLink>
          </nav>
        </div>
      </header>
      <main className={isFullWidthPage ? "App-main-full" : "App-main"}>
        <Suspense fallback={<RouteFallback />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/templates" element={<HomePage />} />
            <Route path="/templates/:slug" element={<TemplateDetail />} />
            <Route path="/examples" element={<ExamplesHub />} />
            <Route path="/examples/:slug" element={<ExampleDetail />} />
            <Route path="/ats-resume-checker" element={<AtsChecker />} />
            {TEMPLATES.map((t) => (
              <Route key={t.id} path={`/template${t.id}`} element={<TemplateWorkspace templateId={t.id} />} />
            ))}
            {CONTENT_PAGES.map((page) => (
              <Route key={page.path} path={page.path} element={<ContentPage pagePath={page.path} />} />
            ))}
          </Routes>
        </Suspense>
      </main>
      {showFooter && (
        <footer className="App-footer">
          <div className="footer-inner">
            {/* Every page links to the content pages: it is how crawlers find
                them, and how the brand name gets repeated site-wide. */}
            <div className="footer-grid">
              <div className="footer-brand">
                <div className="footer-logo">HatchResume</div>
                <p className="footer-blurb">
                  A free online resume builder with 25+ ATS-friendly templates —
                  no sign-up, no watermark, and your data never leaves your
                  browser.
                </p>
              </div>

              <nav className="footer-col" aria-label="Build a resume">
                <div className="footer-col-title">Build</div>
                <ul>
                  <li><Link to="/templates">Resume Templates</Link></li>
                  <li><Link to="/examples">Resume Examples</Link></li>
                  <li><Link to="/ats-resume-checker">ATS Checker</Link></li>
                </ul>
              </nav>

              <nav className="footer-col" aria-label="Resume examples by job title">
                <div className="footer-col-title">Examples</div>
                <ul>
                  {EXAMPLE_RESUMES.map((example) => (
                    <li key={example.slug}>
                      <Link to={`/examples/${example.slug}`}>{example.role}</Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <nav className="footer-col" aria-label="About HatchResume">
                <div className="footer-col-title">HatchResume</div>
                <ul>
                  {CONTENT_PAGES.map((page) => (
                    <li key={page.path}>
                      <Link to={page.path}>{page.navLabel}</Link>
                    </li>
                  ))}
                  <li><Link to="/#feedback">Send feedback</Link></li>
                  <li><a href={`mailto:${SUPPORT_EMAIL}`}>Contact us</a></li>
                </ul>
              </nav>
            </div>

            <div className="footer-bottom">
              <p>&copy; 2026 HatchResume. All rights reserved.</p>
              <p>Built in your browser — nothing you type is uploaded.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}

export default App;
