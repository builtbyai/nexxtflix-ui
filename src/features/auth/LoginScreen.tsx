
import React, { useState, FormEvent } from 'react';
import { useAuth } from '../../context/AuthContext';
import './LoginScreen.css';

interface Props {
  onSwitchToRegister: () => void;
}

export default function LoginScreen({ onSwitchToRegister }: Props) {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setError('');
    setLoading(true);
    const result = await login(email, password);
    if (!result.ok) {
      setError(result.error || 'Login failed');
    }
    setLoading(false);
  };

  return (
    <div className="login-screen">
      <div className="login-card">
        <div className="login-logo">
          <span className="login-logo-n">N</span>
          <span className="login-logo-rest">EXXTFLIX</span>
        </div>
        <p className="login-subtitle">Stream your way</p>

        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-field">
            <label className="login-label">Email</label>
            <input
              type="email"
              className="login-input"
              placeholder="you@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="login-field">
            <label className="login-label">Password</label>
            <input
              type="password"
              className="login-input"
              placeholder="Enter your password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </div>

          {error && <div className="login-error">{error}</div>}

          <button type="submit" className="login-btn" disabled={loading || !email || !password}>
            {loading ? <div className="login-spinner" /> : 'Sign In'}
          </button>

          <button type="button" className="login-forgot" onClick={() => {
            const resetEmail = email || prompt('Enter your email address:');
            if (resetEmail) {
              fetch(`https://dashboard-signaling.jalen1wa.workers.dev/api/nexxtflix/auth/forgot-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: resetEmail }),
              }).then(() => {
                alert('If an account exists with that email, the admin has been notified. You will receive a password reset soon.');
              }).catch(() => {
                alert('Request sent. The admin will be in touch.');
              });
            }
          }}>
            Forgot password?
          </button>
        </form>

        <p className="login-switch">
          Don't have an account?{' '}
          <button className="login-switch-link" onClick={onSwitchToRegister}>
            Create Account
          </button>
        </p>
      </div>
    </div>
  );
}
