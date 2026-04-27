#!/usr/bin/env node
// v2 line-coherence pilot — SKA-47 CEO reopen.
// Two Ultra renders (Retatrutide + NAD+) with a single locked prompt that
// varies only {compound, lot}, plus a fixed seed, to test whether Imagen 4
// Ultra converges to identical-twin compositions when the prompt language
// is itself prescriptive about scale/centering/background. If this pilot
// produces visually-coherent twins we commit to a full 8-SKU v2 batch on
// the same recipe; if not we fall back to a composite (1 master vial +
// programmatic label-text overlay).

import { writeFile, mkdir } from "node:fs/promises";
import { resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = resolvePath(HERE, "..");
const RENDERS_DIR = resolvePath(REPO_ROOT, "docs/brand/imagery/renders");
const V2_DIR = resolvePath(RENDERS_DIR, "v2-pilot");
const RAW_DIR = resolvePath(V2_DIR, "raw");
const WEB_DIR = resolvePath(V2_DIR, "web");

function tryLoadSharp() {
  try {
    const r = createRequire("/tmp/render-tools/package.json");
    return r("sharp");
  } catch {
    return null;
  }
}

const ULTRA_MODEL = "imagen-4.0-ultra-generate-001";
const SEED = 24042701;

function buildPrompt({ compound, dosage, lot }) {
  const dosageLine = dosage.includes("/")
    ? `the dosage line in fixed-width typewriter style reads "${dosage}"`
    : `the dosage line in fixed-width typewriter style reads "${dosage} mg / vial"`;
  return [
    `An overhead photograph of a single small clear glass research vial about two milliliters tall, photographed straight down from directly above, resting on a heavyweight off-white linen-cotton textile in a warm cream off-white tone with a barely-visible gradient from slightly darker tan in the corners to slightly lighter cream in the center.`,
    `The vial is sealed with an aluminum crimp cap. The cap top is a clearly saturated muted green — a soft matte sage / Eucalyptus green — and reads obviously, visibly green at thumbnail size. The cap occupies roughly the top 18 percent of the vial height. The cap color is mandatory: do not shift it toward silver, toward bare aluminum, or toward neutral grey. The full top face of the cap is uniformly green. The cap has no logo, no text, no marking on it.`,
    `Inside the vial is a pale beige lyophilized cake, dry, slightly translucent at the edges.`,
    `A clean wraparound paper label in the same warm cream off-white wraps the lower two-thirds of the vial. The label is printed only in dark near-black ink. The label contains exactly four lines of text in this order from top to bottom, with no other lines and no other text on the label whatsoever:`,
    `Line 1 (top of label, small lower-case sans-serif at modest size): the wordmark "calilean" by itself, with NO trademark symbol after it, NO registered-trademark symbol, NO copyright symbol, NO monogram, NO logomark, NO icon, NO extra letter or punctuation. Beneath this wordmark a thin near-black horizontal hairline rule (a single hairline pen line, full label width, not a colored band, not a decorative stripe).`,
    `Line 2 (large low-contrast modern serif at the same large size as every other vial in this product line): the compound name, which reads exactly: ${compound}. Then another thin near-black horizontal hairline rule.`,
    `Line 3 (fixed-width typewriter style at the same modest size as every other vial in this line): ${dosageLine}.`,
    `Line 4 (fixed-width typewriter style at the same modest size, immediately below the dosage line, with no separator and no other line between them): the lot designation reads exactly: LOT ${lot}.`,
    `Strictly do not insert any extra alphanumeric code, batch identifier, sample number, hex value, color name, or any other text line anywhere on the label, on the cap, on the vial body, on the background, or anywhere else in the frame. The label is exactly: wordmark, compound, dosage, lot. Nothing else.`,
    `Composition lock: the vial is centered exactly in the square frame, exactly equidistant from the left edge and the right edge and from the top edge and the bottom edge. The vial occupies roughly 35 percent of the frame width and roughly 70 percent of the frame height. There is at least 30 percent empty cream-toned linen visible to the left of the vial and at least 30 percent empty cream-toned linen visible to the right of the vial. The complete "calilean" wordmark, including its leading "c" and its trailing "n", is fully visible on the label. No part of the label, the cap, or the vial body touches or extends past any edge of the frame.`,
    `No other props, no decoration, no other objects in the frame, no landscape, no mountains, no sky, no trees, no buildings, no scenery of any kind beyond the cream linen surface.`,
    `Lighting: cool diffuse daylight from a north-facing window, color temperature about 5400 Kelvin, very soft and even, no harsh shadows, no directional spotlight, no glare on the glass, no flash, low contrast, gentle barely-visible drop shadow directly beneath the vial.`,
    `Style: restrained editorial product photography in the style of an Aesop apothecary catalog crossed with a research bench, premium clinical, document-forward, sharp focus across the entire vial, the label perfectly legible, no motion blur, no bokeh on the subject, no lens flare, no HDR look.`,
    `Strictly do not include: any other text or codes anywhere in the frame beyond the four label lines described, no people, no hands, no fingers, no faces, no white lab coats, no blue gloves, no beakers, no test tubes, no syringes, no needles, no green or red or blue liquid, no marble, no wood grain, no sand, no gym equipment, no watermark, no instagram orange grading, no neon, no decorative borders, no mockup labels or annotations, no source code, no UI panels, no schema text.`,
  ].join(" ");
}

const TARGETS = [
  { label: "pdp-primary-retatrutide.v2-pilot", meta: { compound: "RETATRUTIDE", dosage: "15", lot: "24-0438" } },
  { label: "pdp-primary-nad.v2-pilot",          meta: { compound: "NAD+",        dosage: "100", lot: "24-0410" } },
];

async function renderOne(item, sharp) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY missing");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${ULTRA_MODEL}:predict`;
  const prompt = buildPrompt(item.meta);
  await mkdir(RAW_DIR, { recursive: true });
  await writeFile(resolvePath(RAW_DIR, `${item.label}.prompt.txt`), prompt);
  const t0 = Date.now();
  const res = await fetch(url, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: {
        sampleCount: 1,
        aspectRatio: "1:1",
        personGeneration: "dont_allow",
      },
    }),
  });
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  if (!res.ok) {
    const text = await res.text();
    return { item, ok: false, error: `HTTP ${res.status}: ${text.slice(0, 600)}`, elapsed };
  }
  const json = await res.json();
  const pred = json.predictions?.[0];
  if (!pred?.bytesBase64Encoded) {
    return { item, ok: false, error: `no image: ${JSON.stringify(json).slice(0, 400)}`, elapsed };
  }
  const png = Buffer.from(pred.bytesBase64Encoded, "base64");
  const pngPath = resolvePath(RAW_DIR, `${item.label}.png`);
  await writeFile(pngPath, png);
  let webBytes = null;
  if (sharp) {
    await mkdir(WEB_DIR, { recursive: true });
    const jpg = await sharp(png)
      .resize(1200, null, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    await writeFile(resolvePath(WEB_DIR, `${item.label}.jpg`), jpg);
    webBytes = jpg.length;
  }
  return { item, ok: true, pngBytes: png.length, webBytes, elapsed };
}

