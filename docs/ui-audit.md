# Montar UI Audit

**Date:** 2026-05-03  
**Tool:** Playwright — `npm run test:ui-audit`  
**Screenshots:** `test-results/ui-audit/`  
**Viewports tested:** iPhone 390×844 · Android 412×915 · Tablet 768×1024 · Desktop 1440×900

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

## Top 5 UI Problems

### 1. The primary action on the Load Plan screen is styled as secondary
`#btnAcceptMontarPlan` uses a dashed outline style (`btn-accept-montar-outline`), placing it visually below the verbosity of 9 individual "Confirm" buttons. A driver who trusts the system has no obvious single-tap to proceed. The app's core value — "let Montar decide" — is buried in tertiary styling. This is the single biggest trust signal broken.

### 2. Yard map stall labels are illegible — 5.5 px text on device
The `.ym-stall-id` class sets `font-size: 5.5px`. On a real iPhone screen, T042, T043 etc. are invisible. The map is the central operational screen and its stall IDs — the critical "go here" signal — cannot be read without zooming in. Any investor or driver looking at this on a real device will lose confidence immediately.

### 3. The scan screen is visibly a demo, not a product
The mock BOL sits static in a viewfinder. VIN chips appear via CSS animation delay, giving the impression of processing. The "Detecting VINs…" text is hardcoded. There is no progressive revelation, no "found 1 of 9" counter, no actual capture UX. The simulation ends after exactly 2.4 seconds regardless of any user action. This works for an internal demo but reads as a prototype to anyone scrutinizing it.

### 4. The warning screen does not feel dangerous enough
The clearance conflict is surfaced in a red banner, but the overall warning screen has similar visual weight to the informational cards on every other screen. The FAIL badge is buried in a reason card below the fold. The override button is red but small and at the bottom. A driver who reaches this screen should feel the gravity of the conflict before they can proceed — the current design doesn't achieve that.

### 5. The dashboard reads like a mobile analytics tool, not a command center
The greeting card ("Good morning, Adan"), rounded stat boxes, and soft navy gradient feel like a consumer app. Real car-hauler software is denser, more utilitarian, less friendly. The stats on the greeting card (7 loads, 63 vehicles, ~52 min) are the right data, but they are styled with the same visual language as a fitness app. The overall hierarchy makes the most important action (Add load sheet) compete with a greeting and a stats dashboard.

---

## Screen-by-Screen Recommendations

### Splash (01)
**Current:** Large "M" lettermark, "MONTAR" in monospaced caps, tagline, 2.2s auto-advance.  
**Issues:** 2.2 seconds is too long for a returning driver starting their shift. The "M" lettermark is bold but the "MONTAR" subtitle in small monospaced caps feels lightweight below it. The tagline at 12–13px is small.  
**Recommendations:**
- Reduce auto-advance to 1.2–1.5s (keep animation but compress the pause)
- Increase tagline font size to 15px minimum
- Consider adding a subtle truck/trailer icon below the bar to reinforce the transport context

### Rig Picker (02)
**Current:** Drum-scroll picker with fade overlays and selected-item highlight. Specs grid below. Full-width "Confirm Rig" CTA.  
**Issues:** The picker feels borrowed from an iOS time picker. The rig spec labels are 10px (unreadable on a phone in a yard). The spec box backgrounds at 5% white opacity barely register. Picker item sub-text at 12px with 45% opacity is too faint.  
**Recommendations:**
- Increase spec label size to 12px minimum, spec value to 16px
- Strengthen the picker selection line (current 1px at 50% orange opacity — needs to be 2px solid)
- Increase rig sub-text opacity from 45% to 60%

### Dashboard (03)
**Current:** Greeting card with stats, large orange "Add load sheet" action, previous loads list, active rig card, nav bar.  
**Issues:** The greeting ("Good morning, Adan") wastes prime screen real estate on friendliness. The four stat boxes are equal-weight — "7 loads this week" and "1.1 avg dealer stops" are not equally important. The previous loads section is below the fold on iPhone. The nav bar shows Loads, Yards, Profile tabs that lead nowhere in the prototype.  
**Recommendations:**
- Remove or collapse the greeting into a single line header ("Adan · Cottrell CX-09LS")
- Weight the stats: make yard time the prominent number, deprioritize avg dealer stops
- Move "Add load sheet" higher — it is the only action that matters
- Grey out or hide non-functional nav items to avoid dead-end taps

### Load Sheet Picker (04)
**Current:** Bottom sheet with Take Photo, Upload Image, Use Sample Sheet, Cancel.  
**Issues:** Good structure. The "Use sample sheet" button we added for testing is actually a useful demo mode. The bottom sheet animation is clean.  
**Recommendations:**
- Keep this screen largely as-is
- Consider adding a sub-label showing the currently selected rig name in the panel header
- On production, replace "Use sample sheet" with something like "Use last loaded sheet" or remove entirely

