# Changelog — CaliLean

> Generated: 2026-04-22 | Window: Full history (no release tags) | 241 commits

**Note:** This project has no release tags. A baseline tag `v0.1.0` is recommended at the current commit to anchor future changelogs.

## Unreleased (all history)

### Features (Bluum Storefront — charles-sims)

- `8a84ae4` — Add Bluum design tokens, Switzer font, brand colors
- `8e2630d` — Replace nav with Bluum branded header
- `91b7055` — Replace footer with Bluum dark branded footer
- `43fe86e` — Replace hero with Bluum branded hero section
- `dbd7b7b` — Add value props and lab banner components
- `0b1d0d2` — Add FAQ accordion component
- `0cb89cc` — Add trust badges, research disclaimer, and product specs table components
- `fc5f05f` — Compose Bluum homepage with hero, lab banner, featured products, value props, FAQ
- `e4f3824` — Restyle product preview card and thumbnail with Bluum design
- `e1de378` — Add 21+ age gate modal to root layout
- `216c121` — Rewrite PDP with Bluum layout — gallery, badges, trust, specs, related
- `716f536` — Restyle store page with Bluum design
- `a723c36` — Add 33 product seed data with metadata for Medusa import

### Fixes

- `6cae80e` — Divide price by 100 for correct USD display

### Chores / Dependencies

- `18ba182` — Merge upstream (rpuls:master) into master
- `b848473` — Update Medusa and storefront dependencies
- `d17e614` — Trigger Railway rebuild for price display fix
- `e3079a9` — Update .gitignore to exclude pnpm store, node_modules, env files

### Documentation

- `d03c6f0` — Update deployment link in README.md

### Upstream (rpuls — 210+ commits)

The majority of commits originate from the upstream boilerplate (`rpuls/medusajs-2.0-for-railway-boilerplate`) and include:
- Medusa 2.x setup and configuration
- MinIO file storage module
- Resend/SendGrid email notification module
- Stripe payment integration
- MeiliSearch product search integration
- Playwright E2E test suite (10 specs)
- Next.js storefront with internationalization
- Railway deployment configuration
