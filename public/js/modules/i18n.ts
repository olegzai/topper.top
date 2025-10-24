/// <reference lib="dom" />
// modules/i18n.ts
// Internationalization module - Main interface

import { translations } from './translations.js';
import { updateLabel, updateLabelWithInput } from './i18n-helpers.js';

// Update language selector to show only required languages
export function updateLanguageSelector() {
  const selector = document.getElementById('language-selector');
  if (!selector) return;

  selector.innerHTML = '';
  selector.innerHTML += '<option value="en">English</option>';
  selector.innerHTML += '<option value="ro">Romanian</option>';
  selector.innerHTML += '<option value="uk">Ukrainian</option>';
  selector.innerHTML += '<option value="ru">Russian</option>';
}

// Update the interface language based on selected language
export function updateInterfaceLanguage(currentLanguage: string) {
  const t = translations[currentLanguage as keyof typeof translations];
  if (!t) return;

  // Update language selector label
  const languageLabel =
    document.querySelector('label[for="language-selector"]') ||
    document.querySelector('div:first-child label');
  if (languageLabel) {
    // Find the text node directly within the label and update it
    for (let i = 0; i < languageLabel.childNodes.length; i++) {
      const node = languageLabel.childNodes[i];
      if (node && node.nodeType === Node.TEXT_NODE) {
        node.textContent = t.language + ': '; // Add a space after colon
        break;
      }
    }
  }

  // Update navigation buttons
  const prevButton = document.querySelector(
    'button[onclick="previousContent()"]'
  );
  if (prevButton) prevButton.textContent = t.navigation.prev;

  const downvoteButton = document.querySelector(
    'button[onclick="downvoteAndNext()"]'
  );
  if (downvoteButton) downvoteButton.textContent = t.navigation.downvote;

  const upvoteButton = document.querySelector(
    'button[onclick="upvoteAndNext()"]'
  );
  if (upvoteButton) upvoteButton.textContent = t.navigation.upvote;

  const skipButton = document.querySelector('button[onclick="skipContent()"]');
  if (skipButton) skipButton.textContent = t.navigation.skip;

  // Update accordion summaries
  const infoAccordion = document.querySelector(
    '#information-accordion summary'
  );
  if (infoAccordion) infoAccordion.textContent = t.accordions.information;

  const filtersAccordion = document.querySelector('#filters-accordion summary');
  if (filtersAccordion) filtersAccordion.textContent = t.accordions.filters;

  const historyAccordion = document.querySelector('#history-accordion summary');
  if (historyAccordion) historyAccordion.textContent = t.accordions.history;

  const ratingsAccordion = document.querySelector('#ratings-accordion summary');
  if (ratingsAccordion) ratingsAccordion.textContent = t.accordions.rankings;

  const statsAccordion = document.querySelector(
    '#statistics-accordion summary'
  );
  if (statsAccordion) statsAccordion.textContent = t.accordions.statistics;

  const settingsAccordion = document.querySelector(
    '#settings-accordion summary'
  );
  if (settingsAccordion) settingsAccordion.textContent = t.accordions.settings;

  const aboutAccordion = document.querySelector('#about-accordion summary');
  if (aboutAccordion) aboutAccordion.textContent = t.accordions.about;

  const contactAccordion = document.querySelector('#contact-accordion summary');
  if (contactAccordion) contactAccordion.textContent = t.accordions.contact;

  const resetAccordion = document.querySelector('#developer-reset summary');
  if (resetAccordion) resetAccordion.textContent = t.accordions.reset;

  // Update information content labels
  const fullInfoLabel = document.querySelector(
    '#information-content p:nth-child(1) strong'
  );
  if (fullInfoLabel) fullInfoLabel.textContent = t.informationContent.fullInfo;

  const infoContentElement = document.querySelector('#information-content');
  if (infoContentElement) {
    updateLabel(
      infoContentElement.querySelector('p:nth-child(2) strong'),
      t.informationContent.id
    );
    updateLabel(
      infoContentElement.querySelector('p:nth-child(3) strong'),
      t.informationContent.title
    );
    updateLabel(
      infoContentElement.querySelector('p:nth-child(4) strong'),
      t.informationContent.description
    );
    updateLabel(
      infoContentElement.querySelector('p:nth-child(5) strong'),
      t.informationContent.url
    );
    updateLabel(
      infoContentElement.querySelector('p:nth-child(6) strong'),
      t.informationContent.score
    );
    updateLabel(
      infoContentElement.querySelector('p:nth-child(7) strong'),
      t.informationContent.language
    );
    updateLabel(
      infoContentElement.querySelector('p:nth-child(8) strong'),
      t.informationContent.published
    );
    updateLabel(
      infoContentElement.querySelector('p:nth-child(9) strong'),
      t.informationContent.created
    );
    updateLabel(
      infoContentElement.querySelector('p:nth-child(10) strong'),
      t.informationContent.tags
    );
    updateLabel(
      infoContentElement.querySelector('p:nth-child(11) strong'),
      t.informationContent.type
    );
    updateLabel(
      infoContentElement.querySelector('p:nth-child(12) strong'),
      t.informationContent.category
    );
  }

  // Update filters section
  const typesLabel = document.querySelector(
    'details:nth-child(2) div div label'
  );
  if (typesLabel) typesLabel.textContent = t.filters.contentTypes;

  updateLabelWithInput(
    'input[name="type-filter"][value="news"]',
    t.filters.news
  );
  updateLabelWithInput(
    'input[name="type-filter"][value="events"]',
    t.filters.events
  );
  updateLabelWithInput(
    'input[name="type-filter"][value="articles"]',
    t.filters.articles
  );
  updateLabelWithInput(
    'input[name="type-filter"][value="facts"]',
    t.filters.facts
  );
  updateLabelWithInput('input[name="type-filter"][value="ads"]', t.filters.ads);

  // Update category labels
  const categoryInputs = document.querySelectorAll(
    'input[name="category-filter"]'
  );
  categoryInputs.forEach(input => {
    const inputElement = input as HTMLInputElement;
    const label = inputElement.nextElementSibling;
    if (label && label.tagName === 'LABEL') {
      switch (inputElement.value) {
        case 'nature':
          updateLabel(label, t.filters.nature);
          break;
        case 'people':
          updateLabel(label, t.filters.people);
          break;
        case 'health':
          updateLabel(label, t.filters.health);
          break;
        case 'sports':
          updateLabel(label, t.filters.sports);
          break;
        case 'technology':
          updateLabel(label, t.filters.technology);
          break;
        case 'education':
          updateLabel(label, t.filters.education);
          break;
        case 'business':
          updateLabel(label, t.filters.business);
          break;
        case 'entertainment':
          updateLabel(label, t.filters.entertainment);
          break;
      }
    }
  });

  // Update country labels
  const countryInputs = document.querySelectorAll(
    'input[name="country-filter"]'
  );
  countryInputs.forEach(input => {
    const inputElement = input as HTMLInputElement;
    const label = inputElement.nextElementSibling;
    if (label && label.tagName === 'LABEL') {
      switch (inputElement.value) {
        case 'global':
          updateLabel(label, t.filters.global);
          break;
        case 'ro':
          updateLabel(label, t.filters.romania);
          break;
        case 'ru':
          updateLabel(label, t.filters.russia);
          break;
        case 'ua':
          updateLabel(label, t.filters.ukraine);
          break;
        case 'us':
          updateLabel(label, t.filters.usa);
          break;
        case 'uk':
          updateLabel(label, t.filters.uk);
          break;
        case 'de':
          updateLabel(label, t.filters.germany);
          break;
      }
    }
  });

  // Update filter buttons
  const filterButtons = document.querySelectorAll(
    'details:nth-child(3) div button'
  );
  if (filterButtons.length >= 2) {
    const button0 = filterButtons[0] as HTMLElement;
    const button1 = filterButtons[1] as HTMLElement;
    if (button0) button0.textContent = t.filters.applyFilters;
    if (button1) button1.textContent = t.filters.clearFilters;
  }

  // Update history section
  const historySection = document.querySelector('#history-content');
  if (historySection) {
    const h4Elements = historySection.querySelectorAll('h4');
    if (h4Elements.length >= 2) {
      const h4Element0 = h4Elements[0] as HTMLElement;
      const h4Element1 = h4Elements[1] as HTMLElement;
      if (h4Element0) h4Element0.textContent = t.history.rankingHistory;
      if (h4Element1) h4Element1.textContent = t.history.viewHistory;
    }
  }

  // Update rankings section
  // Removed the buttons All Time Top 10, Top 10 News, Top 10 Technology, Top 10 Health
  // as per requirements to clean up the rankings accordion

  // Update statistics section
  const statsSection = document.querySelector('#statistics-content');
  if (statsSection) {
    const h4Elements = statsSection.querySelectorAll('h4');
    if (h4Elements.length >= 2) {
      const h4Element0 = h4Elements[0] as HTMLElement;
      const h4Element1 = h4Elements[1] as HTMLElement;
      if (h4Element0) h4Element0.textContent = t.statistics.personalStats;
      if (h4Element1) h4Element1.textContent = t.statistics.publicStats;
    }

    const personalStatsElement = document.querySelector('#personal-stats');
    if (personalStatsElement) {
      updateLabel(
        personalStatsElement.querySelector('p:nth-child(1) strong'),
        t.statistics.totalRankings
      );
      updateLabel(
        personalStatsElement.querySelector('p:nth-child(2) strong'),
        t.statistics.positiveRankings
      );
      updateLabel(
        personalStatsElement.querySelector('p:nth-child(3) strong'),
        t.statistics.negativeRankings
      );
    }
    updateLabel(
      document.querySelector('#personal-stats p:nth-child(4) strong'),
      t.statistics.favoriteCategories
    );
    const publicStatsElement = document.querySelector('#public-stats');
    if (publicStatsElement) {
      updateLabel(
        publicStatsElement.querySelector('p:nth-child(1) strong'),
        t.statistics.totalItems
      );
      updateLabel(
        publicStatsElement.querySelector('p:nth-child(2) strong'),
        t.statistics.totalRankingsPublic
      );
      updateLabel(
        publicStatsElement.querySelector('p:nth-child(3) strong'),
        t.statistics.mostRankedCategory
      );
      updateLabel(
        publicStatsElement.querySelector('p:nth-child(4) strong'),
        t.statistics.averageScore
      );
    }
  }

  // Update settings section
  const autoLoadLabel = document.querySelector(
    '#auto-load + span, #auto-load + label'
  );
  if (autoLoadLabel) {
    autoLoadLabel.textContent = t.settings.autoLoad;
  }
  const itemsPerLoadLabel = document.querySelector(
    'label[for="items-per-load"], label:has(#items-per-load)'
  );
  if (itemsPerLoadLabel) {
    itemsPerLoadLabel.textContent = t.settings.itemsPerLoad;
  }

  // Update about section
  const aboutSection = document.querySelector('#about-accordion div');
  if (aboutSection) {
    const ps = aboutSection.querySelectorAll('p');
    if (ps.length >= 3) {
      const p0 = ps[0] as HTMLElement;
      const p1 = ps[1] as HTMLElement;
      const p2 = ps[2] as HTMLElement;
      if (p0) p0.textContent = t.about.title;
      if (p1) p1.textContent = t.about.version;
      if (p2) p2.textContent = t.about.description;
    }
  }

  // Update contact section
  const contactSection = document.querySelector('#contact-accordion div p');
  if (contactSection) {
    contactSection.textContent = t.contact.text;
  }

  // Update reset section
  const resetButtons = document.querySelectorAll('#developer-reset div button');
  if (resetButtons.length >= 4) {
    const button0 = resetButtons[0] as HTMLElement;
    const button1 = resetButtons[1] as HTMLElement;
    const button2 = resetButtons[2] as HTMLElement;
    const button3 = resetButtons[3] as HTMLElement;
    if (button0) button0.textContent = t.reset.resetCache;
    if (button1) button1.textContent = t.reset.resetAllData;
    if (button2) button2.textContent = t.reset.clearLocalStorage;
    if (button3) button3.textContent = t.reset.reloadPage;
  }

  // Update debug section
  const debugSummary = document.querySelector('#developer-debug summary');
  if (debugSummary) debugSummary.textContent = t.debug.title;
}
