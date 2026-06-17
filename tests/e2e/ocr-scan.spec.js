// @ts-check
// Diagnostic run-through of the "scan load sheet via OCR" flow:
// Dashboard -> picker -> upload image -> ScanLoadSheet -> extractLoadSheet()
// Captures console errors, the edge-function network call, and which UI phase we land in.
const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const os = require('os');

// 1x1 transparent PNG, used as a stand-in "load sheet photo"
const PNG_BASE64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgAAAAAgAB9HFkpgAAAABJRU5ErkJggg==';

test('OCR scan flow — upload image and inspect extractLoadSheet() result', async ({ page }) => {
  const fixturePath = path.join(os.tmpdir(), 'montar-test-sheet.png');
  fs.writeFileSync(fixturePath, Buffer.from(PNG_BASE64, 'base64'));

  const consoleErrors = [];
  page.on('console', (msg) => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });
  page.on('pageerror', (err) => consoleErrors.push(`pageerror: ${err.message}`));

  /** @type {{url:string,status:number,body:string}[]} */
  const edgeFnCalls = [];
  page.on('response', async (res) => {
    if (res.url().includes('extract-load-sheet')) {
      let body = '';
      try { body = await res.text(); } catch { /* ignore */ }
      edgeFnCalls.push({ url: res.url(), status: res.status(), body });
    }
  });

  // ── Splash → Rig Picker → Dashboard ──────────────────────────────────
  await page.goto('/');
  await page.waitForSelector('[data-testid="splash-screen"].active');
  await page.waitForSelector('[data-testid="rig-picker-screen"].active', { timeout: 5000 });
  await page.locator('#btnConfirmRig').click();
  await page.waitForSelector('[data-testid="dashboard-screen"].active', { timeout: 5000 });

  // ── Open load-sheet picker → "Upload image" ──────────────────────────
  await page.locator('[data-testid="add-load-sheet-button"]').click();
  await page.waitForTimeout(300);

  const [chooser1] = await Promise.all([
    page.waitForEvent('filechooser'),
    page.getByText('Upload image').click(),
  ]);
  await chooser1.setFiles(fixturePath);

  // initScanFromFile() navigates us straight to the scan screen
  await page.waitForSelector('[data-testid="scan-screen"].active', { timeout: 5000 });
  await page.waitForTimeout(500);
  console.log('[scan] landed on scan screen, source-driven displayUrl should be visible');

  // ── Trigger the actual OCR call: tap "Scan load sheet" ────────────────
  const scanButton = page.getByRole('button', { name: /Scan load sheet/i });
  await expect(scanButton).toBeVisible({ timeout: 5000 });

  const [chooser2] = await Promise.all([
    page.waitForEvent('filechooser'),
    scanButton.click(),
  ]);
  await chooser2.setFiles(fixturePath);

  console.log('[scan] file submitted to handleFileChange — awaiting OCR phase change…');

  // The component flips through 'ocr-loading' -> 'ocr-done' | 'ocr-error'
  await page.waitForFunction(() => {
    const el = document.querySelector('[data-testid="scan-screen"]');
    return el && (el.querySelector('.scan-error-card') || el.querySelector('[data-testid="accept-scan-button"]'));
  }, { timeout: 30000 });

  await page.waitForTimeout(800);

  const errorCard = page.locator('.scan-error-card');
  const isError = await errorCard.count() > 0;

  console.log('--- OCR DIAGNOSTIC REPORT -------------------------------------');
  console.log('Edge function calls observed:', JSON.stringify(edgeFnCalls, null, 2));
  console.log('Console/page errors observed:', JSON.stringify(consoleErrors, null, 2));

  if (isError) {
    const msg = await page.locator('.scan-done-body').last().innerText();
    console.log('RESULT: OCR ERROR PHASE — message shown to user:', msg);
  } else {
    const chips = await page.locator('[data-testid="scan-screen"] .vin-chip').allInnerTexts();
    console.log('RESULT: OCR SUCCEEDED — extracted VIN chips:', chips);
  }
  console.log('---------------------------------------------------------------');

  fs.unlinkSync(fixturePath);
});
