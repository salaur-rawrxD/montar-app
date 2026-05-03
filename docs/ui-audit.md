# Montar UI Audit — v2

**Initial audit:** 2026-05-03 (v1 — vanilla HTML prototype)
**Redesign:** 2026-05-03 (v2 — React + design system)
**Tool:** Playwright — `npm run test:ui-audit`
**Screenshots:** `test-results/ui-audit/`
**Viewports tested:** iPhone 390×844 · Android 412×915 · Tablet 768×1024 · Desktop 1440×900
**Build:** ✓ passes — 63 modules, 218KB JS, 50KB CSS

---

## Screenshot Inventory

Each viewport produces 17 screenshots (68 total).

| # | File pattern | Screen |
|---|---|---|
| 01 | `01-splash-{vp}.png` | Splash screen |
| 02 | `02-rig-picker-{vp}.png` | Rig picker |
| 03 | `03-dashboard-{vp}.png` | Dashboard / Home |
| 04 | `04-load-sheet-picker-{vp}.png` | Load sheet picker (bottom sheet) |
| 05 | `05-scan-detecting-{vp}.png` | Scan — VIN detection in progress |
| 06 | `06-scan-ready-{vp}.png` | Scan — sheet captured, accept CTA visible |
| 07 | `07-decode-{vp}.png` | Decode — 9 vehicles listed |
| 08 | `08-decode-all-accepted-{vp}.png` | Decode — all VINs accepted |
| 09 | `09-load-plan-{vp}.png` | Load plan — initial (0 of 9 confirmed) |
| 10 | `10-load-plan-all-confirmed-{vp}.png` | Load plan — all slots confirmed |
| 11 | `11-warning-{vp}.png` | Warning / adjustment screen |
| 12 | `12-yard-map-{vp}.png` | Yard map — first pull |
| 13 | `13-yard-map-progress-{vp}.png` | Yard map — vehicle 1 loaded, 8 remaining |
| 14 | `14-yard-map-all-loaded-{vp}.png` | Yard map — all 9 loaded, finish button visible |
| 15 | `15-load-confirmation-{vp}.png` | Load confirmation |
| 16 | `16-delivery-{vp}.png` | Dealer arrival / delivery |
| 17 | `17-session-wrap-{vp}.png` | Session wrap overlay |

---

## v1 → v2: What Changed

### Design System
A full design system was extracted from the prototype and standardized in `src/styles/`:

| Component | v1 | v2 |
|---|---|---|
| Primary button height | Mix of 40–56px | 52px (`--btn-h`) |
| Secondary button height | Mix of 40–48px | 44px (`--btn-h-sm`) |
| Button radius | Mix of 12–20px | 14px (`--btn-r`) |
| Hero card radius | Mix | 14px (`--card-r`) |
| List card radius | Mix | 12px (`--card-r-sm`) |
| Error/danger color | `#BA1A1A` light-pink container | `#7F1D1D` deep red surface |
| Danger buttons | Solid red but same size as normal | Solid `#991B1B`, opacity-disabled until acknowledged |
| Bottom padding | Hard-coded `env(safe-area-inset-bottom)` | `var(--bottom-pad)` token |

---

## Screen-by-Screen: Before → After

### Splash
**v1 issues:** 1.8s advance too slow; tagline 12–13px; "M" lettermark bold but subtitle felt lightweight.
**v2 changes:**
- Auto-advance reduced to 1.4s
- Tagline increased to 15px
- Subtle refinements to spacing and weight

### Rig Picker
**v1 issues:** Picker selection line 1px at 50% opacity; spec labels 10px unreadable; rig sub-text at 45% opacity too faint.
**v2 changes:**
- Picker selection border: 2px solid at 70% orange — clearly legible
- Spec values: 16px bold in `--primary` orange
- Spec labels: 11px at 45% → proper uppercase label style
- Sub-text opacity raised to 55%
- "Specs — operator verification required" label added

### Dashboard ⭐ Priority 1
**v1 issues:** Greeting card ("Good morning, Adan") wastes space; soft consumer aesthetic; "Add load sheet" competes with greeting; nav items lead nowhere.
**v2 changes:**
- Removed greeting card entirely
- **Dark command header**: wordmark + "ADAN ESPURO · SHIFT ACTIVE" + rig name + slot count pill
- **Compact metric strip** (3 cells): Loads/week, Avg yard time, Units moved
- **"Add load sheet" now FIRST in scroll** — dark navy card with orange icon, not a banner
- Operational language throughout (no consumer friendliness)
- Previous loads immediately below primary action

