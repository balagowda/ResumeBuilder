import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import FeedbackForm from './FeedbackForm';
import '../Styles/LandingPage.css';

// Early users who built their own resume on the site. Kept as data rather than
// markup so adding one is a single entry, and so the quotes stay in one place
// where they can be checked against what the people actually said.
//
// `accent` is the card's colour pair — it drives the avatar, the quote mark and
// the glow, so the row reads as lively rather than four identical indigo cards.
const TESTIMONIALS = [
  {
    name: 'Ganesh',
    role: 'Backend Engineer',
    accent: ['#4f46e5', '#7c3aed'],
    quote:
      'I opened the site and started typing — no sign-up, no email to verify first. A clean one-page PDF was ready in about ten minutes.',
  },
  {
    name: 'Tejas',
    role: 'Automation Engineer',
    accent: ['#0ea5e9', '#06b6d4'],
    quote:
      'The live preview is what I keep coming back for. You can see exactly where the page ends, so nothing spills onto a second page by surprise.',
  },
  {
    name: 'Narasimha',
    role: 'Backend Engineer',
    accent: ['#f43f5e', '#f97316'],
    quote:
      'I pasted a job posting and it listed the keywords I had left out. Fixing those took a few minutes and the resume read much closer to the role.',
  },
  {
    name: 'Kiruthika',
    role: 'Quality Engineer',
    accent: ['#a855f7', '#d946ef'],
    quote:
      'The writing review flagged bullets I had opened the same way three times over, and a few vague ones I had stopped noticing. Small edits, much tighter result.',
  },
  {
    name: 'Varun',
    role: 'Software Engineer',
    accent: ['#10b981', '#14b8a6'],
    quote:
      'Knowing the details stay in my own browser made me comfortable putting real information in. I keep a few versions saved for different applications.',
  },
];

// How fast the row travels, in CSS px per second. Duration is derived from it
// so the speed stays the same however many cards there are.
const MARQUEE_SPEED = 45;

const hexToRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

/** The accent at low opacity — backgrounds, hairlines, glows. */
const tint = (hex, alpha) => `rgba(${hexToRgb(hex).join(', ')}, ${alpha})`;

/**
 * The accent pulled toward the body ink.
 *
 * Small uppercase text set in the raw accent fails contrast on a pale tint of
 * itself — emerald on mint is around 2.4:1. Darkening it first keeps every
 * card's role chip readable without giving them all the same colour.
 */
const deepen = (hex, amount = 0.45) => {
  const toward = [15, 23, 42]; // #0f172a, the site's darkest text colour
  const mixed = hexToRgb(hex).map((c, i) => Math.round(c + (toward[i] - c) * amount));
  return `rgb(${mixed.join(', ')})`;
};

/** Every colour a card needs, derived from its two accent stops. */
const accentVars = ([base, second]) => ({
  '--accent': base,
  '--accent-2': second,
  '--accent-soft': tint(base, 0.11),
  '--accent-edge': tint(base, 0.32),
  '--accent-glow': tint(base, 0.35),
  '--accent-ink': deepen(base),
});

/**
 * One testimonial card.
 *
 * The card itself is skewed into a parallelogram; .testimonial-inner takes the
 * opposite skew so the text inside stays upright.
 *
 * Copies after the first are passed `duplicate` and hidden from assistive tech —
 * a screen reader should hear each person once, not once per copy.
 */
const TestimonialCard = ({ person, duplicate }) => (
  <figure
    className="testimonial-card"
    style={accentVars(person.accent)}
    aria-hidden={duplicate || undefined}
  >
    <div className="testimonial-inner">
      <span className="testimonial-quote-mark" aria-hidden="true">
        <i className="fas fa-quote-right"></i>
      </span>
      <blockquote className="testimonial-text">{person.quote}</blockquote>
      <figcaption className="testimonial-author">
        <span className="testimonial-avatar" aria-hidden="true">
          <i className="fas fa-user"></i>
        </span>
        <span className="testimonial-meta">
          <span className="testimonial-name">{person.name}</span>
          <span className="testimonial-role">{person.role}</span>
        </span>
      </figcaption>
    </div>
  </figure>
);

