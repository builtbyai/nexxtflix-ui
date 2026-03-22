
import React, { useState, useEffect } from 'react';
import './AccountScreen.css';
import { fetchRDUser, getEmbyServers, saveEmbyServers, embyCheckServer, embyGetUsers, EmbyServer } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const SERVER_COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#ef4444'];

const ACCENT_COLORS = [
  { name: 'Purple', value: '#8b5cf6' },
  { name: 'Pink', value: '#ec4899' },
  { name: 'Blue', value: '#3b82f6' },
  { name: 'Cyan', value: '#06b6d4' },
  { name: 'Green', value: '#10b981' },
  { name: 'Yellow', value: '#f59e0b' },
  { name: 'Red', value: '#ef4444' },
  { name: 'Orange', value: '#f97316' },
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Rose', value: '#f43f5e' },
  { name: 'Teal', value: '#14b8a6' },
  { name: 'Lime', value: '#84cc16' },
];

const BG_PRESETS = [
  { name: 'Deep Space', value: '#0d0d1a' },
  { name: 'Midnight', value: '#0f172a' },
  { name: 'Charcoal', value: '#1a1a2e' },
  { name: 'Dark Blue', value: '#0c1222' },
  { name: 'Pitch Black', value: '#000000' },
  { name: 'Dark Gray', value: '#111827' },
];

interface UserTheme {
  accent: string;
  bg: string;
  cardBg: string;
  customAccent?: string;
}

function loadUserTheme(): UserTheme {
  try {
    const saved = localStorage.getItem('nexxtflix-theme');
    if (saved) return JSON.parse(saved);
  } catch {}
  return { accent: '#8b5cf6', bg: '#0d0d1a', cardBg: 'rgba(255,255,255,0.04)' };
}

function saveUserTheme(theme: UserTheme) {
  localStorage.setItem('nexxtflix-theme', JSON.stringify(theme));
  applyTheme(theme);
}

function applyTheme(theme: UserTheme) {
  const root = document.documentElement;
  root.style.setProperty('--accent', theme.accent);
  root.style.setProperty('--bg-main', theme.bg);
  if (theme.cardBg) root.style.setProperty('--bg-card', theme.cardBg);
}

