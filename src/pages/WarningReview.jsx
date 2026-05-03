import { useState } from 'react';
import { useStore } from '../app/state/loadSessionStore.js';

export default function WarningReview() {
  const goBack           = useStore((s) => s.goBack);
  const goTo             = useStore((s) => s.goTo);
  const acceptMontarPlan = useStore((s) => s.acceptMontarPlan);
  const initYardSession  = useStore((s) => s.initYardSession);
  const loadPlan         = useStore((s) => s.loadPlan);

  const [adjChoice, setAdjChoice]   = useState('keep');
  const [driverNote, setDriverNote] = useState('');
  const [outcome, setOutcome]       = useState(null);
  const [ackChecked, setAck]        = useState(false);

  const slot1 = loadPlan?.slots?.find((s) => s.slot === 1);
  const v1    = slot1?.vehicle;
  const isOverridable = adjChoice === 'highlander' && outcome === 'bad' && ackChecked;

  function acceptAndGoYard() {
    acceptMontarPlan();
    initYardSession();
    goTo('map');
  }

  function handleRecheck() {
    setOutcome(adjChoice === 'keep' ? 'ok' : 'bad');
    if (adjChoice === 'keep') setAck(false);
  }

  function handleOverride() {
    if (!isOverridable) return;
    initYardSession();
    goTo('map');
  }

  return (
    <div className="screen active" id="s-warning">
      {/* App bar — sits above the danger zone */}
      <div className="app-bar" style={{ background: 'var(--danger)', paddingBottom: 0 }}>
        <div className="app-bar-inner">
          <button className="icon-btn" style={{ color: 'rgba(255,255,255,.75)' }} onClick={() => goBack('slots')}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <div className="app-bar-title" style={{ color: '#fff', fontSize: 18 }}>Slot 1 — Adjustment</div>
          <div style={{ width: 48 }} />
        </div>
      </div>

      {/* Full-bleed danger zone */}
      <div className="danger-zone">
        <div className="danger-zone-top">
          <div className="danger-icon-wrap">
            <span className="material-icons-round">warning</span>
          </div>
          <div style={{ flex: 1 }}>
            <div className="danger-title">Clearance Warning</div>
            <div className="danger-body">
              Moving the Highlander XLE to Slot 1 creates a height conflict. At 70.9" it exceeds the deck clearance of 60.5" by 10.4 inches.
            </div>
          </div>
        </div>
        <div className="danger-quick-accept">
          <div className="danger-quick-copy">Prefer MONTAR's safe plan? Accept it now.</div>
          <button type="button" className="danger-quick-btn" onClick={acceptAndGoYard}>
            <span className="material-icons-round" style={{ fontSize: 16 }}>check</span>
            Accept plan
          </button>
        </div>
      </div>

      <div className="scroll">
        {/* Why the assigned vehicle belongs here */}
        <div className="reason-card">
          <div className="reason-hdr">
            <div className="reason-title">Why {v1 ? `${v1.make} ${v1.model}` : 'this vehicle'} belongs in Slot 1</div>
            <div className="reason-sub">MONTAR's reasoning for this assignment</div>
          </div>
          <div className="reason-row">
            <div className="ri-ok"><span className="material-icons-round">straighten</span></div>
            <div className="rl">
              <div className="rl-lbl">Height clearance</div>
              <div className="rl-val">{v1 ? `${v1.heightIn}"` : '56.9"'} · Deck 60.5" · Margin {v1 ? (60.5 - v1.heightIn).toFixed(1) : '3.6'}"</div>
            </div>
            <span className="badge badge-ok">Pass</span>
          </div>
          <div className="reason-row">
            <div className="ri-ok"><span className="material-icons-round">scale</span></div>
            <div className="rl">
              <div className="rl-lbl">Front axle weight</div>
              <div className="rl-val">~1,420 lbs to steer axle · Limit 12,000 lbs</div>
            </div>
            <span className="badge badge-ok">Pass</span>
          </div>
          <div className="reason-row">
            <div className="ri-warn"><span className="material-icons-round">rotate_right</span></div>
            <div className="rl">
              <div className="rl-lbl">Loading sequence</div>
              <div className="rl-val">Slot 1 loads reversed — cab-over position required</div>
            </div>
            <span className="badge badge-warn">Note</span>
          </div>
          <div className="reason-row">
            <div className="ri-err"><span className="material-icons-round">height</span></div>
            <div className="rl">
              <div className="rl-lbl">Your change — Highlander XLE</div>
              <div className="rl-val">70.9" exceeds clearance by 10.4"</div>
            </div>
            <span className="badge badge-err">Fail</span>
          </div>
        </div>

        {/* MONTAR suggestion */}
        <div style={{ margin: '10px 16px 0', padding: '14px 16px', background: 'var(--surface-container)', borderRadius: 'var(--card-r)', border: '1px solid var(--outline-var)' }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 5 }}>MONTAR's recommendation</div>
          <div style={{ fontSize: 13, color: 'var(--on-surface-var)', lineHeight: 1.55 }}>
            Keep {v1 ? `${v1.make} ${v1.model}` : 'the Camry XSE'} in Slot 1. The Highlander XLE has adequate clearance on the bottom deck in Slot 6 and better weight distribution there.
          </div>
        </div>

        {/* Driver choice — large tappable option cards */}
        <div className="section-lbl" style={{ paddingTop: 14 }}>Driver adjustment</div>
        <div style={{ padding: '0 16px' }}>
          <div
            className={`adj-option-card${adjChoice === 'keep' ? ' selected' : ''}`}
            onClick={() => { setAdjChoice('keep'); setOutcome(null); setAck(false); }}
          >
            <div className="adj-option-radio" />
            <div>
              <div className="adj-option-lbl">Keep MONTAR's assignment</div>
              <div className="adj-option-sub">Recommended · {v1 ? `${v1.make} ${v1.model}` : 'Camry XSE'} in Slot 1 · clearance safe</div>
            </div>
          </div>
          <div
            className={`adj-option-card${adjChoice === 'highlander' ? ' selected-danger' : ''}`}
            onClick={() => { setAdjChoice('highlander'); setOutcome(null); setAck(false); }}
          >
            <div className="adj-option-radio" />
            <div>
              <div className="adj-option-lbl" style={{ color: adjChoice === 'highlander' ? 'var(--error)' : undefined }}>Move Highlander XLE to Slot 1</div>
              <div className="adj-option-sub">Height conflict — requires driver acknowledgement</div>
            </div>
          </div>
          <textarea
            className="adj-note"
            placeholder="Driver note (optional): dealer staging request, chain placement…"
            value={driverNote}
            onChange={(e) => setDriverNote(e.target.value)}
          />
          <button
            type="button"
            className="btn-outline"
            style={{ width: '100%', justifyContent: 'center', marginTop: 10, height: 44 }}
            onClick={handleRecheck}
          >
            <span className="material-icons-round" style={{ fontSize: 18 }}>fact_check</span>
            Apply &amp; recheck feasibility
          </button>
          {outcome === 'ok' && (
            <div className="adj-outcome ok">MONTAR's plan is clearance-safe. {v1 ? `${v1.make} ${v1.model}` : 'Camry XSE'} in Slot 1 is the recommended assignment.</div>
          )}
          {outcome === 'bad' && (
            <>
              <div className="adj-outcome bad">
                Height conflict confirmed. Highlander XLE at 70.9" exceeds the 60.5" clearance for Slot 1 by 10.4 inches. This override is the driver's sole responsibility.
              </div>
              <div className="adj-ack-card">
                <input
                  type="checkbox"
                  id="adjAckRisk"
                  checked={ackChecked}
                  onChange={(e) => setAck(e.target.checked)}
                />
                <label htmlFor="adjAckRisk" className="adj-ack-text">
                  I understand this creates a deck clearance conflict and accept full responsibility for this override.
                </label>
              </div>
            </>
          )}
        </div>
        <div style={{ height: 16 }} />
      </div>

      {/* Override action bar */}
      <div className="override-bar">
        <button
          type="button"
          className="btn-err"
          id="btnAdjOverride"
          disabled={!isOverridable}
          onClick={handleOverride}
          style={{ cursor: isOverridable ? 'pointer' : 'not-allowed' }}
        >
          <span className="material-icons-round">warning</span>
          Override — I accept the risk
        </button>
        <button
          type="button"
          className="btn-fill"
          id="btnAcceptMontar"
          style={{ width: '100%', justifyContent: 'center' }}
          onClick={acceptAndGoYard}
        >
          <span className="material-icons-round">verified</span>
          Accept MONTAR's Plan
        </button>
      </div>
    </div>
  );
}
