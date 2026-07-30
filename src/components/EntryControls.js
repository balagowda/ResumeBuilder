import React from 'react';

/**
 * Move/delete controls for one entry in a repeating section. Shared so
 * Experience, Projects, Education and Others all behave identically.
 *
 * Buttons rather than drag handles: reordering has to work with a keyboard, and
 * the section-level drag-and-drop already has no keyboard path.
 */
const EntryControls = ({ section, index, total, moveEntry, deleteEntry, label = 'entry' }) => (
  <div className="entry-controls">
    <button
      type="button"
      className="entry-move-btn"
      onClick={() => moveEntry(section, index, -1)}
      disabled={index === 0}
      title={`Move this ${label} up`}
      aria-label={`Move ${label} ${index + 1} up`}
    >
      <i className="fas fa-arrow-up"></i>
    </button>
    <button
      type="button"
      className="entry-move-btn"
      onClick={() => moveEntry(section, index, 1)}
      disabled={index === total - 1}
      title={`Move this ${label} down`}
      aria-label={`Move ${label} ${index + 1} down`}
    >
      <i className="fas fa-arrow-down"></i>
    </button>
    <button
      type="button"
      className="delete-btn"
      onClick={() => deleteEntry(section, index)}
      title={`Delete this ${label}`}
      aria-label={`Delete ${label} ${index + 1}`}
    >
      <i className="fas fa-trash"></i>
    </button>
  </div>
);

export default EntryControls;