### Load Sheet Picker
**v1 issues:** Good structure, rig name missing from context.
**v2 changes:**
- Kicker now shows active rig name: "Optimize your run · Cottrell CX-09LS"

### Scan — Detecting
**v1 issues:** Static chip animation; hardcoded "Detecting VINs…" text; no count-up.
**v2 changes:**
- **Live count-up counter**: "Found 5 of 9 VINs…" updates as chips appear
- Status text updates: "Reading BOL — 5 of 9 found"
- Done state says "9 VINs captured" not "Sheet captured"
- Accept CTA shortened: "Review 9 vehicles" (was "Accept & review vehicles")

### Decode ⭐ Priority 2
**v1 issues:** Individual VIN acceptance tedious; no "accept all" affordance; weight badge cramped; accept buttons 36px (below 44px minimum).
**v2 changes:**
- **"Accept all" inline banner** at top showing accepted count, with orange filled button — disappears when all accepted
- Stall ID badge moved to secondary line below vehicle name (not cramped next to weight)
- Accept/edit buttons: 44px height
- Disabled "Optimize load" button text now explains: "Accept all 9 to continue"
- Summary card: dark navy gradient replacing orange-tinted container

### Load Plan ⭐ Priority 1
**v1 issues:** "Accept MONTAR's plan" in dashed outline — looked broken; 3 stacked buttons with no hierarchy; deck slots 42px/8.5px text; "Why this slot?" as underlined 12px link.
**v2 changes:**
- **CTA hierarchy completely rebuilt:**
  - When incomplete: PRIMARY = "Accept MONTAR's plan" (full-width, filled orange, 52px)
  - Continue button is shown disabled below it (visible but inactive)
  - "Adjustments" is a smaller outline button below both
  - When all confirmed: PRIMARY = "Continue to yard loading" (the only big action)
- Deck diagram slots: **54px tall** (was 42px)
- Slot numbers: 11px (was 8.5px), labels: 9px (was 7px)
- "Why this slot?" changed to a **pill chip** (rounded background, not underline) with orange help icon
- Progress shown as a **bar + counter** (not just text)
- Weight card: cleaner labels, "Est. OK" badge

### Warning / Adjustment ⭐ Priority 2
**v1 issues:** Light pink banner didn't feel dangerous; radio buttons mobile-unfriendly; override button muted; two competing "accept" CTAs.
**v2 changes:**
- **Full-bleed deep red header zone** (`#7F1D1D → #991B1B` gradient) replacing the pink card
- Header contains: warning icon + title + body + inline "Accept plan" shortcut
- App bar is dark red to match the danger state
- **Large tappable option cards** replace radio buttons — 44px+ tap targets with visible selection state
- Danger option card highlights in red when selected
- Acknowledgement is a **red-background card** with clearly styled checkbox + warning text
- Override button: solid `#991B1B`, disabled at 45% opacity until ack checked
- Two "accept" CTAs consolidated: inline quick-accept in header + primary at bottom

### Yard Map ⭐ Priority 1
**v1 issues:** Stall labels 5.5px; map too short; route arrow tiny; "NEXT" badge barely visible; "Rig position" 6.5px unreadable; stop chips cramped.
**v2 changes:**
- **Stall ID labels: 9px bold** (`font-weight: 800`) — readable on any screen
- Row labels: 9px (was 7px)
- **Map height: 54vh** (was 46vh) — more map visible
- **Active stall: `stall-hot-pulse` class** — CSS `stallPulse` animation, glowing blue
- **"NEXT" badge: solid orange rectangle** with white "NEXT" text (was faint blue outline)
- Route line: 5px (was 4px), arrow marker: 9×9 (was 7×7)
- "YOUR RIG" label: 9px bold (was "Rig position" at 6.5px)
- Stop chips: min-width 72px (was 64px), taller padding, labels 10px
- Finish button: solid **green** (`--success` var), filled style matching primary pattern
- Pull count changed to "Pull X of Y" (was number badge alone)

