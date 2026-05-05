# Montar Build Status

**Report date:** 2026-05-05  
**Branch:** main  
**Last commit:** Industrial Command design system applied

---

## Current Status Summary

The app has a complete, clickable UI shell and a working end-to-end session flow using hardcoded seed data. Supabase is connected and all 7 tables are accessible. The build passes. The critical missing layer is real data ingestion — OCR, NHTSA, and Auto.dev are all stubs. The app is a functional demo, not yet a production tool.

---

## What Works

- **App shell** — React + Vite SPA with Zustand state. All 10 screens render. Navigation works.
- **Splash** — auto-advances to rig picker after 1.4 s.
- **Rig picker** — 6 real rig configs (Cottrell, Boydstun, Kaufman, Delavan). Scroll-select works.
- **Dashboard** — rig summary, load sheet picker, previous loads list (reads from localStorage).
- **Add load sheet picker** — bottom-sheet modal opens; camera input, file upload input, and sample sheet all work at the UI level.
- **Scan screen** — animated VIN "detection" (timed intervals), shows user photo if uploaded. Advances to decode.
- **VIN review (DecodeVehicles)** — accept-one and accept-all work; disabled continue until all accepted.
- **Load plan generation** — `runLoadPlanner()` + `scoreVehicleForSlot()` assign vehicles to slots by weight and height scoring. Fully logic-driven.
- **DOT weight/height compliance** — `calculateDotCompliance()` checks estimated cargo weight against rig limits and federal 80,000 lb gross, flags tall vehicles. Shows live progress bar.
- **Slot confirmation** — individual confirm or accept-all. "Why this slot?" reasoning panel works.
- **Yard guide map** — SVG map of BNSF Orillia (stalls T042–T073), animated route path, stop-chip queue, mark-loaded CTA.
- **Delivery page** — approach steps, handoff notes, wrap session CTA.
- **Wrap session** — saves to localStorage immediately; fires Supabase sync in background (fire-and-forget).
- **Supabase sync** — `loadSessionService.js` writes to all 7 tables; sync status indicator (`SyncStatus` component) shows local / syncing / saved / failed.
- **localStorage persistence** — previous loads persist across page reloads.
- **PWA manifest** — `manifest.webmanifest` present with name, icons, and `display: standalone`.

---

## What Is Mocked

| Item | File | What it returns |
|---|---|---|
| Vehicle VINs | `src/data/mockVehicles.js` | Always the same 9 Toyota vehicles |
| NHTSA decode | `src/services/nhtsaService.js` | Returns mock data for known VINs; `unknown` for all others |
| Vehicle specs | `src/services/vehicleSpecsService.js` | Returns mock weights/heights for known VINs; estimates 3,800 lb / 60 in for all others |
| Scan animation | `src/pages/ScanLoadSheet.jsx` | Counts to 9 on a timer; no actual image analysis |
| Dashboard metrics | `src/pages/Dashboard.jsx` | "7 loads / week", "~52m avg", "63 units moved" — hardcoded strings |
| Driver name | `src/pages/Dashboard.jsx` | "ADAN ESPURO · SHIFT ACTIVE" — hardcoded |
| Load ref | `src/services/loadSessionService.js:298` | Always `041625-09` in every Supabase `loads` insert |
| Origin | `src/services/loadSessionService.js:299` | Always `BNSF Orillia` in every Supabase `loads` insert |
| Vehicle count in session | `src/app/state/loadSessionStore.js:169` | Hardcoded `9` in `endSession()` |
| Dealer ETA | `src/logic/deliveryPlanner.js` | Always Renton Toyota, 24 min — hardcoded |
| Dealer destination | `src/app/state/loadSessionStore.js:168` | Randomly picked from `SESSION_DEALER_OPTIONS` list |
| Dealer unload time | `src/app/state/loadSessionStore.js:167` | Random 14–40 min |
| Previous loads seed | `src/data/mockLoads.js` | 7 hardcoded historical loads shown when localStorage is empty |
| Yard map layout | `src/components/maps/YardMap.jsx` | BNSF Orillia stalls only, SVG hardcoded coordinates |
| Delivery map | `src/components/maps/DeliveryMap.jsx` | CSS/HTML static layout, no real map API |

---

## What Is Missing

