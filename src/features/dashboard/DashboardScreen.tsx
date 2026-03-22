import React, { useState, useEffect } from 'react';
import './DashboardScreen.css';

interface Email {
  id: number;
  sender: string;
  initial: string;
  color: string;
  subject: string;
}

interface Props {
  onBack?: () => void;
}

const EMAIL_LIST: Email[] = [
  { id: 1, sender: 'GitHub', initial: 'G', color: 'bg-red-500', subject: '[GitHub] A third-party GitHub Application' },
  { id: 2, sender: 'Builder.io, Inc.', initial: 'BI', color: 'bg-emerald-500', subject: 'Your receipt from Builder.io, Inc. #2559-4' },
  { id: 3, sender: 'support@builder.io', initial: 'S', color: 'bg-amber-500', subject: 'Your payment failed' },
  { id: 4, sender: 'Cash App', initial: 'CA', color: 'bg-blue-500', subject: 'You just paid off part of your overdraft bal...' },
  { id: 5, sender: 'support@builder.io', initial: 'S', color: 'bg-amber-500', subject: 'Your payment failed' },
  { id: 6, sender: 'SpanishPod101.com', initial: 'S', color: 'bg-blue-400', subject: 'How to Make Spanish EASIER to Learn (Ne...' },
  { id: 7, sender: 'CarParts.com', initial: 'C', color: 'bg-teal-400', subject: 'Treat Yourself. Treat Your Ride. 🚗' }
];

