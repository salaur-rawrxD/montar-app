// @ts-check
const { test } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const AUDIT_DIR = path.join(process.cwd(), 'test-results', 'ui-audit');
fs.mkdirSync(AUDIT_DIR, { recursive: true });

const VIEWPORTS = [
  { name: 'iphone',  width: 390,  height: 844  },
  { name: 'android', width: 412,  height: 915  },
  { name: 'tablet',  width: 768,  height: 1024 },
  { name: 'desktop', width: 1440, height: 900  },
];

for (const vp of VIEWPORTS) {
  test(`UI Audit — ${vp.name} (${vp.width}x${vp.height})`, async ({ page }) => {
    await page.setViewportSize({ width: vp.width, height: vp.height });

    let step = 0;
    const shot = async (label) => {
      step++;
      const num = String(step).padStart(2, '0');
      const filename = `${num}-${label}-${vp.name}.png`;
      await page.screenshot({ path: path.join(AUDIT_DIR, filename) });
    };

    // ── 01 SPLASH ───────────────────���───────────────────────────���───────────
    await page.goto('/');
    await page.waitForSelector('[data-testid="splash-screen"].active');
    await page.waitForTimeout(500);
    await shot('splash');

    // ── 02 RIG PICKER  (auto-advances at 2 200 ms) ────────────────────────
    await page.waitForSelector('[data-testid="rig-picker-screen"].active', { timeout: 5000 });
    await page.waitForTimeout(400);
    await shot('rig-picker');

    // ── 03 DASHBOARD ────────────────────────────────────────────────────────
    await page.locator('#btnConfirmRig').click();
    await page.waitForSelector('[data-testid="dashboard-screen"].active', { timeout: 3000 });
    await page.waitForTimeout(450);
    await shot('dashboard');

    // ── 04 LOAD SHEET PICKER (bottom sheet) ──────────────────────────────
    await page.locator('[data-testid="add-load-sheet-button"]').click();
    await page.waitForTimeout(400);
    await shot('load-sheet-picker');

    // ── 05 SCAN — detecting VINs ──────────────────────────────���──────────
    await page.locator('[data-testid="use-sample-sheet-button"]').click();
    await page.waitForSelector('[data-testid="scan-screen"].active', { timeout: 3000 });
    await page.waitForTimeout(450);
    await shot('scan-detecting');

    // ── 06 SCAN — sheet ready (accept button visible) ─────────────────────
    // startScanCapture fires a 2 400 ms setTimeout before adding sheet-ready
    await page.waitForSelector('#s-scan.sheet-ready', { timeout: 5000 });
    await page.waitForTimeout(300);
    await shot('scan-ready');

    // ── 07 DECODE — vehicles listed ──────────────────────────────────────
    await page.locator('[data-testid="accept-scan-button"]').click();
    await page.waitForSelector('[data-testid="decode-screen"].active', { timeout: 3000 });
    await page.waitForTimeout(450);
    await shot('decode');

    // ── 08 DECODE — all VINs accepted ────────────────────────────────────
    const vinBtns = page.locator('[data-testid="accept-vin-button"]');
    const vinCount = await vinBtns.count();
    for (let i = 0; i < vinCount; i++) {
      await vinBtns.nth(i).click();
      await page.waitForTimeout(80);
    }
    await page.waitForTimeout(400);
    await shot('decode-all-accepted');

    // ── 09 LOAD PLAN — initial (0 of 9 confirmed) ────────────────────────
    await page.locator('[data-testid="continue-to-load-plan-button"]').click();
    await page.waitForSelector('[data-testid="load-plan-screen"].active', { timeout: 3000 });
    await page.waitForTimeout(450);
    await shot('load-plan');

    // ── 10 LOAD PLAN — all slots accepted via one tap ────────────────────
    await page.locator('#btnAcceptMontarPlan').click();
    await page.waitForTimeout(400);
    await shot('load-plan-all-confirmed');

    // ── 11 WARNING / ADJUSTMENT ──────────────────────────────────────────
    await page.locator('#btnPlanAdjust').click();
    await page.waitForSelector('#s-warning.active', { timeout: 3000 });
    await page.waitForTimeout(450);
    await shot('warning');

    // Navigate back to load plan (back arrow in the warning app-bar)
    await page.locator('#s-warning .icon-btn').first().click();
    await page.waitForSelector('[data-testid="load-plan-screen"].active', { timeout: 3000 });
    await page.waitForTimeout(450);

    // ── 12 YARD MAP ──────────────────────────────────────────────────────
    await page.locator('[data-testid="continue-to-yard-button"]').click();
    await page.waitForSelector('[data-testid="yard-map-screen"].active', { timeout: 3000 });
    await page.waitForTimeout(600);
    await shot('yard-map');

    // Mark vehicle 1 loaded so we can show mid-progress state
    await page.locator('[data-testid="load-next-vehicle-button"]').click();
    await page.waitForTimeout(300);
    await shot('yard-map-progress');

    // Click through the remaining 8 vehicles
    for (let i = 0; i < 8; i++) {
      const loadBtn = page.locator('[data-testid="load-next-vehicle-button"]');
      if (await loadBtn.isVisible()) {
        await loadBtn.click();
        await page.waitForTimeout(180);
      }
    }
    await page.waitForSelector('#btnYardAllDone:visible', { timeout: 3000 });
    await page.waitForTimeout(400);
    await shot('yard-map-all-loaded');

    // ── 14 LOAD CONFIRMATION ─────────────────────────────────────────────
    await page.locator('#btnYardAllDone').click();
    await page.waitForSelector('[data-testid="load-confirmation-screen"].active', { timeout: 3000 });
    await page.waitForTimeout(450);
    await shot('load-confirmation');

    // ── 15 DELIVERY ──────────────────────────────────────────────────────
    await page.locator('[data-testid="continue-to-delivery-button"]').click();
    await page.waitForSelector('[data-testid="delivery-screen"].active', { timeout: 3000 });
    await page.waitForTimeout(450);
    await shot('delivery');

    // ── 16 SESSION WRAP OVERLAY ──────────────────────────────────────────
    await page.locator('[data-testid="wrap-session-button"]').click();
    await page.waitForTimeout(500);
    await shot('session-wrap');
  });
}