- **Real OCR** — no OCR library (Tesseract, Google Vision, AWS Textract, etc.) exists anywhere in the codebase. Camera/upload inputs do not extract VINs from the image.
- **Real NHTSA API** — `nhtsaService.js` is a stub. The comment says "real implementation calls api.nhtsa.dot.gov" but no HTTP call is made.
- **Real Auto.dev / vehicle specs API** — `vehicleSpecsService.js` is a stub. No Auto.dev key or integration exists.
- **Service worker** — no `sw.js`, no `vite-plugin-pwa` in `vite.config.js`. The manifest exists but the app cannot be installed as a PWA or used offline.
- **Supabase Edge Functions** — no `/supabase` directory. No edge function code anywhere.
- **Vercel / deployment config** — no `vercel.json`, no `.vercel/`, no `netlify.toml`. No CI/CD pipeline.
- **User authentication** — no login, no user record, no session token. Any driver can use any device.
- **Real load ref input** — there is no screen where a driver enters a load reference number before scanning.
- **Real origin/yard selection** — origin and yard are hardcoded; drivers cannot choose a different yard.
- **Multi-yard support** — yard map only knows BNSF Orillia stalls T042–T073. Other yards are not supported.
- **Multi-dealer delivery** — delivery planner always returns Renton Toyota. Multi-stop delivery is scaffolded (`multiStop: false`) but not implemented.
- **Settings page** — `src/pages/Settings.jsx` exists but is not registered in `src/app/routes.jsx`. Unreachable.
- **Load history page** — `src/pages/LoadHistory.jsx` exists but is not registered in `src/app/routes.jsx`. Unreachable.
- **VIN edit** — edit button renders on each VIN card in `DecodeVehicles.jsx` but has no `onClick` handler.
- **`test:auto-dev` script** — does not exist in `package.json`.
- **`test:ocr` script** — does not exist in `package.json`.

---

## What Is Broken or Risky

- **Supabase `loads` insert always writes the same load ref and origin** (`041625-09`, `BNSF Orillia`) regardless of what the driver actually loaded. Every session in the database looks identical on these two fields. See `src/services/loadSessionService.js:297–300`.
- **`endSession()` hardcodes `vehicleCount: 9`** — the actual accepted count is not passed. See `src/app/state/loadSessionStore.js:169`.
- **No service worker = not a real PWA** — the app can run in a browser but cannot be installed, has no offline mode, and will not work without internet. The manifest alone is insufficient.
- **Dashboard metrics are permanently hardcoded** — they will never reflect the driver's actual history even after dozens of completed loads.
- **Playwright test suite times out** in this Codespaces environment — the dev server does not start before the test runner gives up. Screenshots were generated in a prior session but the suite cannot be rerun here without a running dev server.
- **`dangerouslySetInnerHTML` in DeliveryPage** — approach step text uses `dangerouslySetInnerHTML` for HTML formatting. Safe today because the content is a hardcoded constant, but risky if it ever becomes user- or API-supplied data. See `src/pages/DeliveryPage.jsx:43`.

---

## Test Results

| Test | Command | Result |
|---|---|---|
| Production build | `npm run build` | **PASS** — 107 modules, 430 KB JS, 51 KB CSS |
| Supabase connection | `npm run test:supabase` | **PASS** — 7/7 tables accessible |
| UI audit (Playwright) | `npm run test:ui-audit` | **TIMED OUT** — dev server not running in Codespaces env |
| E2E tests | `npm run test:e2e` | **NOT RUN** — same reason as above |
| Auto.dev test | `npm run test:auto-dev` | **MISSING** — script not in `package.json` |
| OCR test | `npm run test:ocr` | **MISSING** — script not in `package.json` |

---

## Environment Variables Needed

| Variable | Status | Purpose |
|---|---|---|
| `VITE_SUPABASE_URL` | **Set** in `.env.local` | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | **Set** in `.env.local` | Supabase publishable key |
| `VITE_GOOGLE_MAPS_API_KEY` | **Missing** | Required for real Google Maps (not currently used) |
| `VITE_NHTSA_API_KEY` | **Not needed yet** | NHTSA API is free/public, no key required |
| `VITE_AUTO_DEV_API_KEY` | **Missing** | Required to activate Auto.dev vehicle specs |
| `VITE_OCR_API_KEY` | **Missing** | Required for any cloud OCR (Google Vision, etc.) |

---

## Supabase Status

**Connected.** All 7 tables are readable with the current anon key.

| Table | Status |
|---|---|
| `loads` | Accessible |
| `load_vehicles` | Accessible |
| `vehicle_specs` | Accessible |
| `load_assignments` | Accessible |
| `yard_stops` | Accessible |
| `delivery_stops` | Accessible |
| `operator_overrides` | Accessible |

The persistence service (`loadSessionService.js`) has full write logic for all tables. The sync is triggered automatically at session end. No edge functions have been deployed. No Row Level Security policy status was checked.

---

## Auto.dev Status

**Not integrated.** `vehicleSpecsService.js` is a stub that returns hardcoded data from `mockVehicles.js`. The comment reads "real implementation would query a vehicle specs DB." No Auto.dev SDK, no API key, no HTTP call exists.

---

## OCR Status

**Not implemented.** The scan screen displays the uploaded image and runs a timed animation counting to 9. It does not read the image. VINs are always loaded from `SEED_VEHICLES`. No OCR library (Tesseract.js, Google Cloud Vision, etc.) is present in `package.json` or anywhere in the source.

