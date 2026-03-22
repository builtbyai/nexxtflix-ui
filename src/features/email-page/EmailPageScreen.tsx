import React, { useState } from 'react';
import './EmailPageScreen.css';
import EmailSidebar from './EmailSidebar';
import EmailList from './EmailList';

export interface EmailMessage {
  id: number;
  sender: string;
  initial: string;
  color: string;
  subject: string;
  read: boolean;
}

interface Props {
  onBack?: () => void;
}

const EMAILS: EmailMessage[] = [
  {
    id: 1,
    sender: 'GitHub',
    initial: 'G',
    color: 'bg-red-600',
    subject: '[GitHub] A third-party GitHub Application h...',
    read: false,
  },
  {
    id: 2,
    sender: 'Builder.io, Inc.',
    initial: 'BI',
    color: 'bg-emerald-500',
    subject: 'Your receipt from Builder.io, Inc. #2559-45...',
    read: true,
  },
  {
    id: 3,
    sender: 'support@builder.io',
    initial: 'S',
    color: 'bg-amber-500',
    subject: 'Your payment failed',
    read: true,
  },
  {
    id: 4,
    sender: 'Cash App',
    initial: 'CA',
    color: 'bg-blue-500',
    subject: 'You just paid off part of your overdraft bala...',
    read: true,
  },
  {
    id: 5,
    sender: 'support@builder.io',
    initial: 'S',
    color: 'bg-amber-500',
    subject: 'Your payment failed',
    read: true,
  },
  {
    id: 6,
    sender: 'SpanishPod101.com',
    initial: 'S',
    color: 'bg-blue-400',
    subject: 'How to Make Spanish EASIER to Learn (New...',
    read: true,
  },
  {
    id: 7,
    sender: 'CarParts.com',
    initial: 'C',
    color: 'bg-cyan-400',
    subject: 'Treat Yourself. Treat Your Ride. 🚗',
    read: true,
  },
];

export default function EmailPageScreen({ onBack }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFolder, setSelectedFolder] = useState('inbox');
  const [emails, setEmails] = useState(EMAILS);

  const filteredEmails = emails.filter(email =>
    email.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
    email.sender.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="email-page-screen">
      <EmailSidebar
        selectedFolder={selectedFolder}
        onSelectFolder={setSelectedFolder}
      />

      <div className="email-page-main">
        {/* Header */}
        <header className="email-page-header">
          <div className="email-page-menu-btn">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="3" y1="6" x2="21" y2="6"/>
              <line x1="3" y1="12" x2="21" y2="12"/>
              <line x1="3" y1="18" x2="21" y2="18"/>
            </svg>
          </div>
          <div className="email-page-header-title">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
              <polyline points="22 6 12 13 2 6"/>
            </svg>
            <h1 className="email-page-header-text">Email</h1>
          </div>
          <div className="email-page-theme-btn">
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
          </div>
        </header>

        {/* Title Area */}
        <div className="email-page-title-area">
          <h2 className="email-page-title">Inbox</h2>
          <span className="email-page-count">(45168)</span>
        </div>

        {/* Search Bar */}
        <div className="email-page-search-container">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/>
            <line x1="21" y1="21" x2="16.65" y2="16.65"/>
          </svg>
          <input
            type="text"
            placeholder="Search emails..."
            className="email-page-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Email List */}
        <EmailList emails={filteredEmails} />
      </div>
    </div>
  );
}
