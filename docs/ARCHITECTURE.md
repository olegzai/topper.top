# TOPPER.top Project Architecture and Structure

This document outlines the overall architecture and file structure of the TOPPER.top project, addressing how different components are organized and interact.

## 1. High-Level Architecture

TOPPER.top follows a client-server architecture:

- **Backend (Server):** A Node.js server built with TypeScript (`src/api/server.ts`) that handles API requests, data storage (using JSON files for development), and serves static frontend assets.
- **Frontend (Client):** A single-page application (SPA) primarily defined in `index.html` (located in the project root and served from `public/`). This SPA interacts with the backend API to fetch and display content, handle user ratings, and manage various UI components.

## 2. Project Directory Structure

Here's a breakdown of the key directories and their purposes:

```
/topper.top/
├───.git/                      # Git version control data
├───.github/                   # GitHub Actions CI/CD workflows
├───.husky/                    # Git hooks configuration
├───config/                    # Configuration files (if any)
├───data/                      # JSON files acting as a simple database for development
│   ├───categories.json
│   ├───items.json
│   ├───ratings.json
│   ├───settings.json
│   └───users.json
├───dist/                      # Compiled JavaScript output from TypeScript
├───docker/                    # Docker-related files for development environment
├───docs/                      # Project documentation (Markdown files)
│   ├───API_REFERENCE.md       # Detailed API endpoint documentation
│   ├───DATA_MODELS.md         # Structure of JSON data files
│   └───ARCHITECTURE.md        # This document
├───interfaces/                # Legacy or alternative HTML interfaces
│   ├───current/
│   │   └───development_interface.html
│   └───legacy/
│       ├───enhanced_interface_no_css.html
│       ├───single_content_interface_no_css.html
│       ├───single_content_interface.html
│       ├───test_interface_no_css.html
│       └───test_interface.html
├───logs/                      # Application logs
├───node_modules/              # Installed Node.js dependencies
├───public/                    # Static assets served by the backend
│   ├───development_interface.html
│   ├───docs.html              # API documentation page (minimal)
│   ├───index.html             # Main frontend application (served for /)
│   ├───reset.css
│   ├───styles.css
│   ├───test_interface.html
│   ├───assets/                # Images, icons, other media
│   │   ├───data/
│   │   ├───icons/
│   │   └───images/
│   ├───css/                   # CSS stylesheets
│   │   ├───reset.css
│   │   └───styles.css
│   ├───docs/                  # Documentation-related static files
│   │   └───development_interface.html
│   └───js/                    # JavaScript files (if separated from HTML)
├───scripts/                   # Utility scripts (e.g., data seeding)
│   └───seed.ts
├───src/                       # Backend TypeScript source code
│   ├───api/
│   │   └───server.ts          # Main backend server logic
│   ├───components/
│   └───utils/
├───tests/                     # Unit and integration tests
│   └───api.test.ts
├───tmp/                       # Temporary files
├───.gitignore                 # Files/directories ignored by Git
├───ABOUT.md                   # Project overview
├───AGENTS.md                  # Information about agents (if any)
├───index.html                 # Main frontend application (identical to public/index.html)
├───INDEX.md                   # Project index/overview
├───KANBAN.md                  # Kanban board for tasks
├───package-lock.json          # Node.js dependency lock file
├───package.json               # Project metadata and scripts
├───PLANS.md                   # Project plans
├───README.md                  # Main project README
├───setup_initial_files_bundle.md # Initial file setup script/template
├───test_api.js                # JavaScript for in-browser API testing
├───TESTING.md                 # Testing guide
├───tsconfig.json              # TypeScript configuration
├───Untitled.md                # Miscellaneous notes/content
└───version.txt                # Project version number
```

## 3. Frontend (`index.html` and `public/`)

The main user interface is provided by `index.html`. This file is present in both the project root and `public/index.html`. The backend server (`src/api/server.ts`) is configured to serve `public/index.html` when a request is made to the root path (`/`). If `index.html` is present in the root, it is effectively a duplicate of `public/index.html` and serves the same purpose.

This `index.html` is a self-contained Single-Page Application (SPA) that includes:

- **HTML Structure:** Defines the layout, content display areas, navigation buttons, and various accordion sections (Information, Filters, History, Ratings, Statistics, Settings, About, Contact Us, Developer Reset).
- **CSS Styling:** Links to `public/css/reset.css` and `public/css/styles.css` for visual presentation.
- **JavaScript Logic:** Embedded `<script>` tags contain all the client-side logic for:
  - Fetching data from backend API endpoints (`/api/items`, `/api/ratings`, `/api/leaderboard`).
  - Handling user interactions (upvoting, downvoting, skipping, filtering, language selection).
  - Dynamically updating the UI based on API responses and user actions.
  - Managing client-side state (e.g., `allItems`, `currentIndex`, `currentLanguage`, `userStats`, `ratingHistory`, `viewHistory`).
  - Providing multi-language support through a `translations` object.
  - Developer-specific tools like cache reset and debug logging.

