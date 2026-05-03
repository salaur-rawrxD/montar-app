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

### 5. Verify it works

Start the dev server and run a full session (Splash → Rig → Dashboard → Sample sheet → Yard → Wrap up). After wrapping, the Dashboard header should briefly show **"Saving…"** then **"Saved"**. Check the `loads` table in Supabase Table Editor to confirm the row appeared.

---

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

## Saving your work with Git

```bash
git add .
git commit -m "describe what you changed"
git push
```
