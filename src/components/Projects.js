import React from 'react';
import DateRangeField from './DateRangeField';
import EntryControls from './EntryControls';

const Projects = ({ projects, collapsed, toggleSection, handleChange, addEntry, deleteEntry, moveEntry, dragHandle }) => (
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
    <div className={`section-content ${collapsed ? 'collapsed' : 'expanded'}`}>
      <div className="section-content-inner">
        {projects.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-project-diagram"></i>
            <p>No projects added yet.</p>
          </div>
        ) : (
          projects.map((proj, index) => (
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
              <DateRangeField
                id={`project-dates-${index}`}
                value={proj.dates}
                onChange={(next) =>
                  handleChange({ target: { name: 'dates', value: next } }, 'projects', index)
                }
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
              <EntryControls
                section="projects"
                index={index}
                total={projects.length}
                moveEntry={moveEntry}
                deleteEntry={deleteEntry}
                label="project"
              />
            </div>
          ))
        )}
        <button className="add-btn" onClick={() => addEntry('projects')}>
          Add Project
        </button>
      </div>
    </div>
  </div>
);

export default Projects;