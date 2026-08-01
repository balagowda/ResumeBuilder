import React from 'react';
import EntryControls from './EntryControls';

// One-click starters for the sections resumes most often need beyond the core
// ones. Each creates a pre-titled entry; templates render the title as the
// section heading, so the resume gets a real "Certifications" block.
const PRESETS = [
  { title: 'Certifications', icon: 'fa-certificate', placeholder: 'AWS Solutions Architect Associate — 2025\nGoogle Analytics Individual Qualification — 2024' },
  { title: 'Languages', icon: 'fa-language', placeholder: 'English — fluent\nSpanish — professional working proficiency' },
  { title: 'Awards & Honors', icon: 'fa-trophy', placeholder: 'Dean’s List, 2022–2024\nFirst place, University Hackathon 2023' },
  { title: 'Volunteering', icon: 'fa-hand-holding-heart', placeholder: 'Meals on Wheels — weekend delivery volunteer, 2023–present' },
];

const Others = ({ others, collapsed, toggleSection, handleChange, addEntry, deleteEntry, dragHandle, moveEntry }) => {
  const existingTitles = others.map((o) => (o.title || '').toLowerCase());

  return (
    <div className="input-group">
      <div className="section-header" onClick={toggleSection}>
        <h3>
          {dragHandle}
          Additional Sections
        </h3>
        <i
          className={`fa-solid ${collapsed ? 'fa-angle-down' : 'fa-angle-up'}`}
          style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#333' }}
        ></i>
      </div>
      <div className={`section-content ${collapsed ? 'collapsed' : 'expanded'}`}>
        <div className="section-content-inner">
          <p className="others-presets-hint">
            Add the extra sections recruiters look for — or create your own with any title.
          </p>
          <div className="others-presets">
            {PRESETS.map((preset) => {
              const added = existingTitles.includes(preset.title.toLowerCase());
              return (
                <button
                  key={preset.title}
                  type="button"
                  className="others-preset-chip"
                  disabled={added}
                  title={added ? `${preset.title} is already added below` : `Add a ${preset.title} section`}
                  onClick={() => addEntry('others', { title: preset.title })}
                >
                  <i className={`fas ${preset.icon}`}></i> {preset.title}
                  {added ? <i className="fas fa-check others-preset-added"></i> : null}
                </button>
              );
            })}
          </div>

          {others.map((other, index) => {
            const preset = PRESETS.find(
              (p) => p.title.toLowerCase() === (other.title || '').toLowerCase()
            );
            return (
              <div key={index} className="sub-group">
                {/* Per-entry ids — see the note in Experiences. */}
                <label htmlFor={`other-title-${index}`}>Section title</label>
                <input
                  id={`other-title-${index}`}
                  type="text"
                  name="title"
                  value={other.title}
                  onChange={(e) => handleChange(e, 'others', index)}
                  placeholder="e.g., Certifications, Languages, Volunteering"
                  className="input-field"
                />
                <label htmlFor={`other-description-${index}`}>Content</label>
                <textarea
                  id={`other-description-${index}`}
                  name="description"
                  rows={4}
                  value={other.description}
                  onChange={(e) => handleChange(e, 'others', index)}
                  placeholder={preset ? preset.placeholder : 'One item per line — each renders as its own line on the resume'}
                  className="input-field"
                />
                <EntryControls
                  section="others"
                  index={index}
                  total={others.length}
                  moveEntry={moveEntry}
                  deleteEntry={deleteEntry}
                  label="section"
                />
              </div>
            );
          })}

          <button className="add-btn" onClick={() => addEntry('others')}>
            Add Custom Section
          </button>
        </div>
      </div>
    </div>
  );
};

export default Others;