/**
 * The scrolling row.
 *
 * The loop works by rendering the list several times and sliding left by
 * exactly one copy — at that point the row is pixel-identical to where it
 * started, so the jump back is invisible.
 *
 * How many copies is a measurement, not a constant. One copy of four cards is
 * about 1500px, so on any monitor wider than that a fixed two copies runs out
 * of cards before the reset and leaves a visible empty stretch. The count is
 * whatever it takes to keep the row covered at the moment it resets.
 */
const TestimonialMarquee = () => {
  const wrapRef = useRef(null);
  const trackRef = useRef(null);
  const [loop, setLoop] = useState({ copies: 2, shift: 0, duration: 0 });

  useEffect(() => {
    const measure = () => {
      const wrap = wrapRef.current;
      const track = trackRef.current;
      const card = track && track.querySelector('.testimonial-card');
      if (!wrap || !card) return;

      const gap = parseFloat(getComputedStyle(track).columnGap) || 0;
      // offsetWidth, not getBoundingClientRect: the cards are skewed, and a
      // client rect reports the sheared bounding box (a 280px card measures
      // ~338px at -7deg). Layout width is what the flex row actually advances
      // by, so it is the only correct basis for the loop distance.
      const copyWidth = TESTIMONIALS.length * (card.offsetWidth + gap);
      if (!(copyWidth > 0)) return;

      const visible = wrap.offsetWidth;
      // One copy scrolls away, so the rest have to fill the viewport behind it.
      // The `+ gap` covers the exact-multiple case: the last card has no gap
      // after it, which would otherwise leave one gap's worth of empty edge.
      const copies = Math.max(2, Math.ceil((visible + gap) / copyWidth) + 1);

      setLoop((prev) =>
        prev.copies === copies && prev.shift === copyWidth
          ? prev
          : { copies, shift: copyWidth, duration: copyWidth / MARQUEE_SPEED }
      );
    };

    measure();
    window.addEventListener('resize', measure);

    // Both elements matter and they change independently: the wrapper follows
    // the viewport (which decides how many copies are needed), the track
    // follows card metrics (which decide the shift). Watching only the track
    // misses every resize, because fixed-width cards keep the track the same
    // width no matter how wide the screen gets. Re-entry is safe: measure()
    // returns the same object when nothing it reads has changed.
    let observer;
    if (typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(measure);
      if (wrapRef.current) observer.observe(wrapRef.current);
      if (trackRef.current) observer.observe(trackRef.current);
    }

    return () => {
      window.removeEventListener('resize', measure);
      if (observer) observer.disconnect();
    };
  }, []);

  return (
    <div className="testimonials-marquee" ref={wrapRef}>
      <div
        className="testimonials-track"
        ref={trackRef}
        style={{
          '--marquee-shift': `${loop.shift}px`,
          '--marquee-duration': `${loop.duration}s`,
        }}
      >
        {Array.from({ length: loop.copies }, (_, copy) =>
          TESTIMONIALS.map((person) => (
            <TestimonialCard
              key={`${copy}-${person.name}`}
              person={person}
              duplicate={copy > 0}
            />
          ))
        )}
      </div>
    </div>
  );
};

