/**
 * User Simulation Script for Topper.top
 * This script simulates 3 different types of users with different behaviors
 */

/* eslint-disable @typescript-eslint/no-var-requires */

// For Node.js < 18, we need to import node-fetch
// For Node.js >= 18, fetch is available globally
const { v4: uuidv4 } = require('uuid');

// Ensure fetch is available
let fetch;
if (typeof global.fetch === 'undefined') {
  // Node.js < 18, fetch is not available globally
  fetch = require('node-fetch');
} else {
  // Node.js >= 18, fetch is available globally
  fetch = global.fetch;
}

// Configuration
const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000';
const SIMULATION_DURATION = process.env.SIMULATION_DURATION || 30000; // 30 seconds in milliseconds
const REQUEST_INTERVAL = process.env.REQUEST_INTERVAL || 1000; // 1 second between requests

class UserSimulation {
  constructor(name, behaviorProfile) {
    this.id = uuidv4();
    this.name = name;
    this.behaviorProfile = behaviorProfile; // Defines how the user interacts
    this.sessionStartTime = Date.now();
    this.actionsCount = 0;
    this.ratings = [];
    this.currentItem = null;
  }

  // Get random item
  async getRandomItem() {
    try {
      const response = await fetch(`${API_BASE_URL}/api/random`);
      if (!response.ok) {
        console.error(`Error fetching random item: ${response.statusText}`);
        return null;
      }
      const data = await response.json();
      return data.item;
    } catch (error) {
      console.error(`Error fetching random item: ${error.message}`);
      return null;
    }
  }

  // Get items with optional language filter
  async getItems(lang = null) {
    try {
      let url = `${API_BASE_URL}/api/items?limit=10`;
      if (lang) {
        url += `&lang=${lang}`;
      }
      const response = await fetch(url);
      if (!response.ok) {
        console.error(`Error fetching items: ${response.statusText}`);
        return [];
      }
      const data = await response.json();
      return data.items || [];
    } catch (error) {
      console.error(`Error fetching items: ${error.message}`);
      return [];
    }
  }

  // Submit rating
  async submitRating(itemId, value) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/rankings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          value,
          // Optionally include userId if tracking by user is needed
        }),
      });
      if (!response.ok) {
        console.error(`Error submitting rating: ${response.statusText}`);
        return null;
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(`Error submitting rating: ${error.message}`);
      return null;
    }
  }

  // Perform user-specific action based on their profile
  async performAction() {
    this.actionsCount++;
    console.log(`${this.name} (ID: ${this.id}) - Action #${this.actionsCount}`);

    switch (this.behaviorProfile.type) {
      case 'explorer':
        // Explorer user: Skips most items, rarely rates, explores different categories
        if (Math.random() < 0.8) {
          // 80% chance to skip
          console.log(`  ${this.name} is skipping the current item`);
          // Get a new random item
          this.currentItem = await this.getRandomItem();
        } else if (Math.random() < 0.5) {
          // 50% of remaining 20% = 10% chance to rate up
          if (this.currentItem) {
            console.log(`  ${this.name} is upvoting the current item`);
            const result = await this.submitRating(this.currentItem.id, 1);
            if (result) {
              this.ratings.push({
                itemId: this.currentItem.id,
                value: 1,
                timestamp: Date.now(),
              });
            }
            this.currentItem = result.nextItem || (await this.getRandomItem());
          }
        } else {
          // 10% chance to rate down
          if (this.currentItem) {
            console.log(`  ${this.name} is downvoting the current item`);
            const result = await this.submitRating(this.currentItem.id, -1);
            if (result) {
              this.ratings.push({
                itemId: this.currentItem.id,
                value: -1,
                timestamp: Date.now(),
              });
            }
            this.currentItem = result.nextItem || (await this.getRandomItem());
          }
        }
        break;

      case 'critic':
        // Critic user: Rates most items, tends to downvote more
        if (Math.random() < 0.7) {
          // 70% chance to rate
          if (this.currentItem) {
            const ratingValue = Math.random() < 0.3 ? 1 : -1; // 30% upvote, 70% downvote
            if (ratingValue === 1) {
              console.log(
                `  ${this.name} is upvoting the current item (critic)`
              );
            } else {
              console.log(
                `  ${this.name} is downvoting the current item (critic)`
              );
            }
            const result = await this.submitRating(
              this.currentItem.id,
              ratingValue
            );
            if (result) {
              this.ratings.push({
                itemId: this.currentItem.id,
                value: ratingValue,
                timestamp: Date.now(),
              });
            }
            this.currentItem = result.nextItem || (await this.getRandomItem());
          }
        } else {
          console.log(`  ${this.name} is skipping the current item (critic)`);
          this.currentItem = await this.getRandomItem();
        }
        break;

      case 'enthusiast':
        // Enthusiast user: Rates most items, tends to upvote more
        if (Math.random() < 0.9) {
          // 90% chance to rate
          if (this.currentItem) {
            const ratingValue = Math.random() < 0.8 ? 1 : -1; // 80% upvote, 20% downvote
            if (ratingValue === 1) {
              console.log(
                `  ${this.name} is upvoting the current item (enthusiast)`
              );
            } else {
              console.log(
                `  ${this.name} is downvoting the current item (enthusiast)`
              );
            }
            const result = await this.submitRating(
              this.currentItem.id,
              ratingValue
            );
            if (result) {
              this.ratings.push({
                itemId: this.currentItem.id,
                value: ratingValue,
                timestamp: Date.now(),
              });
            }
            this.currentItem = result.nextItem || (await this.getRandomItem());
          }
        } else {
          console.log(
            `  ${this.name} is skipping the current item (enthusiast)`
          );
          this.currentItem = await this.getRandomItem();
        }
        break;
    }

    // Update current item if not already set
    if (!this.currentItem) {
      this.currentItem = await this.getRandomItem();
    }
  }

  // Get user statistics
  getStats() {
    const totalRatings = this.ratings.length;
    const positiveRatings = this.ratings.filter(r => r.value === 1).length;
    const negativeRatings = this.ratings.filter(r => r.value === -1).length;
    const positiveRatio = totalRatings > 0 ? positiveRatings / totalRatings : 0;

    return {
      userId: this.id,
      name: this.name,
      behaviorType: this.behaviorProfile.type,
      actionsCount: this.actionsCount,
      totalRatings,
      positiveRatings,
      negativeRatings,
      positiveRatio: Math.round(positiveRatio * 100) / 100,
      sessionDuration: Date.now() - this.sessionStartTime,
    };
  }
}

