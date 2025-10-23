/// <reference lib="dom" />
// modules/content.js
// Content management module

import { state } from './state.js';
import type { Item } from '../types.js';
import { updateInformationSection } from './ui.js';
import { updateViewHistoryDisplay } from './history.js';
import { logDebug } from './utils.js';

/**
 * Narrow type used in this module to avoid `any` casts.
 * It contains the common fields we access in the UI layer.
 */
export interface ContentLike {
  id?: string;
  content_id?: string;
  content_canonical_text_en?: string;
  content_text_en?: string;
  content_text_ro?: string;
  content_text_ua?: string;
  content_text_ru?: string;
  content_source_name_en?: string;
  content_source_name_ro?: string;
  content_source_name_ua?: string;
  content_source_name_ru?: string;
  content_source_link?: string;
  content_country?: string;
  content_created_by?: string | null;
  content_created?: string;
  content_published?: string;
  content_edited?: string;
  content_type?: string;
  content_category?: string;
  content_subcategory?: string;
  content_tags?: string[];
  content_votes?: number;
  content_score?: number;
  source?: string;
  sourceName?: string;
  contentText?: string; // Using content_text instead of title/description
  url?: string;
  score?: number;
  publishedAt?: string;
  tags?: string[];
  title?: string; // Added for backwards compatibility with legacy content
  name?: string; // Added for backwards compatibility with legacy content
}

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

  // Normalize current content reference to a known `Item` type from shared types
  state.currentContent = state.allItems[state.currentIndex] as Item;

  // Add to view history
  addToViewHistory(state.currentContent as ContentLike);

  // Use a local `current` variable to safely access possibly-missing properties
  const current = state.currentContent as ContentLike;

  // Show the content text based on selected language and available fields
  const contentText =
    current?.contentText ??
    current?.content_text_en ??
    current?.content_text_ro ??
    current?.content_text_ua ??
    current?.content_text_ru ??
    current?.content_canonical_text_en ??
    'No content available';

  const truncatedContent =
    typeof contentText === 'string' && contentText.length > 140
      ? contentText.substring(0, 140) + '...'
      : contentText;

  const contentTextElement = document.getElementById('content-text');
  if (contentTextElement) {
    contentTextElement.textContent = String(truncatedContent);
  }

  // Show source name as the title and make it clickable
  const sourceTitleElement = document.getElementById(
    'source-title'
  ) as HTMLAnchorElement;
  if (sourceTitleElement) {
    // Use language-specific source name or fallback to legacy fields
    const lang = state.currentLanguage || 'en';
    let sourceName = 'Unknown Source';

    switch (lang) {
      case 'ro':
        sourceName =
          current?.content_source_name_ro ??
          current?.source ??
          'Unknown Source';
        break;
      case 'uk':
        // internal language code uses 'uk' — support Ukrainian source name field
        sourceName =
          current?.content_source_name_ua ??
          current?.source ??
          'Unknown Source';
        break;
      case 'ru':
        sourceName =
          current?.content_source_name_ru ??
          current?.source ??
          'Unknown Source';
        break;
      default: // en or others
        sourceName =
          current?.content_source_name_en ??
          current?.source ??
          'Unknown Source';
    }

    sourceTitleElement.textContent = sourceName;
    // Set the href to the content URL if available, otherwise use a placeholder
    if (current?.content_source_link || current?.url) {
      sourceTitleElement.href =
        current?.content_source_link ?? current?.url ?? '#';
    } else {
      sourceTitleElement.href = '#';
    }
    sourceTitleElement.style.display = 'block';
  }

  // Update information section with the normalized current object
  updateInformationSection(current);

  const titleForLog =
    current?.contentText ??
    current?.content_text_en ??
    current?.title ??
    current?.name ??
    'Untitled Content';
  const truncatedTitle =
    typeof titleForLog === 'string' && titleForLog.length > 50
      ? titleForLog.substring(0, 50) + '...'
      : titleForLog;

  logDebug(
    `Displaying content: ${truncatedTitle} from ${
      current?.content_source_name_en ??
      current?.sourceName ??
      current?.source ??
      'Unknown Source'
    } (ID: ${current?.content_id ?? current?.id ?? 'N/A'})`
  );
}

// Add to view history
export function addToViewHistory(content: ContentLike) {
  const timestamp = new Date().toISOString();
  const contentTitle =
    content.contentText ||
    content.content_text_en ||
    content.content_canonical_text_en ||
    content.title ||
    content.name ||
    'Untitled';
  state.viewHistory.push({
    itemId: content.content_id ?? content.id ?? 'unknown',
    title: contentTitle,
    timestamp: timestamp,
  });

  // Update view history display
  updateViewHistoryDisplay();
}
