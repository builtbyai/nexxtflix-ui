
import React, { useState, useCallback } from 'react';
import './App.css';
import HomeScreen from './features/home/HomeScreen';
import PlayerScreen from './features/player/PlayerScreen';
import DetailScreen from './features/detail/DetailScreen';
import SearchScreen from './features/search/SearchScreen';
import BrowseScreen from './features/browse/BrowseScreen';
import DownloadsScreen from './features/downloads/DownloadsScreen';
import AccountScreen from './features/account/AccountScreen';
import LoginScreen from './features/auth/LoginScreen';
import RegisterScreen from './features/auth/RegisterScreen';
import PendingScreen from './features/auth/PendingScreen';
import AdminPanel from './features/auth/AdminPanel';
import BottomNav from './components/BottomNav';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Movie, NavTab, Screen, BrowseConfig } from './types';

function AppContent() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState<Screen>('home');
  const [activeNav, setActiveNav] = useState<NavTab>('home');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [browseConfig, setBrowseConfig] = useState<BrowseConfig | null>(null);
  const [history, setHistory] = useState<{ screen: Screen; movie?: Movie; browse?: BrowseConfig }[]>([]);
  const [authScreen, setAuthScreen] = useState<'login' | 'register'>('login');

  const navigate = useCallback((s: Screen, movie?: Movie, browse?: BrowseConfig) => {
    setHistory(h => [...h, { screen, movie: selectedMovie || undefined, browse: browseConfig || undefined }]);
    if (movie) setSelectedMovie(movie);
    if (browse) setBrowseConfig(browse);
    setScreen(s);
    if (s === 'home') setActiveNav('home');
    if (s === 'search') setActiveNav('search');
    if (s === 'downloads') setActiveNav('downloads');
    if (s === 'account') setActiveNav('account');
    if (s === 'admin') setActiveNav('admin');
  }, [screen, selectedMovie, browseConfig]);

  const goBack = useCallback(() => {
    const prev = history[history.length - 1];
    if (prev) {
      setHistory(h => h.slice(0, -1));
      setScreen(prev.screen);
      if (prev.movie) setSelectedMovie(prev.movie);
      if (prev.browse) setBrowseConfig(prev.browse);
      if (prev.screen === 'home') setActiveNav('home');
      if (prev.screen === 'search') setActiveNav('search');
      if (prev.screen === 'downloads') setActiveNav('downloads');
      if (prev.screen === 'account') setActiveNav('account');
      if (prev.screen === 'admin') setActiveNav('admin');
    } else {
      setScreen('home');
      setActiveNav('home');
    }
  }, [history]);

  const handleNavChange = (tab: NavTab) => {
    setActiveNav(tab);
    setHistory([]);
    if (tab === 'home') setScreen('home');
    if (tab === 'search') setScreen('search');
    if (tab === 'downloads') setScreen('downloads');
    if (tab === 'account') setScreen('account');
    if (tab === 'admin') setScreen('admin');
  };

  // Loading state
  if (loading) {
    return (
      <div className="app-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: 36, height: 36,
          border: '3px solid rgba(139,92,246,0.2)',
          borderTopColor: '#8b5cf6',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // Not logged in
  if (!user) {
    if (authScreen === 'register') {
      return <RegisterScreen onSwitchToLogin={() => setAuthScreen('login')} />;
    }
    return <LoginScreen onSwitchToRegister={() => setAuthScreen('register')} />;
  }

  // Pending approval
  if (user.role === 'pending') {
    return <PendingScreen />;
  }

  // Logged in and approved/admin
  const isAdmin = user.role === 'admin';

  return (
    <div className="app-shell">
      <div className="screen-container">
        {screen === 'home' && (
          <HomeScreen
            onMovieClick={(m) => navigate('detail', m)}
            onPlayClick={(m) => { setSelectedMovie(m); navigate('player', m); }}
            onBrowse={(config) => { setBrowseConfig(config); navigate('browse', undefined, config); }}
            onSearch={() => navigate('search')}
          />
        )}
        {screen === 'player' && selectedMovie && (
          <PlayerScreen
            movie={selectedMovie}
            onBack={goBack}
            onMovieClick={(m) => navigate('detail', m)}
          />
        )}
        {screen === 'detail' && selectedMovie && (
          <DetailScreen
            movie={selectedMovie}
            onBack={goBack}
            onPlay={() => navigate('player', selectedMovie)}
            onMovieClick={(m) => navigate('detail', m)}
          />
        )}
        {screen === 'search' && (
          <SearchScreen
            onMovieClick={(m) => navigate('detail', m)}
            onPlay={(m) => navigate('player', m)}
          />
        )}
        {screen === 'browse' && browseConfig && (
          <BrowseScreen
            config={browseConfig}
            onMovieClick={(m) => navigate('detail', m)}
            onBack={goBack}
          />
        )}
        {screen === 'downloads' && (
          <DownloadsScreen
            onMovieClick={(m) => navigate('detail', m)}
            onPlayClick={(m) => navigate('player', m)}
          />
        )}
        {screen === 'account' && (
          <AccountScreen />
        )}
        {screen === 'admin' && isAdmin && (
          <AdminPanel />
        )}
      </div>
      <BottomNav active={activeNav} onChange={handleNavChange} isAdmin={isAdmin} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
