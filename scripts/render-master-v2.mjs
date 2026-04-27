#!/usr/bin/env node
// v2 master vial render — SKA-47 composite path.
// Renders the single load-bearing master vial that ALL 8 PDP primaries will
// be composited from. CMO-locked spec (see SKA-47 thread):
//   - Vial dead-centered, ~50% frame width, identical proportions
//   - Cap: matte sage green, uniform top face, locked saturation
//   - Label: blank in compound/dosage/lot region (SVG overlay per SKU later)
//     — wordmark "calilean" lives at the bottom of the label as the brand anchor
//   - Background: warm cream linen-texture field, no smooth gradient
//   - Wordmark clean — no ™/®/* artifacts (accept if leaks; vector-overlay
//     fallback via SKA-13)
//   - Output: 2048x2048 PNG raw → docs/brand/imagery/renders/v2-pilot/master/

import { writeFile, mkdir } from "node:fs/promises";
import { resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = resolvePath(HERE, "..");
const RENDERS_DIR = resolvePath(REPO_ROOT, "docs/brand/imagery/renders");
const V2_DIR = resolvePath(RENDERS_DIR, "v2-pilot");
const MASTER_DIR = resolvePath(V2_DIR, "master");
const RAW_DIR = resolvePath(MASTER_DIR, "raw");
const WEB_DIR = resolvePath(MASTER_DIR, "web");

function tryLoadSharp() {
  try {
    const r = createRequire("/tmp/render-tools/package.json");
    return r("sharp");
  } catch {
    return null;
  }
}

const ULTRA_MODEL = "imagen-4.0-ultra-generate-001";

const CANDIDATE_COUNT = Number.parseInt(process.env.CAND ?? "3", 10);

function buildPrompt() {
  return [
    `An overhead photograph of a single small clear glass research vial about two milliliters tall, photographed straight down from directly above, resting on a heavyweight off-white linen-cotton textile in a uniformly warm cream off-white tone with a subtle visible woven linen texture across the entire surface.`,
    `The vial is sealed with an aluminum crimp cap. The cap top is a clearly saturated muted green — a soft matte sage / Eucalyptus green with locked saturation — that reads obviously, visibly green at thumbnail size. The cap occupies roughly the top 18 percent of the vial height. The cap color is mandatory: do not shift it toward silver, toward bare aluminum, toward neutral grey, toward forest green, or toward olive. The full top face of the cap is uniformly the same sage green with no shading, no logo, no text, no marking, and no bevel highlight.`,
    `Inside the vial is a pale beige lyophilized cake, dry, slightly translucent at the edges, about two-thirds of the vial height.`,
    `A clean wraparound paper label in the same warm cream off-white wraps the lower two-thirds of the vial. The label is printed only in dark near-black ink. The label has no compound name, no dosage, no lot number, no batch identifier, no alphanumeric code, no hex value, no extra word, and no decorative element anywhere on it. The label has exactly ONE line of text, which sits at the very bottom of the label and reads exactly: calilean — in lower-case sans-serif, modest size, by itself, with NO trademark symbol, NO registered-trademark symbol, NO copyright symbol, NO asterisk, NO monogram, NO logomark, NO icon, NO leading or trailing punctuation. The complete "calilean" wordmark, including its leading "c" and its trailing "n", is fully visible on the label.`,
    `Strictly do not insert any extra text, code, batch identifier, sample number, hex value, color name, label heading, anatomy diagram, or any other text or symbol anywhere on the label, on the cap, on the vial body, on the background, or anywhere else in the frame. The label is exactly: the single word calilean at the bottom. Nothing else.`,
    `Composition lock: this is a tight medium-close-up macro product still life. The vial is centered exactly in the square frame, exactly equidistant from the left edge and the right edge and from the top edge and the bottom edge. The vial is intentionally LARGE in the frame: it occupies fully 50 percent of the frame width — that is, the vial body is half as wide as the frame is wide — and roughly 80 percent of the frame height. Crop in tight; the vial is the dominant subject and fills most of the frame. There is roughly 25 percent empty cream-toned linen visible to the left of the vial and roughly 25 percent empty cream-toned linen visible to the right of the vial. The cap top sits roughly 8 percent below the top edge of the frame; the bottom of the vial sits roughly 8 percent above the bottom edge of the frame. The vial body must NOT appear small, distant, or surrounded by large empty negative space — it is a bold, near-full-frame hero. No part of the label, the cap, or the vial body touches or extends past any edge of the frame.`,
    `No other props, no decoration, no other objects in the frame, no second vial, no spoon, no pipette, no card, no plant, no leaf, no fabric fold, no shadow object, no landscape, no mountains, no sky, no trees, no buildings, no scenery of any kind beyond the cream linen surface.`,
    `Lighting: cool diffuse daylight from a north-facing window, color temperature about 5400 Kelvin, very soft and even, no harsh shadows, no directional spotlight, no glare on the glass, no flash, low contrast, gentle barely-visible drop shadow directly beneath the vial.`,
    `Style: restrained editorial product photography in the style of an Aesop apothecary catalog crossed with a research bench, premium clinical, document-forward, sharp focus across the entire vial, the wordmark perfectly legible, no motion blur, no bokeh on the subject, no lens flare, no HDR look.`,
    `Strictly do not include: any other text or codes anywhere in the frame beyond the single calilean wordmark described, no people, no hands, no fingers, no faces, no white lab coats, no blue gloves, no beakers, no test tubes, no syringes, no needles, no green or red or blue liquid, no marble, no wood grain, no sand, no gym equipment, no watermark, no instagram orange grading, no neon, no decorative borders, no mockup labels or annotations, no source code, no UI panels, no schema text.`,
  ].join(" ");
}

async function renderOne(label, sharp) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY missing");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${ULTRA_MODEL}:predict`;
  const prompt = buildPrompt();
  await mkdir(RAW_DIR, { recursive: true });
  await writeFile(resolvePath(RAW_DIR, `${label}.prompt.txt`), prompt);
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
    return { label, ok: false, error: `HTTP ${res.status}: ${text.slice(0, 600)}`, elapsed };
  }
  const json = await res.json();
  const pred = json.predictions?.[0];
  if (!pred?.bytesBase64Encoded) {
    return { label, ok: false, error: `no image: ${JSON.stringify(json).slice(0, 400)}`, elapsed };
  }
  const png = Buffer.from(pred.bytesBase64Encoded, "base64");
  const pngPath = resolvePath(RAW_DIR, `${label}.png`);
  await writeFile(pngPath, png);
  let webBytes = null;
  if (sharp) {
    await mkdir(WEB_DIR, { recursive: true });
    const jpg = await sharp(png)
      .resize(1200, null, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    await writeFile(resolvePath(WEB_DIR, `${label}.jpg`), jpg);
    webBytes = jpg.length;
  }
  return { label, ok: true, pngBytes: png.length, webBytes, elapsed };
}

