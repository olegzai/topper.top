/// <reference lib="dom" />
// modules/filters.js
// Filter functionality module

import { state } from './state.js';
import apiService from '../services/api.service.js';
import { showCurrentContent } from './content.js';
import { logDebug } from './utils.js';

// Apply filters
export async function applyFilters(currentLanguage) {
  const selectedTypes = Array.from(
    document.querySelectorAll('input[name="type-filter"]:checked')
  ).map(cb => (cb as HTMLInputElement).value);
  const selectedCategories = Array.from(
    document.querySelectorAll('input[name="category-filter"]:checked')
  ).map(cb => (cb as HTMLInputElement).value);
  const selectedCountries = Array.from(
    document.querySelectorAll('input[name="country-filter"]:checked')
  ).map(cb => (cb as HTMLInputElement).value);

  logDebug(
    `Applying filters: Types = [${selectedTypes.join(
      ', '
    )}], Categories = [${selectedCategories.join(
      ', '
    )}], Countries = [${selectedCountries.join(', ')}]`
  );

  try {
    // Reload content with filters
    let url = 'http://localhost:3000/api/items?limit=50';
    if (currentLanguage) {
      url += `&lang=${currentLanguage}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    if (data.items && data.items.length > 0) {
      // Apply client-side filtering
      let filteredItems = data.items;

      if (selectedTypes.length > 0) {
        filteredItems = filteredItems.filter(
          item => item.type && selectedTypes.includes(item.type.toLowerCase())
        );
      }

      if (selectedCategories.length > 0) {
        filteredItems = filteredItems.filter(
          item =>
            item.category &&
            selectedCategories.includes(item.category.toLowerCase())
        );
      }

      if (selectedCountries.length > 0) {
        filteredItems = filteredItems.filter(item => {
          // For country filter, check if item has country property or if 'global' is selected
          const hasCountry = item.country;
          const isGlobal = selectedCountries.includes('global');

          if (isGlobal && selectedCountries.length === 1) {
            // If only 'global' is selected, show all items (no country property filter)
            return true;
          } else if (isGlobal && selectedCountries.length > 1) {
            // If 'global' and other countries are selected, include items with no country or matching countries
            return (
              !hasCountry ||
              selectedCountries.includes(item.country.toLowerCase())
            );
          } else {
            // If only specific countries are selected, show only those items
            return (
              hasCountry &&
              selectedCountries.includes(item.country.toLowerCase())
            );
          }
        });
      }

      state.allItems = filteredItems;
      state.currentIndex = 0;
      showCurrentContent();
      logDebug(`Filters applied: ${filteredItems.length} items match`);
    } else {
      const contentTextElement = document.getElementById('content-text');
      if (contentTextElement) {
        contentTextElement.textContent = 'No items match the filters';
      }
    }
  } catch (error) {
    logDebug('Error applying filters: ' + error.message);
  }
}

// Clear filters
export async function clearFilters() {
  const typeCheckboxes = document.querySelectorAll('input[name="type-filter"]');
  const categoryCheckboxes = document.querySelectorAll(
    'input[name="category-filter"]'
  );
  const countryCheckboxes = document.querySelectorAll(
    'input[name="country-filter"]'
  );

  typeCheckboxes.forEach(cb => ((cb as HTMLInputElement).checked = false));
  categoryCheckboxes.forEach(cb => ((cb as HTMLInputElement).checked = false));
  countryCheckboxes.forEach(cb => ((cb as HTMLInputElement).checked = false));

  // Reload all content
  state.allItems = await apiService.loadContent(state.currentLanguage);
  state.currentIndex = 0;
  showCurrentContent();
  logDebug('Filters cleared');
}
