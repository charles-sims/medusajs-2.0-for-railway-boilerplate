# CaliLean Documentation

## Structure

```
docs/
├── brand/              # Visual assets — logos, favicon, imagery, archive
├── strategy/           # Positioning, voice, copy, launch plan, product lineup
├── compliance/         # Legal posture, C&D playbook, state matrix
├── ops/                # Runbooks, SKU system, technical audits
├── generators/         # Source-generated deliverables (brand book, deck, drive sync)
└── superpowers/        # Sprint plans and design specs
    ├── plans/
    └── specs/
```

## Brand

Visual assets and archived materials.

- [Logo Assets](brand/logo/master/) — wordmark, favicon, black/white variants
- [Imagery](brand/imagery/) — product renders, templates, prompts
- [Archive](brand/archive/) — retired assets

## Strategy

Positioning, voice, and go-to-market docs (locked).

- [Identity Brief](strategy/identity-brief.md) — positioning, voice pillars, color/type system (v1.4)
- [Storefront Copy](strategy/storefront-copy.md) — paste-ready copy for all surfaces (v1.2)
- [Launch Narrative](strategy/launch-narrative.md) — 90-day launch arc and campaign beats
- [Product Architecture](strategy/product-architecture.md) — 33 SKUs, pricing, categories
- [Channel Strategy](strategy/channel-strategy.md) — 30-day calendar, venues, email flows

## Compliance

- [C&D Playbook](compliance/cd-playbook.md) — response decision tree, 4 buckets
- [Counsel Questions](compliance/counsel-questions.md) — 14 pre-built lawyer questions
- [State RUO Posture](compliance/state-ruo-posture.md) — 10-state legal matrix

## Operations

- [Per-State Suppression](ops/per-state-suppression.md) — hot-fix geo-blocking runbook
- [SKU System](ops/sku-system.md) — compound codes, SKU format
- [Repo Audit](ops/audit-2026-04.md) — April 2026 stack snapshot
- [SKU Mapping](ops/sku-mapping-v1.csv) — product-to-SKU table

## Generators

Source-generated brand deliverables. Build from repo root:

```bash
npm run build:brand-book    # → docs/generators/output/.../CaliLean_Brand_Book.pdf
npm run build:deck          # → docs/generators/output/.../CaliLean_Pitch_Deck.pdf
npm run build:all-docs      # build everything
```

Push to Google Drive:

```bash
npm run drive:push:all           # push all mapped outputs
npm run drive:status             # show sync status
npm run drive:check-conflicts    # check for Drive-side changes
```

## Superpowers

Sprint implementation plans and design specs. Follows [superpowers](https://github.com/anthropics/superpowers) conventions with separate `plans/` and `specs/` directories.
