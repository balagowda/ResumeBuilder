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
    <div className={`section-content ${collapsed ? 'collapsed' : 'expanded'}`}>
      <div className="section-content-inner">
        {/* The section heading names this field visually but is not associated
            with it, so the accessible name is spelled out here. */}
        <textarea
          id="summary"
          aria-label="Professional summary"
          name="summary"
          rows={4}
          value={summary}
          onChange={(e) => handleChange(e, 'summary')}
          placeholder="Enter your summary..."
          className="input-field"
        />
      </div>
    </div>
  </div>
);

export default Summary;