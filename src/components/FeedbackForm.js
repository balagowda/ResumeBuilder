import React, { useState } from 'react';
import { SUPPORT_EMAIL } from '../constants';
import '../Styles/FeedbackForm.css';

const FEEDBACK_TYPES = [
  { value: 'suggestion', label: '💡 Suggestion' },
  { value: 'bug', label: '🐞 Bug report' },
  { value: 'other', label: '💬 Something else' },
];

const MESSAGE_MAX = 1500;

// mailto: links choke on long bodies in some browsers, so the textarea is capped
// and the body is kept lean.
const buildDraft = ({ type, name, email, message }) => {
  const typeLabel = FEEDBACK_TYPES.find((t) => t.value === type)?.label.replace(/^\S+\s/, '') || 'Feedback';
  const from = name.trim() || 'Someone';
  const subject = `[hatchresume] ${typeLabel} from ${from}`;

  const lines = [
    `Type: ${typeLabel}`,
    `Name: ${name.trim() || 'Not provided'}`,
    `Reply to: ${email.trim() || 'Not provided'}`,
    '',
    message.trim(),
    '',
    '---',
    `Sent from ${window.location.origin}`,
  ];

  if (type === 'bug') {
    lines.push(`Browser: ${navigator.userAgent}`);
  }

  return { subject, body: lines.join('\n') };
};

const FeedbackForm = () => {
  const [type, setType] = useState('suggestion');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [copied, setCopied] = useState(false);

  const { subject, body } = buildDraft({ type, name, email, message });

  const mailtoUrl = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(SUPPORT_EMAIL)}` +
    `&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

  const validate = () => {
    if (message.trim().length < 10) {
      setError('Please tell us a little more — at least 10 characters.');
      return false;
    }
    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('That email address looks off. Leave it blank if you would rather not share it.');
      return false;
    }
    setError('');
    return true;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    window.location.href = mailtoUrl;
    setSent(true);
  };

  const handleGmail = () => {
    if (!validate()) return;
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    setSent(true);
  };

  const handleCopy = async () => {
    if (!validate()) return;
    const text = `To: ${SUPPORT_EMAIL}\nSubject: ${subject}\n\n${body}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setError(`Copying failed — please email us directly at ${SUPPORT_EMAIL}.`);
    }
  };

  return (
    <section className="feedback-section" id="feedback">
      <div className="landing-section-inner">
        <h2 className="section-title">
          Help us <span className="gradient-text">get better</span>
        </h2>
        <p className="feedback-intro">
          Found a bug, or missing a feature you would actually use? Tell us and we will look at it.
          Your name is optional — the message is the part that matters.
        </p>

        <form className="feedback-card" onSubmit={handleSubmit} noValidate>
          <div className="feedback-types">
            {FEEDBACK_TYPES.map((t) => (
              <button
                key={t.value}
                type="button"
                className={`feedback-chip ${type === t.value ? 'active' : ''}`}
                onClick={() => setType(t.value)}
                aria-pressed={type === t.value}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="feedback-row">
            <div className="feedback-field">
              <label htmlFor="feedback-name">
                Name <span className="feedback-optional">(optional)</span>
              </label>
              <input
                id="feedback-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="How should we address you?"
                maxLength={80}
              />
            </div>
            <div className="feedback-field">
              <label htmlFor="feedback-email">
                Email <span className="feedback-optional">(optional, so we can reply)</span>
              </label>
              <input
                id="feedback-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                maxLength={120}
              />
            </div>
          </div>

          <div className="feedback-field">
            <label htmlFor="feedback-message">Your suggestion or bug report</label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What happened, what you expected, or what you wish the builder could do..."
              rows={6}
              maxLength={MESSAGE_MAX}
              required
            />
            <div className="feedback-counter">
              {message.length}/{MESSAGE_MAX}
            </div>
          </div>

          {error && <p className="feedback-error" role="alert">{error}</p>}

          <button type="submit" className="feedback-submit">
            Send Feedback <i className="fas fa-paper-plane icon-right"></i>
          </button>

          <p className="feedback-fallback">
            This opens a pre-filled draft in your mail app — nothing is sent until you hit send there.
            Mail app didn&apos;t open?{' '}
            <button type="button" className="feedback-link" onClick={handleGmail}>
              Compose in Gmail
            </button>{' '}
            or{' '}
            <button type="button" className="feedback-link" onClick={handleCopy}>
              {copied ? 'Copied!' : 'copy the message'}
            </button>{' '}
            and mail it to <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
          </p>

          {sent && (
            <p className="feedback-success" role="status">
              Thanks! Your draft is ready — send it and we will read every word.
            </p>
          )}

          {type === 'bug' && (
            <p className="feedback-note">
              Bug reports include your browser version in the draft to help us reproduce it. Delete that line before sending if you prefer.
            </p>
          )}
        </form>
      </div>
    </section>
  );
};

export default FeedbackForm;
