// types.ts - Type definitions for the application

export interface Item {
  id: string;
  content_id: string;
  lang?: string;
  score?: number;
  publishedAt?: string;
  tags?: string[];
  contentText?: string; // Using content_text instead of title/description
  sourceName?: string; // Using source_name instead of separate source field
  url?: string;
  type?: string;
  category?: string;
  country?: string;
  createdAt?: string;
  authorId?: string | null;
  categories?: string[];
}

export interface Ranking {
  id: string;
  userId: string | null;
  itemId: string;
  value: 1 | -1;
  timestamp: string; // Added for frontend history tracking
}

export interface UserStats {
  totalRatings: number;
  positiveRatings: number;
  negativeRatings: number;
  rankedCategories: { [key: string]: number };
}

export interface ViewState {
  allItems: Item[];
  currentIndex: number;
  currentContent: Item | null;
  currentLanguage: 'en' | 'ro' | 'ru' | 'uk';
  debugMessages: string[];
  rankingHistory: Ranking[];
  viewHistory: {
    itemId: string;
    title: string;
    timestamp: string;
  }[];
  userStats: UserStats;
}

export interface Translation {
  [key: string]: string | Translation | { [key: string]: string | Translation }; // Allow nested structure
}

export interface Translations {
  en: Translation;
  ro: Translation;
  ru: Translation;
  uk: Translation;
}

export interface ApiLoadContentResponse {
  items: Item[];
  total?: number;
}

export interface ApiRankingResponse {
  ranking: Ranking;
  item: { id: string; score: number };
  nextItem?: Item;
}
