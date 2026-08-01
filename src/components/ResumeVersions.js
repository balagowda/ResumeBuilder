import React, { useState } from 'react';
import ResumeCompare from './ResumeCompare';

/**
 * Switcher for the user's saved resumes, so one person can keep a version per
 * role ("Backend", "Product") instead of overwriting a single document.
 */
const ResumeVersions = ({
  resumes,
  activeId,
  active,
  onSwitch,
  onCreate,
  onDuplicate,
  onRename,
  onDelete,
}) => {
  const [isRenaming, setIsRenaming] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [isComparing, setIsComparing] = useState(false);

  const startRename = () => {
    setDraftName(active ? active.name : '');
    setIsRenaming(true);
  };

  const commitRename = () => {
    if (draftName.trim()) onRename(activeId, draftName);
    setIsRenaming(false);
  };

  const handleDelete = () => {
    if (!active) return;
    const message =
      resumes.length === 1
        ? `Delete "${active.name}"? This is your only resume, so you will be left with a blank one.`
        : `Delete "${active.name}"? This cannot be undone.`;
    if (window.confirm(message)) onDelete(activeId);
  };

  return (
    <div className="resume-versions">
      <div className="resume-versions-row">
        <label htmlFor="resume-version-select" className="resume-versions-label">
          <i className="fas fa-copy"></i> Resume
        </label>

        {isRenaming ? (
          <input
            className="resume-versions-rename"
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onBlur={commitRename}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commitRename();
              if (e.key === 'Escape') setIsRenaming(false);
            }}
            aria-label="Resume name"
            autoFocus
          />
        ) : (
          <select
            id="resume-version-select"
            className="resume-versions-select"
            value={activeId || ''}
            onChange={(e) => onSwitch(e.target.value)}
          >
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="resume-versions-actions">
        <button type="button" onClick={() => onCreate()} title="Start another resume from scratch">
          <i className="fas fa-plus"></i> New
        </button>
        <button type="button" onClick={() => onDuplicate(activeId)} title="Copy this resume to tailor for another role">
          <i className="fas fa-clone"></i> Duplicate
        </button>
        <button type="button" onClick={startRename} title="Rename this resume">
          <i className="fas fa-pen"></i> Rename
        </button>
        {resumes.length > 1 && (
          <button
            type="button"
            onClick={() => setIsComparing(true)}
            title="See what differs between this resume and another version"
          >
            <i className="fas fa-code-compare"></i> Compare
          </button>
        )}
        <button type="button" className="resume-versions-delete" onClick={handleDelete} title="Delete this resume">
          <i className="fas fa-trash"></i>
        </button>
      </div>

      {isComparing && active && (
        <ResumeCompare resumes={resumes} active={active} onClose={() => setIsComparing(false)} />
      )}
    </div>
  );
};

export default ResumeVersions;
