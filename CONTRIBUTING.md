# Contributing to CaliLean

## Getting Started

1. Clone the repo and install dependencies for both apps:

```bash
cd backend/ && pnpm install
cd ../storefront/ && pnpm install
```

2. Copy environment templates:

```bash
cp backend/.env.template backend/.env
cp storefront/.env.local.template storefront/.env.local
```

3. Configure `DATABASE_URL` in `backend/.env` and `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` in `storefront/.env.local`.

4. Initialize the backend (migrations + seed):

```bash
cd backend/ && pnpm ib
```

5. Start both services:

```bash
# Terminal 1
cd backend/ && pnpm dev

# Terminal 2
cd storefront/ && pnpm dev
```

## Branch Strategy

- `master` — production branch, auto-deploys to Railway
- Feature branches — create from `master`, open a PR when ready

## Making Changes

### Backend (Medusa)

- Custom modules go in `backend/src/modules/`
- Custom API routes go in `backend/src/api/`
- Env vars are loaded via `backend/src/lib/constants.ts`
- All external services are conditionally loaded in `medusa-config.js`

### Storefront (Next.js)

- Pages use the App Router at `storefront/src/app/[countryCode]/`
- Bluum brand components live in `storefront/src/modules/bluum/`
- Data fetching functions are in `storefront/src/lib/data/`
- Path aliases: `@lib/*`, `@modules/*`, `@pages/*`

## Code Quality

```bash
# Lint storefront
cd storefront/ && pnpm lint

# Run E2E tests (requires running backend + storefront)
cd storefront/ && pnpm test-e2e
```

CI runs `pnpm build` and `pnpm lint` for both apps on every PR.

## Pull Request Guidelines

- Keep PRs focused — one feature or fix per PR
- Write a clear description of what changed and why
- Ensure CI passes before requesting review
- Test against the running storefront before marking ready
