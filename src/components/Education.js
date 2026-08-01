import React from 'react';
import DateRangeField from './DateRangeField';
import EntryControls from './EntryControls';

const Education = ({ education, collapsed, toggleSection, handleChange, addEntry, deleteEntry, dragHandle, moveEntry }) => (
  <div className="input-group">
    <div className="section-header" onClick={toggleSection}>
      <h3>
        {dragHandle}
        Education
      </h3>
      <i
        className={`fa-solid ${collapsed ? 'fa-angle-down':'fa-angle-up' }`}
        style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#333' }}
      ></i>
    </div>
    <div className={`section-content ${collapsed ? 'collapsed' : 'expanded'}`}>
      <div className="section-content-inner">
        {education.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-graduation-cap"></i>
            <p>No education added yet.</p>
          </div>
        ) : (
          education.map((edu, index) => (
            <div key={index} className="sub-group">
              {/* Per-entry ids — see the note in Experiences. */}
              <label htmlFor={`education-studyTitle-${index}`}>Study Title</label>
              <input
                id={`education-studyTitle-${index}`}
                type="text"
                name="studyTitle"
                value={edu.studyTitle}
                onChange={(e) => handleChange(e, 'education', index)}
                placeholder="e.g., Bachelor of Science"
                className="input-field"
              />
              <label htmlFor={`education-school-${index}`}>School</label>
              <input
                id={`education-school-${index}`}
                type="text"
                name="school"
                value={edu.school}
                onChange={(e) => handleChange(e, 'education', index)}
                placeholder="e.g., XYZ University"
                className="input-field"
              />
              <DateRangeField
                id={`education-date-${index}`}
                label="Date"
                value={edu.date}
                onChange={(next) =>
                  handleChange({ target: { name: 'date', value: next } }, 'education', index)
                }
              />
              <label htmlFor={`education-score-${index}`}>Score</label>
              <input
                id={`education-score-${index}`}
                type="text"
                name="score"
                value={edu.score}
                onChange={(e) => handleChange(e, 'education', index)}
                placeholder="e.g., 3.8 GPA"
                className="input-field"
              />
              <EntryControls
                section="education"
                index={index}
                total={education.length}
                moveEntry={moveEntry}
                deleteEntry={deleteEntry}
                label="qualification"
              />
            </div>
          ))
        )}
        <button className="add-btn" onClick={() => addEntry('education')}>
          Add Education
        </button>
      </div>
    </div>
  </div>
);

export default Education;