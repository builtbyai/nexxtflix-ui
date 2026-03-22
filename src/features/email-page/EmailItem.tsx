import React, { useState } from 'react';
import { EmailMessage } from './EmailPageScreen';

interface Props {
  email: EmailMessage;
}

export default function EmailItem({ email }: Props) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={`email-item ${email.read ? '' : 'email-item--unread'} ${isHovered ? 'email-item--hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className={`email-item-avatar ${email.color}`}>
        {email.initial}
      </div>
      <div className="email-item-content">
        <h3 className="email-item-sender">
          {email.sender}
        </h3>
        <p className="email-item-subject">
          {email.subject}
        </p>
      </div>
      {isHovered && (
        <div className="email-item-actions">
          <button className="email-item-action-btn" title="Archive">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="21 8 21 21 3 21 3 8"/>
              <line x1="1" y1="3" x2="23" y2="3"/>
              <path d="M10 12v4M14 12v4"/>
            </svg>
          </button>
          <button className="email-item-action-btn" title="Delete">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
      )}
    </div>
  );
}
