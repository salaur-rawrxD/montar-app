import { useState } from 'react';
import { useStore } from '../app/state/loadSessionStore.js';

export default function WarningReview() {
  const goBack           = useStore((s) => s.goBack);
  const goTo             = useStore((s) => s.goTo);
  const acceptMontarPlan = useStore((s) => s.acceptMontarPlan);
  const initYardSession  = useStore((s) => s.initYardSession);
  const loadPlan         = useStore((s) => s.loadPlan);

  const [adjChoice, setAdjChoice]     = useState('keep');
  const [driverNote, setDriverNote]   = useState('');
  const [outcomeState, setOutcome]    = useState(null); // null | 'ok' | 'bad'
  const [ackChecked, setAckChecked]   = useState(false);
  const [overrideEnabled, setOverrideEnabled] = useState(false);
  const [showAckRow, setShowAckRow]   = useState(false);

  function acceptAndGoYard() {
    acceptMontarPlan();
    goTo('map');
  }

  function handleRecheck() {
    if (adjChoice === 'keep') {
      setOutcome('ok');
      setShowAckRow(false);
      setOverrideEnabled(false);
    } else {
      setOutcome('bad');
      setShowAckRow(true);
    }
  }

  function handleAckChange(checked) {
    setAckChecked(checked);
    setOverrideEnabled(checked);
  }

  function handleOverride() {
    if (!overrideEnabled) return;
    initYardSession();
    goTo('map');
  }

  const slot1 = loadPlan?.slots?.find((s) => s.slot === 1);
  const v1 = slot1?.vehicle;

  return (
    <div className="screen active" id="s-warning">
      <div className="app-bar">
        <div className="app-bar-inner">
          <button className="icon-btn" onClick={() => goBack('slots')}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <div className="app-bar-title">Slot 1 — Adjustment</div>
          <div style={{ width: 48 }} />
        </div>
      </div>

      <div className="scroll">
        <div className="adj-quick-cta">
          <div className="adj-quick-copy">Prefer MONTAR's clearance-safe plan? You can still review details below.</div>
          <button type="button" className="btn-fill" id="btnAcceptMontarInline" onClick={acceptAndGoYard}>
            <span className="material-icons-round" style={{ fontSize: 18 }}>check</span>
            Accept plan
          </button>
        </div>

        <div className="warn-banner">
          <span className="material-icons-round">warning</span>
          <div>
            <div className="warn-title">Clearance Warning</div>
            <div className="warn-body">
              Moving the Highlander XLE to Slot 1 creates a height clearance issue. At 70.9" it exceeds the deck clearance of 60.5".
            </div>
          </div>
        </div>

        <div className="reason-card">
          <div className="reason-hdr">
            <div className="reason-title">Why {v1 ? `${v1.year} ${v1.make} ${v1.model}` : 'this vehicle'} belongs in Slot 1</div>
            <div className="reason-sub">Reasoning behind this assignment</div>
          </div>
          <div className="reason-row"><div className="ri-ok"><span className="material-icons-round">straighten</span></div><div className="rl"><div className="rl-lbl">Height clearance</div><div className="rl-val">{v1 ? `${v1.make} ${v1.model} ${v1.heightIn}"` : ''} · Deck clearance 60.5" · Margin {v1 ? (60.5 - v1.heightIn).toFixed(1) : '3.6'}"</div></div><span className="badge badge-ok">OK</span></div>
          <div className="reason-row"><div className="ri-ok"><span className="material-icons-round">scale</span></div><div className="rl"><div className="rl-lbl">Front axle weight</div><div className="rl-val">Contributes ~1,420 lbs to steer axle · Limit 12,000 lbs</div></div><span className="badge badge-ok">OK</span></div>
          <div className="reason-row"><div className="ri-warn"><span className="material-icons-round">rotate_right</span></div><div className="rl"><div className="rl-lbl">Loading sequence</div><div className="rl-val">Slot 1 loads reversed — cab-over position required</div></div><span className="badge badge-warn">Note</span></div>
          <div className="reason-row"><div className="ri-err"><span className="material-icons-round">height</span></div><div className="rl"><div className="rl-lbl">Your change — Highlander XLE</div><div className="rl-val">70.9" exceeds Slot 1 clearance by 10.4"</div></div><span className="badge badge-err">Fail</span></div>
        </div>

        <div className="card-fill" style={{ marginTop: 6 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', marginBottom: 5 }}>MONTAR's suggestion</div>
          <div style={{ fontSize: 13, color: 'var(--on-surface-var)', lineHeight: 1.55 }}>
            Keep the Camry XSE in Slot 1. The Highlander XLE has adequate clearance and better weight distribution on the bottom deck in Slot 6.
          </div>
        </div>

        <div className="adj-panel" id="adjPanel">
          <div className="adj-panel-h"><span className="material-icons-round">tune</span>Try a change (driver choice)</div>
          <label className="adj-opt">
            <input type="radio" name="adjSlot1" value="keep" checked={adjChoice === 'keep'} onChange={() => setAdjChoice('keep')} />
            <span className="adj-opt-lbl">Keep MONTAR: Camry XSE V6 in Slot 1 <small>Recommended — clearance safe</small></span>
          </label>
          <label className="adj-opt">
            <input type="radio" name="adjSlot1" value="highlander" checked={adjChoice === 'highlander'} onChange={() => setAdjChoice('highlander')} />
            <span className="adj-opt-lbl">Move Highlander XLE into Slot 1 <small>Requires review — conflicts with deck height</small></span>
          </label>
          <textarea
            className="adj-note"
            id="adjDriverNote"
            placeholder="Driver note (optional): e.g. dealer staging request, chain placement…"
            value={driverNote}
            onChange={(e) => setDriverNote(e.target.value)}
          />
          <div className="adj-actions">
            <button type="button" className="btn-outline btn-adj-check" id="btnAdjCheck" onClick={handleRecheck}>
              <span className="material-icons-round" style={{ fontSize: 18 }}>fact_check</span>
              Apply &amp; recheck feasibility
            </button>
          </div>
          {outcomeState === 'ok' && (
            <div id="adjOutcome" className="adj-outcome ok">
              MONTAR's plan is clearance-safe. Camry XSE V6 in Slot 1 is the recommended assignment.
            </div>
          )}
          {outcomeState === 'bad' && (
            <div id="adjOutcome" className="adj-outcome bad">
              Height conflict detected. Highlander XLE at 70.9" exceeds the 60.5" clearance for Slot 1. This override requires driver acknowledgement.
            </div>
          )}
          {showAckRow && (
            <label id="adjAckRow" className="adj-ack-row show">
              <input type="checkbox" id="adjAckRisk" checked={ackChecked} onChange={(e) => handleAckChange(e.target.checked)} />
              <span>I understand this conflicts with deck clearance and accept responsibility if I proceed with an override.</span>
            </label>
          )}
        </div>
      </div>

      <div className="override-bar">
        <button type="button" className="btn-err" id="btnAdjOverride" disabled={!overrideEnabled} onClick={handleOverride}>
          <span className="material-icons-round">warning</span>Override — I accept the risk
        </button>
        <button
          type="button"
          className="btn-fill"
          id="btnAcceptMontar"
          style={{ width: '100%', justifyContent: 'center', height: 40, borderRadius: 20, fontFamily: 'var(--font)', fontSize: 14, fontWeight: 500 }}
          onClick={acceptAndGoYard}
        >
          <span className="material-icons-round">check</span>Accept MONTAR's Plan
        </button>
      </div>
    </div>
  );
}