**Recommendation for `index.html`:** To avoid confusion and maintain a single source of truth, it is recommended to keep the primary `index.html` within the `public/` directory and remove the duplicate from the project root. The backend is already configured to serve it correctly from `public/`.

### `public/` Directory

This directory is intended for all static assets that the web server directly serves to the client. This includes:

- `public/index.html`: The main frontend application.
- `public/docs.html`: A minimal HTML page for API documentation (as seen in `README.md`).
- `public/css/`: Contains CSS stylesheets (`reset.css`, `styles.css`).
- `public/js/`: Can be used for separate JavaScript files if the SPA logic grows too large for a single HTML file.
- `public/assets/`: For images, icons, and other media files.

## 4. Backend (`src/api/server.ts`)

The `src/api/server.ts` file contains the entire backend logic. It is a minimal Node.js HTTP server that:

- Defines and handles all API endpoints (e.g., `/api/health`, `/api/items`, `/api/ratings`).
- Reads and writes data from JSON files in the `data/` directory.
- Serves static files from the `public/` directory.
- Includes basic logging and error handling.

## 5. Data Storage (`data/`)

The `data/` directory holds JSON files (`users.json`, `items.json`, `ratings.json`, `settings.json`) that serve as a simple, file-based database. This setup is ideal for rapid development and local testing without requiring a full-fledged database system. The `scripts/seed.ts` script is used to populate these files with sample data.

## 6. Documentation (`docs/`)

The `docs/` directory is dedicated to project documentation. It currently contains:

- `API_REFERENCE.md`: Detailed information about all API endpoints.
- `DATA_MODELS.md`: Descriptions of the JSON data structures.
- `ARCHITECTURE.md`: This document, explaining the project's overall structure.

## 7. `interfaces/` Directory

This directory appears to contain various HTML files that represent different frontend interfaces, possibly for testing or alternative views. Some are prefixed with `legacy/` or suffixed with `_no_css.html`, suggesting they might be older versions or stripped-down interfaces. These files are not directly served by the main backend routing for `/` or `/docs` but could be accessed if explicitly requested or linked.

## 8. Communication Flow

The frontend (SPA in `public/index.html`) communicates with the backend (`src/api/server.ts`) primarily via RESTful API calls over HTTP.

- **Requests:** The frontend sends HTTP `GET`, `POST` requests to specific API endpoints (e.g., `/api/items`, `/api/ratings`).
- **Responses:** The backend processes these requests, interacts with the file-based data storage (`data/`), and returns JSON responses to the frontend. HTTP status codes are used to indicate the success or failure of an operation (e.g., `200 OK`, `400 Bad Request`, `404 Not Found`, `500 Internal Server Error`).

## 9. Error Handling and Logging

### Backend Error Handling

The backend (`src/api/server.ts`) includes basic error handling:

- **API Errors:** Specific error responses with appropriate HTTP status codes and JSON bodies (e.g., `{"error": "not_found"}`) are returned for known issues like invalid input or missing resources.
- **Internal Server Errors:** Unhandled exceptions or critical errors result in a `500 Internal Server Error` response, often with a generic error message to avoid exposing sensitive server details.

### Backend Logging

- The backend utilizes a simple logger wrapper (`src/logger.ts`) to output messages to the console or log files (`logs/`). This includes:
  - Informational messages about server startup and requests.
  - Warnings for unusual but non-critical events.
  - Error messages for failures and exceptions.

### Frontend Error Handling

- The frontend handles errors received from the backend API by displaying user-friendly messages or adjusting the UI state. For example, if an item is not found, it might display a "Not Found" message.
- Client-side JavaScript includes `try-catch` blocks for asynchronous operations to gracefully handle network issues or unexpected API responses.

### Frontend Logging

- The frontend uses `console.log` for debugging purposes during development. It also includes developer-specific tools (accessible via the DEBUG accordion) that can enable verbose logging or reset local storage.

## Conclusion

The project is structured to separate backend logic, frontend presentation, and data storage. The backend serves as an API provider and static file server, while the frontend consumes the API to deliver the user experience. Documentation is centralized in the `docs/` directory to provide clear guidance on various aspects of the project.
