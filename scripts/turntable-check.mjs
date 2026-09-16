import { spawn } from "node:child_process";
import { chromium } from "playwright-core";

const cwd = new URL("..", import.meta.url).pathname;
const server = spawn(process.execPath, ["node_modules/vite/bin/vite.js", "--host", "127.0.0.1", "--port", "5181"], {
  cwd,
  stdio: ["ignore", "pipe", "pipe"],
});

async function waitForServer() {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    try {
      const response = await fetch("http://127.0.0.1:5181/");
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

  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("console", (message) => message.type() === "error" && errors.push(message.text()));
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("http://127.0.0.1:5181/", { waitUntil: "networkidle" });
  await page.waitForTimeout(6200);

  const player = page.locator(".turntable-player");
  const before = await player.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    const record = element.querySelector(".turntable-record");
    const recordRect = record.getBoundingClientRect();
    const recordStyle = getComputedStyle(record);
    const [originX, originY] = recordStyle.transformOrigin.split(" ").map(Number.parseFloat);
    const visualLayers = [...element.children].map((child) => child.className);
    return {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
      cursor: getComputedStyle(element).cursor,
      label: element.getAttribute("aria-label"),
      visualLayers,
      baseSource: element.querySelector(".turntable-base").getAttribute("src"),
      audioSource: element.closest(".turntable-object").querySelector("audio").getAttribute("src"),
      notesSource: element.closest(".turntable-object").querySelector(".music-notes").getAttribute("src"),
      notesOpacity: getComputedStyle(element.closest(".turntable-object").querySelector(".music-notes")).opacity,
      recordWidth: recordRect.width,
      recordHeight: recordRect.height,
      recordRadius: recordStyle.borderRadius,
      recordOverflow: recordStyle.overflow,
      recordOrigin: recordStyle.transformOrigin,
      recordOriginCentered: Math.abs(originX - (recordRect.width / 2)) < 0.1
        && Math.abs(originY - (recordRect.height / 2)) < 0.1,
    };
  });

  await player.hover();
  await page.waitForTimeout(350);
  const hoverNotes = await page.locator(".music-notes").evaluate((notes) => ({
    opacity: Number.parseFloat(getComputedStyle(notes).opacity),
    animation: getComputedStyle(notes).animationName,
  }));
  await page.mouse.move(720, 450);
  await page.waitForTimeout(250);
  const departedNotesOpacity = await page.locator(".music-notes").evaluate(
    (notes) => Number.parseFloat(getComputedStyle(notes).opacity),
  );

  await player.click();
  await page.waitForTimeout(850);
  const playing = await page.evaluate(() => ({
    pressed: document.querySelector(".turntable-player").getAttribute("aria-pressed"),
    paused: document.querySelector(".turntable-object audio").paused,
    currentTime: document.querySelector(".turntable-object audio").currentTime,
    recordAnimation: getComputedStyle(document.querySelector(".turntable-record")).animationName,
    recordDuration: getComputedStyle(document.querySelector(".turntable-record")).animationDuration,
    recordTransform: getComputedStyle(document.querySelector(".turntable-record")).transform,
    baseAnimation: getComputedStyle(document.querySelector(".turntable-base")).animationName,
    separateTonearmPresent: document.querySelector(".turntable-tonearm") !== null,
    lightColor: getComputedStyle(document.querySelector(".turntable-player"), "::after").backgroundColor,
    lightShadow: getComputedStyle(document.querySelector(".turntable-player"), "::after").boxShadow,
    horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
  }));
  await page.waitForTimeout(260);
  const laterRecordTransform = await page.locator(".turntable-record").evaluate(
    (record) => getComputedStyle(record).transform,
  );
  await page.screenshot({ path: "/tmp/chloe-turntable-playing.png", fullPage: true });

  await player.click();
  await page.waitForTimeout(800);
  const paused = await page.evaluate(() => ({
    pressed: document.querySelector(".turntable-player").getAttribute("aria-pressed"),
    paused: document.querySelector(".turntable-object audio").paused,
    recordAnimation: getComputedStyle(document.querySelector(".turntable-record")).animationName,
    label: document.querySelector(".turntable-player").getAttribute("aria-label"),
  }));

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  await mobile.goto("http://127.0.0.1:5181/", { waitUntil: "networkidle" });
  await mobile.waitForTimeout(800);
  const mobileMetrics = await mobile.evaluate(() => {
    const playerRect = document.querySelector(".turntable-player").getBoundingClientRect();
    return {
      playerVisible: playerRect.width > 0 && playerRect.height > 0,
      playerWithinViewport: playerRect.left >= 0 && playerRect.right <= innerWidth,
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  await mobile.screenshot({ path: "/tmp/chloe-turntable-mobile.png", fullPage: true });

  console.log(JSON.stringify({ errors, before, hoverNotes, departedNotesOpacity, playing, laterRecordTransform, paused, mobileMetrics }, null, 2));

  if (
    errors.length
    || before.cursor !== "pointer"
    || before.visualLayers.join(",") !== "turntable-base,turntable-record"
    || !before.baseSource.endsWith("/assets/pink-turntable.png")
    || !before.audioSource.endsWith("/assets/belle-epoque.mp3")
    || !before.notesSource.endsWith("/assets/music-notes.png")
    || before.notesOpacity !== "0"
    || hoverNotes.opacity < 0.8
    || hoverNotes.animation !== "music-notes-float"
    || departedNotesOpacity > 0.05
    || Math.abs(before.recordWidth - before.recordHeight) > 0.1
    || before.recordRadius !== "50%"
    || before.recordOverflow !== "hidden"
    || !before.recordOriginCentered
    || playing.paused
    || playing.currentTime <= 0
    || playing.recordAnimation !== "vinyl-spin"
    || playing.recordDuration !== "1.8s"
    || playing.recordTransform === laterRecordTransform
    || playing.baseAnimation !== "none"
    || playing.separateTonearmPresent
    || playing.lightShadow === "none"
    || !paused.paused
    || paused.pressed !== "false"
    || !mobileMetrics.playerVisible
    || !mobileMetrics.playerWithinViewport
    || mobileMetrics.horizontalOverflow > 0
  ) {
    process.exitCode = 1;
  }
} finally {
  await browser?.close();
  server.kill("SIGTERM");
}
