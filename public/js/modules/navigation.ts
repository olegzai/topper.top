/// <reference lib="dom" />
// modules/navigation.js
// Navigation module

import { state } from './state.js';
import { showCurrentContent } from './content.js';
import apiService from '../services/api.service.js';
import { addToRatingHistory, updateUserStats } from './history.js';
import { findSmartContent, logDebug } from './utils.js';
import { updateInformationSection } from './ui.js';
import type { Item as ApiItem } from '../types/api.types.js';

// Navigation functions
export function previousContent() {
  if (state.currentIndex > 0) {
    state.currentIndex--;
    showCurrentContent();
    logDebug('Moved to previous content');
  } else {
    logDebug('Already at the first content item');
  }
}

export async function downvoteAndNext() {
  const current = state.currentContent as unknown as ApiItem | null;
  if (!current) {
    logDebug('No current content to downvote');
    return;
  }

  try {
    const itemId = current.content_id ?? current.id;
    logDebug(`Downvoting content ID: ${itemId}`);

    const data = await apiService.submitRating(itemId, -1);

    // Update score in the current content using API response
    current.content_score = data.item.score ?? current.score;

    // Add to rating history
    addToRatingHistory(itemId, -1);

    // Update user statistics
    updateUserStats(-1);

    // Select next item using server-provided nextItem or client-side smart selection
    const nextItem =
      data.nextItem ??
      findSmartContent(
        state.allItems as unknown as ApiItem[],
        state.ratingHistory as unknown as {
          itemId: string;
          value: 1 | -1;
          timestamp: string;
        }[],
        state.currentLanguage,
        false
      );

    if (nextItem) {
      // Insert next item after current index and move to it
      state.allItems.splice(state.currentIndex + 1, 0, nextItem);
      state.currentIndex++;
      showCurrentContent();
      logDebug(
        'Downvoted and moved to different content based on user preferences'
      );
    } else {
      // Fallback: move to next item if available
      if (state.currentIndex < state.allItems.length - 1) {
        state.currentIndex++;
        showCurrentContent();
      } else {
        // If at end and no next item, still refresh display
        showCurrentContent();
      }
    }
  } catch (error) {
    logDebug('Error during downvote: ' + (error as Error).message);
  }
}

export async function upvoteAndNext() {
  const current = state.currentContent as unknown as ApiItem | null;
  if (!current) {
    logDebug('No current content to upvote');
    return;
  }

  try {
    const itemId = current.content_id ?? current.id;
    logDebug(`Upvoting content ID: ${itemId}`);

    const data = await apiService.submitRating(itemId, 1);

    // Update score in the current content using API response
    current.content_score = data.item.score ?? current.score;

    // Add to rating history
    addToRatingHistory(itemId, 1);

    // Update user statistics
    updateUserStats(1);

    // Select next item using server-provided nextItem or client-side smart selection
    const nextItem =
      data.nextItem ??
      findSmartContent(
        state.allItems as unknown as ApiItem[],
        state.ratingHistory as unknown as {
          itemId: string;
          value: 1 | -1;
          timestamp: string;
        }[],
        state.currentLanguage,
        true
      );

    if (nextItem) {
      // Insert next item after current index and move to it
      state.allItems.splice(state.currentIndex + 1, 0, nextItem);
      state.currentIndex++;
      showCurrentContent();
      logDebug(
        'Upvoted and moved to similar content based on user preferences'
      );
    } else {
      // Fallback: move to next item if available
      if (state.currentIndex < state.allItems.length - 1) {
        state.currentIndex++;
        showCurrentContent();
      } else {
        // End of list - refresh display
        showCurrentContent();
      }
    }
  } catch (error) {
    logDebug('Error during upvote: ' + (error as Error).message);
  }
}

export function skipContent() {
  logDebug('Skipped content without rating');
  if (state.currentIndex < state.allItems.length - 1) {
    state.currentIndex++;
  } else {
    // If at end, try to load more items
    // This would require calling loadContent which we'll need to import later
  }
  showCurrentContent();
}

// Quick rate function
export async function quickRate(value: 1 | -1) {
  const current = state.currentContent as unknown as ApiItem | null;
  if (!current) return;

  try {
    const itemId = current.content_id ?? current.id;
    logDebug(
      `${value === 1 ? 'Upvoting' : 'Downvoting'} content ID: ${itemId}`
    );

    const data = await apiService.submitRating(itemId, value);

    // Update score in the current content using API response
    current.content_score = data.item.score ?? current.score;

    // Add to rating history
    addToRatingHistory(itemId, value);

    // Update user statistics
    updateUserStats(value);

    // Update information section to show new score
    updateInformationSection(current);

    logDebug(
      `${value === 1 ? 'Upvoted' : 'Downvoted'} content. New score: ${
        current.content_score
      }`
    );
  } catch (error) {
    logDebug('Error during quick rating: ' + (error as Error).message);
  }
}
