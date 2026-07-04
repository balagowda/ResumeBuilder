import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/HomePage.css'; 

const templates = [
  {
    id: 1,
    name: 'Professional Executive',
    description: 'A classic, clean single-column layout optimized for corporate and executive jobs. Recommended for traditional industries.',
    link: '/template1',
    thumbnail: '/templates/template1.png',
    category: 'Professional',
    tags: ['ATS-Optimized', 'Corporate', 'Clean'],
  },
  {
    id: 2,
    name: 'Modern Creative',
    description: 'A split-column layout designed to maximize space and readability. Best suited for tech, design, and marketing roles.',
    link: '/template2',
    thumbnail: '/templates/template2.png',
    category: 'Creative',
    tags: ['2-Column', 'Design & Art', 'Slate theme'],
  },
  {
    id: 3,
    name: 'Executive Centered',
    description: 'A pristine, center-aligned corporate structure with full-width section borders. Highly professional.',
    link: '/template3',
    thumbnail: '/templates/template3_v2.png',
    category: 'Professional',
    tags: ['Top-tier Corporate', 'Clean Borders', 'Whitespace'],
  },
  {
    id: 4,
    name: 'Bold Tech Header',
    description: 'Featuring a high-contrast dark indigo top header band and tech-oriented grid layouts. Best for engineering and developers.',
    link: '/template4',
    thumbnail: '/templates/template4.png',
    category: 'Creative',
    tags: ['Bold Accent', 'Tech & Devs', 'High Contrast'],
  },
  {
    id: 5,
    name: 'Modern Professional',
    description: 'A sleek two-column header with heavy section borders in a strict black-and-white aesthetic.',
    link: '/template5',
    thumbnail: '/templates/template5_v2.png',
    category: 'Professional',
    tags: ['Two-Column Header', 'B&W Aesthetic', 'Structured'],
  },
];

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
    ? templates
    : templates.filter(template => template.category === selectedFilter);

  return (
    <div className="templates-page-container">
      {/* Background glow blobs */}
      <div className="glow-blob blob-1"></div>
      <div className="glow-blob blob-2"></div>

      {/* Header section */}
      <section className="templates-header">
        <span className="templates-tagline">✨ Choose Your Layout</span>
        <h1>Select a Resume Template</h1>
        <p>Pick a starting layout. You can customize the fields, change layouts, and drag sections to reorder them in the next step.</p>
      </section>

      {/* Filter bar */}
      <section className="templates-filter-bar">
        {['All', 'Professional', 'Creative'].map((cat) => (
          <button
            key={cat}
            className={`templates-filter-button ${selectedFilter === cat ? 'active' : ''}`}
            onClick={() => handleFilterChange(cat)}
          >
            {cat === 'All' ? 'Show All' : `${cat} Templates`}
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
                    
                    {/* Front Face: ONLY preview pic and hover Customize button */}
                    <div className="card-face card-front">
                      <div
                        className="template-preview-image"
                        style={{ backgroundImage: `url(${template.thumbnail})` }}
                      ></div>
                      
                      {/* Flip button (Info/Details triggers flipping) */}
                      <button 
                        className="btn-card-flip" 
                        onClick={(e) => handleFlip(template.id, e)}
                        title="Show Details & Tags"
                      >
                        <i className="fa-solid fa-rotate"></i>
                      </button>

                      <div className="template-preview-overlay">
                        <Link to={template.link} className="btn-preview-customize">
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
                        <Link to={template.link} className="btn-card-action">
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