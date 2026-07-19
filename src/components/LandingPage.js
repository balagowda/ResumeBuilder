import React, { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/LandingPage.css';

const LandingPage = () => {
  const cardRef = useRef(null);
  const [tiltStyle, setTiltStyle] = useState({});

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
              Build your dream career with <span className="gradient-text">resumebuilder</span>
            </h1>
            <p className="hero-description">
              Create recruiter-approved resumes in minutes. Completely free, no login required, and absolute data privacy. Simply choose a template, enter your details, and download your PDF.
            </p>
            <div className="hero-ctas">
              <Link to="/templates" className="btn-primary-large">
                Get Started Free <i className="fas fa-arrow-right icon-right"></i>
              </Link>
              <Link to="/signin" className="btn-secondary-large">
                Sign In Account
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
                <span className="stat-num">20</span>
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
          <h2 className="section-title">Why use <span className="gradient-text">resumebuilder</span>?</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-icon-wrapper">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Complete Data Privacy</h3>
              <p>Your details are saved exclusively in your browser's local storage. We do not store or send any of your private credentials to a server.</p>
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
    </div>
  );
};

export default LandingPage;
