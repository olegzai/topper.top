/// <reference lib="dom" />
// modules/history.js
// History tracking module

import { state } from './state.js';
import { updateStatistics } from './stats.js';

// Add to rating history
export function addToRatingHistory(itemId: string, value: 1 | -1) {
  const timestamp = new Date().toISOString();
  // Generate a random ID for the rating since we're on the frontend
  const ratingId = `rating_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  state.ratingHistory.push({
    id: ratingId,
    userId: null, // For frontend-only tracking
    itemId: itemId,
    value: value,
    timestamp: timestamp,
  });

  // Update rating history display
  updateRatingHistoryDisplay();
}

// Update rating history display
export function updateRatingHistoryDisplay() {
  const container = document.getElementById('rating-history-list');
  if (!container) return;

  container.innerHTML = '';

  // Show last 10 ratings
  const recentRatings = state.ratingHistory.slice(-10);

  if (recentRatings.length === 0) {
    container.textContent = 'No ratings yet';
    return;
  }

  recentRatings.forEach(rating => {
    const div = document.createElement('div');
    div.textContent = `${rating.timestamp} - Item: ${rating.itemId.substring(
      0,
      8
    )}... - Rating: ${rating.value}`;
    container.appendChild(div);
  });
}

// Update user statistics
export function updateUserStats(ratingValue) {
  state.userStats.totalRatings++;

  if (ratingValue === 1) {
    state.userStats.positiveRatings++;
  } else {
    state.userStats.negativeRatings++;
  }

  // Track rated categories
  if (state.currentContent && state.currentContent.category) {
    const category = state.currentContent.category.toLowerCase();
    if (!state.userStats.ratedCategories[category]) {
      state.userStats.ratedCategories[category] = 0;
    }
    state.userStats.ratedCategories[category]++;
  }

  updateStatistics();
}

// Add to view history
export function addToViewHistory(content) {
  const timestamp = new Date().toISOString();
  const contentTitle =
    content.contentText ||
    content.content_text_en ||
    content.title ||
    content.name ||
    'Untitled';
  state.viewHistory.push({
    itemId: content.id,
    title: contentTitle,
    timestamp: timestamp,
  });

  // Update view history display
  updateViewHistoryDisplay();
}

// Update view history display
export function updateViewHistoryDisplay() {
  const container = document.getElementById('view-history-list');
  if (!container) return;

  container.innerHTML = '';

  // Show last 10 viewed items
  const recentViews = state.viewHistory.slice(-10);

  if (recentViews.length === 0) {
    container.textContent = 'No viewed items yet';
    return;
  }

  recentViews.forEach(view => {
    const div = document.createElement('div');
    div.textContent = `${view.timestamp} - ${view.title.substring(0, 40)}...`;
    container.appendChild(div);
  });
}
