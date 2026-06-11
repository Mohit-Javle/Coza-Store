import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage();

  page.on('pageerror', (err) => {
    console.error('PAGE_ERROR:', err.message);
    console.error(err.stack);
  });

  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      console.error('CONSOLE_ERROR:', msg.text());
    } else {
      console.log('CONSOLE_LOG:', msg.text());
    }
  });

  console.log('Navigating to app...');
  await page.goto('http://localhost:5173/');

  console.log('Clicking How It Works in Navbar...');
  // Find button with text "How It Works" and click it
  await page.click('text="How It Works"');

  // Wait a bit for React to render and crash
  await page.waitForTimeout(2000);

  console.log('Done testing.');
  await browser.close();
})();
