import React from 'react';

const Experiences = ({
  experiences,
  collapsed,
  toggleSection,
  handleChange,
  addEntry,
  deleteEntry,
  experienceHeading,
  handleHeadingChange,
  dragHandle,
}) => (
  <div className="input-group">
    <div className="section-header" onClick={toggleSection}>
      <h3>
        {dragHandle}
        {experienceHeading}
      </h3>
      <i
        className={`fa-solid ${collapsed ? 'fa-angle-down':'fa-angle-up' }`}
        style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#333' }}
      ></i>
    </div>
    {!collapsed && (
      <div>
        <div className="heading-options">
          <button
            className={experienceHeading === 'Experience' ? 'active' : ''}
            onClick={() => handleHeadingChange('Experience')}
          >
            Experience
          </button>
          <button
            className={experienceHeading === 'Internship' ? 'active' : ''}
            onClick={() => handleHeadingChange('Internship')}
          >
            Internship
          </button>
          <button
            className={experienceHeading === 'Experience and Internships' ? 'active' : ''}
            onClick={() => handleHeadingChange('Experience and Internships')}
          >
            Experience and Internships
          </button>
        </div>
        {experiences.map((exp, index) => (
          <div key={index} className="sub-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              name="title"
              value={exp.title}
              onChange={(e) => handleChange(e, 'experiences', index)}
              placeholder="e.g., Software Engineer"
              className="input-field"
            />
            <label htmlFor="company">Company</label>
            <input
              type="text"
              name="company"
              value={exp.company}
              onChange={(e) => handleChange(e, 'experiences', index)}
              placeholder="e.g., ABC Corp"
              className="input-field"
            />
            <label htmlFor="dates">Dates</label>
            <input
              type="text"
              name="dates"
              value={exp.dates}
              onChange={(e) => handleChange(e, 'experiences', index)}
              placeholder="e.g., Jan 2020 - Dec 2021"
              className="input-field"
            />
            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              rows={4}
              value={exp.description}
              onChange={(e) => handleChange(e, 'experiences', index)}
              placeholder="Describe your role and achievements"
              className="input-field"
            />
            <button
              className="delete-btn"
              onClick={() => deleteEntry('experiences', index)}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))}
        <button className="add-btn" onClick={() => addEntry('experiences')}>
          Add Experience
        </button>
      </div>
    )}
  </div>
);

export default Experiences;