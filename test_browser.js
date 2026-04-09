const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('BROWSER_CONSOLE:', msg.text()));
  page.on('pageerror', error => console.log('BROWSER_ERROR:', error.message));

  try {
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0', timeout: 10000 });
    const content = await page.content();
    console.log('HTML_CONTENT:', content.substring(0, 500));
  } catch (err) {
    console.log('PUPPETEER_ERROR:', err.message);
  }
  
  await browser.close();
})();
