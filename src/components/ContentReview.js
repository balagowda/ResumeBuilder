import React, { useMemo, useState } from 'react';
import { lintResume } from '../utils/contentLint';

const SEVERITY_LABEL = {
  high: 'Fix this',
  medium: 'Worth improving',
  low: 'Polish',
};

const scoreTone = (score) => {
  if (score >= 80) return 'good';
  if (score >= 55) return 'ok';
  return 'low';
};

/**
 * The writing-quality counterpart to the strength meter: strength asks whether
 * a field is filled, this asks whether what is in it reads well.
 */
const ContentReview = ({ formData, collapsed, toggleSection }) => {
  const [showAll, setShowAll] = useState(false);
  const { score, issues, bulletCount } = useMemo(() => lintResume(formData), [formData]);

  const visible = showAll ? issues : issues.slice(0, 6);

  return (
    <div className="input-group content-review">
      <div className="section-header" onClick={toggleSection}>
        <h3>
          <i className="fas fa-spell-check content-review-icon"></i>
          Writing Review
          {bulletCount > 0 && (
            <span className={`content-review-badge content-review-badge-${scoreTone(score)}`}>
              {score}%
            </span>
          )}
        </h3>
        <i
          className={`fa-solid ${collapsed ? 'fa-angle-down' : 'fa-angle-up'}`}
          style={{ cursor: 'pointer', fontSize: '1.2rem', color: '#333' }}
        ></i>
      </div>

      {!collapsed && (
        <div>
          <p className="content-review-intro">
            The checks a recruiter makes on a first read — action verbs, hard numbers, passive
            voice, filler. Runs entirely in your browser.
          </p>

          {bulletCount === 0 && (
            <p className="content-review-hint">
              <i className="fas fa-circle-info"></i> Write a few bullet points under your experience
              or projects and they will be reviewed here.
            </p>
          )}

          {bulletCount > 0 && issues.length === 0 && (
            <p className="content-review-clear">
              <i className="fas fa-circle-check"></i> Nothing to flag across your{' '}
              {bulletCount} bullet{bulletCount === 1 ? '' : 's'}. This reads well.
            </p>
          )}

          {visible.length > 0 && (
            <ul className="content-review-list">
              {visible.map((item) => (
                <li key={item.id} className={`content-review-item sev-${item.severity}`}>
                  <div className="content-review-item-head">
                    <span className={`content-review-sev sev-${item.severity}`}>
                      {SEVERITY_LABEL[item.severity]}
                    </span>
                    <span className="content-review-where">{item.where}</span>
                  </div>
                  <p className="content-review-message">{item.message}</p>
                  {item.excerpt && <p className="content-review-excerpt">“{item.excerpt}”</p>}
                  <p className="content-review-fix">
                    <i className="fas fa-arrow-right"></i> {item.fix}
                  </p>
                </li>
              ))}
            </ul>
          )}

          {issues.length > 6 && (
            <button
              type="button"
              className="content-review-more"
              onClick={() => setShowAll((v) => !v)}
            >
              {showAll ? 'Show fewer' : `Show all ${issues.length} suggestions`}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default ContentReview;
