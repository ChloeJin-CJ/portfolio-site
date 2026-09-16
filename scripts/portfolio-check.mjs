import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const cwd = new URL("..", import.meta.url).pathname;
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "5174"], {
  cwd,
  stdio: ["ignore", "pipe", "pipe"],
});

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:5174/");
      if (response.ok) return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 150));
    }
  }
  throw new Error("Vite did not start in time");
}

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({
    executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
    headless: true,
  });

  const heroCases = [
    { name: "fullscreen", width: 1920, height: 960 },
    { name: "windowed", width: 1462, height: 746 },
    { name: "wide-short", width: 1920, height: 720 },
  ];
  const heroMetrics = [];

  for (const current of heroCases) {
    const page = await browser.newPage({ viewport: current, reducedMotion: "reduce" });
    await page.goto("http://127.0.0.1:5174/", { waitUntil: "networkidle" });
    await page.waitForTimeout(700);
    const metrics = await page.evaluate(() => {
      const identity = document.querySelector(".identity").getBoundingClientRect();
      const ticket = document.querySelector(".ticket-object").getBoundingClientRect();
      return {
        identityBottom: Math.round(identity.bottom),
        ticketTop: Math.round(ticket.top),
        gap: Math.round(ticket.top - identity.bottom),
        horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      };
    });
    heroMetrics.push({ ...current, ...metrics });
    await page.screenshot({ path: `/tmp/chloe-hero-${current.name}.png` });
    await page.close();
  }

  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  desktop.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  desktop.on("pageerror", (error) => errors.push(error.message));
  await desktop.goto("http://127.0.0.1:5174/", { waitUntil: "networkidle" });
  await desktop.waitForTimeout(6400);
  await desktop.locator(".folder").scrollIntoViewIfNeeded();
  await desktop.waitForTimeout(1200);
  await desktop.screenshot({ path: "/tmp/chloe-portfolio-closed.png", fullPage: true });
  await desktop.locator(".folder").hover();
  await desktop.waitForTimeout(900);

  const cards = await desktop.locator(".project-card").evaluateAll((elements) => elements.map((element) => {
    const rect = element.getBoundingClientRect();
    return {
      left: Math.round(rect.left),
      top: Math.round(rect.top),
      href: element.getAttribute("href"),
      target: element.getAttribute("target"),
      rel: element.getAttribute("rel"),
    };
  }));
  const desktopMetrics = await desktop.evaluate(() => {
    const pageCenter = document.documentElement.clientWidth / 2;
    const folderRect = document.querySelector(".folder").getBoundingClientRect();
    const wordmarkRect = document.querySelector(".portfolio-wordmark").getBoundingClientRect();
    return {
      scrollHeight: document.documentElement.scrollHeight,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      folderCenterDelta: Math.round(folderRect.left + (folderRect.width / 2) - pageCenter),
      wordmarkCenterDelta: Math.round(wordmarkRect.left + (wordmarkRect.width / 2) - pageCenter),
      wordmarkLoaded: document.querySelector(".portfolio-wordmark")?.complete
        && document.querySelector(".portfolio-wordmark")?.naturalWidth > 0,
    };
  });
  await desktop.screenshot({ path: "/tmp/chloe-portfolio-desktop.png", fullPage: true });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  await mobile.goto("http://127.0.0.1:5174/", { waitUntil: "networkidle" });
  await mobile.waitForTimeout(800);
  await mobile.locator(".portfolio").scrollIntoViewIfNeeded();
  const mobileMetrics = await mobile.evaluate(() => ({
    visibleCards: [...document.querySelectorAll(".project-card")].filter((card) => card.getBoundingClientRect().height > 0).length,
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  await mobile.screenshot({ path: "/tmp/chloe-portfolio-mobile.png", fullPage: true });

  console.log(JSON.stringify({ heroMetrics, errors, cards, desktopMetrics, mobileMetrics }, null, 2));
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
