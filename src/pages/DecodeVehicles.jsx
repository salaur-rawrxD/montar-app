import { useStore } from '../app/state/loadSessionStore.js';
import { vehicleDisplayName, weightBadgeClass } from '../data/mockVehicles.js';

export default function DecodeVehicles() {
  const goBack           = useStore((s) => s.goBack);
  const goTo             = useStore((s) => s.goTo);
  const vehicles         = useStore((s) => s.vehicles);
  const acceptedIdxs     = useStore((s) => s.acceptedIdxs);
  const acceptVin        = useStore((s) => s.acceptVin);
  const acceptAllVins    = useStore((s) => s.acceptAllVins);
  const generateLoadPlan = useStore((s) => s.generateLoadPlan);

  const allAccepted = acceptedIdxs.length === vehicles.length && vehicles.length > 0;
  const acceptedCnt = acceptedIdxs.length;

  function handleOptimize() {
    generateLoadPlan();
    goTo('slots');
  }

  return (
    <div className="screen active" id="s-decode" data-testid="decode-screen">
      <div className="app-bar">
        <div className="app-bar-inner">
          <button className="icon-btn" onClick={() => goBack('scan')}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <div className="app-bar-title">Vehicles Decoded</div>
          <button className="icon-btn" onClick={acceptAllVins} title="Accept all VINs">
            <span className="material-icons-round">done_all</span>
          </button>
        </div>
      </div>

      <div className="scroll">
        {/* Summary header */}
        <div className="decode-sum">
          <div className="dn">{vehicles.length}</div>
          <div>
            <div className="dt">Vehicles on BOL</div>
            <div className="ds">BNSF Orillia · Load 041625-09</div>
            <div style={{ marginTop: 8 }}>
              <span className="badge badge-ok">
                <span className="material-icons-round" style={{ fontSize: 12 }}>document_scanner</span>
                Scan complete
              </span>
            </div>
          </div>
        </div>

        {/* Accept-all affordance */}
        {!allAccepted && (
          <div style={{ margin: '10px 16px 0', padding: '12px 14px', background: 'var(--primary-container)', borderRadius: 'var(--card-r)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ fontSize: 13, color: 'var(--on-primary-container)', lineHeight: 1.4, flex: 1 }}>
              <span style={{ fontWeight: 700 }}>{acceptedCnt} of {vehicles.length}</span> VINs accepted — trust the scan?
            </div>
            <button
              type="button"
              className="btn-fill"
              style={{ height: 40, padding: '0 16px', fontSize: 13, flexShrink: 0 }}
              onClick={acceptAllVins}
            >
              Accept all
            </button>
          </div>
        )}

        <div className="decode-hint">
          Accept each VIN if it matches the metal. MONTAR only plans from accepted rows.
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
              <div className="veh-rank">{i + 1}</div>
              <div className="veh-info">
                <div className="veh-name">{vehicleDisplayName(v)}</div>
                <div className="veh-vin vin-text">{v.vin}</div>
                {v.stallId && v.stallId !== '—' && (
                  <div style={{ marginTop: 4 }}>
                    <span className="badge badge-neu" style={{ fontSize: 11 }}>Stall {v.stallId}</span>
                  </div>
                )}
              </div>
              <div className="veh-meta">
                <span className={`badge ${weightBadgeClass(v.weightLb)}`}>{v.weightLb?.toLocaleString()} lbs</span>
              </div>
              <div className="veh-actions">
                <button
                  type="button"
                  className={`btn-mini${accepted ? ' success' : ' primary'}`}
                  data-testid="accept-vin-button"
                  title={accepted ? 'Accepted' : 'Accept VIN'}
                  onClick={() => acceptVin(i)}
                >
                  <span className="material-icons-round">{accepted ? 'check_circle' : 'check'}</span>
                </button>
                <button type="button" className="btn-mini" title="Edit VIN">
                  <span className="material-icons-round">edit</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="confirm-bar">
        <button type="button" className="btn-outline" id="btnRescan" onClick={() => goBack('scan')}>
          Re-scan
        </button>
        <button
          type="button"
          className="btn-fill"
          id="btnOptimizeLoad"
          data-testid="continue-to-load-plan-button"
          disabled={!allAccepted}
          onClick={handleOptimize}
        >
          <span className="material-icons-round">auto_awesome</span>
          {allAccepted ? 'Optimize load' : `Accept all ${vehicles.length} to continue`}
        </button>
      </div>
    </div>
  );
}