### Scan — Detecting (05)
**Current:** Dark viewfinder with mock BOL document, orange corner brackets, scan line animation, VIN chips appearing below.  
**Issues:** The VIN chips appear all at once via CSS delay — there's no sense of real OCR processing. The scan frame corners bracket the BOL document but there's no visual "locked on" state. The status text "Detecting VINs…" doesn't count up.  
**Recommendations:**
- Add a "Found X of 9 VINs" counter that increments as chips appear
- Make the scan frame corners close in toward the document as more VINs are found (visual confidence signal)
- Change "Detecting VINs…" to "Reading BOL — 5 of 9 found…" dynamically

### Scan — Ready (06)
**Current:** "Sheet captured" card replaces the VIN chips. Green verified icon. Accept CTA.  
**Issues:** The transition from detecting to ready is abrupt — the chips just disappear and a card appears. The "Accept & review vehicles" button text is long for a primary CTA.  
**Recommendations:**
- Animate the transition: chips should contract/fade into a summary count before the card slides up
- Shorten CTA to "Review 9 Vehicles →"

### Decode (07–08)
**Current:** Orange-tinted summary card. List of 9 vehicle cards with weight badges, stall IDs, and accept/edit mini-buttons.  
**Issues:** The mini buttons (accept ✓, edit ✏) are 36px height — just at the minimum tap target. Having 9 rows each requiring a tap makes this feel like clerical work. The "Optimize load" button stays disabled until all 9 are accepted — this is discoverable but frustrating. Weight and stall ID badges are right-aligned on a narrow card, making the layout cramped on 390px.  
**Recommendations:**
- Add a "Accept all" button at the top of the list for drivers who trust the scan
- Make individual accept buttons larger (44px min)
- Move stall ID badge to a secondary line below the vehicle name, not next to the weight

### Load Plan — Initial (09)
**Current:** Weight card, deck diagram, per-slot list with Confirm buttons, three-option CTA bar.  
**Issues:** The deck diagram slots are 42px tall with 8.5px text. On iPhone they're extremely hard to tap. The "Accept MONTAR's plan" button (dashed outline) looks broken/unfinished. The "Why this slot?" links are underlined at 12px — too small and easy to miss. The plan progress counter ("0 of 9 vehicles confirmed") is easy to overlook.  
**Recommendations:**
- Make "Accept MONTAR's plan" the PRIMARY button visually (filled orange, full-width)
- Move "Adjustments & overrides" to a secondary/tertiary position
- Increase deck diagram slot height to at least 54px; increase all text to 10px minimum
- Make "Why this slot?" a visible chip/pill, not underlined microcopy

### Load Plan — All Confirmed (10)
**Current:** All slots go green, "Continue to yard loading" button becomes active.  
**Issues:** Good state visually — the green slot confirmations communicate completion clearly. The "Continue to yard loading" button at 56px height is well-sized.  
**Recommendations:**
- When all slots are confirmed, briefly animate a "Ready to load" badge on the weight card
- This screen is mostly good; focus effort on the initial state (09)

