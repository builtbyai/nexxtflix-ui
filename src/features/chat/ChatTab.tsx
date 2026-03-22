import React, { useState } from 'react';
import './ChatTab.css';

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  avatar: string;
  unread: number;
  timestamp: string;
}

interface Props {}

export default function ChatTab({}: Props) {
  const [conversations, setConversations] = useState<Conversation[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      lastMessage: 'Sounds good! See you then 👍',
      avatar: 'SJ',
      unread: 0,
      timestamp: '2:45 PM'
    },
    {
      id: '2',
      name: 'Design Team',
      lastMessage: 'The new mockups look great!',
      avatar: 'DT',
      unread: 3,
      timestamp: '1:30 PM'
    },
    {
      id: '3',
      name: 'Alex Chen',
      lastMessage: 'Let me check and get back to you',
      avatar: 'AC',
      unread: 0,
      timestamp: 'Yesterday'
    },
    {
      id: '4',
      name: 'Project Sprint',
      lastMessage: 'Q4 planning document updated',
      avatar: 'PS',
      unread: 1,
      timestamp: 'Yesterday'
    }
  ]);

  const [searchQuery, setSearchQuery] = useState('');

  const filteredConversations = conversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getAvatarColor = (initial: string) => {
    const colors = [
      'avatar-purple',
      'avatar-blue',
      'avatar-pink',
      'avatar-green',
      'avatar-orange'
    ];
    return colors[initial.charCodeAt(0) % colors.length];
  };

  return (
    <div className="chat-tab">
      <div className="chat-header">
        <h2 className="chat-title">Messages</h2>
        <button className="chat-new-btn" title="New message">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
        </button>
      </div>

      <div className="chat-search">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
        <input
          type="text"
          placeholder="Search conversations..."
          className="chat-search-input"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="chat-conversations">
        {filteredConversations.length === 0 ? (
          <div className="chat-empty">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            <p>No conversations found</p>
          </div>
        ) : (
          filteredConversations.map(conv => (
            <div
              key={conv.id}
              className={`chat-item ${conv.unread > 0 ? 'chat-item--unread' : ''}`}
            >
              <div className={`chat-avatar ${getAvatarColor(conv.avatar)}`}>
                {conv.avatar}
              </div>
              <div className="chat-content">
                <h3 className="chat-name">{conv.name}</h3>
                <p className="chat-message">{conv.lastMessage}</p>
              </div>
              <div className="chat-meta">
                <span className="chat-time">{conv.timestamp}</span>
                {conv.unread > 0 && (
                  <span className="chat-badge">{conv.unread}</span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
