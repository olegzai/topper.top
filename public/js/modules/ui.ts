/// <reference lib="dom" />
// modules/ui.js
// UI update module

import { state } from './state.js';
import apiService from '../services/api.service.js';
import { logDebug } from './utils.js';

// Update top rated items display for all categories
export async function showTopRated(currentLanguage, category = '') {
  try {
    // Load all top rated content at once
    const allTopItems = await apiService.getTopRated(currentLanguage, category);

    // Populate Top News
    const newsItems = allTopItems.filter(
      item => item.content_type === 'news' || item.type === 'news'
    );
    const newsContainer = document.getElementById('top-news-display');
    if (newsContainer) {
      newsContainer.innerHTML = '<h6>Top News:</h6>';
      if (newsItems.length > 0) {
        newsItems.forEach((item, index) => {
          const div = document.createElement('div');
          div.textContent = `${index + 1}. ${
            item.contentText ||
            item.content_text_en ||
            item.title ||
            item.name ||
            'Untitled'
          } (Score: ${item.content_score || item.score || 0})`;
          newsContainer.appendChild(div);
        });
      } else {
        newsContainer.innerHTML += '<p>No top news items available.</p>';
      }
    }

    // Populate Top Facts
    const factsItems = allTopItems.filter(
      item => item.content_type === 'facts' || item.type === 'facts'
    );
    const factsContainer = document.getElementById('top-facts-display');
    if (factsContainer) {
      factsContainer.innerHTML = '<h6>Top Facts:</h6>';
      if (factsItems.length > 0) {
        factsItems.forEach((item, index) => {
          const div = document.createElement('div');
          div.textContent = `${index + 1}. ${
            item.contentText ||
            item.content_text_en ||
            item.title ||
            item.name ||
            'Untitled'
          } (Score: ${item.content_score || item.score || 0})`;
          factsContainer.appendChild(div);
        });
      } else {
        factsContainer.innerHTML += '<p>No top facts available.</p>';
      }
    }

    // Populate Top Articles (using other content types as articles)
    const articlesItems = allTopItems.filter(
      item =>
        item.content_type !== 'news' &&
        item.content_type !== 'facts' &&
        item.type !== 'news' &&
        item.type !== 'facts'
    );
    const articlesContainer = document.getElementById('top-articles-display');
    if (articlesContainer) {
      articlesContainer.innerHTML = '<h6>Top Articles:</h6>';
      if (articlesItems.length > 0) {
        articlesItems.forEach((item, index) => {
          const div = document.createElement('div');
          div.textContent = `${index + 1}. ${
            item.contentText ||
            item.content_text_en ||
            item.title ||
            item.name ||
            'Untitled'
          } (Score: ${item.content_score || item.score || 0})`;
          articlesContainer.appendChild(div);
        });
      } else {
        articlesContainer.innerHTML += '<p>No top articles available.</p>';
      }
    }
  } catch (error) {
    logDebug('Error loading top ratings: ' + error.message);
    const newsContainer = document.getElementById('top-news-display');
    if (newsContainer)
      newsContainer.innerHTML = '<p>Error loading top news.</p>';

    const factsContainer = document.getElementById('top-facts-display');
    if (factsContainer)
      factsContainer.innerHTML = '<p>Error loading top facts.</p>';

    const articlesContainer = document.getElementById('top-articles-display');
    if (articlesContainer)
      articlesContainer.innerHTML = '<p>Error loading top articles.</p>';
  }
}

// Auto-switch timer variable
let autoSwitchIntervalId: number | null = null;

// Update settings functionality
export function toggleAutoLoad() {
  const autoLoadElement = document.getElementById(
    'auto-load'
  ) as HTMLInputElement;
  if (autoLoadElement) {
    const autoLoad = autoLoadElement.checked;
    logDebug(`Auto-load setting changed to: ${autoLoad}`);
  }
}

export function updateSettings() {
  const itemsPerLoadElement = document.getElementById(
    'items-per-load'
  ) as HTMLInputElement;
  if (itemsPerLoadElement) {
    const itemsPerLoad = itemsPerLoadElement.value;
    logDebug(`Items per load setting changed to: ${itemsPerLoad}`);
  }

  // Update auto-switch interval if the element exists
  const autoSwitchIntervalElement = document.getElementById(
    'auto-switch-interval'
  ) as HTMLInputElement;
  if (autoSwitchIntervalElement) {
    const interval = parseInt(autoSwitchIntervalElement.value);
    logDebug(`Auto-switch interval changed to: ${interval} seconds`);
    // If auto-switch is active, update the interval
    if (autoSwitchIntervalId !== null) {
      clearInterval(autoSwitchIntervalId);
      startAutoSwitchTimer(interval * 1000);
    }
  }
}

