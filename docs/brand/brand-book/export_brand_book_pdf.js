const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

const pages = [
  { html: "CaliLean_Brand_Book.html", pdf: "CaliLean_Brand_Book.pdf" },
  { html: "CaliLean_Brand_Elements.html", pdf: "CaliLean_Brand_Elements.pdf" },
];

async function exportPage(browser, { html, pdf }) {
  const htmlPath = path.resolve(__dirname, html);
  const outputPath = path.join(__dirname, pdf);

  if (!fs.existsSync(htmlPath)) {
    console.error(`HTML not found: ${htmlPath}`);
    return false;
  }

  const page = await browser.newPage();
  await page.goto(`file://${htmlPath}`, { waitUntil: "networkidle0", timeout: 30000 });

  await page.pdf({
    path: outputPath,
    printBackground: true,
    width: "1920px",
    height: "1080px",
    preferCSSPageSize: true,
  });

  await page.close();
  console.log(`Exported: ${outputPath}`);
  return true;
}

async function exportAll() {
  fs.mkdirSync(__dirname, { recursive: true });

  const browser = await puppeteer.launch({ headless: "new" });

  for (const entry of pages) {
    await exportPage(browser, entry);
  }

  await browser.close();
  console.log("All exports complete.");
}

exportAll().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
