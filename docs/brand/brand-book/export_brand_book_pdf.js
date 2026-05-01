const puppeteer = require("puppeteer");
const path = require("path");
const fs = require("fs");

async function exportBrandBook() {
  const htmlPath = path.resolve(__dirname, "CaliLean_Brand_Book.html");
  const outputDir = __dirname;
  const outputPath = path.join(outputDir, "CaliLean_Brand_Book.pdf");

  if (!fs.existsSync(htmlPath)) {
    console.error(`Brand book HTML not found: ${htmlPath}`);
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
  console.log(`Brand book exported: ${outputPath}`);
}

exportBrandBook().catch((err) => {
  console.error("Export failed:", err);
  process.exit(1);
});
