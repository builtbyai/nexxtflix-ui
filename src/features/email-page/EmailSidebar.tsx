import React from 'react';

interface Props {
  selectedFolder: string;
  onSelectFolder: (folder: string) => void;
}

export default function EmailSidebar({ selectedFolder, onSelectFolder }: Props) {
  const folders = [
    { id: 'inbox', label: 'Inbox', icon: 'inbox', unread: 12 },
    { id: 'starred', label: 'Starred', icon: 'star', unread: 0 },
    { id: 'sent', label: 'Sent', icon: 'send', unread: 0 },
    { id: 'drafts', label: 'Drafts', icon: 'file', unread: 3 },
    { id: 'trash', label: 'Trash', icon: 'trash', unread: 0 },
  ];

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'inbox':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="22 12 18 12 15 21 9 21 6 12 2 12"/>
            <path d="M6 5h12"/>
            <path d="M9 9h6"/>
          </svg>
        );
      case 'star':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="12 2 15.09 10.26 24 10.27 17.18 16.70 20.27 25 12 19.54 3.73 25 6.82 16.70 0 10.27 8.91 10.26 12 2"/>
          </svg>
        );
      case 'send':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="22" y1="2" x2="11" y2="13"/>
            <polygon points="22 2 15 22 11 13 2 9 22 2"/>
          </svg>
        );
      case 'file':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"/>
            <polyline points="13 2 13 9 20 9"/>
          </svg>
        );
      case 'trash':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            <line x1="10" y1="11" x2="10" y2="17"/>
            <line x1="14" y1="11" x2="14" y2="17"/>
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <aside className="email-sidebar">
      <div className="email-sidebar-header">
        <button className="email-sidebar-compose-btn">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="12 5 12 19"/>
            <polyline points="5 12 19 12"/>
          </svg>
          <span>Compose</span>
        </button>
      </div>

      <nav className="email-sidebar-nav">
        {folders.map(folder => (
          <button
            key={folder.id}
            className={`email-sidebar-item ${selectedFolder === folder.id ? 'email-sidebar-item--active' : ''}`}
            onClick={() => onSelectFolder(folder.id)}
          >
            <span className="email-sidebar-icon">{getIcon(folder.icon)}</span>
            <span className="email-sidebar-label">{folder.label}</span>
            {folder.unread > 0 && (
              <span className="email-sidebar-badge">{folder.unread}</span>
            )}
          </button>
        ))}
      </nav>

      <div className="email-sidebar-footer">
        <p className="email-sidebar-footer-text">Storage</p>
        <div className="email-sidebar-storage-bar">
          <div className="email-sidebar-storage-fill" style={{ width: '62%' }}></div>
        </div>
        <p className="email-sidebar-storage-text">6.2 GB of 10 GB used</p>
      </div>
    </aside>
  );
}
