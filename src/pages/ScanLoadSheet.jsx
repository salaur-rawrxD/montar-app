import { useEffect, useState } from 'react';
import { useStore } from '../app/state/loadSessionStore.js';

const SEED_VINS = [
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

  const [phase, setPhase] = useState('scanning'); // 'scanning' | 'done'
  const [visibleChips, setVisibleChips] = useState(0);

  useEffect(() => {
    setPhase('scanning');
    setVisibleChips(0);
    let i = 0;
    const chipTimer = setInterval(() => {
      i++;
      setVisibleChips(i);
      if (i >= SEED_VINS.length) {
        clearInterval(chipTimer);
        setTimeout(() => setPhase('done'), 500);
      }
    }, 220);
    return () => clearInterval(chipTimer);
  }, [scanSheetSource]);

  const hasUserSheet = scanSheetSource && scanSheetSource !== 'sample';

  return (
    <div
      className={`screen active${hasUserSheet ? ' has-user-sheet' : ''}${phase === 'done' ? ' sheet-ready' : ''}`}
      id="s-scan"
      data-testid="scan-screen"
      style={{ background: '#000' }}
    >
      <div className="scan-toolbar">
        <button className="icon-btn" onClick={() => goBack('home')} style={{ color: '#fff' }}>
          <span className="material-icons-round">arrow_back</span>
        </button>
        <span className="scan-title">Load sheet</span>
      </div>

      <div className="viewfinder" id="scanViewfinder">
        {hasUserSheet && scanSheetObjectUrl ? (
          <img id="scanSheetPreview" className="scan-sheet-preview" src={scanSheetObjectUrl} alt="Load sheet" />
        ) : null}

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

        <div className="scan-frame">
          <div className="sc tl" /><div className="sc tr" /><div className="sc bl" /><div className="sc br" />
          <div className="scan-line" />
        </div>
      </div>

      <div className="scan-bottom" id="scanBottom">
        {phase === 'scanning' ? (
          <div className="scan-phase-scan" id="scanPhaseScan">
            <div className="scan-status" id="scanStatusLine">Detecting VINs...</div>
            <div className="scan-sub" id="scanPhaseSub">Reading VINs from your sheet…</div>
            {SEED_VINS.slice(0, visibleChips).map((vin, i) => (
              <div key={vin} className="vin-chip" style={{ animationDelay: `${i * 0.15}s` }}>
                <span className="material-icons-round">check_circle</span>{vin}
              </div>
            ))}
          </div>
        ) : (
          <div className="scan-phase-done" id="scanPhaseDone" style={{ display: 'block' }}>
            <div className="scan-done-card">
              <div className="scan-done-title">
                <span className="material-icons-round">verified</span>
                <span id="scanDoneTitleLbl">Sheet captured</span>
              </div>
              <div className="scan-done-body" id="scanDoneBody">
                We read the VINs on your sheet. Review them next, or go back and add a clearer photo if something looks off.
              </div>
            </div>
            <button
              type="button"
              className="btn-fill btn-scan-accept"
              id="btnScanAccept"
              data-testid="accept-scan-button"
              onClick={() => goTo('decode')}
            >
              <span className="material-icons-round">arrow_forward</span>
              Accept &amp; review vehicles
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
