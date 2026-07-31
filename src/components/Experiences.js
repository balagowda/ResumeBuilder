import React from 'react';
import DateRangeField from './DateRangeField';
import EntryControls from './EntryControls';

const Experiences = ({
  experiences,
  collapsed,
  toggleSection,
  handleChange,
  addEntry,
  deleteEntry,
  moveEntry,
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
    <div className={`section-content ${collapsed ? 'collapsed' : 'expanded'}`}>
      <div className="section-content-inner">
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
        {experiences.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-briefcase"></i>
            <p>No experiences added yet.</p>
          </div>
        ) : (
          experiences.map((exp, index) => (
            <div key={index} className="sub-group">
              {/* Ids are per-entry: every role renders the same fields, so a
                  bare "title" would repeat across the list and each label
                  would point at the first one. */}
              <label htmlFor={`experience-title-${index}`}>Title</label>
              <input
                id={`experience-title-${index}`}
                type="text"
                name="title"
                value={exp.title}
                onChange={(e) => handleChange(e, 'experiences', index)}
                placeholder="e.g., Software Engineer"
                className="input-field"
              />
              <label htmlFor={`experience-company-${index}`}>Company</label>
              <input
                id={`experience-company-${index}`}
                type="text"
                name="company"
                autoComplete="organization"
                value={exp.company}
                onChange={(e) => handleChange(e, 'experiences', index)}
                placeholder="e.g., ABC Corp"
                className="input-field"
              />
              <DateRangeField
                id={`experience-dates-${index}`}
                value={exp.dates}
                onChange={(next) =>
                  handleChange({ target: { name: 'dates', value: next } }, 'experiences', index)
                }
              />
              <label htmlFor={`experience-description-${index}`}>Description</label>
              <textarea
                id={`experience-description-${index}`}
                name="description"
                rows={4}
                value={exp.description}
                onChange={(e) => handleChange(e, 'experiences', index)}
                placeholder="Describe your role and achievements"
                className="input-field"
              />
              <EntryControls
                section="experiences"
                index={index}
                total={experiences.length}
                moveEntry={moveEntry}
                deleteEntry={deleteEntry}
                label="role"
              />
            </div>
          ))
        )}
        <button className="add-btn" onClick={() => addEntry('experiences')}>
          Add Experience
        </button>
      </div>
    </div>
  </div>
);

export default Experiences;