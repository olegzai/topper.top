# Topper.top Testing Guide - Version 0.0.1

> **Development Version**: We are currently developing version 0.0.1  
> **Version Control**: Only Oleg Zai specifies which version we're developing  
> **Release Authority**: Only Oleg Zai determines when a version is complete and can be released

This guide explains how to test all the functionality of the Topper.top application.

## Prerequisites

Make sure you have:

1. Node.js (LTS, version >= 18)
2. Git
3. A modern web browser (Chrome/Firefox/Edge)

## Setup

1. Install dependencies:

```bash
npm install
```

2. Seed the database with sample data:

```bash
npm run seed
```

3. Start the development server:

```bash
npm run dev
```

4. Open your browser and navigate to:
   - Main interface: http://localhost:3000/docs
   - API endpoints (for direct testing):
     - Health: http://localhost:3000/api/health
     - Version: http://localhost:3000/api/version
     - Info: http://localhost:3000/api/info

## Manual Testing with Chrome DevTools

### How to Access DevTools:

1. Open Chrome and navigate to http://localhost:3000/docs
2. Press `F12` or `Cmd+Option+I` (Mac) or `Ctrl+Shift+I` (Windows/Linux) to open DevTools
3. Select the "Console" tab to see any JavaScript errors or logs

### Testing Steps:

#### 1. Test API Call Buttons:

- Click the "Call" buttons next to each endpoint:
  - `/api/health`: Should return `{"status":"ok"}`
  - `/api/version`: Should return the version information
  - `/api/info`: Should return app name, version and uptime
- Verify that the results appear in the boxes below each button

#### 2. Test Copy Buttons:

- Click the "Copy" buttons to verify they copy the cURL command to clipboard
- You can verify by pasting into a text editor

#### 3. Test Content Browser Interface:

- Open `test_interface.html` in your browser
- Click the buttons:
  - "Load All Items": Should load all items from the database
  - "Load 10 Items": Should load 10 items from the database
  - "Top Rated": Should load the highest-rated items
  - "Random Item": Should load a random item
- Test the rating buttons for each item:
  - "👍 Upvote" should increase the item's score
  - "👎 Downvote" should decrease the item's score
  - "🔗 Share" should copy the item's link to clipboard

#### 4. Network Tab Testing:

1. Go to the "Network" tab in DevTools
2. Click any API call button
3. You should see the request appear in the list
4. Check that the request method is GET, the URL is correct, and the status is 200

#### 5. Console Tab Testing:

1. Go to the "Console" tab in DevTools
2. Perform actions on the page
3. Look for any error messages (red text) which indicate problems
4. Successful operations should show appropriate logs

### Testing API Endpoints Directly:

You can also test the endpoints using your browser address bar:

- http://localhost:3000/api/health
- http://localhost:3000/api/version
- http://localhost:3000/api/info
- http://localhost:3000/api/items
- http://localhost:3000/api/leaderboard
- http://localhost:3000/api/random

## Automated Testing

Run the existing unit tests:

```bash
npm test
```

## JavaScript Testing in Browser Console

To run the API tests from the test_api.js file:

1. Open `http://localhost:3000/docs` in your browser
2. Open DevTools and go to the Console tab
3. Paste the contents of `test_api.js` into the console
4. Run the command: `runAPITests()`
5. This will run all the API tests and show the results

## Expected Behavior

- API buttons should show results in their designated boxes
- No JavaScript errors should appear in the console
- Network requests should have 200 status
- Content should load properly in the content browser
- Rating functionality should update scores appropriately

## Troubleshooting

If you encounter issues:

1. Check that the development server is running (`npm run dev`)
2. Check the browser console for JavaScript errors
3. Check the Network tab for failed requests
4. Verify that you're running on port 3000 (or the port you set via `PORT` environment variable)
