import { useStore } from '../app/state/loadSessionStore.js';

export default function LoadConfirm() {
  const goBack    = useStore((s) => s.goBack);
  const goTo      = useStore((s) => s.goTo);
  const loadPlan  = useStore((s) => s.loadPlan);
  const dotStatus = useStore((s) => s.dotStatus);
  const yardStartTs = useStore((s) => s.yardStartTs);
  const deliveryPlan = useStore((s) => s.deliveryPlan);

  const vehicleCount = loadPlan?.slots?.length || 9;
  const totalWt      = dotStatus?.estimatedCargoLb || 37887;
  const maxCargo     = loadPlan?.maxCargoLb || 47000;
  const pct          = Math.round((totalWt / maxCargo) * 100);

  const yardMin = yardStartTs
    ? Math.max(1, Math.round((Date.now() - yardStartTs) / 60000))
    : 48;

  const dealer = deliveryPlan?.dealer;

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
        <div className="lc-hero">
          <div className="lc-icon"><span className="material-icons-round">check_circle</span></div>
          <div className="lc-title">All {vehicleCount} vehicles loaded</div>
          <div className="lc-sub">Load 041625-09 · BNSF Orillia, Renton WA<br />Ready for departure</div>
        </div>

        <div className="section-lbl">Load Summary</div>
        <div className="card-el" style={{ marginTop: 0 }}>
          <div className="lc-check-item">
            <div className="lc-chk ok"><span className="material-icons-round">scale</span></div>
            <div className="lc-text">
              <div className="lc-lbl">Weight verified</div>
              <div className="lc-val">{totalWt.toLocaleString()} lbs · {pct}% of capacity · DOT estimated compliant</div>
            </div>
          </div>
          <div className="divider" />
          <div className="lc-check-item">
            <div className="lc-chk ok"><span className="material-icons-round">straighten</span></div>
            <div className="lc-text">
              <div className="lc-lbl">All clearances confirmed</div>
              <div className="lc-val">{vehicleCount} vehicles · 2 decks · No conflicts</div>
            </div>
          </div>
          <div className="divider" />
          <div className="lc-check-item">
            <div className="lc-chk ok"><span className="material-icons-round">inventory_2</span></div>
            <div className="lc-text">
              <div className="lc-lbl">All VINs accounted for</div>
              <div className="lc-val">{vehicleCount} Toyota vehicles · Load 041625-09</div>
            </div>
          </div>
          <div className="divider" />
          <div className="lc-check-item">
            <div className="lc-chk ok"><span className="material-icons-round">timer</span></div>
            <div className="lc-text">
              <div className="lc-lbl">Yard time</div>
              <div className="lc-val">{yardMin} min this run vs ~62 min typical full pull — faster staging path (varies by yard)</div>
            </div>
          </div>
        </div>

        <div className="section-lbl">At the dealer</div>
        <div className="card-el" style={{ marginTop: 0, padding: '14px 16px', marginBottom: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--primary-container)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <span className="material-icons-round" style={{ color: 'var(--on-primary-container)', fontSize: 22 }}>store</span>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface)' }}>{dealer?.name || 'Renton Toyota'}</div>
              <div style={{ fontSize: 13, color: 'var(--on-surface-var)', marginTop: 2 }}>{dealer?.address || '501 SW 41st St, Renton, WA 98057'}</div>
            </div>
            <span className="badge badge-pri">{vehicleCount} units</span>
          </div>
        </div>
      </div>

      <div className="confirm-bar" style={{ padding: 16, flexDirection: 'column', gap: 10, alignItems: 'stretch' }}>
        <div style={{ fontSize: 11, color: 'var(--on-surface-var)', lineHeight: 1.4, padding: '0 4px', textAlign: 'center' }}>
          Car-hauler prep for this drop — not a substitute for Google Maps or Trucker Path. Use your nav app on the road.
        </div>
        <button
          type="button"
          className="btn-fill"
          id="btnOpenDealerGuide"
          data-testid="continue-to-delivery-button"
          style={{ width: '100%', justifyContent: 'center', minHeight: 52, borderRadius: 14, fontSize: 15, flexDirection: 'column', gap: 4, padding: '12px 16px', height: 'auto' }}
          onClick={() => goTo('delivery')}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span className="material-icons-round">warehouse</span>
            Dealer arrival guide
          </span>
          <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.92 }}>
            Drive-in, parking &amp; handoff notes for {dealer?.name || 'Renton Toyota'}
          </span>
        </button>
      </div>
    </div>
  );
}
