/// <reference lib="dom" />
// modules/content.js
// Content management module

import { state } from './state.js';
import { updateInformationSection } from './ui.js';
import { updateViewHistoryDisplay } from './history.js';
import { logDebug } from './utils.js';

// Show the current content item
export function showCurrentContent() {
  if (state.allItems.length === 0) {
    const contentTextElement = document.getElementById('content-text');
    if (contentTextElement) {
      contentTextElement.textContent = 'No content available';
    }
    return;
  }

  if (state.currentIndex < 0) state.currentIndex = 0;
  if (state.currentIndex >= state.allItems.length)
    state.currentIndex = state.allItems.length - 1;

  state.currentContent = state.allItems[state.currentIndex];

  // Add to view history
  addToViewHistory(state.currentContent);

  // Show only the title (up to 140 characters) as per brand format
  const titleText =
    state.currentContent.title || state.currentContent.name || 'Untitled';
  const truncatedTitle =
    titleText.length > 140 ? titleText.substring(0, 140) + '...' : titleText;

  const contentTextElement = document.getElementById('content-text');
  if (contentTextElement) {
    contentTextElement.textContent = truncatedTitle;
  }

  // Show source name as the title and make it clickable
  const sourceTitleElement = document.getElementById(
    'source-title'
  ) as HTMLAnchorElement;
  if (sourceTitleElement) {
    sourceTitleElement.textContent =
      state.currentContent.source || 'Unknown Source';
    // Set the href to the content URL if available, otherwise use a placeholder
    if (state.currentContent.url) {
      sourceTitleElement.href = state.currentContent.url;
    } else {
      sourceTitleElement.href = '#';
    }
    sourceTitleElement.style.display = 'block';
  }

  // Update information section
  updateInformationSection(state.currentContent);

  logDebug(
    `Displaying content: ${truncatedTitle} from ${
      state.currentContent.source || 'Unknown Source'
    } (ID: ${state.currentContent.id})`
  );
}

// Add to view history
export function addToViewHistory(content: {
  id: string;
  title?: string;
  name?: string;
}) {
  const timestamp = new Date().toISOString();
  state.viewHistory.push({
    itemId: content.id,
    title: content.title || content.name || 'Untitled',
    timestamp: timestamp,
  });

  // Update view history display
  updateViewHistoryDisplay();
}
