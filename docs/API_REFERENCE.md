# TOPPER.top Backend API Reference

This document provides a detailed reference for the TOPPER.top backend API endpoints.

## Base URL

The base URL for all API endpoints is `http://localhost:3000` (or the configured port).

## 1. Basic Status/Info Endpoints

### `GET /api/health`

- **Description:** Checks the health of the API.
- **Method:** `GET`
- **Response:**
  - `200 OK`
  - **Body:**
    ```json
    {
      "status": "ok"
    }
    ```

### `GET /api/version`

- **Description:** Returns the current version of the API. The version is read from `version.txt` or falls back to `package.json`.
- **Method:** `GET`
- **Response:**
  - `200 OK`
  - **Body:**
    ```json
    {
      "version": "x.y.z"
    }
    ```
    (e.g., `"0.0.1"`)

### `GET /api/info`

- **Description:** Provides basic information about the API, including its name, version, and uptime.
- **Method:** `GET`
- **Response:**
  - `200 OK`
  - **Body:**
    ```json
    {
      "name": "TOPPER.top Backend",
      "version": "x.y.z",
      "uptimeSeconds": N
    }
    ```
    (e.g., `"name": "TOPPER.top Backend", "version": "0.0.1", "uptimeSeconds": 12345}`)

## 2. Item-related Endpoints

### `GET /api/items`

- **Description:** Retrieves a list of items. Supports filtering, pagination, and sorting.
- **Method:** `GET`
- **Query Parameters:**
  - `limit`: (Optional, `number`, default: `20`, max: `100`) The maximum number of items to return.
  - `offset`: (Optional, `number`, default: `0`) The number of items to skip from the beginning of the list.
  - `lang`: (Optional, `string`) Filters items by language (e.g., `en`, `ru`).
  - `sort`: (Optional, `string`, default: `"new"`) The sorting order for items.
    - `"top"`: Sorts by highest score.
    - Any other value (or omitted): Sorts by published date, newest first.
- **Response:**
  - `200 OK`
  - **Body:**
    ```json
    {
      "total": N,
      "items": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "score": "number",
          "lang": "string",
          "publishedAt": "ISO 8601 string",
          "tags": ["string"]
        },
        // ... more items
      ]
    }
    ```

### `GET /api/items/:id`

- **Description:** Retrieves a single item by its ID.
- **Method:** `GET`
- **Path Parameter:**
  - `id`: (`string`) The unique identifier of the item.
- **Response:**
  - `200 OK`
  - **Body:**
    ```json
    {
      "item": {
        "id": "string",
        "title": "string",
        "description": "string",
        "score": "number",
        "lang": "string",
        "publishedAt": "ISO 8601 string",
        "tags": ["string"]
      }
    }
    ```
  - `404 Not Found`
  - **Body:**
    ```json
    {
      "error": "not_found"
    }
    ```

### `GET /api/random`

- **Description:** Retrieves a single random item from the available items.
- **Method:** `GET`
- **Response:**
  - `200 OK`
  - **Body:**
    ```json
    {
      "item": {
        "id": "string",
        "title": "string",
        "description": "string",
        "score": "number",
        "lang": "string",
        "publishedAt": "ISO 8601 string",
        "tags": ["string"]
      }
    }
    ```
  - `404 Not Found`
  - **Body:**
    ```json
    {
      "error": "no_items"
    }
    ```
    (If no items are available)

## 3. Rating-related Endpoints

### `POST /api/ratings`

- **Description:** Submits a new rating for an item. This endpoint also recomputes the item's score and suggests a `nextItem` based on simple tag similarity (if a similar item exists, it's preferred for positive ratings; a dissimilar item for negative ratings).
- **Method:** `POST`
- **Request Body (JSON):**
  ```json
  {
    "itemId": "string",
    "value": 1 | -1, // 1 for upvote, -1 for downvote
    "userId": "string" // Optional: Identifier for the user submitting the rating
  }
  ```
- **Response:**
  - `200 OK`
  - **Body:**
    ```json
    {
      "rating": {
        "id": "string", // Unique ID for the new rating
        "userId": "string" | null,
        "itemId": "string",
        "value": 1 | -1,
        "createdAt": "ISO 8601 string"
      },
      "item": {
        "id": "string",
        "score": "number" // The updated score of the rated item
      },
      "nextItem": {
        "id": "string",
        "title": "string",
        "description": "string",
        "score": "number",
        "lang": "string",
        "publishedAt": "ISO 8601 string",
        "tags": ["string"]
      } | null // The suggested next item, or null if none found
    }
    ```
  - `400 Bad Request`
  - **Body:**
    ```json
    {
      "error": "invalid_json"
    }
    ```
    (If the request body is not valid JSON)
  - `400 Bad Request`
  - **Body:**
    ```json
    {
      "error": "invalid_payload"
    }
    ```
    (If `itemId` or `value` are missing or invalid in the request body)
  - `404 Not Found`
  - **Body:**
    ```json
    {
      "error": "item_not_found"
    }
    ```
    (If the `itemId` in the request body does not correspond to an existing item)
  - `500 Internal Server Error`
  - **Body:**
    ```json
    {
      "error": "persist_failed"
    }
    ```
    (If there was an error saving the updated data to disk)

## 4. Leaderboard Endpoint

### `GET /api/leaderboard`

- **Description:** Retrieves a list of items sorted by their score in descending order, effectively providing a leaderboard.
- **Method:** `GET`
- **Query Parameters:**
  - `limit`: (Optional, `number`, default: `10`, max: `100`) The maximum number of top items to return.
  - `lang`: (Optional, `string`) Filters items by language.
- **Response:**
  - `200 OK`
  - **Body:**
    ```json
    {
      "items": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "score": "number",
          "lang": "string",
          "publishedAt": "ISO 8601 string",
          "tags": ["string"]
        }
        // ... more top items
      ]
    }
    ```

## 5. Static File Serving

- **Description:** The server can serve static files from the `public/` directory. This is primarily used for frontend assets and documentation pages.
- **Method:** `GET`
- **Paths Handled:**
  - `GET /`: Serves `public/index.html`.
  - `GET /docs` or `GET /docs/`: Serves `public/docs.html`.
  - `GET /<filename>.<extension>`: Serves files directly from `public/` (e.g., `/styles.css`, `/script.js`).
  - `GET /<path>/<filename>.<extension>`: Serves files from subdirectories within `public/` (e.g., `/assets/images/logo.png`).
- **Security:** Includes basic path traversal prevention to ensure only files within the `public/` directory are served.
- **Response:** The content of the requested static file with the appropriate `Content-Type` header.
  - `404 Not Found` if the file does not exist.

## Error Responses

In case of an error, the API will generally return a JSON object with an `error` field and an appropriate HTTP status code.

- `400 Bad Request`: Indicates an issue with the client's request (e.g., invalid JSON, missing parameters).
- `404 Not Found`: The requested resource or endpoint does not exist.
- `500 Internal Server Error`: An unexpected error occurred on the server.
