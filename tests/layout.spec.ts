import { test, expect } from '@playwright/test';

test.describe('Layout and Responsive Design', () => {
  test('desktop navigation should be visible', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation');
    await expect(nav).toBeVisible();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
  });

  test('mobile menu should work correctly', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE size
    await page.goto('/');
    
    // Menu should be collapsed initially
    const menuButton = page.getByRole('button', { name: 'Menu' });
    await expect(menuButton).toBeVisible();
    
    // Open menu
    await menuButton.click();
    await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('link', { name: 'Register' })).toBeVisible();
    
    // Close menu
    await menuButton.click();
    await expect(page.getByRole('link', { name: 'Login' })).not.toBeVisible();
  });

  test('prayer request cards should be responsive', async ({ page }) => {
    // TODO: Mock authentication and prayer request data
    await page.goto('/prayer-requests');
    
    // Desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    const desktopCards = await page.getByRole('article').all();
    expect(desktopCards.length).toBeGreaterThan(0);
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileCards = await page.getByRole('article').all();
    expect(mobileCards.length).toBe(desktopCards.length);
  });

  test('form layouts should be responsive', async ({ page }) => {
    await page.goto('/login');
    
    // Desktop view
    await page.setViewportSize({ width: 1280, height: 720 });
    const desktopForm = page.getByRole('form');
    await expect(desktopForm).toBeVisible();
    const desktopWidth = await desktopForm.evaluate((el) => el.clientWidth);
    
    // Mobile view
    await page.setViewportSize({ width: 375, height: 667 });
    const mobileForm = page.getByRole('form');
    await expect(mobileForm).toBeVisible();
    const mobileWidth = await mobileForm.evaluate((el) => el.clientWidth);
    
    expect(desktopWidth).toBeGreaterThan(mobileWidth);
  });

  test('footer should stick to bottom', async ({ page }) => {
    await page.goto('/');
    const footer = page.getByRole('contentinfo');
    await expect(footer).toBeVisible();
    
    // Check if footer is at the bottom of the viewport
    const isAtBottom = await footer.evaluate((el) => {
      const rect = el.getBoundingClientRect();
      return Math.abs(window.innerHeight - rect.bottom) <= 1;
    });
    
    expect(isAtBottom).toBe(true);
  });
}); 