import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (message) => {
  if (message.type() === "error") errors.push(message.text());
});
page.on("pageerror", (error) => errors.push(error.message));

await page.goto("http://127.0.0.1:5174/", { waitUntil: "networkidle" });
await page.waitForTimeout(6200);
await page.locator(".camera-object").screenshot({ path: "/tmp/camera-sway-a.png" });
await page.waitForTimeout(900);
await page.locator(".camera-object").screenshot({ path: "/tmp/camera-sway-b.png" });

const geometry = await page.locator(".camera-object").evaluate((camera) => {
  const assembly = camera.querySelector(".camera-assembly");
  const shell = camera.querySelector(".camera-shell");
  const screen = camera.querySelector(".camera-screen");
  return {
    assemblyTransform: getComputedStyle(assembly).transform,
    shellTransform: getComputedStyle(shell).transform,
    screen: screen.getBoundingClientRect().toJSON(),
  };
});

console.log(JSON.stringify({ errors, geometry }, null, 2));
await browser.close();
