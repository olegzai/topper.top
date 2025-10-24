/// <reference lib="dom" />
// modules/utils.ts
// Utility functions module

import { state } from './state.js';
import { Item } from '../types/api.types';
import { logger } from '../utils/logger';

// Debug logging function
export function logDebug(
  message: string,
  meta?: Record<string, unknown>,
  correlationId?: string
) {
  const timestamp = new Date().toISOString();
  const logMessage = `[${timestamp}] ${message}`;

  // Add to global debug messages array if it exists
  if (state && state.debugMessages) {
    state.debugMessages.push(logMessage);

    // Update debug area - create list items instead of plain text
    const debugElement = document.getElementById('debug-log');
    if (debugElement) {
      // For a UL element, we want to add LI elements
      const lastMessages = state.debugMessages.slice(-20); // Show last 20 messages

      // Clear current content
      debugElement.innerHTML = '';

      // Add each message as a list item
      lastMessages.forEach(msg => {
        const li = document.createElement('li');
        li.textContent = msg;
        debugElement.appendChild(li);
      });
    }
  }

  // Log using structured logger with correlation ID support
  logger.debug(message, meta, correlationId);
}

// Escape HTML function for security
export function escapeHtml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Function to change language
export function changeLanguage(setCurrentLanguage?: (lang: string) => void) {
  const languageSelector = document.getElementById(
    'language-selector'
  ) as HTMLSelectElement;
  if (languageSelector) {
    const selectedLanguage = languageSelector.value;
    console.log(`Language changed to: ${selectedLanguage}`);

    // Update current language in state
    if (setCurrentLanguage) {
      setCurrentLanguage(selectedLanguage);
    }

    // The language update functionality would typically be handled in the main app
  }
}

// Find similar items based on shared tags
export function findSimilarItems(item: Item, allItems: Item[]): Item[] {
  if (!item.tags || item.tags.length === 0) {
    return [];
  }

  return allItems.filter(
    it =>
      it.id !== item.id &&
      Array.isArray(it.tags) &&
      it.tags.some((tag: string) => item.tags!.includes(tag))
  );
}

// Find non-similar items based on different tags
export function findNonSimilarItems(item: Item, allItems: Item[]): Item[] {
  if (!item.tags || item.tags.length === 0) {
    return allItems.filter(it => it.id !== item.id);
  }

  return allItems.filter(
    it =>
      it.id !== item.id &&
      Array.isArray(it.tags) &&
      !it.tags.some((tag: string) => item.tags!.includes(tag))
  );
}

// Find a single similar item
export function findSimilarItem(
  item: Item,
  allItems: Item[]
): Item | undefined {
  return findSimilarItems(item, allItems)[0];
}

// Find a single non-similar item
export function findNonSimilarItem(
  item: Item,
  allItems: Item[]
): Item | undefined {
  return findNonSimilarItems(item, allItems)[0];
}

// Enhanced smart content selection based on user preferences
export function findSmartContent(
  allItems: Item[],
  rankingHistory: Array<{ itemId: string; value: 1 | -1; timestamp: string }>,
  currentLanguage: string,
  isPositive: boolean = true // true for similar (positive preference), false for different (negative preference)
): Item | undefined {
  if (allItems.length === 0) return undefined;

  // Filter items by current language
  const languageFiltered = allItems.filter(
    item => !item.lang || item.lang === currentLanguage
  );

  if (languageFiltered.length === 0) {
    // If no items in requested language, fall back to all items
    return allItems[Math.floor(Math.random() * allItems.length)];
  }

  // Analyze user preferences from ranking history
  if (rankingHistory.length > 0) {
    // Calculate preference weights based on rankings
    const categoryWeights = new Map<string, number>();
    const typeWeights = new Map<string, number>();
    const tagWeights = new Map<string, number>();

    // Process the ranking history to calculate weights
    for (const ranking of rankingHistory) {
      const item = allItems.find(i => i.id === ranking.itemId);
      if (!item) continue;

      // Calculate multipliers based on ranking value
      const multiplier = ranking.value === 1 ? 1 : -1; // Positive ranking = prefer, negative ranking = avoid

      // Add weight to categories
      if (item.category) {
        const currentWeight = categoryWeights.get(item.category) || 0;
        categoryWeights.set(item.category, currentWeight + multiplier);
      }

      // Add weight to types
      if (item.type) {
        const currentWeight = typeWeights.get(item.type) || 0;
        typeWeights.set(item.type, currentWeight + multiplier);
      }

      // Add weight to tags
      if (item.tags && Array.isArray(item.tags)) {
        for (const tag of item.tags) {
          const currentWeight = tagWeights.get(tag) || 0;
          tagWeights.set(tag, currentWeight + multiplier);
        }
      }
    }

    // Score each item based on user preferences
    const scoredItems = languageFiltered.map(item => {
      let score = 0;

      // Category preference score
      if (item.category && categoryWeights.has(item.category)) {
        score += categoryWeights.get(item.category)! * 2; // Category weight is higher
      }

      // Type preference score
      if (item.type && typeWeights.has(item.type)) {
        score += typeWeights.get(item.type)! * 1.5; // Type weight is medium
      }

      // Tag preference score
      if (item.tags && Array.isArray(item.tags)) {
        for (const tag of item.tags) {
          if (tagWeights.has(tag)) {
            score += tagWeights.get(tag)!;
          }
        }
      }

      // Adjust score based on whether we want similar (positive) or different (negative) content
      if (!isPositive) {
        score = -score; // Invert for negative preference
      }

      // Add some randomness to avoid always getting the same content
      score += Math.random() * 0.1;

      return { item, score };
    });

    // Sort by score (descending)
    scoredItems.sort((a, b) => b.score - a.score);

    // For positive preference (similar), return highest-ranked item
    // For negative preference (different), we could return lowest-ranked but let's still pick from top 30% to avoid very bad matches
    if (isPositive) {
      return scoredItems[0]?.item;
    } else {
      // For negative preference, pick from the lower half but not the absolute worst
      const startIndex = Math.floor(scoredItems.length * 0.7); // Start from 70% down (so we don't get the absolute best)
      const endIndex = scoredItems.length - 1;

      if (startIndex > endIndex) {
        return scoredItems[scoredItems.length - 1]?.item; // Return the worst one if we have to
      }

      const randomIndex =
        Math.floor(Math.random() * (endIndex - startIndex + 1)) + startIndex;
      return scoredItems[randomIndex]?.item;
    }
  }

  // If no ranking history, return a random item from the language-filtered list
  return languageFiltered[Math.floor(Math.random() * languageFiltered.length)];
}

// Safe string comparison function
export function safeStringCompare(
  str1: string | undefined,
  str2: string | undefined
): boolean {
  if (str1 === undefined && str2 === undefined) return true;
  if (str1 === undefined || str2 === undefined) return false;
  return str1.toLowerCase() === str2.toLowerCase();
}

// Get current timestamp
export function getCurrentTimestamp(): string {
  return new Date().toISOString();
}

// Deep clone function
export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

// Function to generate unique ID
export function generateId(): string {
  return `id_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
}

// Safe array access function
export function safeArrayGet<T>(arr: T[], index: number): T | undefined {
  return arr && index >= 0 && index < arr.length ? arr[index] : undefined;
}

// Debounce function utility
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): T {
  let timeout: NodeJS.Timeout | null = null;
  return function executedFunction(...args: Parameters<T>): void {
    const later = () => {
      clearTimeout(timeout!);
      func(...args);
    };
    clearTimeout(timeout!);
    timeout = setTimeout(later, wait);
  } as T;
}
