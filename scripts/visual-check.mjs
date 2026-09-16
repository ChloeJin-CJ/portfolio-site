import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

const cases = [
  { name: "desktop", width: 2048, height: 1148 },
  { name: "laptop", width: 1440, height: 900 },
  { name: "mobile", width: 390, height: 844 },
];

for (const current of cases) {
  const page = await browser.newPage({ viewport: current });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:5174/", { waitUntil: "networkidle" });
  await page.waitForTimeout(6500);
  await page.screenshot({ path: `/tmp/chloe-${current.name}.png`, fullPage: true });
  console.log(`${current.name}: ${errors.length ? errors.join(" | ") : "ok"}`);
  await page.close();
}

await browser.close();
