// modules/api.js
// API communication module

import type {
  Item,
  ItemsResponse,
  RatingResponse,
  LeaderboardResponse,
  RandomItemResponse,
} from '../types/api.types';
import { logDebug } from './utils.js';

// Load content items
export async function loadContent(currentLanguage?: string): Promise<Item[]> {
  try {
    logDebug('Loading content from API...');
    let url = 'http://localhost:3000/api/items?limit=50';
    if (currentLanguage) {
      url += `&lang=${currentLanguage}`;
    }

    const response = await fetch(url);
    const data: ItemsResponse = await response.json();

    if (data.items && data.items.length > 0) {
      return data.items;
    } else {
      logDebug('No items found in API response');
      return [];
    }
  } catch (error) {
    logDebug(
      'Error loading content: ' +
        (error instanceof Error ? error.message : 'Unknown error')
    );
    throw error;
  }
}

// Submit rating to API
export async function submitRating(
  itemId: string,
  value: 1 | -1
): Promise<RatingResponse> {
  try {
    const response = await fetch('http://localhost:3000/api/ratings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        itemId: itemId,
        value: value,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.error || `HTTP error! status: ${response.status}`;
      logDebug('Error rating item: ' + errorMessage);
      throw new Error(errorMessage);
    }

    const data: RatingResponse = await response.json();

    return data;
  } catch (error) {
    logDebug(
      'Error during rating: ' +
        (error instanceof Error ? error.message : 'Unknown error')
    );
    throw error;
  }
}

// Get top rated items
export async function getTopRated(
  currentLanguage?: string,
  category: string = ''
): Promise<Item[]> {
  try {
    let url = `http://localhost:3000/api/leaderboard?limit=10`;
    if (currentLanguage) {
      url += `&lang=${currentLanguage}`;
    }

    const response = await fetch(url);
    const data: LeaderboardResponse = await response.json();

    if (data.items && data.items.length > 0) {
      // If category filter is applied, filter the results
      let filteredItems = data.items;
      if (category) {
        filteredItems = data.items.filter(
          item =>
            item.category &&
            item.category.toLowerCase() === category.toLowerCase()
        );
      }

      // Take top 10 after filtering
      return filteredItems.slice(0, 10);
    } else {
      logDebug('No top-rated items found.');
      return [];
    }
  } catch (error) {
    logDebug(
      'Error loading top ratings: ' +
        (error instanceof Error ? error.message : 'Unknown error')
    );
    throw error;
  }
}

// Get random item
export async function getRandomItem(): Promise<Item | null> {
  try {
    const response = await fetch('http://localhost:3000/api/random');
    const data: RandomItemResponse = await response.json();

    if (data.item) {
      return data.item;
    } else {
      logDebug('No random item found.');
      return null;
    }
  } catch (error) {
    logDebug(
      'Error getting random item: ' +
        (error instanceof Error ? error.message : 'Unknown error')
    );
    throw error;
  }
}
