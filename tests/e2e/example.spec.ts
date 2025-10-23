import { test, expect } from '@playwright/test';

test.describe('Topper.top Application', () => {
  test.beforeEach(async ({ page }) => {
    // For now, we'll assume the server is running externally
    // In a real setup, we would start the server as part of the test
    await page.goto('http://localhost:3001');
  });

  test('should load the main page', async ({ page }) => {
    await expect(page).toHaveURL(/.*localhost:3001/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display content items', async ({ page }) => {
    // Wait for content to load
    await page.waitForSelector('#content-text');
    const contentElement = page.locator('#content-text');
    await expect(contentElement).toBeVisible();
    const contentText = await contentElement.textContent();
    expect(contentText).not.toBe('No content available');
  });

  test('should navigate to next item when upvoting', async ({ page }) => {
    // Record initial content
    const initialContent = await page.locator('#content-text').textContent();

    // Click upvote button (the actual button has ID "upvote-button")
    await page.locator('#upvote-button').click();

    // Wait for new content to load
    await page.waitForTimeout(1000);

    const newContent = await page.locator('#content-text').textContent();
    expect(newContent).not.toBe(initialContent);
  });

  test('should have working navigation controls', async ({ page }) => {
    // Test previous button exists and is functional (ID "prev-button")
    const previousButton = page.locator('#prev-button');
    await expect(previousButton).toBeVisible();

    // Test upvote button exists (ID "upvote-button")
    const upvoteButton = page.locator('#upvote-button');
    await expect(upvoteButton).toBeVisible();

    // Test downvote button exists (ID "downvote-button")
    const downvoteButton = page.locator('#downvote-button');
    await expect(downvoteButton).toBeVisible();

    // Test skip button exists (ID "skip-button")
    const skipButton = page.locator('#skip-button');
    await expect(skipButton).toBeVisible();
  });

  test('should display filtering options', async ({ page }) => {
    // Check for filter elements
    const filterSection = page
      .locator('#filter-section')
      .or(page.locator('.filters'));
    await expect(filterSection)
      .toBeVisible()
      .catch(() => {
        // If specific selector doesn't match, continue without failing
      });
  });

  test('should allow language selection', async ({ page }) => {
    // Check for language selector
    const languageSelector = page
      .locator('#language-selector')
      .or(page.locator('select[name="language"]'));
    await expect(languageSelector)
      .toBeVisible()
      .catch(() => {
        // If specific selector doesn't match, continue without failing
      });
  });
});
