// interfaces/api.types.ts
// API Response Type Definitions

export interface Item {
  id: string;
  lang?: string;
  score?: number;
  publishedAt?: string;
  tags?: string[];
  name?: string;
  title?: string;
  description?: string;
  url?: string;
  type?: string;
  category?: string;
}

export interface Rating {
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

export interface RatingResponse {
  rating: Rating;
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
export interface RatingRequest {
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
