/// <reference lib="dom" />
// modules/history.js
// History tracking module

import { state } from './state.js';
import { updateStatistics } from './stats.js';
import { Item } from '../types/api.types';

// Add to ranking history
export function addToRankingHistory(itemId: string, value: 1 | -1) {
  const timestamp = new Date().toISOString();
  // Generate a random ID for the ranking since we're on the frontend
  const rankingId = `ranking_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;
  state.rankingHistory.push({
    id: rankingId,
    userId: null, // For frontend-only tracking
    itemId: itemId,
    value: value,
    timestamp: timestamp,
  });

  // Update ranking history display
  updateRankingHistoryDisplay();
}

// Update ranking history display
export function updateRankingHistoryDisplay() {
  const container = document.getElementById('ranking-history-list');
  if (!container) return;

  container.innerHTML = '';

  // Show last 10 rankings
  const recentRankings = state.rankingHistory.slice(-10);

  if (recentRankings.length === 0) {
    container.textContent = 'No rankings yet';
    return;
  }

  recentRankings.forEach(ranking => {
    const div = document.createElement('div');
    div.textContent = `${ranking.timestamp} - Item: ${ranking.itemId.substring(
      0,
      8
    )}... - Ranking: ${ranking.value}`;
    container.appendChild(div);
  });
}

// Update user statistics
export function updateUserStats(rankingValue: 1 | -1) {
  state.userStats.totalRatings++;

  if (rankingValue === 1) {
    state.userStats.positiveRatings++;
  } else {
    state.userStats.negativeRatings++;
  }

  // Track ranked categories
  if (state.currentContent && state.currentContent.category) {
    const category = state.currentContent.category.toLowerCase();
    if (!state.userStats.rankedCategories[category]) {
      state.userStats.rankedCategories[category] = 0;
    }
    state.userStats.rankedCategories[category]++;
  }

  updateStatistics();
}

// Add to view history
export function addToViewHistory(content: Item) {
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
