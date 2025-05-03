import React from 'react';

const Education = ({ education, collapsed, toggleSection, handleChange, addEntry, deleteEntry, dragHandle }) => (
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
    {!collapsed && (
      <div>
        {education.map((edu, index) => (
          <div key={index} className="sub-group">
            <label htmlFor="studyTitle">Study Title</label>
            <input
              type="text"
              name="studyTitle"
              value={edu.studyTitle}
              onChange={(e) => handleChange(e, 'education', index)}
              placeholder="e.g., Bachelor of Science"
              className="input-field"
            />
            <label htmlFor="school">School</label>
            <input
              type="text"
              name="school"
              value={edu.school}
              onChange={(e) => handleChange(e, 'education', index)}
              placeholder="e.g., XYZ University"
              className="input-field"
            />
            <label htmlFor="date">Date</label>
            <input
              type="text"
              name="date"
              value={edu.date}
              onChange={(e) => handleChange(e, 'education', index)}
              placeholder="e.g., 2015 - 2019"
              className="input-field"
            />
            <label htmlFor="score">Score</label>
            <input
              type="text"
              name="score"
              value={edu.score}
              onChange={(e) => handleChange(e, 'education', index)}
              placeholder="e.g., 3.8 GPA"
              className="input-field"
            />
            <button
              className="delete-btn"
              onClick={() => deleteEntry('education', index)}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))}
        <button className="add-btn" onClick={() => addEntry('education')}>
          Add Education
        </button>
      </div>
    )}
  </div>
);

export default Education;