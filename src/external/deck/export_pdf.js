const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

async function exportDeck() {
  const htmlPath = path.resolve(__dirname, "CaliLean_Pitch_Deck.html");
  const outputDir = path.resolve(__dirname, "..", "..", "..", "output", "external", "deck");
  const outputPath = path.join(outputDir, "CaliLean_Pitch_Deck.pdf");

  if (!fs.existsSync(htmlPath)) {
    console.error(`Deck HTML not found: ${htmlPath}`);
    process.exit(1);
  }

  fs.mkdirSync(outputDir, { recursive: true });

  const browser = await puppeteer.launch({ headless: "new" });
  const page = await browser.newPage();

  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0", timeout: 30000 });

  await page.pdf({
    path: outputPath,
    printBackground: true,
    width: "1920px",
    height: "1080px",
    preferCSSPageSize: true,
  });

  await browser.close();
  console.log(`Pitch deck exported: ${outputPath}`);
}

exportDeck().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
