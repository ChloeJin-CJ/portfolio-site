import { chromium } from "playwright-core";

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

try {
  const page = await browser.newPage({ viewport: { width: 1024, height: 1024 } });
  await page.setContent("<canvas width='1024' height='1024'></canvas>");

  await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const context = canvas.getContext("2d");
    const roundedRect = (x, y, width, height, radius) => {
      context.beginPath();
      context.roundRect(x, y, width, height, radius);
    };
    const screw = (x, y) => {
      const metal = context.createRadialGradient(x - 5, y - 6, 2, x, y, 19);
      metal.addColorStop(0, "#fff7fb");
      metal.addColorStop(0.45, "#d49ab5");
      metal.addColorStop(1, "#86566f");
      context.fillStyle = metal;
      context.shadowColor = "rgba(81, 38, 60, 0.3)";
      context.shadowBlur = 9;
      context.beginPath();
      context.arc(x, y, 17, 0, Math.PI * 2);
      context.fill();
      context.shadowColor = "transparent";
      context.strokeStyle = "rgba(106, 61, 82, 0.58)";
      context.lineWidth = 3;
      context.beginPath();
      context.moveTo(x - 7, y);
      context.lineTo(x + 7, y);
      context.stroke();
    };

    context.clearRect(0, 0, 1024, 1024);
    context.shadowColor = "rgba(84, 43, 63, 0.25)";
    context.shadowBlur = 30;
    context.shadowOffsetY = 18;
    const body = context.createLinearGradient(56, 48, 970, 980);
    body.addColorStop(0, "#f7d7e5");
    body.addColorStop(0.38, "#eab3ca");
    body.addColorStop(0.72, "#dea0ba");
    body.addColorStop(1, "#f0bfd3");
    roundedRect(48, 38, 928, 938, 30);
    context.fillStyle = body;
    context.fill();
    context.shadowColor = "transparent";

    const surface = context.createRadialGradient(420, 330, 80, 510, 510, 700);
    surface.addColorStop(0, "rgba(255, 232, 241, 0.5)");
    surface.addColorStop(0.62, "rgba(218, 142, 173, 0.16)");
    surface.addColorStop(1, "rgba(125, 66, 93, 0.14)");
    roundedRect(66, 58, 892, 882, 19);
    context.fillStyle = surface;
    context.fill();
    context.strokeStyle = "rgba(255, 245, 250, 0.72)";
    context.lineWidth = 4;
    context.stroke();

    context.strokeStyle = "rgba(122, 68, 93, 0.2)";
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(75, 936);
    context.lineTo(950, 936);
    context.stroke();
    context.strokeStyle = "rgba(255, 244, 249, 0.62)";
    context.lineWidth = 3;
    context.beginPath();
    context.moveTo(72, 70);
    context.lineTo(950, 70);
    context.stroke();

    screw(102, 106);
    screw(922, 106);

    const dial = context.createRadialGradient(115, 835, 3, 115, 835, 42);
    dial.addColorStop(0, "#f9e1eb");
    dial.addColorStop(0.62, "#d89ab4");
    dial.addColorStop(1, "#9f607d");
    context.fillStyle = dial;
    context.beginPath();
    context.arc(115, 835, 38, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "rgba(101, 57, 77, 0.5)";
    context.lineWidth = 3;
    context.stroke();
    context.strokeStyle = "#f8dce8";
    context.lineWidth = 8;
    context.beginPath();
    context.moveTo(115, 837);
    context.lineTo(125, 804);
    context.stroke();

    roundedRect(185, 882, 104, 24, 5);
    context.fillStyle = "#5b4551";
    context.fill();
    for (let x = 195; x < 283; x += 11) {
      context.fillStyle = x % 22 ? "#302b30" : "#87717c";
      context.fillRect(x, 885, 6, 18);
    }

    roundedRect(845, 792, 91, 92, 6);
    const panel = context.createLinearGradient(845, 792, 936, 884);
    panel.addColorStop(0, "#53444c");
    panel.addColorStop(1, "#241f24");
    context.fillStyle = panel;
    context.fill();
    context.strokeStyle = "rgba(255, 224, 237, 0.28)";
    context.lineWidth = 3;
    context.stroke();
    [868, 912].forEach((x) => {
      context.fillStyle = "#161519";
      context.beginPath();
      context.arc(x, 842, 15, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = "#8b6d7b";
      context.lineWidth = 3;
      context.stroke();
    });

    // Fine translucent grain keeps the chassis from reading as a flat vector panel.
    let seed = 24731;
    for (let index = 0; index < 9000; index += 1) {
      seed = (seed * 16807) % 2147483647;
      const x = 68 + (seed % 888);
      seed = (seed * 16807) % 2147483647;
      const y = 62 + (seed % 872);
      context.fillStyle = index % 2 ? "rgba(255,255,255,0.035)" : "rgba(91,45,67,0.025)";
      context.fillRect(x, y, 1, 1);
    }

    document.documentElement.style.background = "transparent";
    document.body.style.cssText = "margin:0;background:transparent;overflow:hidden";
  });

  await page.screenshot({
    path: new URL("../public/assets/pink-turntable-base-clean.png", import.meta.url).pathname,
    omitBackground: true,
  });

  await page.evaluate(() => {
    const canvas = document.querySelector("canvas");
    const context = canvas.getContext("2d");
    context.clearRect(0, 0, 1024, 1024);

    const armPath = new Path2D();
    armPath.moveTo(800, 170);
    armPath.bezierCurveTo(834, 245, 864, 322, 877, 394);
    armPath.bezierCurveTo(895, 490, 902, 590, 903, 686);
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = "rgba(42, 25, 34, 0.3)";
    context.lineWidth = 28;
    context.shadowColor = "rgba(41, 22, 31, 0.42)";
    context.shadowBlur = 14;
    context.shadowOffsetX = 7;
    context.shadowOffsetY = 9;
    context.stroke(armPath);
    context.shadowColor = "transparent";
    context.strokeStyle = "#252229";
    context.lineWidth = 18;
    context.stroke(armPath);
    context.strokeStyle = "rgba(255,255,255,0.44)";
    context.lineWidth = 4;
    context.stroke(armPath);

    const pivot = context.createRadialGradient(778, 112, 5, 800, 135, 68);
    pivot.addColorStop(0, "#69636b");
    pivot.addColorStop(0.42, "#302d33");
    pivot.addColorStop(1, "#141419");
    context.fillStyle = pivot;
    context.shadowColor = "rgba(32, 20, 27, 0.45)";
    context.shadowBlur = 16;
    context.shadowOffsetY = 7;
    context.beginPath();
    context.arc(800, 135, 64, 0, Math.PI * 2);
    context.fill();
    context.shadowColor = "transparent";
    context.strokeStyle = "#806e77";
    context.lineWidth = 5;
    context.stroke();
    context.fillStyle = "#25232a";
    context.beginPath();
    context.arc(800, 135, 47, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#29262c";
    context.beginPath();
    context.arc(877, 394, 38, 0, Math.PI * 2);
    context.fill();
    context.strokeStyle = "#75656d";
    context.lineWidth = 5;
    context.stroke();
    context.fillStyle = "#131318";
    context.beginPath();
    context.arc(877, 394, 13, 0, Math.PI * 2);
    context.fill();

    context.save();
    context.translate(903, 692);
    context.rotate(-0.12);
    const cartridge = context.createLinearGradient(-38, -42, 40, 42);
    cartridge.addColorStop(0, "#403b43");
    cartridge.addColorStop(1, "#17171c");
    context.fillStyle = cartridge;
    context.shadowColor = "rgba(34, 19, 27, 0.38)";
    context.shadowBlur = 10;
    context.shadowOffsetY = 6;
    context.beginPath();
    context.roundRect(-40, -42, 80, 84, 10);
    context.fill();
    context.shadowColor = "transparent";
    context.fillStyle = "#d8cbd1";
    for (let x = -24; x <= 24; x += 16) {
      context.beginPath();
      context.arc(x, 28, 5, 0, Math.PI * 2);
      context.fill();
    }
    context.strokeStyle = "#17151a";
    context.lineWidth = 5;
    context.beginPath();
    context.moveTo(-4, 42);
    context.lineTo(-4, 65);
    context.stroke();
    context.restore();
  });

  await page.screenshot({
    path: new URL("../public/assets/pink-turntable-tonearm-clean.png", import.meta.url).pathname,
    omitBackground: true,
  });
} finally {
  await browser.close();
}
