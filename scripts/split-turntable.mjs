import { readFileSync, writeFileSync } from "node:fs";
import { chromium } from "playwright-core";

const source = readFileSync(new URL("../public/assets/pink-turntable.png", import.meta.url));
const sourceUrl = `data:image/png;base64,${source.toString("base64")}`;
const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

const page = await browser.newPage();
await page.setContent(`<img id="source" src="${sourceUrl}" alt="">`);
await page.locator("#source").evaluate((image) => image.decode());

const assets = await page.evaluate(() => {
  const image = document.querySelector("#source");
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = width;
  sourceCanvas.height = height;
  const sourceContext = sourceCanvas.getContext("2d", { willReadFrequently: true });
  sourceContext.drawImage(image, 0, 0);
  const sourcePixels = sourceContext.getImageData(0, 0, width, height);

  const distanceToSegment = (x, y, startX, startY, endX, endY) => {
    const dx = endX - startX;
    const dy = endY - startY;
    const lengthSquared = dx * dx + dy * dy;
    const t = Math.max(0, Math.min(1, ((x - startX) * dx + (y - startY) * dy) / lengthSquared));
    return Math.hypot(x - (startX + t * dx), y - (startY + t * dy));
  };

  const tonearmRegion = (x, y) => {
    const pivot = Math.hypot(x - 812, y - 180) < 104;
    const elbow = Math.hypot(x - 946, y - 432) < 102;
    const cartridge = Math.hypot((x - 650) / 94, (y - 797) / 68) < 1;
    const upperRail = distanceToSegment(x, y, 810, 180, 946, 432) < 35;
    const lowerRail = distanceToSegment(x, y, 946, 432, 650, 797) < 31;
    return pivot || elbow || cartridge || upperRail || lowerRail;
  };

  const cleanRegion = (x, y) => {
    const pivot = Math.max(0, 1 - Math.hypot(x - 812, y - 180) / 125);
    const elbow = Math.max(0, 1 - Math.hypot(x - 946, y - 432) / 120);
    const upperRail = Math.max(0, 1 - distanceToSegment(x, y, 810, 180, 946, 432) / 48);
    return Math.max(pivot, elbow, upperRail);
  };

  const basePixels = new ImageData(new Uint8ClampedArray(sourcePixels.data), width, height);
  const armPixels = new ImageData(width, height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const offset = (y * width + x) * 4;
      const red = sourcePixels.data[offset];
      const green = sourcePixels.data[offset + 1];
      const blue = sourcePixels.data[offset + 2];
      const alpha = sourcePixels.data[offset + 3];

      if (tonearmRegion(x, y) && alpha > 0) {
        const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
        const chroma = Math.max(red, green, blue) - Math.min(red, green, blue);
        const darkness = Math.max(0, Math.min(1, (212 - luminance) / 102));
        const neutrality = Math.max(0, Math.min(1, (34 - chroma) / 14));
        const objectAlpha = darkness * neutrality;
        armPixels.data[offset] = red;
        armPixels.data[offset + 1] = green;
        armPixels.data[offset + 2] = blue;
        armPixels.data[offset + 3] = Math.round(alpha * objectAlpha);
      }

      const cleanup = cleanRegion(x, y);
      const outsideRecord = Math.hypot(x - 535, y - 554) > 352;
      if (cleanup > 0 && outsideRecord && alpha > 0) {
        const vertical = y / height;
        const fillRed = 239 - vertical * 17;
        const fillGreen = 198 - vertical * 37;
        const fillBlue = 216 - vertical * 25;
        const blend = Math.min(1, cleanup * 1.65);
        basePixels.data[offset] = Math.round(red * (1 - blend) + fillRed * blend);
        basePixels.data[offset + 1] = Math.round(green * (1 - blend) + fillGreen * blend);
        basePixels.data[offset + 2] = Math.round(blue * (1 - blend) + fillBlue * blend);
      }
    }
  }

  const exportPixels = (pixels) => {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    canvas.getContext("2d").putImageData(pixels, 0, 0);
    return canvas.toDataURL("image/png").split(",")[1];
  };

  return {
    base: exportPixels(basePixels),
    tonearm: exportPixels(armPixels),
  };
});

writeFileSync(new URL("../public/assets/pink-turntable-base.png", import.meta.url), Buffer.from(assets.base, "base64"));
writeFileSync(new URL("../public/assets/pink-turntable-tonearm.png", import.meta.url), Buffer.from(assets.tonearm, "base64"));
await browser.close();
