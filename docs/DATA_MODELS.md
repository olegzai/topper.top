# TOPPER.top Backend Data Models

This document describes the structure of the JSON data files used by the TOPPER.top backend. These files serve as a simple, file-backed database for development and demonstration purposes.

## 1. `data/users.json`

This file contains an array of user objects. Each object represents a user in the system.

```json
[
  {
    "id": "string",
    "username": "string",
    "displayName": "string",
    "role": "string",
    "locale": "string",
    "createdAt": "ISO 8601 date-time string"
  }
]
```

### User Object Properties:

- `id`: (`string`, UUID) - A unique identifier for the user.
- `username`: (`string`) - A unique username for login and identification.
- `displayName`: (`string`) - The name displayed for the user.
- `role`: (`string`) - The role of the user (e.g., `"admin"`, `"user"`).
- `locale`: (`string`) - The preferred locale of the user (e.g., `"en"`, `"ru"`, `"uk"`, `"ro"`).
- `createdAt`: (`string`, ISO 8601 date-time) - The timestamp when the user account was created.

## 2. `data/ratings.json`

This file contains an array of rating objects. Each object represents a user's rating (upvote or downvote) for an item.

```json
[
  {
    "id": "string",
    "userId": "string" | null,
    "itemId": "string",
    "value": 1 | -1,
    "createdAt": "ISO 8601 date-time string"
  }
]
```

### Rating Object Properties:

- `id`: (`string`, UUID) - A unique identifier for the rating.
- `userId`: (`string`, UUID | `null`) - The unique identifier of the user who submitted the rating. Can be `null` if the rating is anonymous.
- `itemId`: (`string`, UUID) - The unique identifier of the item that was rated.
- `value`: (`number`) - The value of the rating: `1` for an upvote, `-1` for a downvote.
- `createdAt`: (`string`, ISO 8601 date-time) - The timestamp when the rating was submitted.

## 3. `data/items.json`

This file contains an array of item objects. Each object represents a content item that can be rated.

```json
[
  {
    "id": "string",
    "title": "string",
    "source": "string",
    "url": "string",
    "authorId": "string" | null,
    "tags": ["string"],
    "categories": ["string"],
    "lang": "string",
    "publishedAt": "ISO 8601 date-time string",
    "createdAt": "ISO 8601 date-time string",
    "score": "number"
  }
]
```

### Item Object Properties:

- `id`: (`string`, UUID) - A unique identifier for the content item.
- `title`: (`string`) - The title of the content item.
- `source`: (`string`) - The source or publisher of the content (e.g., `"Global Times"`, `"Example News"`).
- `url`: (`string`) - The URL where the original content can be found.
- `authorId`: (`string`, UUID | `null`) - The unique identifier of the author of the item. Can be `null`.
- `tags`: (`array` of `string`) - A list of keywords or tags associated with the item.
- `categories`: (`array` of `string`, UUID) - A list of category IDs to which the item belongs.
- `lang`: (`string`) - The language of the content (e.g., `"en"`, `"ru"`, `"uk"`, `"ro"`).
- `publishedAt`: (`string`, ISO 8601 date-time) - The timestamp when the content item was originally published.
- `createdAt`: (`string`, ISO 8601 date-time) - The timestamp when the content item was added to the system.
- `score`: (`number`) - The aggregated score of the item, calculated from all its ratings.

## 4. `data/settings.json`

This file contains a single settings object that stores metadata about the seeded data and application configuration.

```json
{
  "version": "string",
  "seededAt": "ISO 8601 date-time string",
  "counts": {
    "users": "number",
    "items": "number",
    "ratings": "number",
    "categories": "number"
  }
}
```

### Settings Object Properties:

- `version`: (`string`) - The version of the seeded data or application configuration.
- `seededAt`: (`string`, ISO 8601 date-time) - The timestamp when the data was last seeded into the system.
- `counts`: (`object`) - An object containing counts of various entities in the seeded data.
  - `users`: (`number`) - The total number of user entries.
  - `items`: (`number`) - The total number of content item entries.
  - `ratings`: (`number`) - The total number of rating entries.
  - `categories`: (`number`) - The total number of category entries.
