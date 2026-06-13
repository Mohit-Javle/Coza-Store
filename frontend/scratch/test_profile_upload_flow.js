import { chromium } from 'playwright';

(async () => {
  console.log('Launching browser...');
  const browser = await chromium.launch({ headless: true, channel: 'chrome' });
  const page = await browser.newPage();

  page.on('pageerror', (err) => {
    console.error('PAGE_ERROR:', err.message);
  });

  page.on('console', (msg) => {
    console.log(`BROWSER_LOG [${msg.type()}]:`, msg.text());
  });

  console.log('Navigating to login page...');
  await page.goto('http://localhost:5173/auth');

  // Fill in login details
  console.log('Logging in...');
  await page.fill('input[placeholder="name@domain.com"]', 'testuser9921@test.com');
  await page.fill('input[placeholder="••••••••"]', 'Password123!');
  await page.click('button[type="submit"]');

  // Wait for login redirection
  await page.waitForTimeout(3000);
  console.log('Redirected to:', page.url());

  // Go to profile page
  console.log('Navigating to profile page...');
  await page.goto('http://localhost:5173/profile/testuser9921');
  await page.waitForTimeout(2000);

  // Click EDIT PROFILE
  console.log('Clicking EDIT PROFILE...');
  await page.click('button:has-text("EDIT PROFILE")');
  await page.waitForTimeout(1000);

  // Set input file
  console.log('Uploading file...');
  const filePath = 'C:\\Users\\ASUS\\.gemini\\antigravity-ide\\brain\\396af24f-eda0-487c-b5aa-1a61e7bcb9f6\\mock_avatar_1781338737894.png';
  await page.setInputFiles('input[type="file"]', filePath);
  await page.waitForTimeout(1000);

  // Click SAVE
  console.log('Saving profile...');
  await page.click('button:has-text("SAVE")');

  // Wait for request and response
  console.log('Waiting for toast response...');
  await page.waitForTimeout(4000);

  console.log('Done testing.');
  await browser.close();
})();
