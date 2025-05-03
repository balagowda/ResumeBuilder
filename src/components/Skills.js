import React from 'react';

const Skills = ({ skills, collapsed, toggleSection, handleChange, dragHandle }) => (
  <div className="input-group">
    <div className="section-header" onClick={toggleSection}>
      <h3>
        {dragHandle}
        Skills
      </h3>
      <i
        className={`fa-solid ${collapsed ? 'fa-angle-down':'fa-angle-up' }`}
        style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#333' }}
      ></i>
    </div>
    {!collapsed && (
      <textarea
        name="skills"
        rows={4}
        value={skills}
        onChange={(e) => handleChange(e, 'skills')}
        placeholder="Enter your skills..."
        className="input-field"
      />
    )}
  </div>
);

export default Skills;