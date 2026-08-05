import React from 'react';
import { Link } from 'react-router-dom';
import { SUPPORT_EMAIL } from '../constants';

/**
 * Last line of defence around the routes.
 *
 * Without one, a single render throw unmounts the whole tree and leaves a blank
 * white page — with no way back and no hint that the work is still sitting in
 * storage, unharmed. Reloading recovers, because a throw during render means
 * the bad state was never committed and never persisted, so this says exactly
 * that rather than leaving someone staring at nothing.
 */
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Nothing is reported anywhere — the console is the only place this can go
    // without sending a visitor's page to a server.
    console.error('Unhandled error in HatchResume:', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;

    return (
      <div className="app-error" role="alert">
        <h1>Something broke on this page</h1>
        <p>
          Your resumes are still saved in this browser — this went wrong while drawing
          the page, before anything could be written, so nothing you typed was lost.
          Reloading should bring it back.
        </p>
        <div className="app-error-actions">
          <button type="button" onClick={() => window.location.reload()}>
            Reload the page
          </button>
          <Link to="/">Go to the home page</Link>
        </div>
        <p className="app-error-detail">
          If it keeps happening, tell us what you were doing at{' '}
          <a href={`mailto:${SUPPORT_EMAIL}`}>{SUPPORT_EMAIL}</a>.
        </p>
        <pre className="app-error-message">{String(this.state.error)}</pre>
      </div>
    );
  }
}
