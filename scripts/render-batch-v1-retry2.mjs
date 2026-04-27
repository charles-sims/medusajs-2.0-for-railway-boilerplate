#!/usr/bin/env node
// v1 retry pass 2 — re-render the 2 SKUs still failing after pass-2 retry:
//   bpc-157     : transient 503 (Imagen decode timeout) — just re-roll.
//   glutathione : "Monospce" gibberish line — Imagen rendered the literal word
//                 "monospace" from the prompt onto the label as text. Same
//                 prompt-leak failure mode as the hex literals.
// Prompt fix: replaced every "monospace" with "fixed-width typewriter style"
// so there is no copyable word the model can paint as text. This is the same
// pattern as stripping hex literals in pass-2.

import { writeFile, appendFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = resolvePath(HERE, "..");
const RENDERS_DIR = resolvePath(REPO_ROOT, "docs/brand/imagery/renders");
const V1_DIR = resolvePath(RENDERS_DIR, "v1");
const RAW_DIR = resolvePath(V1_DIR, "raw");
const WEB_DIR = resolvePath(V1_DIR, "web");
const LOG_PATH = resolvePath(RENDERS_DIR, "log.md");

function tryLoadSharp() {
  try {
    const r = createRequire("/tmp/render-tools/package.json");
    return r("sharp");
  } catch {
    return null;
  }
}

const MODEL_ID = "imagen-4.0-generate-001";

function buildPrompt({ compound, dosage, lot }) {
  const dosageLine = dosage.includes("/")
    ? `the dosage line printed in fixed-width typewriter style reads "${dosage}"`
    : `the dosage line printed in fixed-width typewriter style reads "${dosage} mg / vial"`;
  return [
    `An overhead photograph of a single small clear glass research vial (about two milliliters), photographed straight down from directly above, resting on a heavyweight off-white linen-cotton textile in a warm cream off-white tone.`,
    `The vial is sealed with an aluminum crimp cap. The cap top is matte sage green, a soft muted desaturated grey-green color (not bright green, not silver, not aluminum, not blue, not yellow). The sage-green cap color is mandatory. The cap has no logo, no text, no marking on it.`,
    `Inside the vial is a pale beige lyophilized cake, dry, slightly translucent at the edges.`,
    `A clean wraparound paper label in the same warm cream off-white wraps the lower two-thirds of the vial. The label is printed only in dark near-black ink. The label contains exactly four lines of text in this order from top to bottom, with no other lines and no other text on the label whatsoever:`,
    `Line 1 (top of label, small lower-case sans-serif): the wordmark "calilean" by itself, with no trademark symbol after it, no registered-trademark symbol, no monogram, no logomark, no extra letter or icon. Beneath this wordmark a thin near-black hairline rule (a single hairline thickness pen line, not a colored band, not a decorative stripe, not blue, not green, not orange).`,
    `Line 2 (large low-contrast modern serif): the compound name, which reads exactly: ${compound}.`,
    `Then another thin near-black hairline rule (single hairline pen line, not colored).`,
    `Line 3 (typewriter-style lettering): ${dosageLine}.`,
    `Line 4 (typewriter-style lettering, immediately below the dosage line, with no other line between them): the lot designation reads exactly: LOT ${lot}.`,
    `Strictly do not insert any extra alphanumeric code, batch identifier, sample number, hex color value, font name, type designation, or any other text line between the compound name and the dosage line, and do not insert any extra label line between the dosage line and the lot line. The label is exactly: wordmark, compound, dosage, lot. Nothing else. No invented brand marks, no monogram, no C-logo, no circle-logo, no ® symbol, no ™ symbol, no copyright symbol, no decorative side text, no rotated wraparound text on the side of the vial.`,
    `Composition: the vial is centered in the square frame, occupying roughly the central third, with at least 35% empty cream-toned linen visible around it. No other props, no decoration, no other objects in the frame, no landscape, no mountains, no sky, no trees, no buildings, no scenery of any kind beyond the cream linen surface.`,
    `Lighting: cool diffuse daylight from a north-facing window, color temperature about 5400 Kelvin, very soft and even, no harsh shadows, no directional spotlight, no glare on the glass, no flash, low contrast.`,
    `Style: restrained editorial product photography in the style of an Aesop apothecary catalog crossed with a research bench, premium clinical, document-forward, sharp focus across the entire vial, the label perfectly legible, no motion blur, no bokeh on the subject, no lens flare, no HDR look.`,
    `Strictly do not include: any other text or codes anywhere in the frame beyond the four label lines described, no people, no hands, no fingers, no faces, no white lab coats, no blue gloves, no beakers, no test tubes, no syringes, no needles, no green or red or blue liquid, no gradient backdrops, no marble, no wood grain, no sand, no gym equipment, no watermark, no instagram orange grading, no neon, no decorative borders, no mockup labels or annotations, no source code, no UI panels, no schema text.`,
  ].join(" ");
}

const TARGETS = [
  { label: "pdp-primary-bpc-157",       aspect: "1:1", meta: { compound: "BPC-157",     dosage: "5",   lot: "24-0312" } },
  { label: "pdp-primary-glutathione",   aspect: "1:1", meta: { compound: "GLUTATHIONE", dosage: "200", lot: "24-0433" } },
];

async function renderOne(item, sharp) {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_API_KEY missing");
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_ID}:predict`;
  const prompt = buildPrompt(item.meta);
  await mkdir(RAW_DIR, { recursive: true });
  await writeFile(resolvePath(RAW_DIR, `${item.label}.prompt.txt`), prompt);
  const t0 = Date.now();
  const res = await fetch(url, {
    method: "POST",
    headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
    body: JSON.stringify({
      instances: [{ prompt }],
      parameters: { sampleCount: 1, aspectRatio: item.aspect, personGeneration: "dont_allow" },
    }),
  });
  const elapsed = ((Date.now() - t0) / 1000).toFixed(1);
  if (!res.ok) {
    const text = await res.text();
    return { item, ok: false, error: `HTTP ${res.status}: ${text.slice(0, 400)}`, elapsed };
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
    const webPath = resolvePath(WEB_DIR, `${item.label}.jpg`);
    const longEdge = item.aspect === "16:9" ? 1600 : 1200;
    const jpg = await sharp(png)
      .resize(longEdge, null, { fit: "inside", withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
    await writeFile(webPath, jpg);
    webBytes = jpg.length;
  }
  return { item, ok: true, pngBytes: png.length, webBytes, elapsed };
}

async function appendLog(results, startedAt) {
  const header = `\n## Run ${startedAt} — v1 retry pass 2 (bpc-157 + glutathione, "monospace" word stripped)\n\nDriver: SKA-40 retry pass 1 caught two more issues. bpc-157 hit a transient Imagen 503 decode timeout — pure infra flake, just re-roll. Glutathione rendered the literal word "Monospce" between dosage and lot — Imagen leaked another prompt word as canvas text. Pass-2 prompt replaces every "monospace" with "fixed-width typewriter style" (no copyable word for the model to paint).\n\n| Label | Model | Aspect | Compound | Lot | Elapsed | Bytes |\n|---|---|---|---|---|---|---|\n`;
  const rows = results
    .filter((r) => r.ok)
    .map((r) => `| ${r.item.label} | standard | ${r.item.aspect} | ${r.item.meta.compound} | ${r.item.meta.lot} | ${r.elapsed}s | ${r.pngBytes ?? "-"}B png / ${r.webBytes ?? "-"}B jpg |`)
    .join("\n");
  const errors = results.filter((r) => !r.ok);
  const errBlock = errors.length
    ? `\n\n**Errors (${errors.length}):**\n` + errors.map((e) => `- \`${e.item.label}\`: ${e.error}`).join("\n")
    : "";
  if (!existsSync(LOG_PATH)) {
    await mkdir(RENDERS_DIR, { recursive: true });
    await writeFile(LOG_PATH, "# CaliLean — render log\n");
  }
  await appendFile(LOG_PATH, header + rows + errBlock + "\n");
}

async function main() {
  if (!process.env.GOOGLE_API_KEY) {
    console.error("error: GOOGLE_API_KEY missing — source _default/.env.secrets first");
    process.exit(2);
  }
  const sharp = tryLoadSharp();
  const startedAt = new Date().toISOString();
  const results = [];
  for (const item of TARGETS) {
    process.stderr.write(`[${item.label}] ... `);
    try {
      const r = await renderOne(item, sharp);
      results.push(r);
      process.stderr.write(r.ok ? `ok ${r.elapsed}s\n` : `FAIL ${r.elapsed}s :: ${r.error}\n`);
    } catch (err) {
      results.push({ item, ok: false, error: err?.message || String(err), elapsed: "?" });
      process.stderr.write(`FAIL :: ${err?.message || err}\n`);
    }
  }
  await appendLog(results, startedAt);
  const ok = results.filter((r) => r.ok).length;
  console.log(JSON.stringify({ ok, fail: results.length - ok, items: results.map((r) => ({ label: r.item.label, ok: r.ok, error: r.error || null })) }, null, 2));
  if (results.length - ok > 0) process.exit(1);
}

main().catch((err) => {
  console.error(`fatal: ${err?.message || err}`);
  process.exit(1);
});