async function runSimulation() {
  console.log('Starting user simulation for Topper.top...');
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Simulation Duration: ${SIMULATION_DURATION}ms`);
  console.log(`Request Interval: ${REQUEST_INTERVAL}ms`);
  console.log('---');

  // Create 3 different types of users
  const users = [
    new UserSimulation('Alice', {
      type: 'explorer',
      description: 'Tends to skip items, rarely rates',
    }),
    new UserSimulation('Bob', {
      type: 'critic',
      description: 'Rates frequently, mostly downvotes',
    }),
    new UserSimulation('Charlie', {
      type: 'enthusiast',
      description: 'Rates frequently, mostly upvotes',
    }),
  ];

  // Initialize each user with a random item
  for (const user of users) {
    user.currentItem = await user.getRandomItem();
    console.log(
      `${user.name} (${user.behaviorProfile.description}) initialized with item.`
    );
  }

  let intervalId;

  // Function to perform periodic actions
  const performActions = async () => {
    for (const user of users) {
      await user.performAction();
    }
  };

  // Start periodic actions
  intervalId = setInterval(performActions, REQUEST_INTERVAL);

  // Stop simulation after duration
  setTimeout(async () => {
    clearInterval(intervalId);
    console.log('\n--- Simulation Completed ---');

    // Print final statistics for each user
    for (const user of users) {
      const stats = user.getStats();
      console.log(`\n${stats.name} (${stats.behaviorType}):`);
      console.log(`  Actions performed: ${stats.actionsCount}`);
      console.log(`  Total ratings: ${stats.totalRatings}`);
      console.log(`  Positive ratings: ${stats.positiveRatings}`);
      console.log(`  Negative ratings: ${stats.negativeRatings}`);
      console.log(`  Positive ratio: ${stats.positiveRatio}`);
      console.log(`  Session duration: ${stats.sessionDuration}ms`);
    }

    console.log('\nSimulation finished successfully!');
  }, SIMULATION_DURATION);
}

// Run the simulation if this file is executed directly
if (require.main === module) {
  // Check if API is available before starting
  checkApiHealth();
}

async function checkApiHealth() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/health`);
    if (response.ok) {
      console.log('API is accessible, starting simulation...');
      await runSimulation();
    } else {
      console.error(`API is not accessible at ${API_BASE_URL}/api/health`);
      process.exit(1);
    }
  } catch (error) {
    console.error(
      `Could not connect to API at ${API_BASE_URL}:`,
      error.message
    );
    process.exit(1);
  }
}

module.exports = UserSimulation;
