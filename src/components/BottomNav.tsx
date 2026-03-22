
import React from 'react';
import './BottomNav.css';
import { NavTab } from '../types';

interface Props {
  active: NavTab;
  onChange: (tab: NavTab) => void;
  isAdmin?: boolean;
}

const baseTabs: { id: NavTab; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'search', label: 'Search', icon: 'search' },
  { id: 'downloads', label: 'Downloads', icon: 'download' },
  { id: 'account', label: 'Account', icon: 'user' },
];

const adminTabs: { id: NavTab; label: string; icon: string }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: 'search', label: 'Search', icon: 'search' },
  { id: 'downloads', label: 'Downloads', icon: 'download' },
  { id: 'admin', label: 'Admin', icon: 'shield' },
  { id: 'account', label: 'Account', icon: 'user' },
];

function getIcon(name: string, active: boolean) {
  const color = active ? '#8b5cf6' : '#6b7280';
  switch (name) {
    case 'home':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
          <polyline points="9 22 9 12 15 12 15 22"/>
        </svg>
      );
    case 'search':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"/>
          <line x1="21" y1="21" x2="16.65" y2="16.65"/>
        </svg>
      );
    case 'download':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
          <polyline points="7 10 12 15 17 10"/>
          <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>
      );
    case 'user':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
      );
    case 'shield':
      return (
        <svg width="22" height="22" viewBox="0 0 24 24" fill={active ? color : 'none'} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
      );
    default: return null;
  }
}

export default function BottomNav({ active, onChange, isAdmin }: Props) {
  const tabs = isAdmin ? adminTabs : baseTabs;
  return (
    <nav className="bottom-nav">
      {tabs.map(tab => (
        <button
          key={tab.id}
          className={`nav-tab ${active === tab.id ? 'nav-tab--active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          <span className="nav-icon">{getIcon(tab.icon, active === tab.id)}</span>
          <span className="nav-label">{tab.label}</span>
          {active === tab.id && <span className="nav-dot" />}
        </button>
      ))}
    </nav>
  );
}
