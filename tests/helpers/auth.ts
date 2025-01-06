import { Page } from '@playwright/test';

export async function loginAsTestUser(page: Page) {
  // Use test credentials
  const testEmail = 'test@example.com';
  const testPassword = 'testPassword123!';

  await page.goto('/login');
  await page.getByLabel('Email').fill(testEmail);
  await page.getByLabel('Password').fill(testPassword);
  await page.getByRole('button', { name: 'Sign In' }).click();
  
  // Wait for navigation to complete
  await page.waitForURL('/prayer-requests');
}

export async function registerTestUser(page: Page) {
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'testPassword123!';

  await page.goto('/register');
  await page.getByLabel('Email').fill(testEmail);
  await page.getByLabel('Password').fill(testPassword);
  await page.getByLabel('Confirm Password').fill(testPassword);
  await page.getByRole('button', { name: 'Sign Up' }).click();
  
  // Wait for navigation to complete
  await page.waitForURL('/prayer-requests');
  
  return { email: testEmail, password: testPassword };
}

export async function logout(page: Page) {
  await page.getByRole('button', { name: 'Logout' }).click();
  await page.waitForURL('/');
} 