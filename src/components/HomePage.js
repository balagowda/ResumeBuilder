import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import '../Styles/HomePage.css'; 

const templates = [
  {
    id: 1,
    name: 'Modern',
    link: '/template1',
    thumbnail: 'https://media.licdn.com/dms/image/v2/C4E12AQEq7L7Qgj41Mw/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1520061951064?e=2147483647&v=beta&t=CSquL7-mjmtB826kFrJDiNl0gjjLxwF6hIwVkOq5x8w',
    category: 'Professional',
  },
  {
    id: 2,
    name: 'Creative',
    link: '/template2',
    thumbnail: 'https://www.resumetemplates.com/wp-content/uploads/2024/03/ATS-Friendly-Resume-Templates-and-Examples.pdf.jpeg',
    category: 'Creative',
  },
  {
    id: 3,
    name: 'Classic',
    link: '/template3',
    thumbnail: 'https://media.licdn.com/dms/image/v2/C4E12AQEq7L7Qgj41Mw/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1520061951064?e=2147483647&v=beta&t=CSquL7-mjmtB826kFrJDiNl0gjjLxwF6hIwVkOq5x8w',
    category: 'Professional',
  },
  {
    id: 4,
    name: 'Modern',
    link: '/template4',
    thumbnail: 'https://media.licdn.com/dms/image/v2/C4E12AQEq7L7Qgj41Mw/article-cover_image-shrink_720_1280/article-cover_image-shrink_720_1280/0/1520061951064?e=2147483647&v=beta&t=CSquL7-mjmtB826kFrJDiNl0gjjLxwF6hIwVkOq5x8w',
    category: 'Modern',
  },
];

const HomePage = () => {
    const [selectedFilter, setSelectedFilter] = useState('All');
  
    const handleFilterChange = (category) => {
      setSelectedFilter(category);
    };
  
    const filteredTemplates = selectedFilter === 'All'
      ? templates
      : templates.filter(template => template.category === selectedFilter);
  
    return (
      <div className="homepage-container">
        <section className="hero-section">
          <h1>Create Your Professional Resume</h1>
          <p>Free Resume Templates - No Login Required, No Data Saved, Instant Download</p>
          <p className="cta-button">
            It's free
          </p>
        </section>
        <section className="filter-bar">
          <button
            className={`filter-button ${selectedFilter === 'All' ? 'active' : ''}`}
            onClick={() => handleFilterChange('All')}
          >
            All
          </button>
          <button
            className={`filter-button ${selectedFilter === 'Modern' ? 'active' : ''}`}
            onClick={() => handleFilterChange('Modern')}
          >
            Modern
          </button>
          <button
            className={`filter-button ${selectedFilter === 'Creative' ? 'active' : ''}`}
            onClick={() => handleFilterChange('Creative')}
          >
            Creative
          </button>
          <button
            className={`filter-button ${selectedFilter === 'Professional' ? 'active' : ''}`}
            onClick={() => handleFilterChange('Professional')}
          >
            Professional
          </button>
        </section>
        <section className="template-cards">
          {filteredTemplates.length > 0 ? (
            filteredTemplates.map((template) => (
              <article key={template.id} className="template-card" role="article" aria-labelledby={`template-${template.id}`}>
                <div
                  className="card-image"
                  style={{ backgroundImage: `url(${template.thumbnail})` }}
                  aria-label={`${template.name} template preview`}
                ></div>
                <div className="template-content" id='templates'>
                  <h2 id={`template-${template.id}`}>{template.name}</h2>
                  <Link to={template.link} className="customize-button">
                    Customize This Template
                  </Link>
                </div>
              </article>
            ))
          ) : (
            <div className="no-templates-message">No templates found</div>
          )}
        </section>
      </div>
    );
  };

export default HomePage;