import React from 'react';
import EntryControls from './EntryControls';

const Others = ({ others, collapsed, toggleSection, handleChange, addEntry, deleteEntry ,dragHandle, moveEntry }) => (
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
    <div className={`section-content ${collapsed ? 'collapsed' : 'expanded'}`}>
      <div className="section-content-inner">
        {others.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-layer-group"></i>
            <p>No additional items added yet.</p>
          </div>
        ) : (
          others.map((other, index) => (
            <div key={index} className="sub-group">
              {/* Per-entry ids — see the note in Experiences. */}
              <label htmlFor={`other-title-${index}`}>Title</label>
              <input
                id={`other-title-${index}`}
                type="text"
                name="title"
                value={other.title}
                onChange={(e) => handleChange(e, 'others', index)}
                placeholder="e.g., Volunteer Work"
                className="input-field"
              />
              <label htmlFor={`other-description-${index}`}>Description</label>
              <textarea
                id={`other-description-${index}`}
                name="description"
                rows={4}
                value={other.description}
                onChange={(e) => handleChange(e, 'others', index)}
                placeholder="Describe your role and achievements"
                className="input-field"
              />
              <EntryControls
                section="others"
                index={index}
                total={others.length}
                moveEntry={moveEntry}
                deleteEntry={deleteEntry}
                label="item"
              />
            </div>
          ))
        )}
        <button className="add-btn" onClick={() => addEntry('others')}>
          Add Other
        </button>
      </div>
    </div>
  </div>
);

export default Others;