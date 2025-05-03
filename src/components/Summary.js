import React from 'react';

const Summary = ({ summary, collapsed, toggleSection, handleChange, dragHandle }) => (
  <div className="input-group">
    <div className="section-header" onClick={toggleSection}>
      <h3>
        {dragHandle}
        Summary
      </h3>
      <i
        className={`fa-solid ${collapsed ? 'fa-angle-down':'fa-angle-up' }`}
        style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#333' }}
      ></i>
    </div>
    {!collapsed && (
      <textarea
        name="summary"
        rows={4}
        value={summary}
        onChange={(e) => handleChange(e, 'summary')}
        placeholder="Enter your summary..."
        className="input-field"
      />
    )}
  </div>
);

export default Summary;