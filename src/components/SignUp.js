import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../Styles/Auth.css';

const SignUp = ({ setUser }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      // Load current database
      const users = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      
      // Check if user already exists
      const userExists = users.some(u => u.email.toLowerCase() === email.toLowerCase());
      if (userExists) {
        setError('An account with this email already exists.');
        setLoading(false);
        return;
      }

      // Add user to database
      const newUser = { name, email, password };
      users.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(users));

      // Automatically log the user in
      const currentUser = { name: newUser.name, email: newUser.email };
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
          <h2>Create Account</h2>
          <p>Get started building beautiful resumes today.</p>
        </div>

        {error && (
          <div className="auth-alert error">
            <i className="fas fa-exclamation-circle"></i> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="auth-input-group">
            <label htmlFor="name">Full Name</label>
            <div className="input-with-icon">
              <i className="fas fa-user"></i>
              <input
                type="text"
                id="name"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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
            <label htmlFor="password">Password</label>
            <div className="input-with-icon">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="password"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="auth-input-group">
            <label htmlFor="confirmPassword">Confirm Password</label>
            <div className="input-with-icon">
              <i className="fas fa-lock"></i>
              <input
                type="password"
                id="confirmPassword"
                placeholder="Re-type password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-auth-submit" disabled={loading}>
            {loading ? <i className="fas fa-spinner fa-spin"></i> : 'Create Account'}
          </button>
        </form>

        <div className="auth-divider">
          <span>or register with</span>
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
          Already have an account? <Link to="/signin" className="switch-auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
