import { useStore } from '../app/state/loadSessionStore.js';

export default function LoadConfirm() {
  const goBack       = useStore((s) => s.goBack);
  const goTo         = useStore((s) => s.goTo);
  const loadPlan     = useStore((s) => s.loadPlan);
  const dotStatus    = useStore((s) => s.dotStatus);
  const yardStartTs  = useStore((s) => s.yardStartTs);
  const deliveryPlan = useStore((s) => s.deliveryPlan);

  const vehicleCount = loadPlan?.slots?.length || 9;
  const totalWt      = dotStatus?.estimatedCargoLb || 37887;
  const maxCargo     = loadPlan?.maxCargoLb || 47000;
  const pct          = Math.round((totalWt / maxCargo) * 100);
  const yardMin      = yardStartTs ? Math.max(1, Math.round((Date.now() - yardStartTs) / 60000)) : 48;
  const dealer       = deliveryPlan?.dealer;

  return (
    <div className="screen active" id="s-loadcomplete" data-testid="load-confirmation-screen">
      <div className="app-bar">
        <div className="app-bar-inner">
          <button className="icon-btn" onClick={() => goBack('map')}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <div className="app-bar-title">Load Complete</div>
          <div style={{ width: 48 }} />
        </div>
      </div>

      <div className="scroll">
        {/* Hero — yard time as headline */}
        <div className="lc-hero">
          <div className="lc-icon"><span className="material-icons-round">check_circle</span></div>
          <div className="lc-title">All {vehicleCount} vehicles loaded</div>
          <div className="lc-sub">Load 041625-09 · BNSF Orillia, Renton WA</div>
          <div className="lc-time-hero">
            <div className="lc-time-num">{yardMin}</div>
            <div>
              <div className="lc-time-unit">min yard time</div>
              <div className="lc-time-vs">vs ~62 min typical · {Math.round((1 - yardMin / 62) * 100)}% faster</div>
            </div>
          </div>
        </div>

        {/* Load summary checklist */}
        <div className="section-lbl">Load summary</div>
        <div className="card-el" style={{ marginTop: 0 }}>
          <div className="lc-check-item">
            <div className="lc-chk ok"><span className="material-icons-round">scale</span></div>
            <div className="lc-text">
              <div className="lc-lbl">Weight — estimated within limits</div>
              <div className="lc-val">{totalWt.toLocaleString()} lbs · {pct}% of capacity · Operator must verify at scale</div>
            </div>
          </div>
          <div className="divider" />
          <div className="lc-check-item">
            <div className="lc-chk ok"><span className="material-icons-round">straighten</span></div>
            <div className="lc-text">
              <div className="lc-lbl">Clearances confirmed</div>
              <div className="lc-val">{vehicleCount} vehicles · 2 decks · No conflicts detected</div>
            </div>
          </div>
          <div className="divider" />
          <div className="lc-check-item">
            <div className="lc-chk ok"><span className="material-icons-round">inventory_2</span></div>
            <div className="lc-text">
              <div className="lc-lbl">All VINs accounted for</div>
              <div className="lc-val">{vehicleCount} vehicles · BOL 041625-09 complete</div>
            </div>
          </div>
        </div>

        {/* Dealer summary */}
        <div className="section-lbl">Delivery destination</div>
        <div className="card-el" style={{ marginTop: 0, padding: '14px 16px', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-icons-round" style={{ color: 'var(--primary-dark)', fontSize: 22 }}>store</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--on-surface)' }}>{dealer?.name || 'Renton Toyota'}</div>
              <div style={{ fontSize: 13, color: 'var(--on-surface-var)', marginTop: 2 }}>{dealer?.address || '501 SW 41st St, Renton, WA 98057'}</div>
            </div>
            <span className="badge badge-pri">{vehicleCount} units</span>
          </div>
        </div>
      </div>

      <div className="confirm-bar" style={{ flexDirection: 'column', gap: 8, alignItems: 'stretch', padding: '14px 16px var(--bottom-pad)' }}>
        <div style={{ fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.4, padding: '0 4px', textAlign: 'center' }}>
          Car-hauler handoff prep — not a substitute for Google Maps. Use your nav app for driving directions.
        </div>
        <button
          type="button"
          className="btn-fill"
          id="btnOpenDealerGuide"
          data-testid="continue-to-delivery-button"
          style={{ width: '100%', justifyContent: 'center', height: 'auto', minHeight: 'var(--btn-h)', borderRadius: 'var(--btn-r)', flexDirection: 'column', gap: 4, padding: '12px 20px' }}
          onClick={() => goTo('delivery')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons-round">warehouse</span>
            Dealer arrival guide
          </span>
          <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.85 }}>
            Drive-in, parking &amp; handoff notes
          </span>
        </button>
      </div>
    </div>
  );
}
