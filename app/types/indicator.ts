export interface IndicatorStats {
  uses?: number;
  views?: number;
  favorites: number;
  publishedDate: string;
  updatedDate?: string;
}

export interface Indicator {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  features: string[];
  useCases: string[];
  technicalDetails?: string;
  tradingViewUrl: string;
  category: 'free' | 'pro';
  stats: IndicatorStats;
  isPro: boolean;
  isPublished: boolean;
  image?: string;
}

export interface ProAccessRequest {
  id: string;
  userId: string;
  userEmail: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected';
  tradingViewUsername?: string;
  message?: string;
}

export interface UserAnalytics {
  userId: string;
  pageViews: number;
  lastActive: string;
  indicatorsViewed: string[];
}
