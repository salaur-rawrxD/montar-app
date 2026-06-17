import { useRef, useState } from 'react';
import { useStore } from '../app/state/loadSessionStore.js';
import { extractLoadSheet } from '../services/ocrService.js';

// phases:
//   'ready'       — waiting for user to choose camera or demo
//   'ocr-loading' — image sent to edge function, awaiting response
//   'ocr-done'    — OCR succeeded; chips animate in
//   'ocr-error'   — OCR failed; offer manual entry
//   'manual'      — text input for manual VIN entry
//   'scanning'    — demo animation running
//   'done'        — demo animation complete

const DEMO_VINS = [
  '4T1G11AK8PU123481',
  '2T3P1RFV8PW847263',
  '3TMLB5JN3SM178449',
  '5TDHZRBH9MS523875',
  '4T1DAACK6SU566558',
  '2T3P1RFV2SC561402',
  '4T1DAACK1SU559372',
  '4T1DAACK8SU046040',
  '5TDHZRBH9MS500001',
];

export default function ScanLoadSheet() {
  const goBack           = useStore((s) => s.goBack);
  const goTo             = useStore((s) => s.goTo);
  const scanSheetSource  = useStore((s) => s.scanSheetSource);
  const scanSheetObjectUrl = useStore((s) => s.scanSheetObjectUrl);
  const setOcrVehicles   = useStore((s) => s.setOcrVehicles);

  const [phase, setPhase]           = useState('ready');
  const [visibleChips, setVisible]  = useState(0);
  const [activeVins, setActiveVins] = useState(DEMO_VINS);
  const [capturedUrl, setCapturedUrl] = useState(null);
  const [ocrError, setOcrError]     = useState(null);
  const [manualInput, setManualInput] = useState('');

  const fileInputRef  = useRef(null);
  const scanTimerRef  = useRef(null);

  const hasUserSheet = scanSheetSource && scanSheetSource !== 'sample';
  // Show the captured photo, then the uploaded file, then nothing (bol-mock shown instead)
  const displayUrl = capturedUrl ?? (hasUserSheet ? scanSheetObjectUrl : null);

  // ── Demo scan animation ──────────────────────────────────────────
  function startDemoScan() {
    if (scanTimerRef.current) clearInterval(scanTimerRef.current);
    setActiveVins(DEMO_VINS);
    setVisible(0);
    setPhase('scanning');
    let i = 0;
    scanTimerRef.current = setInterval(() => {
      i++;
      setVisible(i);
      if (i >= DEMO_VINS.length) {
        clearInterval(scanTimerRef.current);
        setTimeout(() => setPhase('done'), 500);
      }
    }, 220);
  }

  // ── Camera / file capture ────────────────────────────────────────
  function handleCaptureClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ''; // allow re-selecting same file

    // Revoke any previous captured preview URL
    if (capturedUrl) URL.revokeObjectURL(capturedUrl);
    const previewUrl = URL.createObjectURL(file);
    setCapturedUrl(previewUrl);
    setPhase('ocr-loading');
    setOcrError(null);

    try {
      const base64 = await fileToBase64(file);
      const { extractedVins } = await extractLoadSheet(base64);
      const vins = extractedVins.map((item) => item.vin);

      setOcrVehicles(extractedVins);
      setActiveVins(vins);
      setVisible(0);
      setPhase('ocr-done');

      // Animate chips appearing
      let i = 0;
      const t = setInterval(() => {
        i++;
        setVisible(i);
        if (i >= vins.length) clearInterval(t);
      }, 180);
    } catch (err) {
      setOcrError(err.message ?? 'Could not read load sheet');
      setPhase('ocr-error');
    }
  }

  // ── Manual entry ─────────────────────────────────────────────────
  function handleManualSubmit() {
    const vins = manualInput
      .split(/[\n,\s]+/)
      .map((v) => v.trim().toUpperCase())
      .filter((v) => v.length === 17);
    if (vins.length === 0) return;
    const ocrVins = vins.map((vin) => ({ vin, bayCode: '—' }));
    setOcrVehicles(ocrVins, 'manual');
    setActiveVins(vins);
    setVisible(vins.length);
    setPhase('ocr-done');
  }

  const isDone = phase === 'done' || phase === 'ocr-done';

  return (
    <div
      className={`screen active${isDone ? ' sheet-ready' : ''}`}
      id="s-scan"
      data-testid="scan-screen"
      style={{ background: '#000' }}
    >
      {/* Hidden file input — capture="environment" requests rear camera on mobile */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      <div className="scan-toolbar">
        <button className="icon-btn" onClick={() => goBack('home')} style={{ color: '#fff' }}>
          <span className="material-icons-round">arrow_back</span>
        </button>
        <span className="scan-title">Load sheet</span>
      </div>

      {/* ── Viewfinder ── */}
      <div className="viewfinder" id="scanViewfinder">
        {displayUrl ? (
          <img
            id="scanSheetPreview"
            className="scan-sheet-preview"
            src={displayUrl}
            alt="Load sheet"
            style={{ display: 'block' }}
          />
        ) : (
          <div className="bol-mock">
            <div className="bh">MASTER UNIFORM STRAIGHT BILL OF LADING — UNITED ROAD</div>
            <div className="bm">CARRIER: United Road · ORIGIN: BNSF ORILLIA – RENTON WA · LOAD: 041625-09</div>
            <div className="bcols"><span>VIN#</span><span>MODEL</span><span>DEALER</span><span>LOC</span></div>
            <div className="brow"><span className="bv">4T1G11AK8PU123481</span><span>CAMRY XSE V6</span><span>05210-WA</span><span className="bl">T042</span></div>
            <div className="brow"><span className="bv">2T3P1RFV8PW847263</span><span>RAV4 XLE PREM</span><span>05210-WA</span><span className="bl">T043</span></div>
            <div className="brow"><span className="bv">3TMLB5JN3SM178449</span><span>TACOMA TRD 4X4</span><span>05318-WA</span><span className="bl">T071</span></div>
            <div className="brow"><span className="bv">5TDHZRBH9MS523875</span><span>HIGHLANDER XLE</span><span>05318-WA</span><span className="bl">T072</span></div>
            <div className="brow"><span className="bv">4T1DAACK6SU566558</span><span>COROLLA SE CVT</span><span>05441-WA</span><span className="bl">T048</span></div>
            <div className="brow"><span className="bv">2T3P1RFV2SC561402</span><span>RAV4 ADVENTURE</span><span>05318-WA</span><span className="bl">T049</span></div>
            <div className="brow"><span className="bv">4T1DAACK1SU559372</span><span>CAMRY LE HYBRID</span><span>05210-WA</span><span className="bl">T044</span></div>
            <div className="brow"><span className="bv">4T1DAACK8SU046040</span><span>CAMRY XSE AWD</span><span>05210-WA</span><span className="bl">T045</span></div>
            <div className="brow" style={{ borderBottom: 'none' }}><span className="bv">5TDHZRBH9MS500001</span><span>HIGHLANDER XSE</span><span>05318-WA</span><span className="bl">T073</span></div>
            <div style={{ fontSize: 5, color: '#888', borderTop: '1px solid #ccc', marginTop: 3, paddingTop: 2 }}>TOTAL UNITS = 9</div>
          </div>
        )}

        <div className="scan-frame">
          <div className="sc tl" /><div className="sc tr" /><div className="sc bl" /><div className="sc br" />
          {(phase === 'scanning' || phase === 'ocr-loading') && <div className="scan-line" />}
        </div>
      </div>

      {/* ── Bottom panel ── */}
      <div className="scan-bottom" id="scanBottom">

        {/* READY — camera + demo choice */}
        {phase === 'ready' && (
          <div>
            <button
              type="button"
              className="btn-fill btn-scan-accept"
              onClick={handleCaptureClick}
            >
              <span className="material-icons-round">camera_alt</span>
              Scan load sheet
            </button>
            <button
              type="button"
              className="btn-scan-demo"
              onClick={startDemoScan}
            >
              Use sample data
            </button>
          </div>
        )}

        {/* OCR LOADING */}
        {phase === 'ocr-loading' && (
          <div style={{ textAlign: 'center', padding: '8px 0 4px' }}>
            <div className="ocr-spinner" />
            <div className="scan-status" style={{ marginTop: 14 }}>Reading load sheet…</div>
            <div className="scan-counter">Extracting VINs via OCR</div>
          </div>
        )}

        {/* DEMO SCANNING animation */}
        {phase === 'scanning' && (
          <div className="scan-phase-scan" id="scanPhaseScan">
            <div className="scan-counter">
              {visibleChips > 0 ? `Found ${visibleChips} of ${activeVins.length} VINs…` : 'Scanning BOL…'}
            </div>
            <div className="scan-status">
              {visibleChips === 0 ? 'Detecting VINs…' : `Reading BOL — ${visibleChips} of ${activeVins.length} found`}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center' }}>
              {activeVins.slice(0, visibleChips).map((vin) => (
                <div key={vin} className="vin-chip">
                  <span className="material-icons-round">check_circle</span>{vin}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* OCR-DONE — chips animate in then show review button */}
        {phase === 'ocr-done' && (
          <div>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 12 }}>
              {activeVins.slice(0, visibleChips).map((vin) => (
                <div key={vin} className="vin-chip">
                  <span className="material-icons-round">check_circle</span>{vin}
                </div>
              ))}
            </div>
            {visibleChips >= activeVins.length && (
              <DoneCard
                count={activeVins.length}
                body={`${activeVins.length} VINs extracted from photo. Review each vehicle before optimizing.`}
                onReview={() => goTo('decode')}
              />
            )}
          </div>
        )}

        {/* DONE — demo animation finished */}
        {phase === 'done' && (
          <div className="scan-phase-done" id="scanPhaseDone" style={{ display: 'block' }}>
            <DoneCard
              count={activeVins.length}
              body={`All ${activeVins.length} VINs read from BOL. Review each vehicle and accept before optimizing.`}
              onReview={() => goTo('decode')}
            />
          </div>
        )}

        {/* OCR ERROR */}
        {phase === 'ocr-error' && (
          <div>
            <div className="scan-done-card scan-error-card">
              <div className="scan-done-title">
                <span className="material-icons-round" style={{ color: '#f87171' }}>error_outline</span>
                <span style={{ color: '#fca5a5' }}>Could not read load sheet</span>
              </div>
              <div className="scan-done-body">{ocrError ?? 'OCR failed. Try again or enter VINs manually.'}</div>
            </div>
            <button
              type="button"
              className="btn-fill btn-scan-accept"
              onClick={() => setPhase('manual')}
            >
              <span className="material-icons-round">edit</span>
              Enter VINs manually
            </button>
            <button
              type="button"
              className="btn-scan-demo"
              onClick={handleCaptureClick}
            >
              Try again
            </button>
          </div>
        )}

        {/* MANUAL ENTRY */}
        {phase === 'manual' && (
          <div>
            <div className="scan-status" style={{ marginBottom: 10, textAlign: 'left' }}>
              Enter VINs — one per line
            </div>
            <textarea
              value={manualInput}
              onChange={(e) => setManualInput(e.target.value)}
              placeholder={'Paste or type VINs here\ne.g. 4T1G11AK8PU123481'}
              className="vin-manual-input"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
            />
            <button
              type="button"
              className="btn-fill btn-scan-accept"
              onClick={handleManualSubmit}
              disabled={!manualInput.trim()}
            >
              <span className="material-icons-round">check</span>
              Confirm VINs
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

// Shared "N VINs captured" card + Review button
function DoneCard({ count, body, onReview }) {
  return (
    <>
      <div className="scan-done-card">
        <div className="scan-done-title">
          <span className="material-icons-round">verified</span>
          <span>{count} VINs captured</span>
        </div>
        <div className="scan-done-body">{body}</div>
      </div>
      <button
        type="button"
        className="btn-fill btn-scan-accept"
        id="btnScanAccept"
        data-testid="accept-scan-button"
        onClick={onReview}
      >
        <span className="material-icons-round">arrow_forward</span>
        Review {count} vehicles
      </button>
    </>
  );
}

// ── Helpers ──────────────────────────────────────────────────────────────────

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      // Strip the "data:<mime>;base64," prefix
      resolve(result.slice(result.indexOf(',') + 1));
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}