export default function AccountScreen() {
  const { user, logout } = useAuth();
  const [rdUser, setRdUser] = useState<any>(null);
  const [notifications, setNotifications] = useState(true);
  const [servers, setServers] = useState<EmbyServer[]>(getEmbyServers(user?.email));
  const [showAddForm, setShowAddForm] = useState(false);
  const [newServer, setNewServer] = useState({ name: '', url: '', apiKey: '', direct: false });
  const [testStatus, setTestStatus] = useState<'idle' | 'testing' | 'success' | 'fail'>('idle');
  const [serverUsers, setServerUsers] = useState<{ Id: string; Name: string }[]>([]);
  const [selectedUserId, setSelectedUserId] = useState('');
  const [savingServer, setSavingServer] = useState(false);
  const [theme, setTheme] = useState<UserTheme>(loadUserTheme());
  const [showTheme, setShowTheme] = useState(false);
  const [customHex, setCustomHex] = useState(theme.accent);

  useEffect(() => {
    applyTheme(theme);
  }, []);

  useEffect(() => {
    fetchRDUser().then(data => {
      if (data?.user) setRdUser(data.user);
    });
  }, []);

  const handleTestConnection = async () => {
    if (!newServer.url || !newServer.apiKey) return;
    setTestStatus('testing');
    const tempServer: EmbyServer = {
      id: `temp-${Date.now()}`,
      name: newServer.name || 'Test',
      url: newServer.url.replace(/\/+$/, ''),
      apiKey: newServer.apiKey,
      userId: '',
      color: SERVER_COLORS[servers.length % SERVER_COLORS.length],
      direct: newServer.direct,
    };
    const ok = await embyCheckServer(tempServer);
    setTestStatus(ok ? 'success' : 'fail');
    if (ok) {
      const users = await embyGetUsers(tempServer);
      setServerUsers(users);
      if (users.length > 0) setSelectedUserId(users[0].Id);
    }
  };

  const handleSaveServer = () => {
    if (!newServer.name || !newServer.url || !newServer.apiKey) return;
    setSavingServer(true);
    const server: EmbyServer = {
      id: `srv-${Date.now()}`,
      name: newServer.name,
      url: newServer.url.replace(/\/+$/, ''),
      apiKey: newServer.apiKey,
      userId: selectedUserId,
      color: SERVER_COLORS[servers.length % SERVER_COLORS.length],
      direct: newServer.direct,
    };
    const updated = [...servers, server];
    saveEmbyServers(updated);
    setServers(updated);
    setNewServer({ name: '', url: '', apiKey: '', direct: false });
    setShowAddForm(false);
    setTestStatus('idle');
    setServerUsers([]);
    setSelectedUserId('');
    setSavingServer(false);
  };

  const handleRemoveServer = (id: string) => {
    const updated = servers.filter(s => s.id !== id);
    saveEmbyServers(updated);
    setServers(updated);
  };

  const handleAccentChange = (color: string) => {
    const newTheme = { ...theme, accent: color };
    setTheme(newTheme);
    setCustomHex(color);
    saveUserTheme(newTheme);
  };

  const handleBgChange = (color: string) => {
    const newTheme = { ...theme, bg: color };
    setTheme(newTheme);
    saveUserTheme(newTheme);
  };

  const MENU_ITEMS = [
    { icon: 'palette', label: 'Theme & Colors', action: () => setShowTheme(t => !t) },
    { icon: 'bell', label: 'Notifications', toggle: true },
    { icon: 'download', label: 'Download Quality' },
    { icon: 'monitor', label: 'Display' },
    { icon: 'shield', label: 'Privacy' },
    { icon: 'help', label: 'Help & Support' },
    { icon: 'info', label: 'About' },
  ];

  return (
    <div className="account-screen">
      <div className="account-profile">
        <div className="account-avatar-ring" style={{ background: `linear-gradient(135deg, ${theme.accent}, #ec4899)` }}>
          <div className="account-avatar">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke={theme.accent} strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
          </div>
        </div>
        <h2 className="account-name">{user?.name || rdUser?.username || 'User'}</h2>
        <p className="account-email">{user?.email || rdUser?.email || 'Not connected'}</p>
        <span className="account-plan-badge">{rdUser ? 'Real-Debrid Premium' : 'Free'}</span>
      </div>

      <div className="account-stats">
        <div className="account-stat">
          <span className="account-stat__num">{servers.length}</span>
          <span className="account-stat__label">Emby Servers</span>
        </div>
        <div className="account-stat">
          <span className="account-stat__num">{rdUser ? 'Active' : '\u2014'}</span>
          <span className="account-stat__label">RD Status</span>
        </div>
        <div className="account-stat">
          <span className="account-stat__num">{rdUser?.expiration?.split('T')[0] || '\u2014'}</span>
          <span className="account-stat__label">Expires</span>
        </div>
      </div>

      {/* Manage Servers Section */}
      <div className="account-servers">
        <div className="servers-header">
          <h3 className="account-section-title">Manage Servers ({servers.length})</h3>
          <button className="add-server-btn" onClick={() => setShowAddForm(!showAddForm)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="12" y1="5" x2="12" y2="19"/>
              <line x1="5" y1="12" x2="19" y2="12"/>
            </svg>
            Add Server
          </button>
        </div>

        <div className="server-list">
          {servers.map(s => (
            <div key={s.id} className="server-item">
              <div className="server-dot" style={{ background: s.color }} />
              <div className="server-item-info">
                <span className="server-item-name">
                  {s.name}
                  {s.direct && <span className="server-local-badge">LOCAL</span>}
                </span>
                <span className="server-item-url">{s.url}</span>
              </div>
              <button className="server-remove-btn" onClick={() => handleRemoveServer(s.id)}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>
          ))}
        </div>

        {showAddForm && (
          <div className="add-server-form">
            <div className="form-field">
              <label className="form-label">Server Name</label>
              <input type="text" className="form-input" placeholder="My Emby Server"
                value={newServer.name} onChange={e => setNewServer(p => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-field">
              <label className="form-label">Server URL</label>
              <input type="text" className="form-input" placeholder="https://emby.example.com"
                value={newServer.url} onChange={e => setNewServer(p => ({ ...p, url: e.target.value }))} />
            </div>
            <div className="form-field">
              <label className="form-label">API Key</label>
              <input type="text" className="form-input" placeholder="Enter API key"
                value={newServer.apiKey} onChange={e => setNewServer(p => ({ ...p, apiKey: e.target.value }))} />
            </div>
            <div className="form-field form-field--row">
              <div className="form-field-label-group">
                <label className="form-label">Direct / Local Connection</label>
                <span className="form-hint">Enable for LAN servers</span>
              </div>
              <button className={`smart-toggle ${newServer.direct ? 'smart-toggle--on' : ''}`}
                onClick={() => setNewServer(p => ({ ...p, direct: !p.direct }))}>
                <div className="smart-toggle-thumb" />
              </button>
            </div>
            {serverUsers.length > 0 && (
              <div className="form-field">
                <label className="form-label">Select User</label>
                <select className="form-select" value={selectedUserId}
                  onChange={e => setSelectedUserId(e.target.value)}>
                  {serverUsers.map(u => <option key={u.Id} value={u.Id}>{u.Name}</option>)}
                </select>
              </div>
            )}
            {testStatus === 'success' && (
              <div className="test-result test-result--success">Connection successful{serverUsers.length > 0 ? ` \u2022 ${serverUsers.length} user(s)` : ''}</div>
            )}
            {testStatus === 'fail' && (
              <div className="test-result test-result--fail">Connection failed. Check URL and API key.</div>
            )}
            <div className="form-actions">
              <button className="form-btn form-btn--test" onClick={handleTestConnection}
                disabled={testStatus === 'testing' || !newServer.url || !newServer.apiKey}>
                {testStatus === 'testing' ? <div className="form-spinner" /> : 'Test Connection'}
              </button>
              <button className="form-btn form-btn--save" onClick={handleSaveServer}
                disabled={!newServer.name || !newServer.url || !newServer.apiKey || savingServer}>
                Save Server
              </button>
            </div>
          </div>
        )}
      </div>

      {rdUser && (
        <div className="account-plan-card">
          <div className="plan-card-top">
            <span className="plan-name">Real-Debrid Premium</span>
            <span className="plan-price">{rdUser.type || 'Premium'}</span>
          </div>
          <div className="plan-features">
            <span>Unlimited downloads</span>
            <span>Max speed streaming</span>
            <span>All hosters supported</span>
            <span>Torrent caching</span>
          </div>
        </div>
      )}

      <div className="account-menu">
        {MENU_ITEMS.map((item, i) => (
          <div key={i} className="account-menu-item" onClick={item.action}>
            <div className="menu-item-left">
              <div className="menu-item-icon">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
                  {item.icon === 'palette' && <><circle cx="13.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="10.5" r="2.5"/><circle cx="8.5" cy="7.5" r="2.5"/><circle cx="6.5" cy="12" r="2.5"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.04-.23-.29-.38-.63-.38-1.04 0-.83.67-1.5 1.5-1.5H16c3.31 0 6-2.69 6-6 0-5.52-4.48-9.5-10-9.5z"/></>}
                  {item.icon === 'bell' && <><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></>}
                  {item.icon === 'download' && <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></>}
                  {item.icon === 'monitor' && <><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></>}
                  {item.icon === 'shield' && <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>}
                  {item.icon === 'help' && <><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></>}
                  {item.icon === 'info' && <><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></>}
                </svg>
              </div>
              <span className="menu-item-label">{item.label}</span>
            </div>
            {item.toggle ? (
              <button className={`smart-toggle ${notifications ? 'smart-toggle--on' : ''}`} onClick={() => setNotifications(n => !n)}>
                <div className="smart-toggle-thumb" />
              </button>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#4b5563" strokeWidth="2">
                <polyline points="9 18 15 12 9 6"/>
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Theme Configuration Panel */}
      {showTheme && (
        <div className="account-theme-panel">
          <h3 className="account-section-title" style={{ padding: '0 16px', marginBottom: 12 }}>Accent Color</h3>
          <div className="theme-color-grid">
            {ACCENT_COLORS.map(c => (
              <button
                key={c.value}
                className={`theme-color-swatch ${theme.accent === c.value ? 'theme-color-swatch--active' : ''}`}
                style={{ background: c.value }}
                onClick={() => handleAccentChange(c.value)}
                title={c.name}
              />
            ))}
          </div>
          <div className="theme-custom-hex">
            <label className="form-label">Custom Hex</label>
            <div className="theme-hex-row">
              <input
                type="color"
                value={customHex}
                onChange={e => { setCustomHex(e.target.value); handleAccentChange(e.target.value); }}
                className="theme-color-input"
              />
              <input
                type="text"
                value={customHex}
                onChange={e => {
                  setCustomHex(e.target.value);
                  if (/^#[0-9a-fA-F]{6}$/.test(e.target.value)) handleAccentChange(e.target.value);
                }}
                className="form-input"
                placeholder="#8b5cf6"
                style={{ flex: 1 }}
              />
            </div>
          </div>

          <h3 className="account-section-title" style={{ padding: '0 16px', marginTop: 16, marginBottom: 12 }}>Background</h3>
          <div className="theme-bg-grid">
            {BG_PRESETS.map(bg => (
              <button
                key={bg.value}
                className={`theme-bg-swatch ${theme.bg === bg.value ? 'theme-bg-swatch--active' : ''}`}
                style={{ background: bg.value }}
                onClick={() => handleBgChange(bg.value)}
              >
                <span className="theme-bg-label">{bg.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      <button className="account-signout" onClick={logout}>Sign Out</button>

      <div className="account-footer">
        <span>NexxtFlix v2.0 &bull; Emby + Real-Debrid + TMDB</span>
      </div>
    </div>
  );
}
