# Montar App

**Load faster. Move more cars.**

A Progressive Web App for car-hauler load planning. Reads VINs from a Bill of Lading, optimizes slot assignments for a multi-car trailer, guides the driver through yard loading, and logs the completed run.

---

## Running in GitHub Codespaces

1. Open this repo on GitHub and click **Code → Codespaces → Create codespace on main**.
2. Wait for the container to build — `npm install` runs automatically.
3. *(Optional)* Add Supabase credentials — see [Supabase Setup](#supabase-setup-optional) below.
4. Start the dev server:
   ```bash
   npm run dev
   ```
5. A notification will appear asking to open the forwarded port. Click **Open in Browser**.
   If it doesn't appear, go to the **Ports** tab, find port `5173`, and click the globe icon.

---

## Running Locally

Requires [Node.js 20+](https://nodejs.org).

```bash
# Install dependencies
npm install

# Start the dev server at http://localhost:5173
npm run dev

# Build for production
npm run build

# Preview the production build
npm run preview
```

---

## Supabase Setup (Optional)

Montar works fully without Supabase — all session data is stored in `localStorage`. Supabase adds cloud persistence so completed loads are saved to a database.

### 1. Create a Supabase project

Go to [supabase.com](https://supabase.com) → New project. Free tier is sufficient.

### 2. Create a `.env.local` file

In the project root, create `.env.local` (never commit this file):

```
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

Both values are in your Supabase project under **Settings → API**.

> **Security note:** Only the `anon` (public) key is used — never the `service_role` key. The anon key is safe to include in client-side code. Row-level security (RLS) should be configured before going to production.

### 3. Create the tables

Run the following SQL in the Supabase **SQL editor** (Dashboard → SQL Editor → New query):

```sql
-- Completed load sessions
CREATE TABLE loads (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  load_ref       text,
  origin         text,
  rig_id         text,
  rig_name       text,
  vehicle_count  int,
  yard_min       int,
  dealer_min     int,
  destination    text,
  status         text    DEFAULT 'completed',
  completed_at   timestamptz DEFAULT now(),
  created_at     timestamptz DEFAULT now()
);

-- Vehicles included on a load
CREATE TABLE load_vehicles (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id      uuid REFERENCES loads(id) ON DELETE CASCADE,
  vin          text    NOT NULL,
  year         int,
  make         text,
  model        text,
  weight_lb    numeric,
  height_in    numeric,
  vehicle_type text,
  dealer_code  text,
  stall_id     text,
  accepted     boolean DEFAULT true
);

-- Slot assignments (the load plan)
CREATE TABLE load_assignments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id    uuid REFERENCES loads(id) ON DELETE CASCADE,
  slot       int     NOT NULL,
  deck       text,
  reversed   boolean DEFAULT false,
  vin        text,
  weight_lb  numeric,
  score      numeric,
  reasoning  text,
  label      text,
  confirmed  boolean DEFAULT false
);

-- Shared vehicle spec cache (upserted by VIN)
CREATE TABLE vehicle_specs (
  vin                text PRIMARY KEY,
  year               int,
  make               text,
  model              text,
  weight_lb          numeric,
  height_in          numeric,
  vehicle_type       text,
  source             text    DEFAULT 'mock',
  operator_verified  boolean DEFAULT false,
  updated_at         timestamptz DEFAULT now()
);

-- Yard stop sequence per load
CREATE TABLE yard_stops (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id      uuid REFERENCES loads(id) ON DELETE CASCADE,
  sequence     int     NOT NULL,
  stall_id     text,
  title        text,
  dist         text,
  walk         text,
  completed    boolean DEFAULT false,
  completed_at timestamptz
);

-- Delivery destinations per load
CREATE TABLE delivery_stops (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id        uuid REFERENCES loads(id) ON DELETE CASCADE,
  sequence       int     NOT NULL,
  dealer_id      text,
  dealer_name    text,
  dealer_address text,
  vehicle_count  int,
  eta_min        int,
  completed      boolean DEFAULT false
);

-- Operator overrides (audit trail when driver overrides Montar's plan)
CREATE TABLE operator_overrides (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  load_id            uuid REFERENCES loads(id) ON DELETE CASCADE,
  slot               int,
  override_type      text,
  original_vin       text,
  override_vin       text,
  driver_note        text,
  risk_acknowledged  boolean DEFAULT false,
  created_at         timestamptz DEFAULT now()
);
```

### 4. Set Row Level Security

For **development / testing**, the simplest option is to allow anonymous access:

```sql
-- Allow anon (unauthenticated) to insert and select on all Montar tables
-- WARNING: use only for development; add proper auth policies before production

ALTER TABLE loads            ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_vehicles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE load_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicle_specs    ENABLE ROW LEVEL SECURITY;
ALTER TABLE yard_stops       ENABLE ROW LEVEL SECURITY;
ALTER TABLE delivery_stops   ENABLE ROW LEVEL SECURITY;
ALTER TABLE operator_overrides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_all" ON loads            FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON load_vehicles    FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON load_assignments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON vehicle_specs    FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON yard_stops       FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON delivery_stops   FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "anon_all" ON operator_overrides FOR ALL TO anon USING (true) WITH CHECK (true);
```

For production, replace the anon policies with driver-scoped auth policies once authentication is added.

### 5. Test the connection (quick check)

Before running the full app, verify your credentials and tables with:

```bash
npm run test:supabase
```

**Where to find your credentials**

In the Supabase dashboard, go to **Settings → API** (left sidebar). Copy:
- **Project URL** → `VITE_SUPABASE_URL`
- **Project API keys → anon / public** → `VITE_SUPABASE_ANON_KEY`

**Create `.env.local` in the project root** (never commit this file):

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

**What success looks like**

```
Montar — Supabase Connection Test
──────────────────────────────────────────────────

[1] Environment variables
  ✓ PASS  VITE_SUPABASE_URL = https://xxxx.supabase.co
  ✓ PASS  VITE_SUPABASE_ANON_KEY = sb_publishable_xxxx…

[2] Table access
  ✓ PASS  loads
  ✓ PASS  load_vehicles
  ✓ PASS  vehicle_specs
  ✓ PASS  load_assignments
  ✓ PASS  yard_stops
  ✓ PASS  delivery_stops
  ✓ PASS  operator_overrides

──────────────────────────────────────────────────
All checks passed. Supabase is connected and all tables are accessible.
```

**Common errors**

| Error message | Fix |
|---|---|
| `VITE_SUPABASE_URL is missing` | Create `.env.local` with both vars |
| `VITE_SUPABASE_ANON_KEY is missing` | Add the anon key to `.env.local` |
| `Table missing or inaccessible` | Run the CREATE TABLE SQL from step 3 above |
| `RLS/policy issue` | Run the CREATE POLICY SQL from step 4 above |
| `Invalid API key` | Wrong anon key — copy it again from Settings → API |
| Wrong project URL | Double-check the Project URL ends in `.supabase.co` |

### 6. Verify with the full app

Start the dev server and run a full session (Splash → Rig → Dashboard → Sample sheet → Yard → Wrap up). After wrapping, the Dashboard header should briefly show **"Saving…"** then **"Saved"**. Check the `loads` table in Supabase Table Editor to confirm the row appeared.

---

## Auto.dev Vehicle Specifications Setup

Auto.dev provides real-time vehicle dimensions and curb weight for load planning and 14 ft height checks. The API is called server-side via a Supabase Edge Function so the API key never reaches the browser.

### Prerequisites

- Supabase project already configured (see [Supabase Setup](#supabase-setup-optional) above)
- Active Auto.dev API account with a valid API key

### 1. Create or rotate your Auto.dev API key

Go to [auto.dev](https://auto.dev), log in, and go to **API Keys** in your dashboard. Create a new key or copy an existing one. You'll use this in the next step.

### 2. Set the Supabase secret

In your Supabase project:

1. Go to **Settings → Secrets and Vault** (left sidebar)
2. Click **+ New secret**
3. Name: `AUTO_DEV_API_KEY`
4. Value: Paste your Auto.dev API key
5. Click **Save**

> **Security note:** Secrets are never visible in logs or to the browser. Only Supabase Edge Functions can read them via `Deno.env.get()`.

### 3. Deploy the Edge Function

The Edge Function is already in `supabase/functions/decode-vehicle-specs/index.ts`. Deploy it:

```bash
supabase functions deploy decode-vehicle-specs
```

If you don't have the Supabase CLI installed:

```bash
npm install -g supabase
supabase login
# (select your Supabase project when prompted)
supabase functions deploy decode-vehicle-specs
```

### 4. Update the vehicle_specs table schema

Run this SQL in the Supabase **SQL Editor** to add new columns for Auto.dev specs:

```sql
ALTER TABLE vehicle_specs ADD COLUMN IF NOT EXISTS trim text;
ALTER TABLE vehicle_specs ADD COLUMN IF NOT EXISTS body_style text;
ALTER TABLE vehicle_specs ADD COLUMN IF NOT EXISTS vehicle_type text;
ALTER TABLE vehicle_specs ADD COLUMN IF NOT EXISTS curb_weight_lb numeric;
ALTER TABLE vehicle_specs ADD COLUMN IF NOT EXISTS length_in numeric;
ALTER TABLE vehicle_specs ADD COLUMN IF NOT EXISTS width_in numeric;
ALTER TABLE vehicle_specs ADD COLUMN IF NOT EXISTS height_in numeric;
ALTER TABLE vehicle_specs ADD COLUMN IF NOT EXISTS ground_clearance_in numeric;
ALTER TABLE vehicle_specs ADD COLUMN IF NOT EXISTS source text DEFAULT 'mock';
ALTER TABLE vehicle_specs ADD COLUMN IF NOT EXISTS confidence text;
ALTER TABLE vehicle_specs ADD COLUMN IF NOT EXISTS needs_verification boolean DEFAULT false;
ALTER TABLE vehicle_specs ADD COLUMN IF NOT EXISTS raw_response jsonb;
```

### 5. Test the integration

```bash
npm run test:auto-dev
```

**Success output:**
```
══════════════════════════════════════════════════
Auto.dev Specs via Supabase Edge Function
══════════════════════════════════════════════════
Supabase URL: https://your-project-id.supabase.co
Function: decode-vehicle-specs

──────────────────────────────────────────────────
Testing: 5TDJKRFH6LS123456
──────────────────────────────────────────────────

✓ Status: auto.dev
✓ Confidence: provider
✓ Needs verification: NO
✓ From cache: NO
✓ Time: 342ms

  Year: 2020
  Make: Toyota
  Model: Highlander
  Curb weight: 4860 lbs
  Length: 194"
  Width: 76"
  Height: 68"
  Ground clearance: 9"

══════════════════════════════════════════════════
Results: 1 passed, 0 failed
══════════════════════════════════════════════════
```

### How it works

1. **VIN decode** — NHTSA vPIC API provides year/make/model/body class
2. **Specs lookup** — Auto.dev provides curb weight, length, width, height, ground clearance
3. **Caching** — Both NHTSA and Auto.dev results are cached in Supabase so you're never querying the same VIN twice
4. **Load planning** — Load planner prefers provider values (curb weight, height, width, length) and falls back to estimated values
5. **Operator verification** — When specs are incomplete or from cache, the driver still verifies each vehicle visually before load planning

### What Auto.dev provides vs. what it doesn't

**Auto.dev provides:**
- Curb weight (lbs)
- Overall length (inches)
- Overall width (inches)
- Overall height (inches)
- Ground clearance (inches)
- Body style (Sedan, SUV, Truck, etc.)
- Trim level

**NHTSA vPIC API provides:**
- Year
- Make
- Model
- Body class (not the same as body style)
- Vehicle type
- Manufacturer
- Plant country

**Montar provides:**
- Operator verification (driver confirms each vehicle visually)
- Load plan scoring and optimization
- DOT compliance checking (14 ft bridge height, weight distribution)
- Delivery routing and yard guides

### If Auto.dev fails

The app never crashes:

1. If the Auto.dev API key is missing or invalid → the function returns an error, the app falls back to estimated specs
2. If Auto.dev times out → the app marks the vehicle as **"Needs verification"** and uses estimated values
3. If a VIN is not found in Auto.dev → local mock data is used and confidence is marked as **"none"**
4. If Supabase is offline → the app works fully with localStorage and no specs

**Example fallback behavior:**

```js
// If Auto.dev fails
{
  vin: "5TDJKRFH6LS123456",
  curbWeightLb: 3800,          // estimated
  heightIn: 60,                // estimated
  lengthIn: 180,               // estimated
  widthIn: 72,                 // estimated
  source: "estimated",
  confidence: "none",
  needsVerification: true
}
```

The driver is prompted to verify all dimensions before the load plan is locked in.



## What works without Supabase

Everything. Supabase is strictly additive — if the env vars are missing, the app:

- Runs the full flow (Splash → Rig picker → Dashboard → Load sheet → Scan → Decode → Load Plan → Yard guide → Delivery → Session wrap)
- Saves previous loads to `localStorage` (persists across browser sessions)
- Shows no sync status indicator (the pill only appears when Supabase is configured)

The only feature that requires Supabase is cloud persistence of completed sessions.

---

## Sync Status Indicator

When Supabase is configured, a small pill appears in the Dashboard header next to the rig slot count:

| State | Color | Meaning |
|---|---|---|
| *(hidden)* | — | Supabase not configured, or no session yet |
| Saving… | Blue | Writing to Supabase |
| Saved | Green | Session persisted to cloud |
| Sync failed | Red | Supabase write failed — localStorage copy is intact |

A sync failure never breaks the app or loses data. The `localStorage` copy is always written first.

---

## Testing

```bash
# Full Playwright UI audit (4 viewports, 17 screenshots each)
npm run test:ui-audit

# Run all e2e tests
npm run test:e2e

# Run with browser visible
npm run test:e2e:headed
```

Screenshots are saved to `test-results/ui-audit/`.

---

## Project Structure

```
montar-app/
├── index.html               # Vite entry (minimal shell)
├── public/
│   ├── icon.svg
│   └── manifest.webmanifest # PWA manifest
├── src/
│   ├── main.jsx
│   ├── app/
│   │   ├── App.jsx          # Screen switcher
│   │   ├── routes.jsx       # Screen ID → component map
│   │   └── state/
│   │       └── loadSessionStore.js  # Zustand store (nav, vehicles, plan, sync)
│   ├── pages/               # One file per screen
│   ├── components/
│   │   ├── common/          # Button, Badge, Card, SyncStatus
│   │   ├── shell/           # AppShell, MobileFrame, TopBar, BottomNav
│   │   ├── planning/        # TrailerMap, SlotCard, OverridePanel, LoadPlanSummary
│   │   ├── scan/            # LoadSheetCapture, VinReviewList
│   │   └── maps/            # YardMap, DeliveryMap
│   ├── data/                # Mock data (mockVehicles, trailerConfigs, sampleYards…)
│   ├── logic/               # Pure functions (vinParser, scoringEngine, loadPlanner…)
│   ├── services/
│   │   ├── supabaseClient.js     # Null-safe Supabase client
│   │   ├── loadSessionService.js # Save/load for all 7 tables
│   │   ├── nhtsaService.js       # NHTSA VIN decode stub
│   │   └── vehicleSpecsService.js
│   └── styles/
│       ├── tokens.css       # Design tokens + html/body/root
│       └── app.css          # Full component styles
├── vite.config.js
└── docs/
    └── ui-audit.md          # Playwright audit findings + before/after
```

---

## Installing as a PWA

Montar is a fully installable Progressive Web App. Once installed it launches full-screen (no browser chrome), works from the home screen like a native app, and loads instantly from cache even with no signal.

### Android (Chrome)

1. Open Montar in **Chrome for Android**.
2. After a few seconds Chrome shows a banner at the bottom: **"Add MONTAR to Home screen"** — tap it, then tap **Add**.
3. If the banner doesn't appear automatically, tap the **⋮ menu → Add to Home screen**.
4. The MONTAR icon appears on your home screen. Tap it to launch in standalone mode.

> Chrome requires HTTPS for the install prompt. Use the production URL or a tunnelled Codespaces port (the forwarded `https://` URL works; `http://localhost` does not trigger the prompt).

### iOS (Safari)

iOS does not show an automatic install prompt. Use the Share sheet:

1. Open Montar in **Safari** (must be Safari — Chrome on iOS cannot install PWAs).
2. Tap the **Share button** (box with arrow pointing up) in the bottom toolbar.
3. Scroll down and tap **Add to Home Screen**.
4. Confirm the name (MONTAR) and tap **Add**.
5. The icon appears on your home screen and opens in full-screen standalone mode.

> **Icon note:** iOS requires a PNG `apple-touch-icon` for a custom home-screen icon. Until a PNG is generated from `icon.svg`, iOS will use a screenshot of the page instead of the logo. The app still installs and runs correctly.

---

## What works offline

After the first load, the service worker caches the entire app shell. The following work with **no internet connection**:

- Splash, rig picker, and dashboard screens
- Load plan generation and slot confirmation (pure in-browser logic)
- DOT weight/height compliance checks
- Yard guide map (SVG — no network needed)
- Delivery page layout and approach notes
- All previously saved session data (localStorage)
- The session wrap flow (data is saved locally and synced when back online)

Google Fonts are cached on first load (StaleWhileRevalidate for CSS, CacheFirst for font files) so the full typography renders offline after initial use.

## What still requires internet

- **Supabase sync** — completed session data uploads to the cloud. If offline, data stays in localStorage and there is no data loss. The sync status indicator will show the state.
- **Google Fonts** — on the very first load before the cache is populated, the app falls back to system sans-serif and monospace fonts. This is cosmetic only.
- **NHTSA VIN decode** (future) — real VIN decode requires the NHTSA public API.
- **OCR** (future) — load sheet scanning will require a cloud or on-device OCR call.

---

## Saving your work with Git

```bash
git add .
git commit -m "describe what you changed"
git push
```
