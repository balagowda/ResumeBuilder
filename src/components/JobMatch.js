import React, { useMemo } from 'react';
import { analyzeJobMatch } from '../utils/keywordMatch';

const scoreTone = (score) => {
  if (score >= 75) return 'good';
  if (score >= 50) return 'ok';
  return 'low';
};

const JobMatch = ({ jobDescription, formData, collapsed, toggleSection, handleChange, onAddSkill }) => {
  const result = useMemo(
    () => analyzeJobMatch(jobDescription, formData),
    [jobDescription, formData]
  );

  const hasInput = (jobDescription || '').trim().length > 0;

  return (
    <div className="input-group job-match">
      <div className="section-header" onClick={toggleSection}>
        <h3>
          <i className="fas fa-crosshairs job-match-icon"></i>
          Job Match
          <span className="beta-badge">BETA</span>
          {hasInput && !result.tooShort && (
            <span className={`job-match-badge job-match-badge-${scoreTone(result.score)}`}>
              {result.score}%
            </span>
          )}
        </h3>
        <i
          className={`fa-solid ${collapsed ? 'fa-angle-down' : 'fa-angle-up'}`}
          style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#333' }}
        ></i>
      </div>

      <div className={`section-content ${collapsed ? 'collapsed' : 'expanded'}`}>
        <div className="section-content-inner">
          <p className="job-match-intro">
            Paste the job posting. We compare its keywords against your resume.
          </p>
          <div className="ai-notice">
            <i className="fas fa-triangle-exclamation"></i>
            <div>
              <strong>Beta Feature:</strong> This automated job match may occasionally make mistakes or miss context. Don't expect 100% accuracy — use your best judgment.
            </div>
          </div>

          <textarea
            id="jobDescription"
            aria-label="Job description to match against"
            name="jobDescription"
            rows={6}
            value={jobDescription || ''}
            onChange={(e) => handleChange(e, 'jobDescription')}
            placeholder="Paste the full job description here…"
            className="input-field"
          />

          {hasInput && result.tooShort && (
            <p className="job-match-hint">
              <i className="fas fa-circle-info"></i> Paste a bit more of the posting — there isn't
              enough text yet to pull keywords from.
            </p>
          )}

          {hasInput && !result.tooShort && (
            <div className="job-match-results">
              <div className="job-match-score-row">
                <div className="job-match-score-bar">
                  <div
                    className={`job-match-score-fill job-match-fill-${scoreTone(result.score)}`}
                    style={{ width: `${result.score}%` }}
                  ></div>
                </div>
                <span className="job-match-score-num">{result.score}%</span>
              </div>
              <p className="job-match-summary">
                Your resume covers <strong>{result.matched.length}</strong> of{' '}
                <strong>{result.total}</strong> key terms from this posting.
              </p>

              {result.missing.length > 0 && (
                <div className="job-match-block">
                  <h4>
                    <i className="fas fa-circle-exclamation"></i> Missing keywords
                    <span className="job-match-count">{result.missing.length}</span>
                  </h4>
                  <p className="job-match-block-hint">
                    Click one to add it to your Skills — but only if it is genuinely true of you.
                  </p>
                  <div className="job-match-tags">
                    {result.missing.map((entry) => (
                      <button
                        key={entry.term}
                        type="button"
                        className="job-match-tag job-match-tag-missing"
                        title={`Mentioned ${entry.count}x in the posting — click to add to Skills`}
                        onClick={() => onAddSkill(entry.term)}
                      >
                        {entry.term}
                        <i className="fas fa-plus"></i>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {result.matched.length > 0 && (
                <div className="job-match-block">
                  <h4>
                    <i className="fas fa-circle-check"></i> Already covered
                    <span className="job-match-count">{result.matched.length}</span>
                  </h4>
                  <div className="job-match-tags">
                    {result.matched.map((entry) => (
                      <span key={entry.term} className="job-match-tag job-match-tag-matched">
                        {entry.term}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatch;
