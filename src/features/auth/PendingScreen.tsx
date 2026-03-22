
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import './PendingScreen.css';

export default function PendingScreen() {
  const { logout, checkStatus } = useAuth();
  const [checking, setChecking] = useState(false);

  const handleCheck = async () => {
    setChecking(true);
    await checkStatus();
    setChecking(false);
  };

  return (
    <div className="pending-screen">
      <div className="pending-card">
        <div className="pending-logo">
          <span className="pending-logo-n">N</span>
          <span className="pending-logo-rest">EXXTFLIX</span>
        </div>

        <div className="pending-icon">
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
        </div>

        <h2 className="pending-title">Your account is pending approval</h2>
        <p className="pending-msg">
          An administrator will review your registration. You'll be able to access NexxtFlix once approved.
        </p>

        <div className="pending-actions">
          <button className="pending-btn pending-btn--signout" onClick={logout}>
            Sign Out
          </button>
          <button className="pending-btn pending-btn--check" onClick={handleCheck} disabled={checking}>
            {checking ? <div className="pending-check-spinner" /> : 'Check Status'}
          </button>
        </div>
      </div>
    </div>
  );
}