// Toggle auto-switch functionality
export function toggleAutoSwitch() {
  const switchButton = document.querySelector(
    'button[onclick="toggleAutoSwitch()"]'
  ) as HTMLButtonElement;
  if (switchButton) {
    if (autoSwitchIntervalId === null) {
      // Start auto-switch
      const autoSwitchIntervalElement = document.getElementById(
        'auto-switch-interval'
      ) as HTMLInputElement;
      let interval = 60; // default to 60 seconds
      if (autoSwitchIntervalElement) {
        interval = parseInt(autoSwitchIntervalElement.value) || 60;
      }
      startAutoSwitchTimer(interval * 1000);
      switchButton.textContent = 'Disable Auto-Switch';
      logDebug(`Auto-switch enabled with ${interval} second interval`);
    } else {
      // Stop auto-switch
      clearInterval(autoSwitchIntervalId);
      autoSwitchIntervalId = null;
      switchButton.textContent = 'Enable Auto-Switch';
      logDebug('Auto-switch disabled');
    }
  }
}

// Start auto-switch timer
function startAutoSwitchTimer(interval: number) {
  // Use window.setInterval and type it properly
  autoSwitchIntervalId = window.setInterval(() => {
    // Import navigation function to switch to next content
    import('./navigation.js')
      .then(navModule => {
        if (navModule.skipContent) {
          navModule.skipContent(); // Using skipContent to move to next item
        }
      })
      .catch(err => {
        logDebug('Error importing navigation module: ' + err.message);
      });
  }, interval) as number;
}

// Reset functions for developer
export function resetCache() {
  logDebug('Cache reset requested');
  if (typeof caches !== 'undefined') {
    caches.keys().then(function (names) {
      for (const name of names) {
        caches.delete(name);
      }
    });
  }
  if (typeof alert !== 'undefined') {
    alert('Cache reset completed');
  }
}

export function resetAllData() {
  logDebug('All data reset requested');
  // Reset all data arrays
  state.allItems.length = 0; // Clear array without reassigning
  state.ratingHistory.length = 0; // Clear array without reassigning
  state.viewHistory.length = 0; // Clear array without reassigning
  state.userStats.totalRatings = 0;
  state.userStats.positiveRatings = 0;
  state.userStats.negativeRatings = 0;
  state.userStats.ratedCategories = {};

  // Update displays
  // These need to be imported from their respective modules
  // updateRatingHistoryDisplay();
  // updateViewHistoryDisplay();
  // updateStatistics();

  // Reload content
  // This would need to be implemented

  if (typeof alert !== 'undefined') {
    alert('All data reset completed');
  }
}

export function clearLocalStorage() {
  logDebug('Local storage clear requested');
  if (typeof localStorage !== 'undefined') {
    localStorage.clear();
  }
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.clear();
  }
  if (typeof alert !== 'undefined') {
    alert('Local storage cleared');
  }
}

export function reloadPage() {
  logDebug('Page reload requested');
  if (typeof location !== 'undefined') {
    location.reload();
  }
}

// Update information section with full content details
export function updateInformationSection(content) {
  if (!content) return;

  const infoIdElement = document.getElementById('info-id');
  if (infoIdElement)
    infoIdElement.textContent = content.content_id || content.id || 'N/A';

  const infoTitleElement = document.getElementById('info-title');
  if (infoTitleElement)
    infoTitleElement.textContent =
      content.contentText ||
      content.content_text_en ||
      content.content_canonical_text_en ||
      'Untitled';

  // Since we removed title/description in favor of content_text, don't display empty description
  const infoDescriptionElement = document.getElementById('info-description');
  if (infoDescriptionElement) infoDescriptionElement.textContent = '';

  const infoUrlElement = document.getElementById('info-url');
  if (infoUrlElement)
    infoUrlElement.textContent =
      content.content_source_link || content.url || 'No URL';

  const infoScoreElement = document.getElementById('info-score');
  if (infoScoreElement)
    infoScoreElement.textContent =
      content.content_score !== undefined
        ? content.content_score
        : content.score !== undefined
        ? content.score
        : 'N/A';

  const infoLangElement = document.getElementById('info-lang');
  if (infoLangElement) infoLangElement.textContent = content.lang || 'N/A';

  const infoPublishedElement = document.getElementById('info-published');
  if (infoPublishedElement)
    infoPublishedElement.textContent =
      content.content_published || content.publishedAt || 'N/A';

  const infoCreatedElement = document.getElementById('info-created');
  if (infoCreatedElement)
    infoCreatedElement.textContent =
      content.content_created || content.createdAt || 'N/A';

  const infoTagsElement = document.getElementById('info-tags');
  if (infoTagsElement)
    infoTagsElement.textContent = Array.isArray(content.content_tags)
      ? content.content_tags.join(', ')
      : Array.isArray(content.tags)
      ? content.tags.join(', ')
      : 'No tags';

  const infoTypeElement = document.getElementById('info-type');
  if (infoTypeElement)
    infoTypeElement.textContent = content.content_type || content.type || 'N/A';

  const infoCategoryElement = document.getElementById('info-category');
  if (infoCategoryElement)
    infoCategoryElement.textContent =
      content.content_category || content.category || 'N/A';
}
