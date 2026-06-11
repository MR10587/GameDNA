export interface UserProfile {
  id: string;
  username: string;
  avatarUrl: string;
  favoriteGames: { name: string; hours: number }[];
  preferredGenres: string[];
  weeklyHours: number;
  analysisDepth: string; // 'Standard' | 'Neural Decryption' | 'Quantum Synthesis'
  playstyleSelfTag: 'aggressive' | 'support' | 'tactical' | 'balanced';
  customBio?: string;
  dnaProfile?: DnaProfile;
  isDemo: boolean;
  createdAt: string;
}

export interface DnaProfile {
  personalityName: string; // e.g. "THE TACTICAL AGGRESSOR"
  description: string;
  metrics: {
    aggression: number; // 0-100
    strategy: number; // 0-100
    teamwork: number; // 0-100
  };
  badges: string[]; // e.g. ["#HighMobility", "#ShotCaller", "#ClutchKing"]
  analysisReliability: number; // e.g. 99.2
  competitiveTier: string; // e.g. "Level 3"
  generatedAt: string;
}

export interface Game {
  id: string;
  name: string;
  genre: string;
  tags: string[];
  playstyleAttributes: {
    aggression: number;
    strategy: number;
    teamwork: number;
  };
  description: string;
  imageUrl?: string;
}

export interface GameRecommendation {
  id: string;
  name: string;
  genre: string;
  matchPercentage: number;
  whyRecommended: string;
  imageUrl?: string;
}

export interface PlayerMatch {
  userId: string;
  username: string;
  avatarUrl: string;
  personalityName: string;
  compatibility: number; // percentage (e.g. 94)
  playstyleLabels: string[]; // e.g. ["SHADOW ASSASSIN"]
  synergyExplanation: string;
  hasSentRequest?: boolean;
}

export interface CmsContent {
  homePage: {
    tagline: string;
    heroTitle: string;
    heroSubtitle: string;
    ctaAnalyzeText: string;
    ctaDemoText: string;
    statsCounterProfiles: string;
    statsCounterAccuracy: string;
    statsCounterRating: string;
    trustHeading: string;
    trustText: string;
    scienceTitle: string;
    scienceSubtitle: string;
    scienceBullet1: string;
    scienceBullet2: string;
    scienceBullet3: string;
  };
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    urlSlug: string;
  };
  recWeights: {
    genreMatchWeight: number; // 0.0 to 1.0 (defaults to 0.40)
    playstyleWeight: number; // 0.0 to 1.0 (defaults to 0.40)
    hoursWeight: number; // 0.0 to 1.0 (defaults to 0.20)
    matchingSensitivity: number; // 0.0 to 1.0 (defaults to 0.85)
  };
}

export interface AnalyticsData {
  totalAnalyzedProfiles: number;
  activeSessions: number;
  successfulMatchups: number;
  recClicksCount: Record<string, number>;
  mostRecommendedGames: { name: string; count: number }[];
}
