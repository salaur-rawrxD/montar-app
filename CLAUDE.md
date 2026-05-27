# Montar App

## Overview
Progressive Web App for car-hauler load planning: reads VINs from a Bill of Lading, optimizes slot assignments on a multi-car trailer, guides the driver through yard loading, and logs the completed run. Mobile-first, offline-capable, Supabase-optional.

## Tech Stack
- **Framework**: React 18.3 (JSX, no TS) — Vite 5.4 build
- **Language**: JavaScript (ES modules)
- **State Management**: Zustand 5 — single store at [src/app/state/loadSessionStore.js](src/app/state/loadSessionStore.js)
- **Routing**: Custom screen switcher via `currentScreen` in store + `SCREEN_MAP` ([src/app/routes.jsx](src/app/routes.jsx)) — no react-router
- **Styling**: Plain CSS — tokens in [src/styles/tokens.css](src/styles/tokens.css), components in [src/styles/app.css](src/styles/app.css). No Tailwind, no CSS-in-JS.
- **PWA**: `vite-plugin-pwa` (Workbox) — manifest inline in [vite.config.js](vite.config.js)
- **Database**: Supabase (optional) — `@supabase/supabase-js` + `@supabase/ssr`. Falls back to `localStorage`.
- **Edge Functions**: Deno-based Supabase Functions in [supabase/functions/](supabase/functions/)
- **Testing**: Playwright e2e + Node integration scripts
- **Deployment**: Not yet wired (`.vercel/` is gitignored — Vercel intent)

## Project Structure

```
src/
├── main.jsx                       # ReactDOM entry; imports tokens.css + app.css
├── app/
│   ├── App.jsx                    # Screen switcher; reads currentScreen from store
│   ├── routes.jsx                 # SCREEN_MAP: screen id → component
│   └── state/loadSessionStore.js  # Zustand — nav, rig, vehicles, plan, sync
├── pages/                         # One .jsx per screen (Splash, RigPicker, Dashboard, ScanLoadSheet, DecodeVehicles, LoadPlan, WarningReview, YardMapPage, LoadConfirm, DeliveryPage, LoadHistory, Settings)
├── components/
│   ├── common/                    # Button, Badge, Card, SyncStatus
│   ├── shell/                     # AppShell, MobileFrame, TopBar, BottomNav
│   ├── planning/                  # TrailerMap, SlotCard, OverridePanel, LoadPlanSummary
│   ├── scan/                      # LoadSheetCapture, VinReviewList
│   └── maps/                      # YardMap, DeliveryMap (SVG, no network)
├── data/                          # Mock seeds: mockVehicles, mockLoads, trailerConfigs, sampleYards, sampleDealers
├── logic/                         # Pure functions: vinParser, scoringEngine, loadPlanner, dotCompliance, yardPlanner, deliveryPlanner, loadingSequence, rigValidation, vehicleMatcher
├── services/                      # I/O: supabaseClient (null-safe), loadSessionService, nhtsaService, vehicleSpecsService
└── styles/                        # tokens.css + app.css (~64KB single sheet)
supabase/functions/                # decode-vehicle-specs, extract-load-sheet (Deno)
tests/e2e/                         # Playwright (ui-audit.spec.js — 4 viewports × 17 screenshots)
scripts/                           # test-supabase.js, test-nhtsa.js, test-auto-dev-specs.js
docs/                              # build-status.md, ui-audit.md
```

## Key Commands
```bash
npm run dev               # Vite dev server on :5173 (hot reload, PWA active)
npm run build             # Production build to dist/
npm run preview           # Serve the built dist/
npm run test:e2e          # Playwright (auto-starts dev server)
npm run test:ui-audit     # 17-screenshot mobile/desktop audit
npm run test:supabase     # Verify .env.local + table access (Node script)
npm run test:nhtsa        # Probe NHTSA vPIC VIN-decode API
npm run test:auto-dev     # Probe Auto.dev via Supabase edge function
```

## Important Conventions
- **No TypeScript.** All source is `.jsx` / `.js`. Do not introduce TS, JSDoc-as-types, or `.d.ts` files.
- **Single Zustand store.** Nav, rig, vehicles, plan, and sync state all live in `loadSessionStore.js`. Don't add Context providers, second stores, or Redux.
- **No client-side router.** Navigation = `useStore.goTo(screenId)`. Screen ids are the keys in `SCREEN_MAP`.
- **`src/logic/` is pure.** No React imports, no fetch, no localStorage. Pure functions only.
- **`src/services/` owns I/O.** Anything touching `fetch`, Supabase, or `localStorage` belongs here.
- **Supabase is additive.** `supabaseClient` exports `null` when env vars are missing — guard with `isSupabaseEnabled()` on every call.
- **Offline-first.** Writes hit `localStorage` first; Supabase sync is best-effort and updates `syncStatus` in the store.
- **CSS in two files.** Edit `tokens.css` for design tokens (colors, spacing, fonts) and `app.css` for component styles. No CSS Modules, no Tailwind, no styled-components.
- **Mock data is the demo path.** `src/data/*.js` files seed flows when no real input is supplied — they are not test fixtures.

