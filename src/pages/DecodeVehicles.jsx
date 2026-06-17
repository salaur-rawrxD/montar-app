import { useStore } from '../app/state/loadSessionStore.js';
import { vehicleDisplayName, weightBadgeClass } from '../data/mockVehicles.js';

/* Maps v.source → badge config (for VIN identity) */
const SOURCE_BADGE = {
  nhtsa:          { cls: 'vbadge-nhtsa',     icon: 'verified_user', label: 'NHTSA' },
  identity_only:  { cls: 'vbadge-nhtsa',     icon: 'verified_user', label: 'NHTSA' },
  nhtsa_fallback: { cls: 'vbadge-estimated', icon: 'calculate',     label: 'Estimated' },
  estimated:      { cls: 'vbadge-estimated', icon: 'calculate',     label: 'Estimated' },
  ocr:            { cls: 'vbadge-nhtsa',     icon: 'document_scanner', label: 'From scan' },
  manual:         { cls: 'vbadge-operator',  icon: 'edit',          label: 'Manual entry' },
  operator:       { cls: 'vbadge-operator',  icon: 'how_to_reg',    label: 'Verified' },
  autodev:        { cls: 'vbadge-autodev',   icon: 'bolt',          label: 'Auto.dev' },
  review:         { cls: 'vbadge-review',    icon: 'error_outline', label: 'Needs review' },
  invalid:        { cls: 'vbadge-review',    icon: 'error_outline', label: 'Invalid VIN' },
  demo:           { cls: 'vbadge-demo',      icon: 'science',       label: 'Demo data' },
};

/* Maps v.specsSource → badge config (for vehicle specs: weight, dimensions) */
const SPECS_BADGE = {
  'auto.dev':   { cls: 'vbadge-autodev',     icon: 'bolt',          label: 'Auto.dev specs' },
  'estimated':  { cls: 'vbadge-estimated',   icon: 'calculate',     label: 'Estimated specs' },
  'fallback':   { cls: 'vbadge-review',      icon: 'error_outline', label: 'Needs verification' },
  'mock':       { cls: 'vbadge-demo',        icon: 'science',       label: 'Demo specs' },
};

