import { test, expect } from '@playwright/test';

// Test critical user flows
const flows = [
  {
    name: 'Authentication Flow',
    tests: [
      { path: '/login', title: 'Login' },
      { path: '/register', title: 'Create an account' },
    ],
  },
  {
    name: 'Prayer Request Flow',
    tests: [
      { path: '/prayer-requests', title: 'Prayer Requests' },
      { path: '/profile', title: 'Profile' },
    ],
  },
];

// Test each flow in different browsers
test.describe('Cross-browser compatibility tests', () => {
  for (const flow of flows) {
    test.describe(flow.name, () => {
      for (const { path, title } of flow.tests) {
        test(`should render ${path} correctly`, async ({ page }) => {
          // Navigate to the page
          await page.goto(`http://localhost:5173${path}`);
          
          // Check if the page title is correct
          const pageTitle = await page.textContent('h1');
          expect(pageTitle).toContain(title);

          // Check for critical UI elements
          await expect(page.locator('button')).toBeVisible();
          await expect(page.locator('nav')).toBeVisible();

          // Test responsive layout
          // Desktop
          await page.setViewportSize({ width: 1920, height: 1080 });
          await expect(page.locator('nav')).toBeVisible();

          // Tablet
          await page.setViewportSize({ width: 768, height: 1024 });
          await expect(page.locator('nav')).toBeVisible();

          // Mobile
          await page.setViewportSize({ width: 375, height: 667 });
          await expect(page.locator('nav')).toBeVisible();

          // Take a screenshot for visual comparison
          await page.screenshot({
            path: `./test-results/screenshots/${path.replace('/', '-')}-${page.context().browser().browserType().name()}.png`,
          });
        });
      }
    });
  }

  // Test interactive features
  test('should handle form interactions correctly', async ({ page }) => {
    await page.goto('http://localhost:5173/login');

    // Test form validation
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button[type="submit"]');

    // Empty form submission
    await submitButton.click();
    await expect(page.locator('text=required')).toBeVisible();

    // Invalid email
    await emailInput.fill('invalid-email');
    await submitButton.click();
    await expect(page.locator('text=valid email')).toBeVisible();

    // Valid input
    await emailInput.fill('test@example.com');
    await passwordInput.fill('password123');
    await submitButton.click();
  });

  // Test accessibility
  test('should meet accessibility standards', async ({ page }) => {
    const paths = ['/login', '/register', '/prayer-requests', '/profile'];

    for (const path of paths) {
      await page.goto(`http://localhost:5173${path}`);
      
      // Check for ARIA labels
      const buttons = await page.locator('button');
      for (const button of await buttons.all()) {
        const ariaLabel = await button.getAttribute('aria-label');
        const text = await button.textContent();
        expect(ariaLabel || text).toBeTruthy();
      }

      // Check for proper heading hierarchy
      const headings = await page.locator('h1, h2, h3, h4, h5, h6').all();
      let lastLevel = 0;
      for (const heading of headings) {
        const level = parseInt(await heading.evaluate(el => el.tagName.toLowerCase().replace('h', '')));
        expect(level).toBeGreaterThanOrEqual(lastLevel - 1);
        lastLevel = level;
      }

      // Check for image alt text
      const images = await page.locator('img').all();
      for (const image of images) {
        const alt = await image.getAttribute('alt');
        expect(alt).toBeTruthy();
      }
    }
  });
}); 