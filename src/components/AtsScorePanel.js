import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkResumeText } from '../utils/atsCheck';
import { resumeToAtsText } from '../utils/atsText';

const scoreTone = (score) => {
  if (score >= 80) return 'good';
  if (score >= 55) return 'ok';
  return 'low';
};

const STATE_ICON = {
  pass: 'fa-circle-check',
  warn: 'fa-triangle-exclamation',
  fail: 'fa-circle-xmark',
};

/**
 * Live ATS score for the open resume — the same structural checks as the
 * standalone /ats-resume-checker page, run against the text an ATS would
 * extract from the exported ATS PDF. The score updates as the user types, so
 * fixing a flagged issue is immediately rewarded.
 */
const AtsScorePanel = ({ formData, sectionOrder, experienceHeading, collapsed, toggleSection }) => {
  const [showPassing, setShowPassing] = useState(false);

  const result = useMemo(
    () => checkResumeText(resumeToAtsText(formData, sectionOrder, experienceHeading)),
    [formData, sectionOrder, experienceHeading]
  );

  const flagged = result.checks.filter((c) => c.state !== 'pass');
  const passing = result.checks.filter((c) => c.state === 'pass');

  return (
    <div className="input-group ats-score-panel">
      <div className="section-header" onClick={toggleSection}>
        <h3>
          <i className="fas fa-robot ats-score-icon"></i>
          ATS Check
          <span className="beta-badge">BETA</span>
          {!result.empty && (
            <span className={`content-review-badge content-review-badge-${scoreTone(result.score)}`}>
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
          <p className="content-review-intro">
            How your exported ATS PDF scores against the checks applicant tracking systems run —
            contact details, standard headings, dates, length, quantified bullets.
          </p>

          {result.empty ? (
            <p className="content-review-hint">
              <i className="fas fa-circle-info"></i> Fill in your details and the score appears
              here.
            </p>
          ) : (
            <>
              {flagged.length === 0 && (
                <p className="content-review-clear">
                  <i className="fas fa-circle-check"></i> All {result.checks.length} structural
                  checks pass. Parsers should read this cleanly.
                </p>
              )}

              {flagged.length > 0 && (
                <ul className="ats-score-checks">
                  {flagged.map((check) => (
                    <li key={check.id} className={`ats-score-check state-${check.state}`}>
                      <i className={`fas ${STATE_ICON[check.state]}`}></i>
                      <div>
                        <strong>{check.label}</strong>
                        <p>{check.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              {passing.length > 0 && flagged.length > 0 && (
                <button
                  type="button"
                  className="content-review-more"
                  onClick={() => setShowPassing((v) => !v)}
                >
                  {showPassing ? 'Hide' : 'Show'} {passing.length} passing check
                  {passing.length === 1 ? '' : 's'}
                </button>
              )}

              {showPassing && (
                <ul className="ats-score-checks ats-score-checks-pass">
                  {passing.map((check) => (
                    <li key={check.id} className="ats-score-check state-pass">
                      <i className={`fas ${STATE_ICON.pass}`}></i>
                      <div>
                        <strong>{check.label}</strong>
                      </div>
                    </li>
                  ))}
                </ul>
              )}

              <p className="ats-score-footer">
                Scoring a resume from another builder?{' '}
                <Link to="/ats-resume-checker">Use the standalone checker</Link>.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AtsScorePanel;
