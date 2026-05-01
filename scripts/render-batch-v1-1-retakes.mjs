#!/usr/bin/env node
// v1.1 retakes — SKA-47.
//   nad     : v1 cap drifted to aluminum/silver with only a thin green ring.
//             NAD+ powder is yellow — Imagen's color-balance fights the cap
//             back toward neutral on this fill. Mitigation per CMO: stronger
//             cap-color language + reference to the rest of the line +
//             imagen-4.0-ultra-generate-001.
//   mots-c  : v1 vial sat ~25% from left edge with the calilean wordmark's
//             leading "c" clipped (read as "alilean"). Mitigation: explicit
//             centering language matching the CL-3R v1 composition,
//             guard against any edge cropping of the label.
//
// Renders multiple candidates per SKU into v1.1/raw/ as {label}.cand-N.png
// plus prompt files. Designer picks the winner and promotes to {label}.png /
// {label}.jpg before committing.

import { writeFile, mkdir } from "node:fs/promises";
import { resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = resolvePath(HERE, "..");
const RENDERS_DIR = resolvePath(REPO_ROOT, "docs/brand/imagery/renders");
const V11_DIR = resolvePath(RENDERS_DIR, "v1.1");
const RAW_DIR = resolvePath(V11_DIR, "raw");
const WEB_DIR = resolvePath(V11_DIR, "web");

function tryLoadSharp() {
  try {
    const r = createRequire("/tmp/render-tools/package.json");
    return r("sharp");
  } catch {
    return null;
  }
}

const STANDARD_MODEL = "imagen-4.0-generate-001";
const ULTRA_MODEL = "imagen-4.0-ultra-generate-001";

function buildNadPrompt() {
  return [
    `An overhead photograph of a single small clear glass research vial (about two milliliters), photographed straight down from directly above, resting on a heavyweight off-white linen-cotton textile in a warm cream off-white tone.`,
    `The vial is sealed with an aluminum crimp cap. The cap top is a clearly saturated muted green — a soft matte forest-green / Eucalyptus sage like the bottle cap on a high-end apothecary tincture. The cap color is mandatory and non-negotiable: it must read as obviously, visibly green at thumbnail size — the same identical green cap color and saturation as every other vial in this product line. Do NOT shift the cap toward silver. Do NOT shift the cap toward aluminum. Do NOT shift the cap toward neutral grey. Do NOT render the cap as bare metal with only a thin green ring around the rim — the entire top face of the cap must be uniformly green. Do NOT desaturate the cap to compensate for any other color in the frame. The cap is solid green across its full top surface. The cap has no logo, no text, no marking on it.`,
    `Inside the vial is a pale beige lyophilized cake, dry, slightly translucent at the edges. The cake color must NOT influence the cap color in any way — they are independent surfaces.`,
    `A clean wraparound paper label in the same warm cream off-white wraps the lower two-thirds of the vial. The label is printed only in dark near-black ink. The label contains exactly four lines of text in this order from top to bottom, with no other lines and no other text on the label whatsoever:`,
    `Line 1 (top of label, small lower-case sans-serif): the wordmark "calilean" by itself, with no trademark symbol after it, no registered-trademark symbol, no monogram, no logomark, no extra letter or icon. Beneath this wordmark a thin near-black hairline rule (a single hairline thickness pen line, not a colored band, not a decorative stripe).`,
    `Line 2 (large low-contrast modern serif): the compound name, which reads exactly: NAD+.`,
    `Then another thin near-black hairline rule (single hairline pen line, not colored).`,
    `Line 3 (fixed-width typewriter style): the dosage line reads "100 mg / vial".`,
    `Line 4 (fixed-width typewriter style, immediately below the dosage line, with no other line between them): the lot designation reads exactly: LOT 24-0410.`,
    `Strictly do not insert any extra alphanumeric code, batch identifier, sample number, hex color value, or any other text line between the compound name and the dosage line. The label is exactly: wordmark, compound, dosage, lot. Nothing else. No invented brand marks, no monogram, no C-logo, no circle-logo, no registered-trademark symbol, no trademark symbol, no copyright symbol, no decorative side text, no rotated wraparound text on the side of the vial.`,
    `Composition: the vial is centered in the square frame, occupying roughly the central third, with at least 35% empty cream-toned linen visible around it. The entire vial including the cap fits inside the frame with comfortable margin on all four sides. No edge of the label or cap touches any edge of the frame.`,
    `No other props, no decoration, no other objects in the frame, no landscape, no mountains, no sky, no trees, no buildings, no scenery of any kind beyond the cream linen surface.`,
    `Lighting: cool diffuse daylight from a north-facing window, color temperature about 5400 Kelvin, very soft and even, no harsh shadows, no directional spotlight, no glare on the glass, no flash, low contrast.`,
    `Style: restrained editorial product photography in the style of an Aesop apothecary catalog crossed with a research bench, premium clinical, document-forward, sharp focus across the entire vial, the label perfectly legible, no motion blur, no bokeh on the subject, no lens flare, no HDR look.`,
    `Strictly do not include: any other text or codes anywhere in the frame beyond the four label lines described, no people, no hands, no fingers, no faces, no white lab coats, no blue gloves, no beakers, no test tubes, no syringes, no needles, no green or red or blue liquid, no gradient backdrops, no marble, no wood grain, no sand, no gym equipment, no watermark, no instagram orange grading, no neon, no decorative borders, no mockup labels or annotations, no source code, no UI panels, no schema text.`,
  ].join(" ");
}

function buildMotsCPrompt() {
  return [
    `An overhead photograph of a single small clear glass research vial (about two milliliters), photographed straight down from directly above, resting on a heavyweight off-white linen-cotton textile in a warm cream off-white tone.`,
    `The vial is sealed with an aluminum crimp cap. The cap top is a clearly saturated muted green — a soft matte forest-green / Eucalyptus sage matching the cap on every other vial in this product line. The cap color is mandatory: must read as obviously green, the entire top face uniformly green, not silver, not aluminum, not neutral grey. The cap has no logo, no text, no marking on it.`,
    `Inside the vial is a pale beige lyophilized cake, dry, slightly translucent at the edges.`,
    `A clean wraparound paper label in the same warm cream off-white wraps the lower two-thirds of the vial. The label is printed only in dark near-black ink. The label contains exactly four lines of text in this order from top to bottom, with no other lines and no other text on the label whatsoever:`,
    `Line 1 (top of label, small lower-case sans-serif): the wordmark "calilean" by itself, with no trademark symbol after it, no registered-trademark symbol, no monogram, no logomark, no extra letter or icon. The wordmark must be fully legible with the leading "c" clearly visible — every letter c, a, l, i, l, e, a, n is rendered in full and is not clipped, cropped, cut off, or covered by the curve of the vial or the edge of the label or the edge of the frame. Beneath this wordmark a thin near-black hairline rule.`,
    `Line 2 (large low-contrast modern serif): the compound name, which reads exactly: MOTS-C.`,
    `Then another thin near-black hairline rule.`,
    `Line 3 (fixed-width typewriter style): the dosage line reads "10 mg / vial".`,
    `Line 4 (fixed-width typewriter style, immediately below the dosage line, with no other line between them): the lot designation reads exactly: LOT 24-0356.`,
    `Strictly do not insert any extra alphanumeric code, batch identifier, sample number, hex color value, or any other text line between the compound name and the dosage line. The label is exactly: wordmark, compound, dosage, lot. Nothing else. No invented brand marks, no monogram, no C-logo, no circle-logo, no registered-trademark symbol, no trademark symbol, no copyright symbol, no decorative side text, no rotated wraparound text on the side of the vial.`,
    `Composition is critical. The vial is positioned dead center in the square frame, exactly equidistant from the left edge and the right edge of the frame, exactly equidistant from the top edge and the bottom edge of the frame. The vial occupies roughly the central third of the frame. There is at least 35% empty cream-toned linen visible around the vial on every side. The entire vial including the cap fits comfortably inside the frame with generous margin on all four sides. No part of the vial, no part of the cap, and no part of the label may touch or extend past any edge of the frame. The complete "calilean" wordmark, including its leading "c" and its trailing "n", is fully visible on the front face of the label and is not cropped by the curvature of the vial.`,
    `No other props, no decoration, no other objects in the frame, no landscape, no mountains, no sky, no trees, no buildings, no scenery of any kind beyond the cream linen surface.`,
    `Lighting: cool diffuse daylight from a north-facing window, color temperature about 5400 Kelvin, very soft and even, no harsh shadows, no directional spotlight, no glare on the glass, no flash, low contrast.`,
    `Style: restrained editorial product photography in the style of an Aesop apothecary catalog crossed with a research bench, premium clinical, document-forward, sharp focus across the entire vial, the label perfectly legible, no motion blur, no bokeh on the subject, no lens flare, no HDR look.`,
    `Strictly do not include: any other text or codes anywhere in the frame beyond the four label lines described, no people, no hands, no fingers, no faces, no white lab coats, no blue gloves, no beakers, no test tubes, no syringes, no needles, no green or red or blue liquid, no gradient backdrops, no marble, no wood grain, no sand, no gym equipment, no watermark, no instagram orange grading, no neon, no decorative borders, no mockup labels or annotations, no source code, no UI panels, no schema text.`,
  ].join(" ");
}

const TARGETS = [
  { label: "pdp-primary-nad",    candidate: 1, model: STANDARD_MODEL, prompt: buildNadPrompt() },
  { label: "pdp-primary-nad",    candidate: 2, model: STANDARD_MODEL, prompt: buildNadPrompt() },
  { label: "pdp-primary-nad",    candidate: 3, model: ULTRA_MODEL,    prompt: buildNadPrompt() },
  { label: "pdp-primary-mots-c", candidate: 1, model: STANDARD_MODEL, prompt: buildMotsCPrompt() },
  { label: "pdp-primary-mots-c", candidate: 2, model: STANDARD_MODEL, prompt: buildMotsCPrompt() },
  { label: "pdp-primary-mots-c", candidate: 3, model: STANDARD_MODEL, prompt: buildMotsCPrompt() },
];

async function renderOne(item, sharp) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY missing");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${item.model}:predict`;
  const slug = `${item.label}.cand-${item.candidate}`;
  await mkdir(RAW_DIR, { recursive: true });
  await writeFile(resolvePath(RAW_DIR, `${slug}.prompt.txt`), item.prompt);
  const t0 = Date.now();
  const res = await fetch(url, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt: item.prompt }],
      parameters: { sampleCount: 1, aspectRatio: "1:1", personGeneration: "dont_allow" },
    }),
  });
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  if (!res.ok) {
    const text = await res.text();
    return { item, slug, ok: false, error: `HTTP ${res.status}: ${text.slice(0, 400)}`, elapsed };
  }
  const json = await res.json();
  const pred = json.predictions?.[0];
  if (!pred?.bytesBase64Encoded) {
    return { item, slug, ok: false, error: `no image: ${JSON.stringify(json).slice(0, 400)}`, elapsed };
  }
  const png = Buffer.from(pred.bytesBase64Encoded, "base64");
  await writeFile(resolvePath(RAW_DIR, `${slug}.png`), png);
  let webBytes = null;
  if (sharp) {
    await mkdir(WEB_DIR, { recursive: true });
    const jpg = await sharp(png)
      .resize(1200, null, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    await writeFile(resolvePath(WEB_DIR, `${slug}.jpg`), jpg);
    webBytes = jpg.length;
  }
  return { item, slug, ok: true, pngBytes: png.length, webBytes, elapsed };
}

