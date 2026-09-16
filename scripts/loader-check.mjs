import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:5174/", { waitUntil: "networkidle" });

const moments = [600, 1550, 2450, 3600, 4800, 6200];
let elapsed = 0;
for (const moment of moments) {
  await page.waitForTimeout(moment - elapsed);
  await page.screenshot({ path: `/tmp/chloe-loader-${moment}.png` });
  elapsed = moment;
}

await browser.close();
