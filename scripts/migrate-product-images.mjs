#!/usr/bin/env node
// Surgical Medusa v2 Admin-API update of `thumbnail` + `images[]` for the
// 8 CaliLean launch SKUs after a storefront imagery refresh. Does NOT seed,
// does NOT delete unrelated records — only PATCHes the targeted products.
//
// Contract: SKA-42 — Imagery v1 swap (parent SKA-20).
// Auth: POST /auth/user/emailpass → bearer token → POST /admin/products/{id}.
//
// Usage:
//   scripts/migrate-product-images.mjs --dry-run
//   scripts/migrate-product-images.mjs \
//     --backend-url https://api.calilean.bio \
//     --public-base https://calilean.bio
//
// Env (read from process env or backend/.env):
//   MEDUSA_BACKEND_URL        default http://localhost:9000
//   MEDUSA_ADMIN_EMAIL        required
//   MEDUSA_ADMIN_PASSWORD     required
//   STOREFRONT_PUBLIC_URL     default https://calilean.bio
//
// Flags:
//   --dry-run        Print resolved URLs and target product ids; do not write.
//   --backend-url    Override MEDUSA_BACKEND_URL.
//   --public-base    Override STOREFRONT_PUBLIC_URL.
//   --only <handle>  Restrict to a single product handle (debug).

import { existsSync, readFileSync } from "node:fs";
import { resolve as resolvePath } from "node:path";
import { parseArgs } from "node:util";
import { fileURLToPath } from "node:url";

const HERE = fileURLToPath(new URL(".", import.meta.url));
const REPO_ROOT = resolvePath(HERE, "..");

const BACKEND_ENV = resolvePath(REPO_ROOT, "backend", ".env");
if (existsSync(BACKEND_ENV)) {
  for (const line of readFileSync(BACKEND_ENV, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m) continue;
    if (m[1].startsWith("#")) continue;
    if (process.env[m[1]] !== undefined) continue;
    let val = m[2];
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    process.env[m[1]] = val;
  }
}

// 8 launch SKUs. Handle is the Medusa product handle; folder is the
// storefront/public/brand/products/<folder>/pdp-primary.jpg path. They
// diverge for the cjc blend (handle is `cjc-1295-...`, folder is the
// pre-existing truncated `cjc-12-...` slug).
const LAUNCH_SKUS = [
  { handle: "bpc-157", folder: "bpc-157" },
  { handle: "bpc-157-tb-500-blend", folder: "bpc-157-tb-500-blend" },
  { handle: "cjc-1295-no-dac-ipamorelin-blend", folder: "cjc-12-no-dac-ipamorelin-blend" },
  { handle: "glutathione", folder: "glutathione" },
  { handle: "mots-c", folder: "mots-c" },
  { handle: "nad", folder: "nad" },
  { handle: "retatrutide", folder: "retatrutide" },
  { handle: "tb-500", folder: "tb-500" },
];

function fail(msg) {
  console.error(`error: ${msg}`);
  process.exit(2);
}

async function authToken(backendUrl, email, password) {
  const res = await fetch(`${backendUrl}/auth/user/emailpass`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    fail(`auth failed: ${res.status} ${res.statusText} — ${await res.text()}`);
  }
  const data = await res.json();
  if (!data.token) fail(`auth response missing token: ${JSON.stringify(data)}`);
  return data.token;
}

async function findProductByHandle(backendUrl, token, handle) {
  const url = new URL(`${backendUrl}/admin/products`);
  url.searchParams.set("handle", handle);
  url.searchParams.set("limit", "1");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    fail(`list failed for handle "${handle}": ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  const product = data.products?.[0];
  if (!product) return null;
  return product;
}

async function updateProductImages(backendUrl, token, productId, payload) {
  const res = await fetch(`${backendUrl}/admin/products/${productId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    fail(`update failed for ${productId}: ${res.status} ${await res.text()}`);
  }
  return res.json();
}

async function main() {
  const { values } = parseArgs({
    options: {
      "dry-run": { type: "boolean", default: false },
      "backend-url": { type: "string" },
      "public-base": { type: "string" },
      only: { type: "string" },
      help: { type: "boolean", short: "h", default: false },
    },
    strict: true,
    allowPositionals: false,
  });

  if (values.help) {
    console.log(
      "Usage: scripts/migrate-product-images.mjs [--dry-run] [--backend-url URL] [--public-base URL] [--only HANDLE]",
    );
    process.exit(0);
  }

  const backendUrl = (values["backend-url"] || process.env.MEDUSA_BACKEND_URL || "http://localhost:9000").replace(/\/$/, "");
  const publicBase = (values["public-base"] || process.env.STOREFRONT_PUBLIC_URL || "https://calilean.bio").replace(/\/$/, "");

  const targets = values.only
    ? LAUNCH_SKUS.filter((s) => s.handle === values.only)
    : LAUNCH_SKUS;
  if (targets.length === 0) fail(`--only "${values.only}" did not match any launch SKU`);

  const plan = targets.map((sku) => ({
    handle: sku.handle,
    folder: sku.folder,
    url: `${publicBase}/brand/products/${sku.folder}/pdp-primary.jpg`,
  }));

  console.log(`Backend: ${backendUrl}`);
  console.log(`Public base: ${publicBase}`);
  console.log(`Targets: ${plan.length}`);
  for (const p of plan) {
    console.log(`  ${p.handle.padEnd(40)} → ${p.url}`);
  }

  if (values["dry-run"]) {
    console.log("\n[dry-run] Skipping auth + writes.");
    return;
  }

  const email = process.env.MEDUSA_ADMIN_EMAIL;
  const password = process.env.MEDUSA_ADMIN_PASSWORD;
  if (!email) fail("missing env: MEDUSA_ADMIN_EMAIL");
  if (!password) fail("missing env: MEDUSA_ADMIN_PASSWORD");

  const token = await authToken(backendUrl, email, password);
  console.log("\nAuthenticated. Patching products…");

  const results = [];
  for (const p of plan) {
    const product = await findProductByHandle(backendUrl, token, p.handle);
    if (!product) {
      console.warn(`  skip ${p.handle}: no product with that handle in this Medusa instance`);
      results.push({ handle: p.handle, status: "missing" });
      continue;
    }
    await updateProductImages(backendUrl, token, product.id, {
      thumbnail: p.url,
      images: [{ url: p.url }],
    });
    console.log(`  ✓ ${p.handle.padEnd(40)} (${product.id})`);
    results.push({ handle: p.handle, status: "updated", productId: product.id });
  }

  const updated = results.filter((r) => r.status === "updated").length;
  const missing = results.filter((r) => r.status === "missing").length;
  console.log(`\nDone. updated=${updated} missing=${missing} total=${results.length}`);
}

main().catch((err) => {
  console.error(`error: ${err?.message || err}`);
  process.exit(1);
});
