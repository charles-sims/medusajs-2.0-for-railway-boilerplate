# CaliLean Documentation

## Brand
- [Identity Brief](brand/identity-brief.md) — Positioning, voice, visual direction (v1.4, locked)
- [Storefront Copy](brand/storefront-copy.md) — Paste-ready copy for all surfaces (v1.2)
- [Launch Narrative](brand/launch-narrative.md) — 90-day launch arc and campaign beats
- [Product Architecture](brand/product-architecture.md) — 33 SKUs, pricing, categories
- [Channel Strategy](brand/channel-strategy.md) — 30-day calendar, venues, email flows
- [Logo Assets](brand/logo/master/) — Wordmark PNG, favicon, black/white variants
- [Archive](brand/archive/) — Retired wordmark brief, old render versions

## Compliance
- [C&D Playbook](compliance/cd-playbook.md) — Response decision tree, 4 buckets
- [Counsel Questions](compliance/counsel-questions.md) — 14 pre-built lawyer questions
- [State RUO Posture](compliance/state-ruo-posture.md) — 10-state legal matrix

## Operations
- [Per-State Suppression](ops/per-state-suppression.md) — Hot-fix geo-blocking runbook
- [SKU System](ops/sku-system.md) — Compound codes, SKU format

## Technical
- [Repo Audit](technical/audit-2026-04.md) — April 2026 stack snapshot
- [SKU Mapping](technical/sku-mapping-v1.csv) — Product-to-SKU table

## Generated Deliverables

Build from `src/`:

```bash
npm run build:brand-book    # → output/internal/brand/CaliLean_Brand_Book.pdf
npm run build:deck          # → output/external/deck/CaliLean_Pitch_Deck.pdf
npm run build:all-docs      # Build everything
```

Push to Google Drive:

```bash
npm run drive:push:all              # Push all mapped outputs
npm run drive:status                # Show sync status
npm run drive:check-conflicts       # Check for Drive-side changes
```
