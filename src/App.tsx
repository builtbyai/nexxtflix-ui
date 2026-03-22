import React, { useState } from 'react';
import './App.css';
import HomeScreen from './features/home/HomeScreen';
import PlayerScreen from './features/player/PlayerScreen';
import DetailScreen from './features/detail/DetailScreen';
import SearchScreen from './features/search/SearchScreen';
import DownloadsScreen from './features/downloads/DownloadsScreen';
import AccountScreen from './features/account/AccountScreen';
import DashboardScreen from './features/dashboard/DashboardScreen';
import EmailPageScreen from './features/email-page/EmailPageScreen';
import BottomNav from './components/BottomNav';
import { Movie, NavTab } from './types';

export type Screen = 'home' | 'player' | 'detail' | 'search' | 'downloads' | 'account' | 'dashboard' | 'email-page';

function App() {
  const [screen, setScreen] = useState<Screen>('home');
  const [activeNav, setActiveNav] = useState<NavTab>('home');
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const navigate = (s: Screen, movie?: Movie) => {
    if (movie) setSelectedMovie(movie);
    setScreen(s);
    if (s === 'home') setActiveNav('home');
    if (s === 'search') setActiveNav('search');
    if (s === 'downloads') setActiveNav('downloads');
    if (s === 'account') setActiveNav('account');
  };

  const handleNavChange = (tab: NavTab) => {
    setActiveNav(tab);
    if (tab === 'home') setScreen('home');
    if (tab === 'search') setScreen('search');
    if (tab === 'downloads') setScreen('downloads');
    if (tab === 'account') setScreen('account');
    if (tab === 'dashboard') setScreen('dashboard');
    if (tab === 'email-page') setScreen('email-page');
  };

  return (
    <div className="app-shell">
      <div className="screen-container">
        {screen === 'home' && (
          <HomeScreen
            onMovieClick={(m) => navigate('detail', m)}
            onPlayClick={(m) => { setSelectedMovie(m); setIsPlaying(true); navigate('player', m); }}
          />
        )}
        {screen === 'player' && selectedMovie && (
          <PlayerScreen
            movie={selectedMovie}
            onBack={() => navigate('detail', selectedMovie)}
            onMovieClick={(m) => navigate('detail', m)}
          />
        )}
        {screen === 'detail' && selectedMovie && (
          <DetailScreen
            movie={selectedMovie}
            onBack={() => navigate('home')}
            onPlay={() => { setIsPlaying(true); navigate('player', selectedMovie); }}
            onMovieClick={(m) => navigate('detail', m)}
          />
        )}
        {screen === 'search' && (
          <SearchScreen
            onMovieClick={(m) => navigate('detail', m)}
          />
        )}
        {screen === 'downloads' && (
          <DownloadsScreen
            onMovieClick={(m) => navigate('detail', m)}
          />
        )}
        {screen === 'account' && (
          <AccountScreen />
        )}
        {screen === 'dashboard' && (
          <DashboardScreen onBack={() => navigate('home')} />
        )}
        {screen === 'email-page' && (
          <EmailPageScreen onBack={() => navigate('home')} />
        )}
      </div>
      <BottomNav active={activeNav} onChange={handleNavChange} />
    </div>
  );
}

export default App;
