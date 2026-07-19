import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TEMPLATES, SAMPLE_DATA, DEFAULT_SECTION_ORDER, renderResumeTemplate, formatTextToList } from './ResumeTemplates';
import '../Styles/HomePage.css';

const CATEGORIES = ['All', 'ATS-Optimized', 'Professional', 'Creative'];

// Every card renders its template live with realistic sample data,
// so previews always match the real output exactly.
const sampleCtx = {
  formData: SAMPLE_DATA,
  sectionOrder: DEFAULT_SECTION_ORDER,
  experienceHeading: 'Experience',
  formatTextToList,
};

const HomePage = () => {
  const [selectedFilter, setSelectedFilter] = useState('All');
  const [flippedCards, setFlippedCards] = useState({});

  const handleFilterChange = (category) => {
    setSelectedFilter(category);
  };

  const handleFlip = (id, e) => {
    e.preventDefault();
    e.stopPropagation();
    setFlippedCards(prev => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const filteredTemplates = selectedFilter === 'All'
    ? TEMPLATES
    : TEMPLATES.filter(template => template.category === selectedFilter);

  return (
    <div className="templates-page-container">
      {/* Background glow blobs */}
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>

      {/* Header section */}
      <section className="templates-header">
        <span className="templates-tagline">✨ {TEMPLATES.length} Professional Templates</span>
        <h1>Select a Resume Template</h1>
        <p>Every layout is recruiter-approved. ATS-Optimized templates follow the single-column standard preferred by FAANG and top MNC recruiting systems. You can switch templates at any time without losing your data.</p>
      </section>

      {/* Filter bar */}
      <section className="templates-filter-bar">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`templates-filter-button ${selectedFilter === cat ? 'active' : ''}`}
            onClick={() => handleFilterChange(cat)}
          >
            {cat === 'All' ? `Show All (${TEMPLATES.length})` : `${cat} (${TEMPLATES.filter(t => t.category === cat).length})`}
          </button>
        ))}
      </section>

      {/* Template cards grid */}
      <section className="templates-grid-section">
        {filteredTemplates.length > 0 ? (
          <div className="templates-cards-grid">
            {filteredTemplates.map((template) => {
              const isFlipped = !!flippedCards[template.id];
              return (
                <div key={template.id} className="premium-template-card-container">
                  <div className={`card-inner ${isFlipped ? 'flipped' : ''}`}>

                    {/* Front Face: live template preview and hover Customize button */}
                    <div className="card-face card-front">
                      <div className="template-preview-live">
                        <div className="template-thumb-sheet">
                          {renderResumeTemplate(template.id, sampleCtx)}
                        </div>
                      </div>

                      <div className="template-front-label">
                        <span className="template-front-name">{template.name}</span>
                        <span className={`template-front-category cat-${template.category.toLowerCase().replace(/[^a-z]/g, '')}`}>{template.category}</span>
                      </div>

                      {/* Flip button (Info/Details triggers flipping) */}
                      <button
                        className="btn-card-flip"
                        onClick={(e) => handleFlip(template.id, e)}
                        title="Show Details & Tags"
                      >
                        <i className="fa-solid fa-rotate"></i>
                      </button>

                      <div className="template-preview-overlay">
                        <Link to={`/template${template.id}`} className="btn-preview-customize">
                          Select Template <i className="fa-solid fa-pen-to-square"></i>
                        </Link>
                      </div>
                    </div>

                    {/* Back Face: Description, Tags, Use Template & Flip-back */}
                    <div className="card-face card-back">
                      <div className="card-back-header">
                        <h3 className="template-name-title">{template.name}</h3>
                        <button
                          className="btn-card-flip-back"
                          onClick={(e) => handleFlip(template.id, e)}
                          title="Back to Preview"
                        >
                          <i className="fa-solid fa-rotate"></i>
                        </button>
                      </div>

                      <div className="card-back-body">
                        <div className="template-tags-row">
                          {template.tags.map((tag, i) => (
                            <span key={i} className="template-badge-tag">{tag}</span>
                          ))}
                        </div>
                        <p className="template-desc-text">{template.description}</p>
                      </div>

                      <div className="card-back-footer">
                        <Link to={`/template${template.id}`} className="btn-card-action">
                          Use Template <i className="fa-solid fa-arrow-right"></i>
                        </Link>
                      </div>
                    </div>

                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="no-templates-found-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <p>No templates found matching this filter.</p>
            <button className="btn-reset-filter" onClick={() => setSelectedFilter('All')}>Reset Filter</button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
