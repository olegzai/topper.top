// public/js/services/api.service.ts
// API Service Layer - Abstracts API communication

import type {
  Item,
  ItemsResponse,
  RankingResponse,
  LeaderboardResponse,
  RandomItemResponse,
} from '../types/api.types';
import { logger } from '../utils/logger';

class ApiService {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = '') {
    // Use the current origin as default if no base URL is provided
    this.baseUrl =
      baseUrl ||
      (typeof window !== 'undefined'
        ? window.location.origin
        : 'http://localhost:3000');
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  // Load content items
  async loadContent(currentLanguage?: string): Promise<Item[]> {
    const startTime = Date.now();
    logger.info('Loading content from API', { language: currentLanguage });

    try {
      let url = `${this.baseUrl}/api/items?limit=50`;
      if (currentLanguage) {
        url += `&lang=${currentLanguage}`;
      }

      const response = await fetch(url);
      const data: ItemsResponse = await response.json();

      const duration = Date.now() - startTime;
      logger.info('Content loaded successfully', {
        itemCount: data.items?.length || 0,
        duration: `${duration}ms`,
        url,
      });

      if (data.items && data.items.length > 0) {
        return data.items;
      } else {
        logger.warn('No items found in API response');
        return [];
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Error loading content', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
      });
      throw error;
    }
  }

  // Submit ranking to API
  async submitRanking(itemId: string, value: 1 | -1): Promise<RankingResponse> {
    const startTime = Date.now();
    logger.info('Submitting ranking', { itemId, value });

    try {
      const response = await fetch(`${this.baseUrl}/api/rankings`, {
        method: 'POST',
        headers: this.defaultHeaders,
        body: JSON.stringify({
          itemId: itemId,
          value: value,
        }),
      });

      const data: RankingResponse = await response.json();

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage =
          errorData.error || `HTTP error! status: ${response.status}`;
        logger.error('Error rating item', {
          itemId,
          value,
          error: errorMessage,
          status: response.status,
        });
        throw new Error(errorMessage);
      }

      const duration = Date.now() - startTime;
      logger.info('Ranking submitted successfully', {
        itemId,
        value,
        duration: `${duration}ms`,
        rankingId: data.ranking?.id,
      });

      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Error during ranking', {
        itemId,
        value,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
      });
      throw error;
    }
  }

  // Get top ranked items
  async getTopRanked(
    currentLanguage?: string,
    category: string = ''
  ): Promise<Item[]> {
    const startTime = Date.now();
    logger.info('Loading top ranked items', {
      language: currentLanguage,
      category,
    });

    try {
      let url = `${this.baseUrl}/api/leaderboard?limit=10`;
      if (currentLanguage) {
        url += `&lang=${currentLanguage}`;
      }

      const response = await fetch(url);
      const data: LeaderboardResponse = await response.json();

      // If category filter is applied, filter the results
      let filteredItems = Array.isArray(data.items) ? data.items : [];
      if (category) {
        filteredItems = filteredItems.filter(
          item =>
            item.category &&
            typeof item.category === 'string' &&
            item.category.toLowerCase() === category.toLowerCase()
        );
      }

      // Take top 10 after filtering
      const result = filteredItems.slice(0, 10);
      const duration = Date.now() - startTime;

      logger.info('Top ranked items loaded successfully', {
        itemCount: result.length,
        duration: `${duration}ms`,
        url,
      });

      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Error loading top ratings', {
        error: error instanceof Error ? error.message : 'Unknown error',
        category,
        duration: `${duration}ms`,
      });
      throw error;
    }
  }

  // Get random item
  async getRandomItem(): Promise<Item | null> {
    const startTime = Date.now();
    logger.info('Loading random item');

    try {
      const response = await fetch(`${this.baseUrl}/api/random`);
      const data: RandomItemResponse = await response.json();

      if (data.item) {
        const duration = Date.now() - startTime;
        logger.info('Random item loaded successfully', {
          itemId: data.item.id,
          duration: `${duration}ms`,
        });
        return data.item;
      } else {
        logger.warn('No random item found');
        return null;
      }
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Error getting random item', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
      });
      throw error;
    }
  }

  // Get health status
  async getHealth(): Promise<boolean> {
    const startTime = Date.now();
    logger.debug('Checking API health');

    try {
      const response = await fetch(`${this.baseUrl}/api/health`);
      const data = await response.json();

      const duration = Date.now() - startTime;
      logger.info('Health check completed', {
        status: data.status,
        healthy: data.status === 'ok',
        duration: `${duration}ms`,
      });

      return data.status === 'ok';
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Error checking health', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
      });
      return false;
    }
  }

  // Get app info
  async getInfo() {
    const startTime = Date.now();
    logger.debug('Getting app info');

    try {
      const response = await fetch(`${this.baseUrl}/api/info`);
      const data = await response.json();

      const duration = Date.now() - startTime;
      logger.info('App info retrieved', {
        appName: data.name,
        version: data.version,
        duration: `${duration}ms`,
      });

      return data;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Error getting app info', {
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
      });
      throw error;
    }
  }

  // Get specific item by ID
  async getItemById(id: string): Promise<Item | null> {
    const startTime = Date.now();
    logger.debug('Getting item by ID', { id });

    try {
      const response = await fetch(`${this.baseUrl}/api/items/${id}`);

      if (response.status === 404) {
        logger.warn('Item not found', { id });
        return null;
      }

      const data = await response.json();

      const duration = Date.now() - startTime;
      logger.info('Item retrieved successfully', {
        itemId: id,
        duration: `${duration}ms`,
      });

      return data.item || null;
    } catch (error) {
      const duration = Date.now() - startTime;
      logger.error('Error getting item by ID', {
        id,
        error: error instanceof Error ? error.message : 'Unknown error',
        duration: `${duration}ms`,
      });
      throw error;
    }
  }
}

// Create singleton instance
const apiService = new ApiService();
export default apiService;
