# CaliLean Documentation

```
docs/
├── brand/              # Visual assets + brand book
│   ├── assets/         # logos, favicon, imagery, renders
│   ├── brand-book/     # source HTML + export script + output PDF
│   └── archive/        # retired assets
├── strategy/           # Positioning, voice, copy, launch, product lineup
├── compliance/         # Legal posture, C&D playbook, state matrix
├── ops/                # Runbooks, SKUs, audits
├── deliverables/       # External-facing generated docs
│   └── pitch-deck/     # source HTML + export script + output PDF
├── utils/              # Shared tooling (brand constants, PDF conversion, Drive sync)
└── superpowers/        # Sprint artifacts
    ├── plans/
    └── specs/
```

## Build

```bash
npm run build:brand-book    # → docs/brand/brand-book/CaliLean_Brand_Book.pdf
npm run build:deck          # → docs/deliverables/pitch-deck/CaliLean_Pitch_Deck.pdf
npm run build:all-docs      # build everything
```

## Google Drive Sync

```bash
npm run drive:push:all           # push all mapped outputs
npm run drive:status             # show sync status
npm run drive:check-conflicts    # check for Drive-side changes
```
