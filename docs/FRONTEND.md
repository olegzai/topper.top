# TOPPER.top Frontend Documentation

This document details the structure, functionality, and key components of the TOPPER.top frontend application.

## 1. Main Application (`public/index.html`)

The primary user interface is a Single-Page Application (SPA) served from `public/index.html`. This file encapsulates all the HTML structure, CSS styling, and JavaScript logic for the client-side application.

### Structure

The `index.html` file includes:

- **HTML Layout:** Defines the main layout, content display areas, navigation, and various interactive accordion sections.
- **CSS Styling:** Links to external stylesheets for visual presentation:
  - `public/css/reset.css`: A CSS reset to ensure consistent styling across browsers.
  - `public/css/styles.css`: The main stylesheet for the application's visual design.
- **JavaScript Logic:** All client-side functionality is embedded within `<script>` tags. This includes:
  - **API Interaction:** Functions for fetching data from backend API endpoints (`/api/items`, `/api/ratings`, `/api/leaderboard`).
  - **User Interaction Handling:** Logic for upvoting, downvoting, skipping items, applying filters, and selecting languages.
  - **UI Updates:** Dynamic rendering and updating of the user interface based on API responses and user actions.
  - **State Management:** Client-side variables manage the application's state, such as `allItems` (list of content items), `currentIndex` (currently displayed item), `currentLanguage`, `userStats`, `ratingHistory`, and `viewHistory`.
  - **Multi-language Support:** A `translations` object handles text localization, allowing the UI to switch between English, Romanian, Ukrainian, and Russian.
  - **Developer Tools:** Features like cache reset and debug logging for development purposes.

### Key Functionality

- **Content Display:** Fetches and displays content items, including title, description, score, and tags.
- **Rating System:** Allows users to upvote or downvote items, with immediate score updates.
- **Navigation:** Provides mechanisms to move between items (next/previous) and access different sections via accordions.
- **Filtering & Sorting:** Users can filter items by language and sort them (e.g., by "top" or "new").
- **History Tracking:** Records viewed items and rating history.
- **Leaderboard:** Displays top-rated items.
- **Settings:** Allows users to configure application preferences.

## 2. `public/` Directory

This directory contains all static assets directly served by the backend server.

- `public/index.html`: The main frontend application.
- `public/docs.html`: A minimal HTML page for API documentation.
- `public/css/`: Contains `reset.css` and `styles.css`.
- `public/js/`: Intended for separate JavaScript files if the embedded logic in `index.html` becomes too large.
- `public/assets/`: For images, icons, and other media files.

## 3. `interfaces/` Directory

This directory houses various HTML files representing different frontend interfaces, potentially for testing, development, or alternative views.

- `interfaces/current/development_interface.html`: Likely a current development version of an interface.
- `interfaces/legacy/`: Contains older or stripped-down versions of interfaces, such as `enhanced_interface_no_css.html`, `single_content_interface_no_css.html`, `single_content_interface.html`, and `test_interface.html`. These might be useful for debugging or historical reference but are generally not part of the main user flow.

## 4. Styling

The application's visual presentation is controlled by:

- `public/css/reset.css`: Standard CSS reset rules.
- `public/css/styles.css`: Custom styles defining the application's theme, layout, and component appearance.

## 5. Multi-language Support

The frontend includes a `translations` object in its JavaScript logic, enabling the application to display text in multiple languages (English, Romanian, Ukrainian, Russian) based on user selection.
