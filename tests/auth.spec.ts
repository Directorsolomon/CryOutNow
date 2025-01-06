import { test, expect } from '@playwright/test';

test.describe('Authentication flows', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should navigate to login page', async ({ page }) => {
    await page.getByRole('link', { name: 'Login' }).click();
    await expect(page).toHaveURL('/login');
    await expect(page.getByRole('heading', { name: 'Login' })).toBeVisible();
  });

  test('should show validation errors on login form', async ({ page }) => {
    await page.goto('/login');
    await page.getByRole('button', { name: 'Sign In' }).click();
    
    const emailError = page.getByText('Email is required');
    const passwordError = page.getByText('Password is required');
    
    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
  });

  test('should navigate to register page', async ({ page }) => {
    await page.getByRole('link', { name: 'Register' }).click();
    await expect(page).toHaveURL('/register');
    await expect(page.getByRole('heading', { name: 'Register' })).toBeVisible();
  });

  test('should show validation errors on register form', async ({ page }) => {
    await page.goto('/register');
    await page.getByRole('button', { name: 'Sign Up' }).click();
    
    const emailError = page.getByText('Email is required');
    const passwordError = page.getByText('Password is required');
    
    await expect(emailError).toBeVisible();
    await expect(passwordError).toBeVisible();
  });
}); 