const LandingPage = () => {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});
  const location = useLocation();

  // The "Feedback" nav link routes here as /#feedback. location.key changes on
  // every push, so repeat clicks scroll again instead of going nowhere.
  useEffect(() => {
    if (location.hash !== '#feedback') return;
    const target = document.getElementById('feedback');
    if (!target) return;
    // scrollIntoView would get swallowed by .landing-container's overflow:hidden,
    // so scroll the window directly and leave room for the sticky header.
    const top = target.getBoundingClientRect().top + window.scrollY - 80;
    window.scrollTo({ top, behavior: 'smooth' });
    // Smooth scrolling is a no-op in some browsers (reduced-motion settings,
    // older engines), so snap into place if nothing actually moved.
    const snap = setTimeout(() => {
      if (Math.abs(window.scrollY - top) > 8) window.scrollTo(0, top);
    }, 700);
    return () => clearTimeout(snap);
  }, [location.hash, location.key]);

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const card = cardRef.current;
    const box = card.getBoundingClientRect();
    
    // Get mouse position relative to the element
    const x = e.clientX - box.left;
    const y = e.clientY - box.top;
    
    // Normalize coordinates around the center (from -0.5 to 0.5)
    const px = (x / box.width) - 0.5;
    const py = (y / box.height) - 0.5;
    
    // Calculate rotation angles (max 25 degrees tilt)
    const rotateX = -py * 25;
    const rotateY = px * 25;
    
    setTiltStyle({
      transform: `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`,
      transition: 'transform 0.05s ease-out'
    });
  };

  const handleMouseLeave = () => {
    setTiltStyle({
      transform: 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)',
      transition: 'transform 0.5s ease-out'
    });
  };

  return (
    <div className="landing-container">
      {/* Background glowing blobs */}
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>
      <div className="glow-blob blob-3"></div>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="landing-section-inner hero-container">
          <div className="hero-content">
            <span className="badge-intro">🚀 Create Resumes Instantly</span>
            <h1 className="hero-title">
              Build your dream career with <span className="gradient-text">HatchResume</span>
            </h1>
            <p className="hero-description">
              HatchResume is a free online resume builder that creates recruiter-approved resumes in minutes — no login required and absolute data privacy. Simply choose a template, enter your details, and download your PDF.
            </p>
            <div className="hero-ctas">
              <Link to="/templates" className="btn-primary-large">
                Get Started Free <i className="fas fa-arrow-right icon-right"></i>
              </Link>
              <Link to="/template7" className="btn-secondary-large">
                Skip to the ATS Template
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat-item">
                <span className="stat-num">0%</span>
                <span className="stat-label">Data Saved Online</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-num">100%</span>
                <span className="stat-label">Privacy Protected</span>
              </div>
              <div className="stat-divider"></div>
              <div className="stat-item">
                <span className="stat-num">25</span>
                <span className="stat-label">Free Pro Templates</span>
              </div>
            </div>
          </div>

          {/* 3D Interactive Resume Mockup */}
          <div className="hero-visual">
            <div 
              className="scene"
              onMouseMove={handleMouseMove}
              onMouseLeave={handleMouseLeave}
            >
              <div 
                className="tilt-card" 
                ref={cardRef}
                style={tiltStyle}
              >
                {/* Fake Resume Content representing 3D elements */}
                <div className="mock-resume">
                  <div className="mock-header">
                    <div className="mock-avatar"></div>
                    <div className="mock-title-block">
                      <div className="mock-line-long"></div>
                      <div className="mock-line-short"></div>
                    </div>
                  </div>
                  <div className="mock-divider"></div>
                  <div className="mock-body">
                    <div className="mock-left">
                      <div className="mock-section-title"></div>
                      <div className="mock-line-medium"></div>
                      <div className="mock-line-medium"></div>
                      <div className="mock-section-title"></div>
                      <div className="mock-chip-container">
                        <div className="mock-chip"></div>
                        <div className="mock-chip"></div>
                        <div className="mock-chip"></div>
                      </div>
                    </div>
                    <div className="mock-right">
                      <div className="mock-section-title"></div>
                      <div className="mock-line-long"></div>
                      <div className="mock-line-medium"></div>
                      <div className="mock-line-long"></div>
                      <div className="mock-section-title"></div>
                      <div className="mock-line-medium"></div>
                      <div className="mock-line-long"></div>
                    </div>
                  </div>
                </div>

                {/* Float-out Parallax Elements (Layered in 3D using translateZ) */}
                <div className="parallax-badge badge-ats">
                  <i className="fas fa-check-circle"></i> ATS Friendly
                </div>
                <div className="parallax-badge badge-free">
                  <i className="fas fa-star"></i> 100% Free
                </div>
                <div className="parallax-badge badge-pdf">
                  <i className="fas fa-file-pdf"></i> PDF Download
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="steps-section">
        <div className="landing-section-inner">
          <h2 className="section-title">Create your resume in <span className="gradient-text">4 Easy Steps</span></h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-num">01</div>
              <h3>Choose Template</h3>
              <p>Select from our professionally tailored design templates that suit your industry style.</p>
            </div>
            <div className="step-card">
              <div className="step-num">02</div>
              <h3>Fill in Details</h3>
              <p>Type in your educational qualifications, work experiences, projects, and key skills.</p>
            </div>
            <div className="step-card">
              <div className="step-num">03</div>
              <h3>Arrange Sections</h3>
              <p>Use our interactive drag-and-drop system to reorder categories to present your best self.</p>
            </div>
            <div className="step-card">
              <div className="step-num">04</div>
              <h3>Download PDF</h3>
              <p>Download your high-resolution A4-sized PDF instantly, ready to send to employers.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="landing-section-inner">
          <h2 className="section-title">Why use <span className="gradient-text">HatchResume</span>?</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Complete Data Privacy</h3>
              <p>Your details never leave your own browser — by default they are erased the moment you close the tab. We do not store or send any of your private information to a server.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <i className="fas fa-crosshairs"></i>
              </div>
              <h3>Job Description Matching</h3>
              <p>Paste any job posting and instantly see which of its keywords your resume is missing — the feature other builders charge a monthly subscription for.</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <i className="fas fa-compress"></i>
              </div>
              <h3>Fit To One Page</h3>
              <p>We warn you the moment your content spills onto a second page, and resize the whole resume to fit in a single click.</p>
            </div>

            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <i className="fas fa-arrows-alt"></i>
              </div>
              <h3>Interactive Reordering</h3>
              <p>Customize the order of your resume sections effortlessly. Highlight what matters most to your prospective recruiter.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <i className="fas fa-bolt"></i>
              </div>
              <h3>No Account Necessary</h3>
              <p>Get straight to building. You don't need to sign up or log in to use our builder and download PDF files.</p>
            </div>
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <i className="fas fa-print"></i>
              </div>
              <h3>Precision Print Layouts</h3>
              <p>Templates are styled precisely to fit standard A4 specifications, preventing broken bullet points or formatting issues.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Plain-language summary of the product plus links into the content
          pages. It states the brand name in prose (search engines have no
          other way to connect the query "hatchresume" to this site) and gives
          crawlers a path to /about, /faq and /alternatives. */}
      <section className="about-strip">
        <div className="landing-section-inner">
          <h2 className="section-title">What is <span className="gradient-text">HatchResume</span>?</h2>
          <p className="about-strip-text">
            HatchResume is a free online resume builder at hatchresume.com. Pick
            one of 25+ professional, ATS-friendly templates, fill in your
            details, and download a print-ready PDF — with no account, no
            watermark, and no payment at the download step. Everything runs in
            your browser, so your work history is never uploaded to a server.
          </p>
          <div className="about-strip-links">
            <Link to="/examples">Resume examples by job title</Link>
            <Link to="/ats-resume-checker">Free ATS resume checker</Link>
            <Link to="/about">About HatchResume</Link>
            <Link to="/faq">Is HatchResume free and private?</Link>
            <Link to="/alternatives">A free alternative to paid resume builders</Link>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="cta-section">
        <div className="landing-section-inner">
          <div className="cta-box">
            <h2>Ready to stand out in your job search?</h2>
            <p>Create a beautiful, modern resume in under 5 minutes.</p>
            <Link to="/templates" className="btn-white">
              Build My Resume Now <i className="fas fa-arrow-right icon-right"></i>
            </Link>
          </div>
        </div>
      </section>

      {/* What early users said after building a resume here. Plain quotes about
          features that actually exist — no ratings, no employer claims.

          The cards scroll right-to-left forever and stop on hover or keyboard
          focus, so anyone who wants to finish reading one can. */}
      <section className="testimonials-section">
        {/* Soft mesh-gradient wash behind the row. */}
        <div className="testimonials-glow" aria-hidden="true">
          <span className="t-blob t-blob-a"></span>
          <span className="t-blob t-blob-b"></span>
          <span className="t-blob t-blob-c"></span>
          <span className="t-blob t-blob-d"></span>
        </div>

        <div className="landing-section-inner">
          <h2 className="section-title">
            What early users <span className="gradient-text">told us</span>
          </h2>
          <p className="testimonials-intro">
            Friends and colleagues who built their own resume on HatchResume, in their words.
          </p>
        </div>

        <TestimonialMarquee />
      </section>

      {/* Suggestions / bug reports */}
      <FeedbackForm />
    </div>
  );
};

export default LandingPage;
