export type NavTab = 'home' | 'search' | 'downloads' | 'account' | 'email' | 'notes' | 'business' | 'chat';

export interface Movie {
  id: number;
  title: string;
  genre: string;
  year: number;
  rating: string;
  duration: string;
  description: string;
  gradient: string;
  accentColor: string;
  episodes?: number;
  seasons?: number;
  isSeries?: boolean;
  progress?: number;
}
