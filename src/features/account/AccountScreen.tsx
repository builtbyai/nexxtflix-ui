
import React, { useState } from 'react';
import './AccountScreen.css';

const PLAN_FEATURES = ['4K Ultra HD', 'HDR10+', 'Dolby Atmos', '4 Screens', 'Offline Downloads'];

const MENU_ITEMS = [
  { icon: 'user', label: 'Edit Profile', sub: 'Update your info' },
  { icon: 'bell', label: 'Notifications', sub: 'Manage alerts', toggle: true },
  { icon: 'lock', label: 'Privacy & Security', sub: 'Passwords, biometrics' },
  { icon: 'credit', label: 'Billing & Plans', sub: 'Premium · Monthly' },
  { icon: 'globe', label: 'Language & Region', sub: 'English (US)' },
  { icon: 'star', label: 'Rate NexxtFlix', sub: 'Leave a review' },
  { icon: 'help', label: 'Help & Support', sub: 'FAQs, contact us' },
];

function MenuIcon({ name }: { name: string }) {
  switch (name) {
    case 'user': return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;
    case 'bell': return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;
    case 'lock': return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>;
    case 'credit': return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>;
    case 'globe': return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>;
    case 'star': return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>;
    case 'help': return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>;
    default: return null;
  }
}

export default function AccountScreen() {
  const [notifOn, setNotifOn] = useState(true);
  const [watchTime] = useState('142h 37m');

  return (
    <div className="account-screen">
      {/* Header */}
      <div className="account-header">
        <h1 className="account-page-title">Account</h1>

        {/* Profile Card */}
        <div className="profile-card">
          <div className="profile-avatar-wrap">
            <div className="profile-avatar">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <div className="profile-avatar__ring" />
          </div>
          <div className="profile-info">
            <span className="profile-name">Alex Morgan</span>
            <span className="profile-email">alex.morgan@nexxt.com</span>
            <div className="profile-plan-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="#f59e0b"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
              Premium Ultra
            </div>
          </div>
          <button className="profile-edit-btn">Edit</button>
        </div>
      </div>

      {/* Stats */}
      <div className="account-stats">
        <div className="stat-card">
          <span className="stat-card__num">142h</span>
          <span className="stat-card__label">Watch Time</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__num">47</span>
          <span className="stat-card__label">My List</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__num">12</span>
          <span className="stat-card__label">Downloads</span>
        </div>
        <div className="stat-card">
          <span className="stat-card__num">8.6</span>
          <span className="stat-card__label">Avg Rating</span>
        </div>
      </div>

      {/* Plan */}
      <div className="plan-card">
        <div className="plan-card__top">
          <div>
            <div className="plan-card__label">Current Plan</div>
            <div className="plan-card__name">Premium Ultra</div>
          </div>
          <div className="plan-card__price">
            <span className="plan-price-num">$17</span>
            <span className="plan-price-per">/mo</span>
          </div>
        </div>
        <div className="plan-features">
          {PLAN_FEATURES.map((f, i) => (
            <div key={i} className="plan-feature">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#8b5cf6" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              <span>{f}</span>
            </div>
          ))}
        </div>
        <button className="plan-manage-btn">Manage Plan</button>
      </div>

      {/* Menu */}
      <div className="account-menu">
        {MENU_ITEMS.map((item, i) => (
          <div key={i} className="menu-item">
            <div className="menu-item__icon">
              <MenuIcon name={item.icon} />
            </div>
            <div className="menu-item__text">
              <span className="menu-item__label">{item.label}</span>
              <span className="menu-item__sub">{item.sub}</span>
            </div>
            {item.toggle ? (
              <div
                className={`toggle-switch ${notifOn ? 'toggle-switch--on' : ''}`}
                onClick={() => setNotifOn(n => !n)}
              >
                <div className="toggle-thumb" />
              </div>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Sign Out */}
      <button className="signout-btn">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        Sign Out
      </button>

      <div className="account-footer">
        <span>NexxtFlix v3.2.1</span>
        <span>Terms • Privacy • Help</span>
      </div>
    </div>
  );
}
