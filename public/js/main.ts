/// <reference lib="dom" />
// main.js - Main application entry point

// Extend Window interface to include our application functions
declare global {
  interface Window {
    previousContent: () => void;
    downvoteAndNext: () => void;
    upvoteAndNext: () => void;
    skipContent: () => void;
    quickRate: (rating: number) => void;
    applyFilters: () => Promise<void>;
    clearFilters: () => Promise<void>;
    showTopRated: (category?: string) => Promise<void>;
    toggleAutoLoad: () => void;
    updateSettings: () => void;
    toggleAutoSwitch: () => void;
    resetCache: () => void;
    resetAllData: () => void;
    clearLocalStorage: () => void;
    reloadPage: () => void;
    changeLanguage: () => void;
  }
}

// Import all modules
import { state, initializeState } from './modules/state.js';
import {
  updateLanguageSelector,
  updateInterfaceLanguage,
} from './modules/i18n.js';

import { showCurrentContent } from './modules/content.js';
import {
  previousContent,
  downvoteAndNext,
  upvoteAndNext,
  skipContent,
  quickRate,
} from './modules/navigation.js';
import apiService from './services/api.service.js';
import { applyFilters, clearFilters } from './modules/filters.js';

import { updateStatistics } from './modules/stats.js';
import {
  showTopRated,
  toggleAutoLoad,
  updateSettings,
  resetCache,
  resetAllData,
  clearLocalStorage,
  reloadPage,
} from './modules/ui.js';
import { logDebug } from './modules/utils.js';

// Initialize the application
window.onload = async function () {
  try {
    // Initialize state
    initializeState();

    // Update language selector to show only the 4 required languages
    updateLanguageSelector();

    // Update interface language based on current language
    updateInterfaceLanguage(state.currentLanguage);

    // Load initial content
    state.allItems = await apiService.loadContent(state.currentLanguage);
    state.currentIndex = 0;
    showCurrentContent();

    // Update statistics
    updateStatistics();

    console.log('Application initialized');
    logDebug('Application initialized');
  } catch (error) {
    console.error('Error initializing application:', error);
    logDebug('Error initializing application: ' + error.message);
  }
};

// Export functions to be used in HTML onclick attributes
// These functions will be made globally available so they can be used in HTML onclick attributes

// Navigation functions
window.previousContent = previousContent;
window.downvoteAndNext = downvoteAndNext;
window.upvoteAndNext = upvoteAndNext;
window.skipContent = skipContent;

// Quick rate function
window.quickRate = quickRate;

// Filter functions
window.applyFilters = async function () {
  await applyFilters(state.currentLanguage);
};

window.clearFilters = clearFilters;

// Top rated display functions
window.showTopRated = async function (category = '') {
  await showTopRated(state.currentLanguage, category);
};

// Settings functions
window.toggleAutoLoad = toggleAutoLoad;
window.updateSettings = updateSettings;
window.toggleAutoSwitch = toggleAutoSwitch;

// Reset functions
window.resetCache = resetCache;
window.resetAllData = resetAllData;
window.clearLocalStorage = clearLocalStorage;
window.reloadPage = reloadPage;

// Language change function
window.changeLanguage = function () {
  const languageSelector = document.getElementById(
    'language-selector'
  ) as HTMLSelectElement;
  if (languageSelector) {
    // Ensure the value is one of the allowed languages
    const validLanguages = ['en', 'ro', 'ru', 'uk'];
    if (validLanguages.includes(languageSelector.value)) {
      state.currentLanguage = languageSelector.value as
        | 'en'
        | 'ro'
        | 'ru'
        | 'uk';
    }
    console.log(`Language changed to: ${state.currentLanguage}`);
    updateInterfaceLanguage(state.currentLanguage);

    // Reload content in the new language
    apiService
      .loadContent(state.currentLanguage)
      .then(items => {
        state.allItems = items;
        state.currentIndex = 0;
        showCurrentContent();
      })
      .catch(error => {
        console.error('Error loading content in new language:', error);
        logDebug('Error loading content in new language: ' + error.message);
      });
  }
};