## Configuration Highlights
- [vite.config.js](vite.config.js) — PWA manifest (name `MONTAR`, theme `#0B1726`), Workbox runtime caching for Google Fonts only (Supabase/NHTSA are network-first), `envPrefix: ['VITE_', 'NEXT_PUBLIC_']` so the same `.env.local` works for a future Next.js layer
- [playwright.config.js](playwright.config.js) — chromium only, baseURL `http://localhost:5173`, reuses an existing dev server
- No `tsconfig.json`, no `.eslintrc`, no `prettier` config — keep it that way unless asked

## Key Environment Variables
```
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon key>
```
- Only the **anon** key (never `service_role`) — it ships to the browser.
- Edge function reads `AUTO_DEV_API_KEY` from Supabase Vault (server-side only).
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` are also accepted as fallbacks.

## Common Workflows

### Add a new screen
1. Create `src/pages/MyScreen.jsx` (default-export a React component).
2. Register it in [src/app/routes.jsx](src/app/routes.jsx): `myscreen: MyScreen`.
3. Navigate to it from anywhere: `useStore.getState().goTo('myscreen')`.
4. Add any new state slices to `loadSessionStore.js` — don't create a parallel store.

### Add a new piece of business logic
1. Add a pure function in `src/logic/` (no React, no I/O).
2. Import it from the store action that orchestrates the flow, not from a component.

### Persist a new field to Supabase
1. ALTER the relevant table (DDL lives in [README.md](README.md#L68-L168)).
2. Extend the matching mapper in [src/services/loadSessionService.js](src/services/loadSessionService.js).
3. Verify with `npm run test:supabase`.

### Edit styling
1. Token (color/spacing/font) → [src/styles/tokens.css](src/styles/tokens.css).
2. Component style → [src/styles/app.css](src/styles/app.css). Class names are kebab-case, scoped by component prefix.

## Known Issues / Gotchas
- **PWA install on iOS** needs a PNG `apple-touch-icon`. Until it's generated from [icon.svg](icon.svg), iOS uses a page screenshot for the home-screen icon.
- **Chrome install prompt requires HTTPS.** `http://localhost` won't trigger it — use the Codespaces forwarded HTTPS URL.
- **`app.css` is one ~64KB file** — search before adding; many utility-ish classes already exist.
- **Supabase Edge Functions are Deno**, not Node. They cannot import from `src/`. Type errors there are TS but the rest of the project is JS.
- **`pwa-standalone` class** is set once on mount ([src/app/App.jsx:13](src/app/App.jsx#L13)) — a runtime display-mode change won't update it.
- **`scanSheetObjectUrl`** must be `URL.revokeObjectURL`'d before being replaced (already handled in the store — don't leak).
- **`navigator.vibrate` is wrapped in try/catch** (`haptic()` helper) — Safari throws. Don't call it directly.

## Dependencies to Know
- **`zustand`** — the entire app state. Read with `useStore((s) => s.field)`; mutate via store actions.
- **`@supabase/supabase-js`** — client. Imported once in `supabaseClient.js`, used everywhere through that null-safe export.
- **`vite-plugin-pwa`** — owns the service worker and `manifest.webmanifest`. Don't add a separate manifest file in `public/`.
- **`@vitejs/plugin-react`** — JSX/Fast Refresh. No Babel config of our own.
- **`@playwright/test`** — e2e + UI audit. No Jest/Vitest; integration probes are plain Node scripts.

## File Naming & Organization
- React components: `PascalCase.jsx` (`LoadPlan.jsx`, `TrailerMap.jsx`).
- Logic / services / data / store: `camelCase.js` (`loadPlanner.js`, `loadSessionService.js`).
- One screen per file in `src/pages/`. One reusable widget per file in `src/components/<group>/`.
- Component-group folders (`common`, `shell`, `planning`, `scan`, `maps`) reflect intended use, not technical role.
- CSS lives in two global files — do not co-locate `.module.css` next to components.

## Deployment & Environment
- **Local**: `npm install && npm run dev` → http://localhost:5173. Node 20+.
- **Codespaces**: container builds via [.devcontainer](.devcontainer/), `npm install` runs automatically, dev server on the forwarded port.
- **Production**: not yet configured. `dist/` is the static build output; `.vercel/` is gitignored.
- **Supabase Edge Functions**: deploy via `supabase functions deploy <name>` (CLI required, see [README.md](README.md#L284-L298)).
- **Env vars** required: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` (both optional — app degrades to localStorage-only). Edge-function-side: `AUTO_DEV_API_KEY` in Supabase Vault.

## How to Help Me Work Faster
1. **Never propose TypeScript, Tailwind, react-router, Redux, or new state libraries.** This stack is a deliberate choice — point to existing patterns instead.
2. **Trace the flow before editing.** Most features cross `pages → store action → logic (pure) → service (I/O)`. Land changes in the right layer; don't put fetches in components or React in `logic/`.
3. **Guard every Supabase call** with `isSupabaseEnabled()` (or the existing service wrappers). Treat the null client as a normal runtime state, not an error.
4. **Reuse classes from [app.css](src/styles/app.css)** before inventing new ones; grep the stylesheet first. New tokens go in `tokens.css`.
5. **Don't auto-run destructive commands.** Migrations, force-pushes, and `supabase functions deploy` need explicit user confirmation — they affect shared cloud state.
6. **When showing a UI change works, actually run `npm run dev`** and verify in a browser before reporting done — type-checks alone can't validate a JS-only project.