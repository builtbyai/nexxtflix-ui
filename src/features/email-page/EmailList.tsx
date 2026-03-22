import React from 'react';
import { EmailMessage } from './EmailPageScreen';
import EmailItem from './EmailItem';

interface Props {
  emails: EmailMessage[];
}

export default function EmailList({ emails }: Props) {
  return (
    <div className="email-list">
      {emails.length === 0 ? (
        <div className="email-list-empty">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
            <polyline points="22 6 12 13 2 6"/>
          </svg>
          <p className="email-list-empty-text">No emails found</p>
        </div>
      ) : (
        emails.map(email => (
          <EmailItem key={email.id} email={email} />
        ))
      )}
    </div>
  );
}