async function main() {
  if (!process.env.GOOGLE_API_KEY) {
    console.error("error: GOOGLE_API_KEY missing — source _default/.env.secrets first");
    process.exit(2);
  }
  const sharp = tryLoadSharp();
  if (!sharp) console.error("warn: sharp not available — skipping web jpg conversion");
  const results = [];
  for (const item of TARGETS) {
    process.stderr.write(`[${item.label}] ULTRA seed=${SEED} ... `);
    try {
      const r = await renderOne(item, sharp);
      results.push(r);
      process.stderr.write(r.ok ? `ok ${r.elapsed}s\n` : `FAIL ${r.elapsed}s :: ${r.error}\n`);
    } catch (err) {
      results.push({ item, ok: false, error: err?.message || String(err), elapsed: "?" });
      process.stderr.write(`FAIL :: ${err?.message || err}\n`);
    }
  }
  const ok = results.filter((r) => r.ok).length;
  console.log(JSON.stringify({ seed: SEED, model: ULTRA_MODEL, ok, fail: results.length - ok, items: results.map((r) => ({ label: r.item.label, ok: r.ok, elapsed: r.elapsed, pngBytes: r.pngBytes ?? null, webBytes: r.webBytes ?? null, error: r.error || null })) }, null, 2));
  if (results.length - ok > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`fatal: ${err?.message || err}`);
  process.exit(1);
});
