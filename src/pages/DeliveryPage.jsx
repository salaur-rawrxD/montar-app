import { useStore } from '../app/state/loadSessionStore.js';
import DeliveryMap from '../components/maps/DeliveryMap.jsx';

export default function DeliveryPage() {
  const goBack           = useStore((s) => s.goBack);
  const endSession       = useStore((s) => s.endSession);
  const dismissSession   = useStore((s) => s.dismissSession);
  const sessionEndVisible = useStore((s) => s.sessionEndVisible);
  const sessionEndData   = useStore((s) => s.sessionEndData);
  const deliveryPlan     = useStore((s) => s.deliveryPlan);

  const dealer = deliveryPlan?.dealer;

  return (
    <div className="screen active" id="s-delivery" data-testid="delivery-screen">
      <div className="app-bar">
        <div className="app-bar-inner">
          <button className="icon-btn" onClick={() => goBack('loadcomplete')}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <div className="app-bar-title">Dealer arrival</div>
          <button className="icon-btn">
            <span className="material-icons-round">more_vert</span>
          </button>
        </div>
      </div>

      <div className="scroll">
        <div className="delivery-disclaimer">
          <strong>On-lot &amp; handoff only.</strong> MONTAR does not replace your GPS. Dealer instructions here — how to drive in, where to park, approach, and notes — vary by store. Read before you roll in.
        </div>

        <DeliveryMap dealer={dealer} />

        <div className="approach-card" style={{ marginTop: 6 }}>
          <div className="ac-title">
            <span className="material-icons-round">fork_right</span>
            Optimal approach (this dealer)
          </div>
          {(dealer?.approach || []).map((step) => (
            <div key={step.step} className="ac-step">
              <div className="ac-num">{step.step}</div>
              <div className="ac-text" dangerouslySetInnerHTML={{ __html: step.text }} />
            </div>
          ))}
        </div>

        <div className="section-lbl">Delivery Notes</div>
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

        <div id="deliverySingleStopNote" style={{ margin: '8px 16px 0', fontSize: 12, color: 'var(--on-surface-var)', lineHeight: 1.45 }}>
          Single-dealer drop: follow your trailer unload order. A step-by-step unload list appears here only for multi-stop deliveries.
        </div>

        <div id="deliveryBottomCta" style={{ padding: 16 }}>
          <button
            type="button"
            className="btn-fill"
            id="btnEndDeliverySession"
            data-testid="wrap-session-button"
            style={{ width: '100%', justifyContent: 'center', minHeight: 48, borderRadius: 14, fontSize: 15, background: 'var(--green)', flexDirection: 'column', gap: 4, padding: '12px 16px', height: 'auto' }}
            onClick={endSession}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className="material-icons-round">emoji_events</span>
              Wrap up session
            </span>
            <span style={{ fontSize: 12, fontWeight: 400, opacity: 0.92 }}>
              Adds this run to Previous loads on Home for your records. Dealers are not notified from Montar.
            </span>
          </button>
        </div>
      </div>

      {/* Session End Overlay */}
      <div
        id="sessionEndOverlay"
        className={`session-end-overlay${sessionEndVisible ? ' visible' : ''}`}
        aria-hidden={!sessionEndVisible}
      >
        <div className="session-end-panel" role="dialog" aria-modal="true" aria-labelledby="sessionDialogTitle">
          <button type="button" className="session-end-x" id="btnSessionEndDismiss" aria-label="Close" onClick={dismissSession}>
            <span className="material-icons-round">close</span>
          </button>
          <div className="session-end-banner">
            <div className="session-hdr" id="sessionDialogTitle">Session saved</div>
            <div style={{ fontSize: 13, color: 'var(--on-surface-var)' }}>Timing for this session</div>
            <div className="session-time-grid">
              <div className="session-time-cell">
                <div className="stl-lbl">Yard · loading</div>
                <div className="stl-val" id="sessionYardMin">~{sessionEndData?.yardMin ?? '—'} min</div>
              </div>
              <div className="session-time-cell">
                <div className="stl-lbl">Dealer · unloading</div>
                <div className="stl-val" id="sessionDealerMin">~{sessionEndData?.dealerMin ?? '—'} min</div>
              </div>
            </div>
            <div className="sub" id="sessionEndSub">
              Saved to Previous loads on Home with today's load date. Nothing is shared with the dealer from here.
            </div>
            {sessionEndData?.destination && (
              <div className="sub" id="sessionSavedDetail" style={{ marginTop: 12, textAlign: 'left', fontSize: 12, color: 'var(--on-surface-var)' }}>
                {sessionEndData.loadDate} · {sessionEndData.destination}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
