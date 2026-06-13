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
    console.log(`BROWSER_LOG [${msg.type()}]:`, msg.text());
  });

  console.log('Navigating to signup page...');
  await page.goto('http://localhost:5173/auth');

  // Switch to Signup tab
  console.log('Switching to Sign Up tab...');
  await page.click('button:has-text("SIGN UP")');

  // Fill in signup form
  const uniqueUsername = `test_bidder_${Date.now()}`;
  console.log(`Filling form for username: @${uniqueUsername}`);
  await page.fill('input[placeholder="Your real name"]', 'Test Bidder');
  await page.fill('input[placeholder="deadstock.dev"]', uniqueUsername);
  await page.fill('input[placeholder="name@domain.com"]', `${uniqueUsername}@example.com`);
  await page.fill('input[placeholder="••••••••"] >> nth=0', 'Password123!');
  await page.fill('input[placeholder="••••••••"] >> nth=1', 'Password123!');
  
  // Click terms checkbox (using the custom click handler wrapper)
  console.log('Checking terms checkbox...');
  await page.click('div:has(span:has-text("I agree to the vibe")) div, div.w-4.h-4');

  // Wait for username check
  await page.waitForTimeout(1000);

  // Submit signup
  console.log('Submitting signup...');
  await page.click('button:has-text("REGISTER MEMBERSHIP")');

  // Wait for redirection to homepage
  console.log('Waiting for homepage redirect...');
  await page.waitForTimeout(3000);

  // Navigate to product page
  console.log('Navigating to product page...');
  await page.goto('http://localhost:5173/product/435ea9c0-fa32-4e4c-98de-82605530fb90');
  
  await page.waitForTimeout(2000);

  // Place a bid
  console.log('Placing a bid of 600...');
  await page.fill('input[type="number"]', '600');
  await page.click('button:has-text("BID")');

  // Wait to see results
  await page.waitForTimeout(3000);

  console.log('Done.');
  await browser.close();
})();
