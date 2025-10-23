/// <reference lib="dom" />
// modules/navigation.js
// Navigation module

import { state } from './state.js';
import { showCurrentContent } from './content.js';
import apiService from '../services/api.service.js';
import { addToRatingHistory, updateUserStats } from './history.js';
import { findSmartContent, logDebug } from '../modules/utils.js';

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
  if (state.currentContent) {
    try {
      logDebug(`Downvoting content ID: ${state.currentContent.id}`);
      const data = await apiService.submitRating(state.currentContent.id, -1);

      // Update score in the current content
      if (state.currentContent) {
        state.currentContent.score = data.item.score;
      }

      // Add to rating history
      addToRatingHistory(state.currentContent.id, -1);

      // Update user statistics
      updateUserStats(-1);

      // Get a different item using smart selection based on user preferences
      const nextItem =
        data.nextItem ||
        findSmartContent(
          state.allItems,
          state.ratingHistory,
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
        // Fallback: just move to next item if available
        if (state.currentIndex < state.allItems.length - 1) {
          state.currentIndex++;
        } else {
          // If at end, try to load more items
          // This would require calling loadContent which we'll need to import later
        }
        showCurrentContent();
      }
    } catch (error) {
      logDebug('Error during downvote: ' + error.message);
    }
  }
}

export async function upvoteAndNext() {
  if (state.currentContent) {
    try {
      logDebug(`Upvoting content ID: ${state.currentContent.id}`);
      const data = await apiService.submitRating(state.currentContent.id, 1);

      // Update score in the current content
      if (state.currentContent) {
        state.currentContent.score = data.item.score;
      }

      // Add to rating history
      addToRatingHistory(state.currentContent.id, 1);

      // Update user statistics
      updateUserStats(1);

      // Get a similar item using smart selection based on user preferences
      const nextItem =
        data.nextItem ||
        findSmartContent(
          state.allItems,
          state.ratingHistory,
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
        // Fallback: just move to next item if available
        if (state.currentIndex < state.allItems.length - 1) {
          state.currentIndex++;
        } else {
          // If at end, try to load more items
          // This would require calling loadContent which we'll need to import later
        }
        showCurrentContent();
      }
    } catch (error) {
      logDebug('Error during upvote: ' + error.message);
    }
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
export async function quickRate(value) {
  if (!state.currentContent) return;

  try {
    logDebug(
      `${value === 1 ? 'Upvoting' : 'Downvoting'} content ID: ${
        state.currentContent.id
      }`
    );
    const data = await apiService.submitRating(state.currentContent.id, value);

    // Update score in the current content
    if (state.currentContent) {
      state.currentContent.score = data.item.score;
    }

    // Add to rating history
    addToRatingHistory(state.currentContent.id, value);

    // Update user statistics
    updateUserStats(value);

    // Update information section to show new score
    // This requires importing updateInformationSection from ui.js

    logDebug(
      `${value === 1 ? 'Upvoted' : 'Downvoted'} content. New score: ${
        state.currentContent.score
      }`
    );
  } catch (error) {
    logDebug('Error during quick rating: ' + error.message);
  }
}