---

## Google Maps Status

**Not integrated.** Both maps are custom-built:

- **Yard map** — hand-drawn SVG with hardcoded coordinates for BNSF Orillia stalls T042–T073. Route paths are static SVG `<path>` elements. No Maps API.
- **Delivery map** — CSS `div`-based layout showing a simplified street grid. Static, no real address rendering, no real routing.

No `VITE_GOOGLE_MAPS_API_KEY` is set. No Google Maps SDK appears in `package.json`.

---

## Load Planning Status

**Working (estimated data).** The load planner (`src/logic/loadPlanner.js` + `src/logic/scoringEngine.js`) is fully functional:

- Assigns vehicles to slots by scoring height clearance, weight limits, deck preference (heavy/tall → bottom, light/low → top), and reversed-slot fit.
- Sorts top-deck reversed slot first, then fills by highest score.
- Returns slot assignments with reasoning strings for the "Why this slot?" panel.

Limitation: all vehicle weights and heights come from `mockVehicles.js`. The planner is only as accurate as the data it receives.

---

## DOT Weight/Height Status

**Working (estimated only).** `calculateDotCompliance()` checks:

- Estimated cargo weight vs. rig cargo limit.
- Estimated gross weight vs. federal 80,000 lb limit.
- Tallest vehicle vs. 162-inch (13.5 ft) conservative clearance.

Produces `ok` / `fail` / `warn` status flags and required operator check disclaimers. All weights and heights are from mock data — the operator must verify at scale. This is appropriate and correctly labeled in the UI.

---

## Recommended Next 5 Tasks

1. **Wire real NHTSA VIN decode** — replace the stub in `nhtsaService.js` with a real `fetch()` call to `https://vpic.api.nhtsa.dot.gov/api/vehicles/DecodeVin/{VIN}?format=json`. No API key needed. This makes every scanned VIN produce real year/make/model data.

2. **Fix hardcoded session data in `saveCompleteSession()`** — pass `loadRef` and `origin` dynamically from the store state (the driver should enter or confirm these before scanning). This makes every Supabase `loads` row unique and queryable. See `src/services/loadSessionService.js:297–300`.

3. **Add a service worker** — install `vite-plugin-pwa` and configure a basic cache-first strategy. Without this the app is not installable and has no offline capability, which breaks the core field-use case.

4. **Integrate basic OCR** — add Tesseract.js (`npm install tesseract.js`) and wire it to the file input in `initScanFromFile`. Parse the result for 17-character VIN patterns. Even a rough extraction is better than always returning SEED_VEHICLES.

5. **Register `Settings` and `LoadHistory` pages in routes** — `src/pages/Settings.jsx` and `src/pages/LoadHistory.jsx` both exist and are complete but are unreachable. Add them to `src/app/routes.jsx` and link them from the bottom nav or dashboard.

---

## Do Not Build Yet

- Real-time multi-driver sync (requires auth first)
- Multi-stop delivery routing (requires real dealer data and maps integration)
- Driver performance analytics (requires enough real session data first)
- Push notifications (requires auth + service worker first)
- Auto.dev vehicle specs enrichment (NHTSA is free and covers the same need for now)
- Google Maps integration (the SVG yard map works well enough for the current single-yard demo)

---

## Status Table

| Area | Status | Notes | Next Action |
|---|---|---|---|
| App shell | Working | React + Vite + Zustand, 10 screens, clean build | None needed now |
| PWA | Partial | Manifest present; no service worker, not installable | Add `vite-plugin-pwa` |
| UI flow | Working | Full end-to-end click-through with seed data | None needed now |
| localStorage | Working | Previous loads persist; mockLoads.js handles read/write | None needed now |
| Supabase | Working | Connected; 7 tables accessible; sync fires on session end | Fix hardcoded load ref/origin |
| Auto.dev | Missing | Stub only; no API key, no HTTP call | Defer — use NHTSA first |
| OCR | Missing | Scan is animated simulation; image not read | Add Tesseract.js |
| Google Maps | Missing | SVG/CSS custom maps; no Maps API | Defer — SVG sufficient for now |
| Load planner | Working | Scoring engine assigns vehicles by weight/height | None needed now |
| DOT checks | Working (est.) | Estimates only; labels and disclaimers are correct | None needed now |
| Yard guide | Working (mocked) | BNSF Orillia only; hardcoded SVG stalls | Add real yard entry screen later |
| Delivery | Working (mocked) | Renton Toyota only; hardcoded approach/notes | Add real dealer DB later |
| Playwright | Exists | Prior screenshots in `test-results/`; suite times out in Codespaces | Run manually with `npm run dev` + `npm run test:ui-audit` |
| Vercel | Missing | No `vercel.json`, no deploy pipeline | Add when ready to ship |
