import { useStore } from '../app/state/loadSessionStore.js';
import DeliveryMap from '../components/maps/DeliveryMap.jsx';

export default function DeliveryPage() {
  const goBack            = useStore((s) => s.goBack);
  const endSession        = useStore((s) => s.endSession);
  const dismissSession    = useStore((s) => s.dismissSession);
  const sessionEndVisible = useStore((s) => s.sessionEndVisible);
  const sessionEndData    = useStore((s) => s.sessionEndData);
  const deliveryPlan      = useStore((s) => s.deliveryPlan);

  const dealer = deliveryPlan?.dealer;

  return (
    <div className="screen active" id="s-delivery" data-testid="delivery-screen"
      style={{ background: 'var(--surface-var)' }}>

      {/* ── App bar — dark shell ── */}
      <div className="app-bar">
        <div className="app-bar-inner">
          <button className="icon-btn" onClick={() => goBack('loadcomplete')} aria-label="Back">
            <span className="material-icons-round">arrow_back</span>
          </button>
          <div className="app-bar-title">Dealer arrival</div>
          <button className="icon-btn" aria-label="More options">
            <span className="material-icons-round">more_vert</span>
          </button>
        </div>
      </div>

      <div className="scroll">
        {/* On-lot disclaimer */}
        <div className="delivery-disclaimer" style={{ marginTop: 12 }}>
          <strong>On-lot &amp; handoff only.</strong> MONTAR does not replace your GPS.
          Dealer instructions here vary by store — drive-in, parking, and handoff.
        </div>

        {/* Dealer map + info */}
        <DeliveryMap dealer={dealer} />

        {/* Approach steps — dark operational card */}
        <div className="approach-card" style={{ margin: '12px 16px 0' }}>
          <div className="ac-title">
            <span className="material-icons-round">fork_right</span>
            Optimal approach — {dealer?.name || 'Renton Toyota'}
          </div>
          {(dealer?.approach || []).map((step) => (
            <div key={step.step} className="ac-step">
              <div className="ac-num">{step.step}</div>
              {/* dangerouslySetInnerHTML is safe here: content is a hardcoded constant */}
              <div className="ac-text" dangerouslySetInnerHTML={{ __html: step.text }} />
            </div>
          ))}
        </div>

        {/* Handoff notes */}
        <div className="section-lbl" style={{ paddingTop: 14 }}>Handoff notes</div>
        {(dealer?.notes || []).map((note, i) => (
          <div key={i} className="note-card">
            <div className={`nc-icon ${note.color}`}>
              <span className="material-icons-round">{note.icon}</span>
            </div>
            <div className="nc-content">
              <div className="nc-title">{note.title}</div>
              <div className="nc-body">{note.body}</div>
            </div>
          </div>
        ))}

        {/* Unload sequence note */}
        <div style={{
          margin: '8px 16px 0',fontSize: 12,
          color: 'var(--muted)',lineHeight: 1.55,
          padding: '10px 14px',background: 'var(--surface)',
          borderRadius: 'var(--card-r-sm)',border: '1px solid var(--outline-var)',
        }}>
          Single-dealer drop: follow your trailer unload order. A step-by-step unload list appears here for multi-stop deliveries.
        </div>

        {/* Wrap session CTA */}
        <div style={{ padding: '16px 16px 4px' }}>
          <button
            type="button" className="btn-fill"
            id="btnEndDeliverySession"
            data-testid="wrap-session-button"
            style={{
              width: '100%',justifyContent: 'center',
              height: 'auto',minHeight: 'var(--btn-h)',
              borderRadius: 'var(--btn-r)',
              flexDirection: 'column',gap: 4,padding: '14px 20px',
              boxShadow: 'var(--e-orange)',
            }}
            onClick={endSession}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-icons-round">flag</span>
              Wrap up session
            </span>
            <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.8, fontFamily: 'var(--mono)' }}>
              Saves this run · dealers not notified
            </span>
          </button>
        </div>
        <div style={{ height: 8 }} />
      </div>

      {/* ── Session end overlay ── */}
      <div
        id="sessionEndOverlay"
        className={`session-end-overlay${sessionEndVisible ? ' visible' : ''}`}
        aria-hidden={!sessionEndVisible}
      >
        <div className="session-end-panel" role="dialog" aria-modal="true" aria-labelledby="sessionDialogTitle">
          <button type="button" className="session-end-x" aria-label="Close" onClick={dismissSession}>
            <span className="material-icons-round">close</span>
          </button>
          <div className="session-end-icon">
            <span className="material-icons-round">check_circle</span>
          </div>
          <div className="session-end-banner">
            <div className="session-hdr" id="sessionDialogTitle">Session saved</div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-var)', marginBottom: 8, marginTop: 4 }}>
              {sessionEndData?.destination && (
                <span style={{ fontWeight: 700, color: 'var(--on-surface)', fontFamily: 'var(--mono)' }}>
                  BNSF Orillia → {sessionEndData.destination}
                </span>
              )}
            </div>
            <div className="session-time-grid">
              <div className="session-time-cell">
                <div className="stl-lbl">Yard · loading</div>
                <div className="stl-val">
                  ~{sessionEndData?.yardMin ?? '—'}
                  <span style={{ fontSize: 14, fontWeight: 500 }}>m</span>
                </div>
              </div>
              <div className="session-time-cell">
                <div className="stl-lbl">Dealer · unload</div>
                <div className="stl-val">
                  ~{sessionEndData?.dealerMin ?? '—'}
                  <span style={{ fontSize: 14, fontWeight: 500 }}>m</span>
                </div>
              </div>
            </div>
            <div style={{ marginTop: 12, fontSize: 13, color: 'var(--muted)', lineHeight: 1.5 }}>
              Saved to Previous loads with {sessionEndData?.loadDate || 'today'}'s date.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
