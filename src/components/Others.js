import React from 'react';

const Others = ({ others, collapsed, toggleSection, handleChange, addEntry, deleteEntry ,dragHandle}) => (
  <div className="input-group">
    <div className="section-header" onClick={toggleSection}>
      <h3>
        {dragHandle}
        Others
      </h3>
      <i
        className={`fa-solid ${collapsed ? 'fa-angle-down':'fa-angle-up' }`}
        style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#333' }}
      ></i>
    </div>
    {!collapsed && (
      <div>
        {others.map((other, index) => (
          <div key={index} className="sub-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              name="title"
              value={other.title}
              onChange={(e) => handleChange(e, 'others', index)}
              placeholder="e.g., Volunteer Work"
              className="input-field"
            />
            <label htmlFor="description">Description</label>
            <textarea
              name="description"
              rows={4}
              value={other.description}
              onChange={(e) => handleChange(e, 'others', index)}
              placeholder="Describe your role and achievements"
              className="input-field"
            />
            <button
              className="delete-btn"
              onClick={() => deleteEntry('others', index)}
            >
              <i className="fas fa-trash"></i>
            </button>
          </div>
        ))}
        <button className="add-btn" onClick={() => addEntry('others')}>
          Add Other
        </button>
      </div>
    )}
  </div>
);

export default Others;