async function main() {
  if (!process.env.GOOGLE_API_KEY) {
    console.error("error: GOOGLE_API_KEY missing — source _default/.env.secrets first");
    process.exit(2);
  }
  const sharp = tryLoadSharp();
  if (!sharp) console.error("warn: sharp not available — skipping web jpg conversion");
  const results = [];
  for (let i = 1; i <= CANDIDATE_COUNT; i += 1) {
    const label = `master-vial.cand-${String(i).padStart(2, "0")}`;
    process.stderr.write(`[${label}] ULTRA ... `);
    try {
      const r = await renderOne(label, sharp);
      results.push(r);
      process.stderr.write(r.ok ? `ok ${r.elapsed}s\n` : `FAIL ${r.elapsed}s :: ${r.error}\n`);
    } catch (err) {
      results.push({ label, ok: false, error: err?.message || String(err), elapsed: "?" });
      process.stderr.write(`FAIL :: ${err?.message || err}\n`);
    }
  }
  const ok = results.filter((r) => r.ok).length;
  console.log(JSON.stringify({ model: ULTRA_MODEL, candidates: CANDIDATE_COUNT, ok, fail: results.length - ok, items: results.map((r) => ({ label: r.label, ok: r.ok, elapsed: r.elapsed, pngBytes: r.pngBytes ?? null, webBytes: r.webBytes ?? null, error: r.error || null })) }, null, 2));
  if (results.length - ok > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`fatal: ${err?.message || err}`);
  process.exit(1);
});