function VerificationBadge({ source }) {
  const cfg = SOURCE_BADGE[source] ?? SOURCE_BADGE.demo;
  return (
    <span className={`vbadge ${cfg.cls}`}>
      <span className="material-icons-round">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function SpecsBadge({ specsSource, specsNeedsVerification }) {
  // If needs verification, always show that regardless of source
  if (specsNeedsVerification) {
    const cfg = SPECS_BADGE['fallback'];
    return (
      <span className={`vbadge ${cfg.cls}`}>
        <span className="material-icons-round">{cfg.icon}</span>
        {cfg.label}
      </span>
    );
  }
  const cfg = SPECS_BADGE[specsSource] ?? SPECS_BADGE.estimated;
  return (
    <span className={`vbadge ${cfg.cls}`}>
      <span className="material-icons-round">{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

export default function DecodeVehicles() {
  const goBack           = useStore((s) => s.goBack);
  const goTo             = useStore((s) => s.goTo);
  const vehicles         = useStore((s) => s.vehicles);
  const acceptedIdxs     = useStore((s) => s.acceptedIdxs);
  const acceptVin        = useStore((s) => s.acceptVin);
  const acceptAllVins    = useStore((s) => s.acceptAllVins);
  const generateLoadPlan = useStore((s) => s.generateLoadPlan);
  const nhtsaStatus      = useStore((s) => s.nhtsaStatus);

  const allAccepted = acceptedIdxs.length === vehicles.length && vehicles.length > 0;
  const acceptedCnt = acceptedIdxs.length;

  function handleOptimize() {
    // Log data sources before generating plan
    if (vehicles && vehicles.length > 0) {
      const accepted = vehicles.filter((_, i) => acceptedIdxs.includes(i));
      console.log(`📋 Generating load plan for ${accepted.length} accepted vehicles`);
      accepted.forEach((v) => {
        console.log(`  • ${v.vin} (${v.source} • specs: ${v.specsSource})`);
      });
    }
    generateLoadPlan();
    goTo('slots');
  }

  return (
    <div className="screen active" id="s-decode" data-testid="decode-screen"
      style={{ background: 'var(--surface-var)' }}>

      {/* ── App bar — dark shell ── */}
      <div className="app-bar">
        <div className="app-bar-inner">
          <button className="icon-btn" onClick={() => goBack('scan')} aria-label="Back">
            <span className="material-icons-round">arrow_back</span>
          </button>
          <div className="app-bar-title">Vehicle Review</div>
          <button className="icon-btn" onClick={acceptAllVins} title="Accept all VINs" aria-label="Accept all">
            <span className="material-icons-round">done_all</span>
          </button>
        </div>
      </div>

      <div className="scroll">
        {/* BOL summary card — dark */}
        <div className="decode-sum" style={{ marginTop: 12 }}>
          <div className="dn">{vehicles.length}</div>
          <div>
            <div className="dt">Vehicles on BOL</div>
            <div className="ds">BNSF Orillia · Load 041625-09</div>
            <div style={{ marginTop: 10, display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              <span className="badge badge-ok">
                <span className="material-icons-round" style={{ fontSize: 12 }}>document_scanner</span>
                Scan complete
              </span>
              <VerificationBadge source="demo" />
            </div>
          </div>
        </div>

        {/* Accept-all affordance — only if not all accepted */}
        {!allAccepted && (
          <div style={{
            margin: '10px 16px 0',padding: '14px 16px',
            background: 'var(--primary-container)',
            borderRadius: 'var(--card-r)',
            border: '1.5px solid rgba(232,98,10,.35)',
            display: 'flex',alignItems: 'center',justifyContent: 'space-between',gap: 12,
          }}>
            <div style={{ fontSize: 13, color: 'var(--on-primary-container)', lineHeight: 1.4, flex: 1 }}>
              <span style={{ fontWeight: 700 }}>{acceptedCnt} of {vehicles.length}</span> VINs accepted — trust the scan?
            </div>
            <button
              type="button" className="btn-fill"
              style={{ height: 40, padding: '0 16px', fontSize: 13, flexShrink: 0, boxShadow: 'none' }}
              onClick={acceptAllVins}
            >
              Accept all
            </button>
          </div>
        )}

        <div className="decode-hint">
          Verify each VIN against the metal. MONTAR only plans from accepted rows.
        </div>

        <div className="section-lbl">Decoded vehicles</div>

        {vehicles.map((v, i) => {
          const accepted = acceptedIdxs.includes(i);
          return (
            <div
              key={v.vin}
              className={`veh-card veh-card-decode${accepted ? ' vin-accepted' : ''}`}
              data-vix={i}
            >
              {/* Rank / sequence */}
              <div className="veh-rank">{i + 1}</div>

              {/* Vehicle info */}
              <div className="veh-info">
                <div className="veh-name">{vehicleDisplayName(v)}</div>
                <div className="veh-vin vin-text">{v.vin}</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 7 }}>
                  <VerificationBadge source={v.source || 'demo'} />
                  {v.specsSource && <SpecsBadge specsSource={v.specsSource} specsNeedsVerification={v.specsNeedsVerification} />}
                  {v.weightLb && (
                    <span className={`badge ${weightBadgeClass(v.weightLb)}`}>
                      {v.weightLb?.toLocaleString()} lbs
                    </span>
                  )}
                  {v.heightIn && (
                    <span className="badge badge-neu" style={{ fontFamily: 'var(--mono)' }}>
                      {v.heightIn}" tall
                    </span>
                  )}
                  {v.stallId && v.stallId !== '—' && (
                    <span className="badge badge-info" style={{ fontFamily: 'var(--mono)' }}>
                      Stall {v.stallId}
                    </span>
                  )}
                </div>
              </div>

              {/* Action buttons */}
              <div className="veh-actions">
                <button
                  type="button"
                  className={`btn-mini${accepted ? ' success' : ' primary'}`}
                  data-testid="accept-vin-button"
                  title={accepted ? 'Accepted' : 'Accept VIN'}
                  onClick={() => acceptVin(i)}
                >
                  <span className="material-icons-round">
                    {accepted ? 'check_circle' : 'check'}
                  </span>
                </button>
                <button type="button" className="btn-mini" title="Edit VIN">
                  <span className="material-icons-round">edit</span>
                </button>
              </div>
            </div>
          );
        })}

        <div style={{ height: 8 }} />
      </div>

      {/* ── Bottom action bar ── */}
      <div className="confirm-bar">
        <button type="button" className="btn-outline" id="btnRescan" onClick={() => goBack('scan')}>
          Re-scan
        </button>
        <button
          type="button" className="btn-fill"
          id="btnOptimizeLoad"
          data-testid="continue-to-load-plan-button"
          disabled={!allAccepted}
          onClick={handleOptimize}
        >
          <span className="material-icons-round">auto_awesome</span>
          {allAccepted ? 'Build load plan' : `Accept all ${vehicles.length} to continue`}
        </button>
      </div>
    </div>
  );
}
