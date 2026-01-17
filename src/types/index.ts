export interface Review {
  id: string;
  title: string;
  titleLower: string;
  language: string;
  rating: number;
  snippet: string;
  content: string;
  posterUrl?: string;
  tags?: string[];
  releaseDate?: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  commentCount: number;
  helpfulCount: number;
}

export interface Comment {
  id: string;
  reviewId: string;
  text: string;
  isAnonymous: boolean;
  displayName: string;
  userId: string | null;
  createdAt: Date;
  reported: boolean;
  reportedReason?: string;
}

export interface HelpfulVote {
  id: string;
  reviewId: string;
  voterUserId: string | null;
  voterDeviceId: string | null;
  createdAt: Date;
}

export interface User {
  id: string;
  email: string;
  displayName?: string;
  role?: 'admin' | 'user';
  pushEnabled: boolean;
  pushToken?: string;
  platform?: string;
  updatedAt: Date;
}

export type SortOption = 'release-date' | 'newest' | 'highest-rated' | 'most-commented' | 'most-helpful';

export interface AppState {
  selectedLanguage: string | null;
  sortBy: SortOption;
  searchQuery: string;
}