export default function DashboardScreen({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState<'home' | 'email'>('home');
  const [currentTime, setCurrentTime] = useState(new Date(2026, 2, 22, 8, 14, 56));

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    return `${days[currentTime.getDay()]}, ${months[currentTime.getMonth()]} ${currentTime.getDate()}`;
  };

  const formatTime = (hours: number, minutes: number) => {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  return (
    <div className="dashboard-screen">
      {/* Header */}
      <header className="dashboard-header">
        <button className="dashboard-menu-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6"/>
            <line x1="3" y1="12" x2="21" y2="12"/>
            <line x1="3" y1="18" x2="21" y2="18"/>
          </svg>
        </button>
        <div className="dashboard-header-title">
          {activeTab === 'home' ? (
            <div className="dashboard-title-home">
              <div className="dashboard-grid-icon">
                <div className="grid-square"></div>
                <div className="grid-square"></div>
                <div className="grid-square"></div>
                <div className="grid-square"></div>
              </div>
              <span>Dashboard</span>
            </div>
          ) : (
            <div className="dashboard-title-email">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                <polyline points="22 6 12 13 2 6"/>
              </svg>
              <span>Email</span>
            </div>
          )}
        </div>
        <button className="dashboard-theme-btn">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5"/>
            <line x1="12" y1="1" x2="12" y2="3"/>
            <line x1="12" y1="21" x2="12" y2="23"/>
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
            <line x1="1" y1="12" x2="3" y2="12"/>
            <line x1="21" y1="12" x2="23" y2="12"/>
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
          </svg>
        </button>
      </header>

      {/* AI Assistant Button */}
      <div className="dashboard-ai-button">
        <button className="dashboard-ai-btn">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0V3a1 1 0 0 1 1-1z"/>
            <path d="M12 20a1 1 0 0 1 1 1v2a1 1 0 0 1-2 0v-2a1 1 0 0 1 1-1z"/>
            <path d="M4.22 4.22a1 1 0 0 1 1.415 0l1.414 1.415a1 1 0 1 1-1.415 1.415L4.22 5.635a1 1 0 0 1 0-1.415z"/>
            <path d="M15.95 15.95a1 1 0 0 1 1.415 0l1.414 1.414a1 1 0 1 1-1.415 1.415l-1.414-1.414a1 1 0 0 1 0-1.415z"/>
          </svg>
          <span>AI Assistant</span>
        </button>
      </div>

      {/* Main Content */}
      <main className="dashboard-content">
        {activeTab === 'home' && (
          <div className="dashboard-home-view">
            <div className="dashboard-greeting">
              <p className="dashboard-date-label">{formatDate().split(',')[0].toUpperCase()}, {formatDate().split(',')[1]}</p>
              <h1 className="dashboard-greeting-title">Morning, <span className="dashboard-name">Jalen</span></h1>
            </div>

            {/* Clock Card */}
            <div className="dashboard-clock-card">
              <div className="dashboard-clock-main">
                <span className="dashboard-hour">08</span>
                <span className="dashboard-separator">:</span>
                <span className="dashboard-minute">14</span>
                <span className="dashboard-separator">:</span>
                <span className="dashboard-second">56</span>
                <span className="dashboard-ampm">AM</span>
              </div>
              
              <h2 className="dashboard-day">Sunday</h2>
              <p className="dashboard-full-date">March 22, 2026</p>

              {/* Timezones */}
              <div className="dashboard-timezones">
                <div className="dashboard-timezone">
                  <p className="dashboard-tz-label">NYC</p>
                  <p className="dashboard-tz-time">08:14 AM</p>
                </div>
                <div className="dashboard-timezone">
                  <p className="dashboard-tz-label">LON</p>
                  <p className="dashboard-tz-time">01:14 PM</p>
                </div>
                <div className="dashboard-timezone">
                  <p className="dashboard-tz-label">TYO</p>
                  <p className="dashboard-tz-time">10:14 PM</p>
                </div>
              </div>

              {/* Pagination Dots */}
              <div className="dashboard-pagination">
                <div className="dashboard-dot dashboard-dot--active"></div>
                <div className="dashboard-dot"></div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'email' && (
          <div className="dashboard-email-view">
            <div className="dashboard-inbox-header">
              <h1 className="dashboard-inbox-title">Inbox</h1>
              <span className="dashboard-inbox-count">(45168)</span>
            </div>

            {/* Search */}
            <div className="dashboard-search">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8"/>
                <line x1="21" y1="21" x2="16.65" y2="16.65"/>
              </svg>
              <input 
                type="text" 
                placeholder="Search emails..." 
                className="dashboard-search-input"
              />
            </div>

            {/* Email List */}
            <div className="dashboard-email-list">
              {EMAIL_LIST.map((email) => (
                <div key={email.id} className="dashboard-email-item">
                  <div className={`dashboard-email-avatar ${email.color}`}>
                    {email.initial}
                  </div>
                  <div className="dashboard-email-content">
                    <h3 className="dashboard-email-sender">{email.sender}</h3>
                    <p className="dashboard-email-subject">{email.subject}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Bottom Navigation */}
      <nav className="dashboard-bottom-nav">
        <NavButton 
          icon="home"
          label="HOME" 
          active={activeTab === 'home'} 
          onClick={() => setActiveTab('home')}
        />
        <NavButton 
          icon="notes"
          label="NOTES" 
          active={activeTab === 'notes'} 
          onClick={() => {}}
        />
        <NavButton 
          icon="chat"
          label="CHAT" 
          active={activeTab === 'chat'} 
          onClick={() => {}}
        />
        <NavButton 
          icon="email"
          label="EMAIL" 
          active={activeTab === 'email'} 
          onClick={() => setActiveTab('email')}
        />
        <NavButton 
          icon="more"
          label="MORE" 
          active={activeTab === 'more'} 
          onClick={() => {}}
        />
      </nav>
    </div>
  );
}

interface NavButtonProps {
  icon: string;
  label: string;
  active: boolean;
  onClick: () => void;
}

function NavButton({ icon, label, active, onClick }: NavButtonProps) {
  return (
    <button 
      onClick={onClick}
      className={`dashboard-nav-item ${active ? 'dashboard-nav-item--active' : ''}`}
    >
      {active && <div className="dashboard-nav-indicator"></div>}
      <span className="dashboard-nav-icon">
        {icon === 'home' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
            <polyline points="9 22 9 12 15 12 15 22" style={{fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round'}}/>
          </svg>
        )}
        {icon === 'notes' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2z"/>
            <path d="M16 2v4M8 2v4M4 10h16"/>
          </svg>
        )}
        {icon === 'chat' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        )}
        {icon === 'email' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22 6 12 13 2 6"/>
          </svg>
        )}
        {icon === 'more' && (
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="2"/>
            <circle cx="19" cy="12" r="2"/>
            <circle cx="5" cy="12" r="2"/>
          </svg>
        )}
      </span>
      <span className="dashboard-nav-label">{label}</span>
    </button>
  );
}
