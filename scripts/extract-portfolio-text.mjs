import { readFile } from "node:fs/promises";
import { chromium } from "playwright-core";

const sourcePath = process.argv[2] ?? "/Users/chloejin/Downloads/SCR-20260914-pnvu.png";
const outputPath = process.argv[3] ?? new URL("../public/assets/portfolio-backdrop.png", import.meta.url).pathname;
const source = await readFile(sourcePath);
const sourceUrl = `data:image/png;base64,${source.toString("base64")}`;

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

try {
  const page = await browser.newPage({ viewport: { width: 1420, height: 622 } });
  await page.setContent("<canvas></canvas>");

  const dimensions = await page.evaluate(async (url) => {
    const image = new Image();
    image.src = url;
    await image.decode();

    const canvas = document.querySelector("canvas");
    canvas.width = image.naturalWidth;
    canvas.height = image.naturalHeight;
    const context = canvas.getContext("2d", { willReadFrequently: true });
    context.drawImage(image, 0, 0);

    const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
    for (let index = 0; index < pixels.data.length; index += 4) {
      const red = pixels.data[index];
      const green = pixels.data[index + 1];
      const blue = pixels.data[index + 2];
      const distanceFromWhite = Math.max(255 - red, 255 - green, 255 - blue);

      if (distanceFromWhite <= 1) {
        pixels.data[index + 3] = 0;
        continue;
      }

      // A gradual alpha ramp retains the original diffuse halo and translucent letter edges.
      const alpha = Math.min(0.92, 0.92 * Math.pow((distanceFromWhite - 1) / 31, 0.78));
      const colorDepth = 1.12;
      pixels.data[index] = Math.max(0, 255 - (((255 - red) / alpha) * colorDepth));
      pixels.data[index + 1] = Math.max(0, 255 - (((255 - green) / alpha) * colorDepth));
      pixels.data[index + 2] = Math.max(0, 255 - (((255 - blue) / alpha) * colorDepth));
      pixels.data[index + 3] = Math.round(alpha * 255);
    }

    const textLayer = document.createElement("canvas");
    textLayer.width = canvas.width;
    textLayer.height = canvas.height;
    textLayer.getContext("2d").putImageData(pixels, 0, 0);

    const glowLayer = document.createElement("canvas");
    glowLayer.width = canvas.width;
    glowLayer.height = canvas.height;
    const glowContext = glowLayer.getContext("2d");
    const glowPixels = new ImageData(canvas.width, canvas.height);
    for (let index = 0; index < pixels.data.length; index += 4) {
      glowPixels.data[index] = 255;
      glowPixels.data[index + 1] = 255;
      glowPixels.data[index + 2] = 255;
      glowPixels.data[index + 3] = Math.round(pixels.data[index + 3] * 0.58);
    }
    glowContext.putImageData(glowPixels, 0, 0);

    context.clearRect(0, 0, canvas.width, canvas.height);
    context.save();
    context.filter = "blur(24px)";
    context.drawImage(glowLayer, 0, 0);
    context.restore();
    context.drawImage(textLayer, 0, 0);
    document.documentElement.style.background = "transparent";
    document.body.style.cssText = "margin:0;background:transparent;overflow:hidden";
    return { width: canvas.width, height: canvas.height };
  }, sourceUrl);

  await page.setViewportSize(dimensions);
  await page.screenshot({ path: outputPath, omitBackground: true });
  console.log(`Created ${outputPath} (${dimensions.width}x${dimensions.height})`);
} finally {
  await browser.close();
}
