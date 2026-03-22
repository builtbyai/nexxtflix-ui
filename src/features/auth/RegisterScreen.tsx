
import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import './RegisterScreen.css';

interface Props {
  onSwitchToLogin: () => void;
}

export default function RegisterScreen({ onSwitchToLogin }: Props) {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password || !confirmPassword) return;
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }
    setError('');
    setLoading(true);
    const result = await register(email, password, name);
    if (result.ok) {
      setSuccess(true);
    } else {
      setError(result.error || 'Registration failed');
    }
    setLoading(false);
  };

  if (success) {
    return (
      <div className="register-screen">
        <div className="register-card">
          <div className="register-logo">
            <span className="register-logo-n">N</span>
            <span className="register-logo-rest">EXXTFLIX</span>
          </div>
          <div className="register-success">
            <div className="register-success-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 className="register-success-title">Registration Submitted!</h3>
            <p className="register-success-msg">
              An admin will review your account. You'll be able to access NexxtFlix once approved.
            </p>
            <button className="register-success-btn" onClick={onSwitchToLogin}>
              Back to Sign In
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="register-screen">
      <div className="register-card">
        <div className="register-logo">
          <span className="register-logo-n">N</span>
          <span className="register-logo-rest">EXXTFLIX</span>
        </div>
        <p className="register-subtitle">Create your account</p>

        <form className="register-form" onSubmit={handleSubmit}>
          <div className="register-field">
            <label className="register-label">Name</label>
            <input
              type="text"
              className="register-input"
              placeholder="Your name"
              value={name}
              onChange={e => setName(e.target.value)}
              autoComplete="name"
            />
          </div>
          <div className="register-field">
            <label className="register-label">Email</label>
            <input
              type="email"
              className="register-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="register-field">
            <label className="register-label">Password</label>
            <input
              type="password"
              className="register-input"
              placeholder="At least 6 characters"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>
          <div className="register-field">
            <label className="register-label">Confirm Password</label>
            <input
              type="password"
              className="register-input"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
            />
          </div>

          {error && <div className="register-error">{error}</div>}

          <button
            type="submit"
            className="register-btn"
            disabled={loading || !name || !email || !password || !confirmPassword}
          >
            {loading ? <div className="register-spinner" /> : 'Create Account'}
          </button>
        </form>

        <p className="register-switch">
          Already have an account?{' '}
          <button className="register-switch-link" onClick={onSwitchToLogin}>
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
}
