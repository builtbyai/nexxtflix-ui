
import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import './AdminPanel.css';

const AUTH_API = 'https://dashboard-signaling.jalen1wa.workers.dev';

interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at?: string;
}

const AVATAR_COLORS = ['#8b5cf6', '#ec4899', '#10b981', '#f59e0b', '#06b6d4', '#ef4444', '#6366f1'];

function getAvatarColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name: string) {
  return name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
}

function formatDate(dateStr?: string) {
  if (!dateStr) return '';
  try {
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch { return dateStr; }
}

export default function AdminPanel() {
  const { token } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${AUTH_API}/api/nexxtflix/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Failed to fetch users');
      const data = await res.json();
      setUsers(data.users || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load users');
    }
    setLoading(false);
  }, [token]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleAction = async (userId: string, action: 'approve' | 'reject') => {
    setActionLoading(userId);
    try {
      const res = await fetch(`${AUTH_API}/api/nexxtflix/admin/${action}/${userId}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error(`Failed to ${action}`);
      await fetchUsers();
    } catch (err: any) {
      setError(err.message);
    }
    setActionLoading(null);
  };

  const pendingUsers = users.filter(u => u.role === 'pending');
  const otherUsers = users.filter(u => u.role !== 'pending');
  const totalActive = users.filter(u => u.role === 'approved' || u.role === 'admin').length;

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1 className="admin-title">Admin Panel</h1>
        <button className="admin-refresh-btn" onClick={fetchUsers} disabled={loading}>
          <svg className={loading ? 'admin-refresh-spin' : ''} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 4 23 10 17 10"/>
            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
          </svg>
          Refresh
        </button>
      </div>

      <div className="admin-stats">
        <div className="admin-stat-card">
          <span className="admin-stat-num">{users.length}</span>
          <span className="admin-stat-label">Total</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num">{pendingUsers.length}</span>
          <span className="admin-stat-label">Pending</span>
        </div>
        <div className="admin-stat-card">
          <span className="admin-stat-num">{totalActive}</span>
          <span className="admin-stat-label">Active</span>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading">
          <div className="admin-loading-spinner" />
        </div>
      ) : (
        <>
          {pendingUsers.length > 0 && (
            <>
              <h3 className="admin-section-title">Pending Approval ({pendingUsers.length})</h3>
              <div className="admin-user-list">
                {pendingUsers.map(user => (
                  <div key={user.id} className="admin-user-card">
                    <div className="admin-user-avatar" style={{ background: getAvatarColor(user.name) }}>
                      {getInitials(user.name)}
                    </div>
                    <div className="admin-user-info">
                      <span className="admin-user-name">{user.name}</span>
                      <span className="admin-user-email">{user.email}</span>
                      <span className="admin-user-date">{formatDate(user.created_at)}</span>
                    </div>
                    <div className="admin-user-actions">
                      <button
                        className="admin-action-btn admin-action-btn--approve"
                        onClick={() => handleAction(user.id, 'approve')}
                        disabled={actionLoading === user.id}
                      >
                        Approve
                      </button>
                      <button
                        className="admin-action-btn admin-action-btn--reject"
                        onClick={() => handleAction(user.id, 'reject')}
                        disabled={actionLoading === user.id}
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {otherUsers.length > 0 && (
            <>
              <h3 className="admin-section-title">All Users ({otherUsers.length})</h3>
              <div className="admin-user-list">
                {otherUsers.map(user => (
                  <div key={user.id} className="admin-user-card">
                    <div className="admin-user-avatar" style={{ background: getAvatarColor(user.name) }}>
                      {getInitials(user.name)}
                    </div>
                    <div className="admin-user-info">
                      <span className="admin-user-name">{user.name}</span>
                      <span className="admin-user-email">{user.email}</span>
                      <span className="admin-user-date">{formatDate(user.created_at)}</span>
                    </div>
                    <div className="admin-user-actions">
                      {user.role === 'admin' && <span className="admin-badge admin-badge--admin">Admin</span>}
                      {user.role === 'approved' && <span className="admin-badge admin-badge--active">Active</span>}
                      {user.role === 'rejected' && <span className="admin-badge admin-badge--rejected">Rejected</span>}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {users.length === 0 && !error && (
            <div className="admin-empty">No users found.</div>
          )}
        </>
      )}
    </div>
  );
}