### Warning / Adjustment (11)
**Current:** Adjust quick CTA inline, error banner, reason card with OK/WARN/FAIL rows, adjustment radio buttons, override bar.  
**Issues:** The error banner red is light (`--error-container` = #FFDAD6 — a very pale pink). The FAIL badge in the reason card is small. The radio buttons for driver choice look out of place in a mobile app. The override button is wide but the red is muted (error-container background, not solid red). The warning is structurally sound but tonally weak.  
**Recommendations:**
- Use a full-bleed deep red header strip for the warning — not a soft pink card
- Replace radio buttons with large tappable option cards
- Make the override button background solid `--error` (#BA1A1A) with white text — it should look scary
- Add a haptic-style icon animation (shaking warning symbol) to the danger state

### Yard Map (12–14)
**Current:** Google Maps-style SVG with lot layout, route line, rig position. Bottom sheet with current pull card, up-next strip, stop chips, main CTA.  
**Issues:** 
- Stall labels are 5.5px — completely unreadable
- Map height is clamped (240–400px) leaving it feeling like a thumbnail
- The route glow/line is visually present but the arrowhead is small
- The "NEXT" badge in the SVG overlaps with the stall and is hard to read
- The bottom sheet stop chips are 64px minimum width — they overflow and require horizontal scroll, but on 390px they're still cramped
- The "Strapped & loaded" CTA is good (large, orange, prominent) — keep this
- "Rig position" text at 6.5px in the SVG is unreadable  
**Recommendations:**
- Increase stall label font size to minimum 9px inside the SVG, even if it means fewer stalls shown
- Make the map taller on mobile — minimum 54vh not 46vh
- Show the active stall prominently: highlight the current stall with a pulsing animation, not just a blue outline
- Replace the "NEXT" SVG text badge with an orange pulsing indicator (more visible)
- Increase "Rig position" label font size or remove it entirely in favor of a truck icon glyph

### Load Confirmation (15)
**Current:** Green-tinted hero card, load summary checklist, dealer card, "Dealer arrival guide" CTA.  
**Issues:** The hero gradient (navy to dark green) is distinctive and appropriate. The check items are well-spaced. The CTA is appropriately large.  
**Recommendations:**
- This screen works well. Minor: show the yard time prominently (48 min) as a headline rather than burying it in a check item
- Add a subtle "vs average" comparison on the time item to reinforce Montar's value

### Delivery (16)
**Current:** Disclaimer text, dealer map preview (dark background), approach guidance card, delivery notes, wrap session CTA.  
**Issues:** The dealer map preview uses very dark colors (navy roads, navy blocks) — almost nothing is readable on a dark background. The route arrow is orange and visible but the surrounding context is a black rectangle. The "Wrap up session" button uses `--green` which doesn't match the brand orange — it's a one-off color.  
**Recommendations:**
- Switch dealer map preview to a light scheme (like the yard map) — dark previews feel like error states
- Replace the one-off green on "Wrap up session" with the standard orange, or use a success-green that is semantically consistent
- The approach guidance card (numbered steps) is excellent content — make it more visually prominent

### Session Wrap (17)
**Current:** Modal overlay with timing grid (yard min / dealer min), dismiss and return to home.  
**Issues:** The modal is well-proportioned. The two-cell timing grid is clear. The "Session saved" header is small.  
**Recommendations:**
- Increase "Session saved" to display-size text with a trophy/check icon
- Consider showing the route headline (BNSF Orillia → Dealer) prominently

---

## Mobile Usability Issues

| Issue | Severity | Screen(s) |
|---|---|---|
| Stall ID labels at 5.5px unreadable on any real device | Critical | Yard map |
| Accept/edit buttons at 36px below 44px minimum tap target | High | Decode |
| Deck diagram slots at 42px — too small for gloved hands | High | Load plan |
| Horizontal scroll required for stop chips on 390px | Medium | Yard map |
| "Why this slot?" underlined links at 12px too small | Medium | Load plan |
| Scan corner brackets don't respond to finger placement | Medium | Scan |
| Bottom nav tabs lead to dead ends (Loads, Yards, Profile) | Medium | Dashboard |
| Override checkbox on warning screen too small to hit reliably | Medium | Warning |

---

## Visual Hierarchy Issues

- **Load plan CTA bar** has 3 stacked actions with no visual hierarchy differentiation — "Accept MONTAR's plan" (dashed outline), "Adjustments & overrides" (outline), and "Continue to yard loading" (fill) are all roughly equal weight
- **Dashboard greeting card** places soft stats above the operational primary action
- **Warning screen** has an "Accept plan" CTA at the top AND an "Accept MONTAR's Plan" button at the bottom — two competing primary actions on the same screen
- **Decode screen** lists 9 rows of equal weight — there is no visual emphasis on where to start or what matters first

---

## Typography Issues

| Element | Current size | Recommended minimum |
|---|---|---|
| Stall IDs in yard map SVG | 5.5px | 9px |
| Rig position label in SVG | 6.5px | Remove or 9px |
| Section labels (`.section-lbl`) | 11px | 11px — OK |
| Slot diagram labels (`.sv`) | 7px | 9px |
| Slot diagram numbers (`.sn`) | 8.5px | 10px |
| Deck row labels (`.deck-lbl`) | 9px | 10px |
| VIN text in decode (`.veh-vin`) | 11px | 11px — borderline |
| "Why this slot?" links | 12px | 13px |
| Meta text in yard map chips | 8.5–9px | 10px |

The mixed font strategy (Display/Regular/Mono) is intentional and good. The issue is not the typefaces — it is that too many data-dense screens use sub-12px text that is unreadable at arm's length.

---

## Spacing / Density Issues

- The card margin of `8px 16px` is consistent but produces a very tight grid at 390px viewport width — cards fill almost the full width with no breathing room
- The load plan slot list uses `padding: 11px 16px` — tight for touch targets
- The yard map bottom sheet is visually dense: pull card + up-next strip + 9 stop chips + CTA button + footer hint — all visible at once
- The delivery screen packs approach steps (4), note cards (4), and disclaimer all on one scroll — consider collapsing one section by default

---

## CTA / Button Clarity Issues

| Screen | Problem | Fix |
|---|---|---|
| Load plan | "Accept MONTAR's plan" is dashed outline — looks broken | Make it the primary filled button |
| Decode | "Optimize load" disabled with no guidance on how to enable | Add inline helper: "Accept all 9 VINs to continue" |
| Warning | Two CTAs labeled "Accept plan" (top) and "Accept MONTAR's Plan" (bottom) | Consolidate to one prominent CTA |
| Yard map | After all 9 loaded, "Strapped & loaded" button hides and "All 9 loaded — finish yard" appears | Good pattern, but the "All loaded" button uses outline style — should use the same filled orange |
| Dashboard | "Add load sheet" is styled like a banner/card, not a button | Good prominence, but add an explicit "button" accessible role and text saying "Tap to start" |

---

## Map UI Issues

1. **Stall labels (5.5px)** — The single biggest map issue. Every stall ID label in the SVG is set to `font-size: 5.5px`, which renders at ~3–4 CSS pixels on a retina display. They must be increased to a minimum of 9px.

2. **Route line endpoint arrow** — The `marker-end="url(#arrGm)"` arrowhead on the route line is a 7×7 SVG element. At current map scale this is ~3px on screen. Increase the marker size or replace with a pulsing circle at the destination.

3. **Rig position indicator** — The circle + "You / Rig position" text at the bottom-left of the map is the most useful contextual anchor, but both the label (6.5px) and the sub-label are unreadable. Replace with a dedicated truck icon + "YOUR RIG" pill in the info HUD at the top, not in the SVG.

4. **Active stall highlight** — The current pull stall uses `.stall-hot` (light blue fill + blue stroke). This is easy to miss when the route line passes through multiple stalls. Add a pulsing animation to the active stall.

5. **Map feels static** — The Google Maps aesthetic (tan lots, white roads, gray grid) is appropriate but nothing moves. Even the route glow is static. A slowly pulsing destination stall would dramatically improve the sense of "this is live guidance."

---

## Load Plan Clarity Issues

1. The deck diagram is the most compact, least scannable element on the screen — 42px slots with 7–8.5px text at the top of the plan, but most drivers will scroll past it and look at the list below
2. The deck diagram color coding (orange-filled = assigned, amber = reversed, green = confirmed) requires a legend that doesn't exist
3. The "37,887 lbs · 80.6% · DOT OK" weight card is trustworthy content displayed well — keep it
4. The "Why this slot?" reasoning is high-value content but hidden under tiny underlined links — this should be expandable and more prominent, especially for driver education
5. The plan counter ("0 of 9 vehicles confirmed") is easy to overlook — it should be a persistent progress indicator, perhaps a progress bar below the weight card

---

## Brand / Premium Feel Issues

| Issue | Current | Montar standard |
|---|---|---|
| One-off green on "Wrap session" button (`--green: #1D9E75`) | Inconsistent color | Use brand orange or standardize a success-green token |
| Dealer map uses dark navy on dark roads — unreadable | Looks like an error state | Light map scheme matching yard map |
| Greeting card uses "Good morning" personal tone | Friendly but not industrial | Replace with operational context ("Day 3 of 5 · BNSF Orillia") |
| 2.2s splash auto-advance | Feels like a loading screen | Reduce to 1.2s or add tap-to-skip |
| Dashed "Accept MONTAR's plan" button | Looks unfinished | Solid primary button |
| Sub-11px text in multiple screens | Looks like a mobile prototype | Enforce 11px minimum across all visible text |

---

## Which Screens to Redesign First

**Priority 1 — Redesign now (blocks investor demo credibility):**
1. **Load Plan** — Primary CTA is wrong, deck diagram is unreadable, hierarchy is broken
2. **Yard Map** — Critical legibility failures (5.5px stall labels) and low visual energy

**Priority 2 — Redesign soon (driver experience blockers):**
3. **Decode** — Individual VIN acceptance is tedious; no "accept all" affordance
4. **Dashboard** — Hierarchy prioritizes greeting over action
5. **Warning** — Severity doesn't match styling

**Priority 3 — Polish later (good enough, needs refinement):**
6. Splash (minor timing/size fixes)
7. Rig picker (legibility improvements)
8. Scan (progressive reveal improvements)
9. Delivery (map scheme, button color fix)

---

## Which Components to Standardize

| Component | Current state | Needed |
|---|---|---|
| Primary CTA button height | Mix of 40px, 46px, 48px, 52px, 56px | Standardize to 52px for primary actions |
| Card radius | Mix of 12px, 14px, 16px, 20px | Choose two: 12px (list cards), 16px (hero cards) |
| Bottom action bar | Different padding/layout per screen | Single `<confirm-bar>` standard with consistent slot sizes |
| Section label | `11px 500 .1em uppercase primary` | Already consistent — keep |
| Badge sizes | 24px height across app | Already consistent — keep |
| Map bottom sheet | Custom per map screen | Extract to shared `<sheet>` component |
| Error/warning styling | Light-pink banner — inconsistent severity | Standardize to three levels: info (blue), warning (amber), danger (solid red) |
