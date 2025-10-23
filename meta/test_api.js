/**
 * API Tests for Topper.top
 * These tests verify that all API endpoints are working correctly
 */

/* eslint-env browser, node */

async function testAPIEndpoint(url, testName) {
  console.log(`Testing ${testName}: ${url}`);
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log(`✓ ${testName} - Status: ${response.status}, Response:`, data);
    return { success: true, data, status: response.status };
  } catch (error) {
    console.log(`✗ ${testName} - Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function testPostEndpoint(url, testData, testName) {
  console.log(`Testing ${testName}: ${url} with data:`, testData);
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    const data = await response.json();
    console.log(`✓ ${testName} - Status: ${response.status}, Response:`, data);
    return { success: true, data, status: response.status };
  } catch (error) {
    console.log(`✗ ${testName} - Error:`, error.message);
    return { success: false, error: error.message };
  }
}

async function runAllTests() {
  console.log('Starting API tests...\n');

  // Test GET endpoints
  await testAPIEndpoint('http://localhost:3000/api/health', 'Health Check');
  await testAPIEndpoint('http://localhost:3000/api/version', 'Version');
  await testAPIEndpoint('http://localhost:3000/api/info', 'Info');
  await testAPIEndpoint('http://localhost:3000/api/items', 'Items List');
  await testAPIEndpoint('http://localhost:3000/api/leaderboard', 'Leaderboard');
  await testAPIEndpoint('http://localhost:3000/api/random', 'Random Item');

  // Get a random item to use for rating test
  let randomItemResult;
  try {
    const response = await fetch('http://localhost:3000/api/random');
    if (response.ok) {
      randomItemResult = await response.json();
    }
  } catch (e) {
    console.log('Could not get random item for rating test:', e.message);
  }

  if (randomItemResult && randomItemResult.item) {
    // Test POST endpoint for ratings
    await testPostEndpoint(
      'http://localhost:3000/api/ratings',
      {
        itemId: randomItemResult.item.id,
        value: 1,
      },
      'Upvote Item'
    );

    // Test downvote
    await testPostEndpoint(
      'http://localhost:3000/api/ratings',
      {
        itemId: randomItemResult.item.id,
        value: -1,
      },
      'Downvote Item'
    );
  } else {
    console.log('Skipping rating tests - no items available for testing');
  }

  console.log('\nAPI tests completed!');
}

// Run tests if this file is executed in browser or with Node.js with fetch polyfill
if (typeof window !== 'undefined' || typeof require !== 'undefined') {
  // Check if running in browser context
  if (typeof window !== 'undefined') {
    console.log('Run these tests in browser console on your docs.html page');
    if (typeof window !== 'undefined') {
      window.runAPITests = runAllTests;
    }
  }
}

// Export for Node.js usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testAPIEndpoint, testPostEndpoint, runAllTests };
}
