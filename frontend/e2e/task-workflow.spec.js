import { expect, test } from '@playwright/test';

test('captures, completes, deletes, and restores tasks without browser errors', async ({ page }) => {
  const browserErrors = [];
  page.on('pageerror', (error) => browserErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') browserErrors.push(message.text());
  });

  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'QuickTask' })).toBeVisible();
  await expect(page.getByText('No tasks yet. Add your first task!')).toBeVisible();

  const input = page.getByRole('textbox', { name: 'Enter a task' });
  await input.fill('Plan the week');
  await input.press('Enter');
  await expect(page.getByText('Plan the week')).toBeVisible();
  await expect(input).toHaveValue('');

  await input.fill('Send the note');
  await page.getByRole('button', { name: 'Add Task' }).click();
  await expect(page.getByText('Send the note')).toBeVisible();
  await expect(page.getByText('2', { exact: true })).toHaveCount(1);

  const firstTask = page.getByRole('listitem').filter({ hasText: 'Plan the week' });
  await firstTask.getByRole('checkbox', { name: 'Mark Plan the week complete' }).check();
  await expect(firstTask.getByText('Plan the week')).toHaveCSS('text-decoration-line', 'line-through');
  await expect(page.getByText('1', { exact: true })).toHaveCount(2);

  await page.reload();
  await expect(page.getByText('Plan the week')).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Mark Plan the week complete' })).toBeChecked();

  await page.getByRole('button', { name: 'Delete Send the note' }).click();
  await expect(page.getByText('Send the note')).toHaveCount(0);
  await expect(page.getByText('1', { exact: true })).toHaveCount(2);

  await page.getByRole('checkbox', { name: 'Mark Plan the week complete' }).uncheck();
  await expect(page.getByText('0', { exact: true })).toHaveCount(1);
  expect(browserErrors).toEqual([]);
});

test('rejects whitespace-only input and adapts to a narrow viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const input = page.getByRole('textbox', { name: 'Enter a task' });
  await input.fill('   ');
  await page.getByRole('button', { name: 'Add Task' }).click();
  await expect(page.getByText('No tasks yet. Add your first task!')).toBeVisible();
  await expect(page.locator('body')).not.toHaveJSProperty('scrollWidth', 376);
});