async function main() {
  if (!process.env.GOOGLE_API_KEY) {
    console.error("error: GOOGLE_API_KEY missing — source _default/.env.secrets first");
    process.exit(2);
  }
  const sharp = tryLoadSharp();
  if (!sharp) {
    console.error("warn: sharp not available — skipping web jpg conversion");
  }
  const results = [];
  for (const item of TARGETS) {
    const slug = `${item.label}.cand-${item.candidate}`;
    process.stderr.write(`[${slug} :: ${item.model.includes("ultra") ? "ULTRA" : "standard"}] ... `);
    try {
      const r = await renderOne(item, sharp);
      results.push(r);
      process.stderr.write(r.ok ? `ok ${r.elapsed}s\n` : `FAIL ${r.elapsed}s :: ${r.error}\n`);
    } catch (err) {
      results.push({ item, slug, ok: false, error: err?.message || String(err), elapsed: "?" });
      process.stderr.write(`FAIL :: ${err?.message || err}\n`);
    }
  }
  const ok = results.filter((r) => r.ok).length;
  console.log(JSON.stringify({ ok, fail: results.length - ok, items: results.map((r) => ({ slug: r.slug, model: r.item.model, ok: r.ok, elapsed: r.elapsed, pngBytes: r.pngBytes ?? null, webBytes: r.webBytes ?? null, error: r.error || null })) }, null, 2));
  if (results.length - ok > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`fatal: ${err?.message || err}`);
  process.exit(1);
});
