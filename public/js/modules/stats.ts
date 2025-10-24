/// <reference lib="dom" />
// modules/stats.js
// Statistics module

import { state } from './state.js';

// Update statistics display
export function updateStatistics() {
  // Personal stats
  const totalRatingsElement = document.getElementById('personal-total-ratings');
  if (totalRatingsElement)
    totalRatingsElement.textContent = state.userStats.totalRatings.toString();

  const positiveRatingsElement = document.getElementById(
    'personal-positive-ratings'
  );
  if (positiveRatingsElement)
    positiveRatingsElement.textContent =
      state.userStats.positiveRatings.toString();

  const negativeRatingsElement = document.getElementById(
    'personal-negative-ratings'
  );
  if (negativeRatingsElement)
    negativeRatingsElement.textContent =
      state.userStats.negativeRatings.toString();

  // Find favorite category
  let favoriteCategory = 'None';
  let maxCount = 0;
  for (const [category, count] of Object.entries(
    state.userStats.rankedCategories
  )) {
    if (count > maxCount) {
      maxCount = count;
      favoriteCategory = category;
    }
  }
  const favCategoriesElement = document.getElementById(
    'personal-fav-categories'
  );
  if (favCategoriesElement) favCategoriesElement.textContent = favoriteCategory;

  // Find favorite content type
  if (state.rankingHistory.length > 0 && state.allItems.length > 0) {
    // Build a map of content types and their rankings
    const typeRankings = new Map<string, number>();

    for (const ranking of state.rankingHistory) {
      const item = state.allItems.find(i => i.id === ranking.itemId);
      if (item && item.type) {
        const current = typeRankings.get(item.type) || 0;
        typeRankings.set(item.type, current + 1);
      }
    }

    let favoriteType = 'None';
    let maxTypeCount = 0;
    for (const [type, count] of typeRankings) {
      if (count > maxTypeCount) {
        maxTypeCount = count;
        favoriteType = type;
      }
    }

    const favTypeElement = document.getElementById('personal-fav-type');
    if (favTypeElement) favTypeElement.textContent = favoriteType;

    // Calculate engagement rate
    const engagementRateElement = document.getElementById(
      'personal-engagement-rate'
    );
    if (engagementRateElement) {
      const engagementRate =
        state.allItems.length > 0
          ? (
              (state.rankingHistory.length / state.allItems.length) *
              100
            ).toFixed(2) + '%'
          : '0%';
      engagementRateElement.textContent = engagementRate;
    }
  }

  // Calculate public stats
  const publicTotalItemsElement = document.getElementById('public-total-items');
  if (publicTotalItemsElement)
    publicTotalItemsElement.textContent = state.allItems.length.toString();

  // Calculate total ratings from rating history
  const publicTotalRatingsElement = document.getElementById(
    'public-total-ratings'
  );
  if (publicTotalRatingsElement)
    publicTotalRatingsElement.textContent =
      state.rankingHistory.length.toString();

  // Calculate average score
  if (state.allItems.length > 0) {
    const totalScore = state.allItems.reduce(
      (sum, item) => sum + (item.score || 0),
      0
    );
    const avgScore = totalScore / state.allItems.length;
    const publicAvgScoreElement = document.getElementById(
      'public-average-score'
    );
    if (publicAvgScoreElement)
      publicAvgScoreElement.textContent = avgScore.toFixed(2);
  }

  // Find most rated content type globally
  if (state.rankingHistory.length > 0 && state.allItems.length > 0) {
    const publicTypeRankings = new Map<string, number>();

    for (const ranking of state.rankingHistory) {
      const item = state.allItems.find(i => i.id === ranking.itemId);
      if (item && item.type) {
        const current = publicTypeRankings.get(item.type) || 0;
        publicTypeRankings.set(item.type, current + 1);
      }
    }

    let mostRatedType = 'None';
    let maxPublicTypeCount = 0;
    for (const [type, count] of publicTypeRankings) {
      if (count > maxPublicTypeCount) {
        maxPublicTypeCount = count;
        mostRatedType = type;
      }
    }

    const mostRatedTypeElement = document.getElementById(
      'public-most-rated-type'
    );
    if (mostRatedTypeElement) mostRatedTypeElement.textContent = mostRatedType;
  }

  // Calculate content diversity index
  if (state.allItems.length > 0) {
    // Count unique categories in the system
    const uniqueCategories = new Set(state.allItems.map(item => item.category))
      .size;
    const uniqueTypes = new Set(state.allItems.map(item => item.type)).size;

    // Simple diversity index: normalize to 0-10 scale
    const diversityIndex = Math.min(10, (uniqueCategories + uniqueTypes) / 2);
    const diversityIndexElement = document.getElementById(
      'public-diversity-index'
    );
    if (diversityIndexElement)
      diversityIndexElement.textContent = diversityIndex.toFixed(2);
  }
}
