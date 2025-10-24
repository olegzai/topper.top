// interfaces/api.types.ts
// API Response Type Definitions

export interface Item {
  content_id: string;
  content_canonical_text_en: string;
  content_text_en: string;
  content_text_ro: string;
  content_text_ua: string;
  content_text_ru: string;
  content_source_name_en: string;
  content_source_name_ro: string;
  content_source_name_ua: string;
  content_source_name_ru: string;
  content_source_link: string;
  content_country?: string;
  content_created_by?: string | null;
  content_created: string;
  content_published: string;
  content_edited?: string;
  content_type: string;
  content_category: string;
  content_subcategory?: string;
  content_tags: string[];
  content_votes: number;
  content_score: number;
  categories?: string[];
  lang: string;
  // Properties added dynamically by the API
  [key: string]: unknown;
}

export interface Ranking {
  id: string;
  userId: string | null;
  itemId: string;
  value: 1 | -1;
  createdAt: string;
}

export interface ApiResponse<T> {
  data: T;
  error?: string;
  status?: number;
}

// API Response Structures
export interface ItemsResponse {
  total: number;
  items: Item[];
}

export interface ItemResponse {
  item: Item;
}

export interface RankingResponse {
  ranking: Ranking;
  item: { id: string; score: number };
  nextItem?: Item;
}

export interface LeaderboardResponse {
  items: Item[];
}

export interface HealthResponse {
  status: 'ok';
}

export interface VersionResponse {
  version: string;
}

export interface InfoResponse {
  name: string;
  version: string;
  uptimeSeconds: number;
}

export interface RandomItemResponse {
  item: Item;
}

// API Request Types
export interface RankingRequest {
  itemId: string;
  value: 1 | -1;
  userId?: string;
}

export interface ItemsQueryParams {
  limit?: number;
  offset?: number;
  lang?: string;
  sort?: 'new' | 'top';
}

export interface LeaderboardQueryParams {
  limit?: number;
  lang?: string;
}
