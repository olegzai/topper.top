# TOPPER.top Utility Scripts Documentation

This document describes the utility scripts available in the `scripts/` directory of the TOPPER.top project. These scripts are designed to automate common development and data management tasks.

## 1. `scripts/seed.ts`

- **Purpose:** This script is responsible for generating and populating the `data/` directory with sample JSON data. It creates `users.json`, `ratings.json`, `items.json`, and `settings.json` with predefined or randomly generated content.
- **Usage:**
  ```bash
  npm run seed
  ```
- **Description:** When executed, `seed.ts` will:
  1.  Clear any existing data files in `data/`.
  2.  Generate a set of sample users, items, and ratings.
  3.  Populate the `data/` directory with these generated JSON files.
  4.  Update `data/settings.json` with metadata about the seeded data (e.g., `seededAt` timestamp, counts of entities).
- **When to Use:**
  - To initialize your local development environment with fresh data.
  - To reset your data during testing.
  - To quickly get a working dataset without manual entry.

## 2. `scripts/import_awesome.ts`

- **Status:** This script has been removed from the project.
