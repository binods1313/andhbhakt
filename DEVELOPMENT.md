# Development

Local notes for running and extending the Andhbhakt.org frontend.

Do **not** commit `.env`, `SESSION_SECRET`, `ADMIN_TOKEN`, or database credentials.

## Run locally

Requires **Node.js 24** and **pnpm** (the repo rejects npm/yarn on `pnpm install`).

```bash
pnpm install
cp .env.example .env
```

### Frontend on port 3100 (no API required)

*nix:

```bash
pnpm --filter @workspace/govlens run dev
# or: pnpm run dev
```

PowerShell:

```powershell
$env:PORT = 3100
pnpm --filter @workspace/govlens run dev
```

Opens at **http://localhost:3100/**. Vite defaults to 3100 (`artifacts/govlens/vite.config.ts`). Port 3000 is often used by other local apps.

### Central Schemes without Postgres (mock / offline)

The Central Schemes page (`/schemes` and `/central-schemes`) needs `/api/schemes`. If the API is down, the page shows a banner and an empty state. Load the 8-row sample catalog:

*nix:

```bash
pnpm run dev:mock
```

PowerShell:

```powershell
$env:PORT = 3100
pnpm run dev:mock
```

Then open http://localhost:3100/central-schemes?mockSchemes=1

You can also click **Load sample schemes** on the empty page, or toggle **Use sample schemes (dev)** (shown in `import.meta.env.DEV`). Sample data lives in `artifacts/govlens/src/data/mock/schemes.sample.json` and is marked **FOR DEV ONLY**.

`npm run dev:mock` works the same if you already ran `pnpm install` (it just forwards to the pnpm script).

### Vite `/api` proxy

In development, Vite proxies `/api` → **http://localhost:8080**. Restart the Vite process after pulling this change. Without the proxy, Vite used to return `index.html` for `/api/*` and the schemes page treated HTML as an empty list.

### API (optional — live schemes, CAG, news, admin)

Needs PostgreSQL and `DATABASE_URL` in `.env`. No Cloudflare or Turnstile keys in development.

```bash
pnpm --filter @workspace/db run push
psql "$DATABASE_URL" -f lib/db/seed.sql
```

*nix API start (the package `dev` script uses bash `export`):

```bash
PORT=8080 pnpm --filter @workspace/api-server run dev
```

PowerShell — avoid the bash `export` in `dev`; build then start:

```powershell
$env:NODE_ENV = "development"
$env:PORT = "8080"
pnpm --filter @workspace/api-server run build
pnpm --filter @workspace/api-server run start
```

The API listens on `PORT` (example: 8080). Leave `.env` uncommitted.

### Smoke test

```bash
# frontend already on 3100
pnpm run test:e2e
```

### Build

```bash
pnpm --filter @workspace/govlens run build
pnpm --filter @workspace/govlens run serve   # preview, also port 3100 unless PORT is set
pnpm run typecheck
```

## Design tokens

Tokens live in one place:

| File | Role |
|---|---|
| `artifacts/govlens/src/styles/tokens.css` | CSS custom properties (color, type, space, radius, elevation) |
| `artifacts/govlens/src/styles/tokens.ts` | JS mirror for charts / inline styles |
| `artifacts/govlens/src/index.css` | Tailwind `@theme` mapping + skip-link / focus / reduced-motion |

Use semantic classes (`bg-primary`, `text-muted-foreground`, `rounded-lg`) in components. Do not hard-code hex in new UI.

Palette: navy neutrals + saffron primary, tuned so body text and primary-on-white meet WCAG AA.

## Layout components

| Component | Path | Notes |
|---|---|---|
| `Header` | `artifacts/govlens/src/components/header.tsx` | Skip link, logo, desktop nav, mobile menu, language select |
| `Navbar` | same module | Alias of `Header` |
| `Footer` | `artifacts/govlens/src/components/footer.tsx` | Legal + clone strip |
| `Button` | `artifacts/govlens/src/components/ui/button.tsx` | Token-based variants |
| Cards | `artifacts/govlens/src/components/ui/card.tsx` | shadcn card |

`Header` and `Footer` are mounted once in `artifacts/govlens/src/App.tsx`. Pages should not render their own navbar. Page content sits in `<main id="main-content">`.

## Accessibility

- Skip link is the first focusable control.
- Header is a `<header>`; nav has an accessible name.
- Mobile menu: `aria-expanded`, Escape to close, 44px touch targets.
- `:focus-visible` ring uses `--ring`.
- `document.documentElement.lang` follows the language selector (`en` / `hi`).
- Chrome strings live in `artifacts/govlens/src/locales/{en,hi}.json`.

## Images

- Logo in the header has reserved width/height (`fetchpriority=high`).
- Wikipedia avatars use `loading="lazy"` and `decoding="async"`.
- Unused Inter font request was removed from `index.html` so only Space Grotesk + IBM Plex Mono load.

## i18n

`artifacts/govlens/src/i18n.ts` — i18next, persist key `govlens-lang`. Language selector is in the header.
