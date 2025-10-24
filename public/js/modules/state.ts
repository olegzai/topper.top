// modules/state.ts
// Global state management module

import { ViewState } from '../types.js';

// Global state
export const state: ViewState = {
  allItems: [],
  currentIndex: -1,
  currentContent: null,
  currentLanguage: 'en',
  debugMessages: [],
  rankingHistory: [],
  viewHistory: [],
  userStats: {
    totalRatings: 0,
    positiveRatings: 0,
    negativeRatings: 0,
    rankedCategories: {},
  },
};

// Initialize the state
export function initializeState() {
  state.allItems = [];
  state.currentIndex = -1;
  state.currentContent = null;
  state.currentLanguage = 'en';
  state.debugMessages = [];
  state.rankingHistory = [];
  state.viewHistory = [];
  state.userStats = {
    totalRatings: 0,
    positiveRatings: 0,
    negativeRatings: 0,
    rankedCategories: {},
  };
}
