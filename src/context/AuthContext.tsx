
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

const AUTH_API = 'https://dashboard-signaling.jalen1wa.workers.dev';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'approved' | 'pending' | 'rejected';
  picture?: string;
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (email: string, password: string, name: string) => Promise<{ ok: boolean; error?: string; message?: string }>;
  logout: () => Promise<void>;
  checkStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('nexxtflix_token'));
  const [loading, setLoading] = useState(true);

  const verifyToken = useCallback(async (t: string) => {
    try {
      const res = await fetch(`${AUTH_API}/api/nexxtflix/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (!res.ok) throw new Error('Invalid token');
      const data = await res.json();
      setUser(data.user);
      setToken(t);
    } catch {
      localStorage.removeItem('nexxtflix_token');
      setUser(null);
      setToken(null);
    }
  }, []);

  useEffect(() => {
    if (token) {
      verifyToken(token).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch(`${AUTH_API}/api/nexxtflix/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        return { ok: false, error: data.message || data.error || 'Login failed' };
      }
      localStorage.setItem('nexxtflix_token', data.token);
      setToken(data.token);
      setUser(data.user);
      return { ok: true };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Network error' };
    }
  };

  const register = async (email: string, password: string, name: string) => {
    try {
      const res = await fetch(`${AUTH_API}/api/nexxtflix/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) {
        return { ok: false, error: data.message || data.error || 'Registration failed' };
      }
      return { ok: true, message: data.message };
    } catch (err: any) {
      return { ok: false, error: err.message || 'Network error' };
    }
  };

  const logout = async () => {
    try {
      if (token) {
        await fetch(`${AUTH_API}/api/nexxtflix/auth/logout`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        });
      }
    } catch { /* ignore */ }
    localStorage.removeItem('nexxtflix_token');
    setUser(null);
    setToken(null);
  };

  const checkStatus = async () => {
    if (token) {
      await verifyToken(token);
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, checkStatus }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
