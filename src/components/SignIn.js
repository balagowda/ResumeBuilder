import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Auth.css';

const SignIn = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Fetch users database from localStorage
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        setError('No account found with this email.');
        setLoading(false);
        return;
      }

      if (user.password !== password) {
        setError('Incorrect password.');
        setLoading(false);
        return;
      }

      // Successful Auth
      const currentUser = { name: user.name, email: user.email };
      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      setUser(currentUser);
      setLoading(false);
      navigate('/templates');
    }, 800); // Mock network latency
  };

  return (
    <div className="auth-container">
      {/* Background visual graphics */}
      <div className="auth-bg-glow"></div>
      <div className="auth-bubble bubble-1"></div>
      <div className="auth-bubble bubble-2"></div>

      <div className="auth-card">
        <div className="auth-header">
          <Link to="/" className="auth-logo">resumebuilder</Link>
          <h2>Welcome Back</h2>
          <p>Please enter your credentials to log in.</p>
        </div>

        {error && (
          <div className="auth-alert error">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="email">Email Address</label>
            <div className="input-with-icon">
              <i className="fas fa-envelope"></i>
              <input
                type="email"
                id="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <div className="label-row">
              <label htmlFor="password">Password</label>
              <a href="#forgot" className="forgot-link" onClick={(e) => e.preventDefault()}>Forgot?</a>
            </div>
            <div className="input-with-icon">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Sign In'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or continue with</span>
        </div>

        <div className="social-auth-grid">
          <button className="btn-social" onClick={() => alert('Social logins are mock-only for presentation.')}>
            <i className="fab fa-google"></i> Google
          </button>
          <button className="btn-social" onClick={() => alert('Social logins are mock-only for presentation.')}>
            <i className="fab fa-github"></i> GitHub
          </button>
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/signup" className="switch-auth-link">Sign Up Free</Link>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
