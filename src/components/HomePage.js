import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { TEMPLATES, SAMPLE_DATA, DEFAULT_SECTION_ORDER, renderResumeTemplate, formatTextToList } from './ResumeTemplates';
import { TWO_COLUMN_IDS, templateSlug } from './templateMeta.mjs';
import useDocumentMeta from '../seo/useDocumentMeta';
import '../Styles/HomePage.css';

// Card thumbnails render the real template on the same 560px-wide sheet the
// editor uses, then scale it down to the card. The scale used to be hard-coded
// per view mode (360/560 large, 230/560 compact), which silently assumed the
// card got its full max-width — on a phone it is narrower than that, so the
// sheet overflowed and the preview was cropped on both sides. Measure instead.
const THUMB_PAGE_W = 560;

const CATEGORIES = ['All', 'ATS-Optimized', 'Professional', 'Creative'];

const LAYOUTS = ['Any layout', 'Single column', 'Two column'];

// Every card renders its template live with realistic sample data,
// so previews always match the real output exactly.
const sampleCtx = {
  formData: SAMPLE_DATA,
  sectionOrder: DEFAULT_SECTION_ORDER,
  experienceHeading: 'Experience',
  formatTextToList,
};

const HomePage = () => {
  // Mirrors the pre-rendered /templates/ document head for in-app navigation.
  useDocumentMeta({
    title: `Free Resume Templates — ${TEMPLATES.length}+ ATS-Friendly Designs | HatchResume`,
    description: `Browse ${TEMPLATES.length}+ free professional resume templates on HatchResume. All designs are ATS-friendly and download as PDF — no sign-up, no watermark, 100% private.`,
    path: '/templates',
  });

  const [selectedFilter, setSelectedFilter] = useState('All');
  const [selectedLayout, setSelectedLayout] = useState('Any layout');
  const [searchQuery, setSearchQuery] = useState('');
  const [compactView, setCompactView] = useState(false);
  const [flippedCards, setFlippedCards] = useState({});

  // One measurement drives every card: they are all the same width, so the
  // scale goes on the grid as a custom property and each thumbnail inherits it.
  const gridRef = useRef(null);
  const measureThumbScale = useCallback(() => {
    const grid = gridRef.current;
    if (!grid) return;
    const frame = grid.querySelector('.template-preview-live');
    if (!frame) return;
    const width = frame.getBoundingClientRect().width;
    if (width <= 0) return;
    grid.style.setProperty('--thumb-scale', String(width / THUMB_PAGE_W));
  }, []);

  // Re-run after every render — switching view mode or filtering changes the
  // card width — and on resize, which does not re-render.
  useLayoutEffect(measureThumbScale);

  useEffect(() => {
    window.addEventListener('resize', measureThumbScale);
    return () => window.removeEventListener('resize', measureThumbScale);
  }, [measureThumbScale]);

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

  const resetFilters = () => {
    setSelectedFilter('All');
    setSelectedLayout('Any layout');
    setSearchQuery('');
  };

  const query = searchQuery.trim().toLowerCase();
  const filteredTemplates = TEMPLATES.filter((template) => {
    if (selectedFilter !== 'All' && template.category !== selectedFilter) return false;
    if (selectedLayout === 'Single column' && TWO_COLUMN_IDS.includes(template.id)) return false;
    if (selectedLayout === 'Two column' && !TWO_COLUMN_IDS.includes(template.id)) return false;
    if (query) {
      const haystack = `${template.name} ${template.description} ${template.category} ${template.tags.join(' ')}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });

  return (
    <div className="templates-page-container">
      {/* Background glow blobs */}
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>

      {/* Header section */}
      <section className="templates-header">
        <span className="templates-tagline">✨ {TEMPLATES.length} Professional Templates</span>
        {/* Wording matches the pre-rendered /templates/ page so crawlers and
            visitors see the same heading. */}
        <h1>Resume Templates — ATS-Friendly Designs</h1>
        <p>Every layout is recruiter-approved. ATS-Optimized templates follow the single-column standard preferred by FAANG and top MNC recruiting systems. You can switch templates at any time without losing your data.</p>
      </section>

      {/* Sticky discovery toolbar: search, filters, layout, density */}
      <section className="templates-toolbar">
        <div className="templates-search-row">
          <div className="templates-search-box">
            <i className="fa-solid fa-magnifying-glass"></i>
            <input
              type="text"
              placeholder={`Search ${TEMPLATES.length} templates — try "ATS", "two column", "developer"…`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button className="search-clear-btn" onClick={() => setSearchQuery('')} title="Clear search">
                <i className="fa-solid fa-xmark"></i>
              </button>
            )}
          </div>
          <button
            className={`view-toggle-btn ${compactView ? 'active' : ''}`}
            onClick={() => setCompactView(!compactView)}
            title={compactView ? 'Switch to large previews' : 'Switch to compact grid — see all templates at once'}
          >
            <i className={`fa-solid ${compactView ? 'fa-table-cells-large' : 'fa-table-cells'}`}></i>
            {compactView ? ' Large' : ' Compact'}
          </button>
        </div>
        <div className="templates-filter-bar">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              className={`templates-filter-button ${selectedFilter === cat ? 'active' : ''}`}
              onClick={() => handleFilterChange(cat)}
            >
              {cat === 'All' ? `All (${TEMPLATES.length})` : `${cat} (${TEMPLATES.filter(t => t.category === cat).length})`}
            </button>
          ))}
          <span className="filter-bar-divider"></span>
          {LAYOUTS.map((layout) => (
            <button
              key={layout}
              className={`templates-filter-button layout-chip ${selectedLayout === layout ? 'active' : ''}`}
              onClick={() => setSelectedLayout(layout)}
            >
              {layout}
            </button>
          ))}
          <span className="templates-result-count">
            {filteredTemplates.length} of {TEMPLATES.length} shown
          </span>
        </div>
      </section>

      {/* Template cards grid */}
      <section className="templates-grid-section">
        {filteredTemplates.length > 0 ? (
          <div className={`templates-cards-grid ${compactView ? 'compact' : ''}`} ref={gridRef}>
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
                        {/* Also the crawl path to each template's own page. */}
                        <Link to={`/templates/${templateSlug(template)}`} className="btn-card-details">
                          Details
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
            <p>No templates match{query ? ` "${searchQuery}"` : ' these filters'}.</p>
            <button className="btn-reset-filter" onClick={resetFilters}>Reset Filters</button>
          </div>
        )}
      </section>
    </div>
  );
};

export default HomePage;
