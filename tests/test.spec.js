import { test, expect } from '@playwright/test';

test.describe('store', () => {
  let page; 

  test.beforeEach(async ({ browser }) => {
    const context = await browser.newContext();
    page = await context.newPage();
  });

  test.afterEach(async () => {
    await page.close();
  });

  test.only('should translate file PDF in google traductor!', async () => {
    await page.goto('https://translate.google.com/?hl=es&sl=en&tl=es&op=docs');
    await page.getByRole('main', { name: 'Traducción de documentos' }).locator('label').click();
    await page.getByRole('textbox', { name: 'Explorar archivos' }).setInputFiles('11705-JISBD-2021-056.pdf');
    await page.getByRole('button', { name: 'Traducir' }).click();
    // await page.waitForTimeout(90000);
    await page.waitForTimeout(5000);
    const isSuccessful = await page.isVisible('button:has-text("Abrir traducción")');
    console.log('isSuccessful2', isSuccessful);
    expect(isSuccessful).toBe(true);
    console.log('isSuccessful', isSuccessful);
  });
});
