import { readFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const sourcePath = process.argv[2] ?? "/Users/chloejin/Downloads/ac520bbe60bfb1d898c0f68d56cbbf7c.png";
const outputPath = process.argv[3] ?? new URL("../public/assets/music-notes.png", import.meta.url).pathname;
const source = await readFile(sourcePath);
const sourceUrl = `data:image/png;base64,${source.toString("base64")}`;

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

try {
  const page = await browser.newPage();
  await page.setContent("<canvas></canvas>");
  const result = await page.evaluate(async (url) => {
    const image = new Image();
    image.src = url;
    await image.decode();

    const sourceCanvas = document.createElement("canvas");
    sourceCanvas.width = image.naturalWidth;
    sourceCanvas.height = image.naturalHeight;
    const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
    sourceContext.drawImage(image, 0, 0);
    const pixels = sourceContext.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height).data;

    let minX = sourceCanvas.width;
    let minY = sourceCanvas.height;
    let maxX = 0;
    let maxY = 0;
    for (let y = 0; y < sourceCanvas.height; y += 1) {
      for (let x = 0; x < sourceCanvas.width; x += 1) {
        if (pixels[((y * sourceCanvas.width) + x) * 4 + 3] > 8) {
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
      }
    }

    const padding = 18;
    minX = Math.max(0, minX - padding);
    minY = Math.max(0, minY - padding);
    maxX = Math.min(sourceCanvas.width - 1, maxX + padding);
    maxY = Math.min(sourceCanvas.height - 1, maxY + padding);
    const width = maxX - minX + 1;
    const height = maxY - minY + 1;

    const canvas = document.querySelector("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").drawImage(sourceCanvas, minX, minY, width, height, 0, 0, width, height);
    document.documentElement.style.background = "transparent";
    document.body.style.cssText = "margin:0;background:transparent;overflow:hidden";
    return { width, height };
  }, sourceUrl);

  await page.setViewportSize(result);
  await page.screenshot({ path: outputPath, omitBackground: true });
  console.log(`Created ${outputPath} (${result.width}x${result.height})`);
} finally {
  await browser.close();
}
