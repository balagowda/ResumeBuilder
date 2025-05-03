import React from 'react';

const Projects = ({ projects, collapsed, toggleSection, handleChange, addEntry, deleteEntry , dragHandle}) => (
  <div className="input-group">
    <div className="section-header"  onClick={toggleSection}>
      <h3>
        {dragHandle}
        Projects
      </h3>
      <i
        className={`fa-solid ${collapsed ? 'fa-angle-down':'fa-angle-up' }`}
        style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#333' }}
      ></i>
    </div>
    {!collapsed && (
      <div>
        {projects.map((proj, index) => (
          <div key={index} className="sub-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              name="title"
              value={proj.title}
              onChange={(e) => handleChange(e, 'projects', index)}
              placeholder="e.g., Portfolio Website"
              className="input-field"
            />
            <label htmlFor="dates">Dates</label>
            <input
              type="text"
              name="dates"
              value={proj.dates}
              onChange={(e) => handleChange(e, 'projects', index)}
              placeholder="e.g., Jan 2021 - Mar 2021"
              className="input-field"
            />
            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              rows={4}
              value={proj.description}
              onChange={(e) => handleChange(e, 'projects', index)}
              placeholder="Describe the project and your role"
              className="input-field"
            />
            <button
              className="delete-btn"
              onClick={() => deleteEntry('projects', index)}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))}
        <button className="add-btn" onClick={() => addEntry('projects')}>
          Add Project
        </button>
      </div>
    )}
  </div>
);

export default Projects;