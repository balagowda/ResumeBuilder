import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkResumeText } from '../utils/atsCheck';
import { analyzeJobMatchText } from '../utils/keywordMatch';
import { ATS_CHECKER_META, ATS_CHECKER_COPY } from '../seo/pageMeta.mjs';
import useDocumentMeta from '../seo/useDocumentMeta';
import '../Styles/AtsChecker.css';

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

// Standalone version of the checks the editor runs in its sidebar. It exists as
// its own page because "free ATS resume checker" is how people look for this,
// and because it is useful before you have committed to rebuilding a resume.
const AtsChecker = () => {
  useDocumentMeta({ ...ATS_CHECKER_META, path: '/ats-resume-checker' });

  const [resumeText, setResumeText] = useState('');
  const [jobText, setJobText] = useState('');

  const result = useMemo(() => checkResumeText(resumeText), [resumeText]);
  const match = useMemo(
    () => (jobText.trim() ? analyzeJobMatchText(jobText, resumeText) : null),
    [jobText, resumeText]
  );

  return (
    <div className="ats-page">
      <div className="ats-inner">
        <h1>{ATS_CHECKER_COPY.h1}</h1>
        <p className="ats-lead">{ATS_CHECKER_COPY.lead}</p>
        <p className="ats-privacy">
          <i className="fas fa-lock" aria-hidden="true"></i> {ATS_CHECKER_COPY.privacy}
        </p>

        <div className="ats-inputs">
          <label className="ats-field">
            <span className="ats-field-label">Your resume</span>
            <textarea
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              placeholder="Paste the full text of your resume here — open your PDF, select all, copy."
              rows={16}
              spellCheck="false"
            />
          </label>

          <label className="ats-field">
            <span className="ats-field-label">
              Job posting <span className="ats-optional">optional</span>
            </span>
            <textarea
              value={jobText}
              onChange={(e) => setJobText(e.target.value)}
              placeholder="Paste the job description to compare keywords."
              rows={16}
              spellCheck="false"
            />
          </label>
        </div>

        {result.empty ? (
          <p className="ats-empty">
            Results appear here as soon as you paste something. Nothing to build
            or sign up for.
          </p>
        ) : (
          <div className="ats-results">
            <div className={`ats-score ats-score-${scoreTone(result.score)}`}>
              <span className="ats-score-num">{result.score}</span>
              <span className="ats-score-label">ATS readiness</span>
              <span className="ats-score-stats">
                {result.stats.words} words · {result.stats.bullets} bullets ·{' '}
                {result.stats.quantified} with numbers
              </span>
            </div>

            <ul className="ats-checks">
              {result.checks.map((check) => (
                <li key={check.id} className={`ats-check ats-check-${check.state}`}>
                  <i className={`fas ${STATE_ICON[check.state]}`} aria-hidden="true"></i>
                  <div>
                    <strong>{check.label}</strong>
                    <p>{check.detail}</p>
                  </div>
                </li>
              ))}
            </ul>

            {result.writing && result.writing.issues.length > 0 && (
              <section className="ats-writing">
                <h2>Writing issues in your bullets</h2>
                <ul>
                  {result.writing.issues.slice(0, 8).map((issue) => (
                    <li key={issue.id} className={`ats-issue ats-issue-${issue.severity}`}>
                      <strong>{issue.message}</strong>
                      <p>{issue.fix}</p>
                      {issue.excerpt && <q>{issue.excerpt}</q>}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {match && !match.tooShort && (
              <section className="ats-keywords">
                <h2>Keyword match against the posting: {match.score}%</h2>
                {match.missing.length > 0 ? (
                  <>
                    <p>
                      In the posting but not in your resume — add the ones you can
                      honestly claim:
                    </p>
                    <div className="ats-keyword-list">
                      {match.missing.slice(0, 18).map((entry) => (
                        <span key={entry.term} className="ats-keyword missing">
                          {entry.term}
                        </span>
                      ))}
                    </div>
                  </>
                ) : (
                  <p>Every significant term from the posting appears in your resume.</p>
                )}
                {match.matched.length > 0 && (
                  <>
                    <p className="ats-keyword-heading">Already covered:</p>
                    <div className="ats-keyword-list">
                      {match.matched.slice(0, 18).map((entry) => (
                        <span key={entry.term} className="ats-keyword matched">
                          {entry.term}
                        </span>
                      ))}
                    </div>
                  </>
                )}
              </section>
            )}

            {match && match.tooShort && (
              <p className="ats-note">
                That job posting is too short to analyse — paste the full
                description, including the requirements list.
              </p>
            )}
          </div>
        )}

        <section className="ats-explainer">
          <h2>What this checker looks at</h2>
          <ul className="ats-explainer-list">
            {ATS_CHECKER_COPY.checks.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          <h2>What an ATS actually does</h2>
          {ATS_CHECKER_COPY.explainer.map((paragraph) => (
            <p key={paragraph.slice(0, 40)}>{paragraph}</p>
          ))}
          <p className="ats-cta-line">
            Need a layout that passes without fiddling?{' '}
            <Link to="/templates">Start from a free ATS-friendly template</Link>{' '}
            or <Link to="/examples">see a complete example</Link>.
          </p>
        </section>
      </div>
    </div>
  );
};

export default AtsChecker;
