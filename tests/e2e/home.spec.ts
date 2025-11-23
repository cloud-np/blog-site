import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should load the home page successfully', async ({ page }) => {
    await page.goto('/');

    // Check that the page has loaded (status 200 implied by no error)
    await expect(page).toHaveURL('/');
  });

  test('should have a valid page title', async ({ page }) => {
    await page.goto('/');

    // Check that the page has a title
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test('should contain navigation links', async ({ page }) => {
    await page.goto('/');

    // Check for navigation - look for common nav patterns
    const nav = page.locator('nav').first();
    await expect(nav).toBeVisible();
  });

  test('should have a main content area', async ({ page }) => {
    await page.goto('/');

    // Check for main content
    const main = page.locator('main').first();
    await expect(main).toBeVisible();
  });

  test('should be responsive - viewport changes', async ({ page }) => {
    await page.goto('/');

    // Test mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.locator('body')).toBeVisible();

    // Test tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 });
    await expect(page.locator('body')).toBeVisible();

    // Test desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 });
    await expect(page.locator('body')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate to blog page', async ({ page }) => {
    await page.goto('/');

    // Find and click blog link (look for common patterns)
    const blogLink = page.locator('a[href*="blog"]').first();

    if (await blogLink.isVisible()) {
      await blogLink.click();
      await expect(page).toHaveURL(/.*blog.*/);
    }
  });
});

test.describe('Accessibility', () => {
  test('should have no major accessibility issues on home page', async ({ page }) => {
    await page.goto('/');

    // Check for presence of landmark elements
    const hasMain = await page.locator('main').count() > 0;
    const hasNav = await page.locator('nav').count() > 0;

    expect(hasMain).toBe(true);
    expect(hasNav).toBe(true);

    // Check that images have alt text
    const images = page.locator('img');
    const imageCount = await images.count();

    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i);
      const alt = await img.getAttribute('alt');
      // alt can be empty string for decorative images, but should exist
      expect(alt).not.toBeNull();
    }
  });

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/');

    // Check that there's at least one h1
    const h1Count = await page.locator('h1').count();
    expect(h1Count).toBeGreaterThanOrEqual(1);
  });
});
