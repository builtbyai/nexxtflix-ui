
// Fallback/placeholder data when Emby server is unreachable

import { Movie } from '../types';

export const PLACEHOLDER_MOVIES: Movie[] = [
  {
    id: 'tt0111161',
    imdbId: 'tt0111161',
    title: 'The Shawshank Redemption',
    genre: 'Drama',
    year: 1994,
    rating: '9.3',
    duration: '2h 22m',
    description: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    gradient: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
    accentColor: '#6366f1',
    poster: 'https://m.media-amazon.com/images/M/MV5BMDAyY2FhYjctNDc5OS00MDNlLThiMGUtY2UxYWVkNGY2ZjljXkEyXkFqcGc@._V1_SX300.jpg',
  },
  {
    id: 'tt1375666',
    imdbId: 'tt1375666',
    title: 'Inception',
    genre: 'Sci-Fi • Action • Thriller',
    year: 2010,
    rating: '8.8',
    duration: '2h 28m',
    description: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea.',
    gradient: 'linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)',
    accentColor: '#8b5cf6',
    poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_SX300.jpg',
  },
];

export const FEATURED_MOVIE = PLACEHOLDER_MOVIES[0];
export const LOADING_SKELETON: Movie = {
  id: 'loading',
  title: 'Loading...',
  genre: '',
  year: 0,
  rating: '—',
  duration: '',
  description: '',
  gradient: 'linear-gradient(135deg, #1a1a2e, #16213e)',
  accentColor: '#8b5cf6',
};
