import { chromium } from "playwright-core";

const cases = [
  { name: "fullscreen", width: 1920, height: 960 },
  { name: "windowed", width: 1462, height: 746 },
  { name: "wide-short", width: 1920, height: 720 },
  { name: "laptop", width: 1366, height: 768 },
];

const browser = await chromium.launch({
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  headless: true,
});

const results = [];
for (const current of cases) {
  const page = await browser.newPage({ viewport: current });
  await page.setContent(`
    <main class="hero">
      <section class="identity hero-item">
        <div class="signature-wrap"><p class="signature">Chloe Jin</p></div>
        <p class="tagline">Agent Babysitter &amp; Chief Token Burner</p>
      </section>
      <div class="ticket-object hero-item">
        <img src="" width="2240" height="734" alt="">
      </div>
    </main>
  `);
  await page.addStyleTag({ path: "src/styles.css" });

  const measurements = await page.evaluate(() => {
    const identity = document.querySelector(".identity").getBoundingClientRect();
    const ticket = document.querySelector(".ticket-object").getBoundingClientRect();
    const hero = document.querySelector(".hero").getBoundingClientRect();
    return {
      identityBottom: Math.round(identity.bottom),
      ticketTop: Math.round(ticket.top),
      gap: Math.round(ticket.top - identity.bottom),
      ticketBottom: Math.round(ticket.bottom),
      heroBottom: Math.round(hero.bottom),
      lowerClearance: Math.round(hero.bottom - ticket.bottom),
      horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    };
  });
  results.push({ ...current, ...measurements });
  await page.close();
}

await browser.close();
console.log(JSON.stringify(results, null, 2));

if (results.some(({ gap, lowerClearance, horizontalOverflow }) => gap < 24 || lowerClearance < 0 || horizontalOverflow > 0)) {
  process.exitCode = 1;
}