### Load Confirmation
**v1 issues:** Yard time buried in checklist; hero gradient okay.
**v2 changes:**
- **Yard time as headline**: large mono number in hero ("48 min yard time")
- "vs ~62 min typical · X% faster" shows value delivered
- Checklist simplified to 3 items (removed timer row, folded into hero)
- "Weight verified" language updated to "estimated within limits" (accurate)

### Delivery ⭐ Priority 2
**v1 issues:** Dark navy map unreadable; "Wrap up session" used one-off `--green` color; approach card good but not prominent enough.
**v2 changes:**
- **Dealer map: light scheme** — tan lot background + white roads + gray blocks (matches yard map aesthetic)
- Road labels now readable (dark text on light background)
- Wrap session button: **brand orange** (consistent with all other primary actions)
- Approach card: moved above notes, more prominent
- Dealer info panel: light surface with clear typography hierarchy
- "Session end" overlay: orange trophy icon instead of generic check

---

## Remaining Issues (Post v2)

### Critical — Resolved ✓
- [x] Stall labels at 5.5px → now 9px
- [x] "Accept MONTAR's plan" dashed outline → now primary filled orange
- [x] Warning screen too mild → now full-bleed deep red danger zone
- [x] Dashboard greets instead of commands → now operational header

### High — Resolved ✓
- [x] Accept buttons 36px → now 44px
- [x] Deck diagram slots 42px → now 54px
- [x] "Why this slot?" unreadable link → now pill chip
- [x] Delivery map dark/unreadable → now light scheme
- [x] Wrap session one-off green → now brand orange
- [x] No "accept all" on decode → inline banner added

### Medium — Resolved ✓
- [x] Scan "Detecting VINs" hardcoded → now live count-up
- [x] Bottom padding inconsistent → standardized `--bottom-pad` token
- [x] Picker selection line 1px → now 2px solid
- [x] Stop chips cramped → wider, taller

### Still Open (v3 targets)

| Issue | Severity | Notes |
|---|---|---|
| Nav bar tabs (Loads, Yards, Profile) lead nowhere | Medium | Grey them out or wire up stub screens |
| Scan screen still feels like a prototype | Medium | No real OCR, no camera integration yet |
| Load plan adjustment screen only covers Slot 1 | Medium | Needs generalization for any slot |
| "Why this slot?" reasoning text is generic | Medium | Needs slot-specific reasoning from logic layer |
| Deck diagram has no legend | Low | Add color key (orange = assigned, amber = reversed, green = confirmed) |
| Desktop/tablet layout not optimized | Low | Phone frame is appropriate for now |
| Session wrap data (yard min) is sometimes 1 min | Low | Race condition when yard session just started |

---

## Typography — Post v2 Minimums Enforced

| Element | v1 size | v2 size |
|---|---|---|
| Stall IDs in yard map SVG | 5.5px | **9px** |
| Row labels in yard map SVG | 7px | **9px** |
| Rig position label in SVG | 6.5px | **9px** ("YOUR RIG") |
| Slot diagram labels `.sv` | 7px | **9px** |
| Slot diagram numbers `.sn` | 8.5px | **11px** |
| Deck row labels `.deck-lbl` | 9px | **10px** |
| "Why this slot?" links | 12px underline | **12px pill chip** |
| Stop chip meta text | 8.5px | **10px** |
| Spec labels in rig picker | 10px | **11px** |

---

## Component Standardization (v2)

| Component | Standard class | Height | Notes |
|---|---|---|---|
| Primary action | `.btn-fill` | 52px | Orange, 14px radius, 600 weight |
| Secondary action | `.btn-outline` | 44px | 1.5px border, same radius |
| Tertiary/text | `.btn-text` | 40px | Transparent, orange text |
| Danger button | `.btn-err` | 44px | Solid `#991B1B`, requires ack state |
| Primary accept | `.btn-accept-montar-primary` | 52px | Full-width, load plan specific |
| Yard confirm | `.btn-yard-primary` | 56px | Orange, tall for gloved use |
| Yard finish | `.btn-yard-finish` | 56px | Green success, same height |
| Hero card | `.card-r` = 14px | — | Dark navy or surface |
| List card | `.card-r-sm` = 12px | — | Surface + border |
| Danger zone | `.danger-zone` | — | Deep red gradient, full-bleed |
| Option card | `.adj-option-card` | min 60px | Replaces radio buttons |
