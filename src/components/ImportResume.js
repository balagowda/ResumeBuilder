import React, { useRef, useState } from 'react';
import { parseResumeText } from '../utils/resumeParser';

/**
 * Bring an existing resume in by pasting its text.
 *
 * Nothing is written until the user has seen what was detected — a parse of
 * free-form resume text is a guess, and silently overwriting someone's work
 * with a bad guess is the one outcome worth designing against.
 */
const ImportResume = ({ collapsed, toggleSection, onImport, hasExistingContent }) => {
  const [text, setText] = useState('');
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const fileRef = useRef();

  const scan = (source) => {
    const value = (source ?? text).trim();
    if (value.length < 40) {
      setError('That is not enough text to read — paste the whole resume.');
      setResult(null);
      return;
    }
    const parsed = parseResumeText(value);
    if (parsed.report.found.length === 0) {
      setError('Nothing recognisable was found. Check that the text pasted correctly.');
      setResult(null);
      return;
    }
    setError('');
    setResult(parsed);
  };

  const handleFile = (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const value = String(e.target.result || '');
      setText(value);
      scan(value);
    };
    reader.onerror = () => setError('Could not read that file.');
    reader.readAsText(file);
    event.target.value = '';
  };

  const apply = (mode) => {
    if (!result) return;
    onImport(result.data, mode);
    setText('');
    setResult(null);
  };

  return (
    <div className="input-group import-resume">
      <div className="section-header" onClick={toggleSection}>
        <h3>
          <i className="fas fa-file-import import-resume-icon"></i>
          Import Existing Resume
        </h3>
        <i
          className={`fa-solid ${collapsed ? 'fa-angle-down' : 'fa-angle-up'}`}
          style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#333' }}
        ></i>
      </div>

      {!collapsed && (
        <div>
          <p className="import-resume-intro">
            Open your current resume, select all the text and paste it here. It is read in your
            browser — the file is never uploaded.
          </p>

          <textarea
            className="input-field import-resume-input"
            rows={7}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Paste the full text of your resume…"
          />

          <div className="import-resume-actions">
            <button type="button" className="import-scan-btn" onClick={() => scan()}>
              <i className="fas fa-wand-magic-sparkles"></i> Read it
            </button>
            <button
              type="button"
              className="import-file-btn"
              onClick={() => fileRef.current && fileRef.current.click()}
            >
              <i className="fas fa-folder-open"></i> Open .txt
            </button>
            <input
              type="file"
              accept=".txt,text/plain"
              ref={fileRef}
              onChange={handleFile}
              style={{ display: 'none' }}
            />
          </div>

          <p className="import-resume-note">
            Have a PDF? Open it, press Ctrl/Cmd+A then Ctrl/Cmd+C, and paste above.
          </p>

          {error && <p className="import-resume-error" role="alert">{error}</p>}

          {result && (
            <div className="import-preview">
              <h4>
                <i className="fas fa-clipboard-check"></i> Here is what was found
              </h4>

              <div className="import-chips">
                {result.report.found.map((label) => (
                  <span key={label} className="import-chip found">
                    <i className="fas fa-check"></i> {label}
                  </span>
                ))}
                {result.report.missing.map((label) => (
                  <span key={label} className="import-chip missing">
                    <i className="fas fa-minus"></i> {label}
                  </span>
                ))}
              </div>

              {result.data.fullName && (
                <p className="import-preview-line">
                  <strong>{result.data.fullName}</strong>
                  {result.data.professionalTitle ? ` — ${result.data.professionalTitle}` : ''}
                </p>
              )}

              {result.report.missing.length > 0 && (
                <p className="import-preview-hint">
                  Anything greyed out was not recognised — you can fill it in after importing.
                </p>
              )}

              <div className="import-apply-row">
                <button type="button" className="import-apply-btn" onClick={() => apply('new')}>
                  <i className="fas fa-plus"></i> Import as a new resume
                </button>
                <button
                  type="button"
                  className="import-apply-btn secondary"
                  onClick={() => apply('replace')}
                >
                  Replace this one
                </button>
              </div>
              {hasExistingContent && (
                <p className="import-preview-hint">
                  Replacing overwrites what is in the form now — undo brings it straight back.
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImportResume;
