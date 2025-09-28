import { test, expect } from '@playwright/test';

test.describe('Apply Anywhere E2E Tests', () => {
  test('should show panel and fill fields on Greenhouse mock page', async ({ page }) => {
    await page.goto('/greenhouse.html');
    
    // Wait for the panel to appear
    await expect(page.locator('#apply-anywhere-panel')).toBeVisible({ timeout: 10000 });
    
    // Check that the panel contains expected fields
    await expect(page.locator('#apply-anywhere-panel')).toContainText('First Name');
    await expect(page.locator('#apply-anywhere-panel')).toContainText('Last Name');
    await expect(page.locator('#apply-anywhere-panel')).toContainText('Email');
    
    // Click confirm button
    await page.click('#confirm-btn');
    
    // Check that fields are filled
    await expect(page.locator('input[name="first_name"]')).toHaveValue('John');
    await expect(page.locator('input[name="last_name"]')).toHaveValue('Doe');
    await expect(page.locator('input[name="email"]')).toHaveValue('john.doe@example.com');
    await expect(page.locator('input[name="phone"]')).toHaveValue('+1 (555) 123-4567');
  });

  test('should show panel and fill fields on LinkedIn mock page', async ({ page }) => {
    await page.goto('/linkedin.html');
    
    // Wait for the panel to appear
    await expect(page.locator('#apply-anywhere-panel')).toBeVisible({ timeout: 10000 });
    
    // Click confirm button
    await page.click('#confirm-btn');
    
    // Check that fields are filled
    await expect(page.locator('input[name="firstName"]')).toHaveValue('John');
    await expect(page.locator('input[name="lastName"]')).toHaveValue('Doe');
    await expect(page.locator('input[name="email"]')).toHaveValue('john.doe@example.com');
  });

  test('should show panel and fill fields on Workday mock page', async ({ page }) => {
    await page.goto('/workday.html');
    
    // Wait for the panel to appear (Workday has longer delay)
    await expect(page.locator('#apply-anywhere-panel')).toBeVisible({ timeout: 15000 });
    
    // Click confirm button
    await page.click('#confirm-btn');
    
    // Check that fields are filled
    await expect(page.locator('input[data-automation-id="firstName"]')).toHaveValue('John');
    await expect(page.locator('input[data-automation-id="lastName"]')).toHaveValue('Doe');
    await expect(page.locator('input[data-automation-id="email"]')).toHaveValue('john.doe@example.com');
  });

  test('should allow editing values in panel before confirming', async ({ page }) => {
    await page.goto('/greenhouse.html');
    
    // Wait for the panel to appear
    await expect(page.locator('#apply-anywhere-panel')).toBeVisible({ timeout: 10000 });
    
    // Edit a field in the panel
    const firstNameInput = page.locator('#proposal-0');
    await firstNameInput.fill('Jane');
    
    // Click confirm button
    await page.click('#confirm-btn');
    
    // Check that the edited value was used
    await expect(page.locator('input[name="first_name"]')).toHaveValue('Jane');
  });

  test('should cancel when cancel button is clicked', async ({ page }) => {
    await page.goto('/greenhouse.html');
    
    // Wait for the panel to appear
    await expect(page.locator('#apply-anywhere-panel')).toBeVisible({ timeout: 10000 });
    
    // Click cancel button
    await page.click('#cancel-btn');
    
    // Check that panel is removed
    await expect(page.locator('#apply-anywhere-panel')).not.toBeVisible();
    
    // Check that fields are not filled
    await expect(page.locator('input[name="first_name"]')).toHaveValue('');
  });
});
