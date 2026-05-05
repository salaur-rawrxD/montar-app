import { useState } from 'react';
import { useStore } from '../app/state/loadSessionStore.js';

export default function WarningReview() {
  const goBack           = useStore((s) => s.goBack);
  const goTo             = useStore((s) => s.goTo);
  const acceptMontarPlan = useStore((s) => s.acceptMontarPlan);
  const initYardSession  = useStore((s) => s.initYardSession);
  const loadPlan         = useStore((s) => s.loadPlan);

  const [adjChoice, setAdjChoice] = useState('keep');
  const [driverNote, setDriverNote] = useState('');
  const [outcome, setOutcome]     = useState(null);
  const [ackChecked, setAck]      = useState(false);

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
    <div className="screen active" id="s-warning" style={{ background: 'var(--surface-var)' }}>

      {/* ── App bar — sits on danger-zone background ── */}
      <div className="app-bar" style={{ background: '#7F1313', paddingBottom: 0 }}>
        <div className="app-bar-inner" style={{ borderBottomColor: 'rgba(255,255,255,.08)' }}>
          <button
            className="icon-btn"
            style={{ color: 'rgba(255,255,255,.65)' }}
            onClick={() => goBack('slots')}
            aria-label="Back"
          >
            <span className="material-icons-round">arrow_back</span>
          </button>
          <div className="app-bar-title" style={{ color: '#fff', fontSize: 18 }}>
            Slot 1 — Clearance Warning
          </div>
          <div style={{ width: 48 }} />
        </div>
      </div>

      {/* ── Full-bleed danger zone ── */}
      <div className="danger-zone">
        <div className="danger-zone-top">
          <div className="danger-icon-wrap">
            <span className="material-icons-round">warning</span>
          </div>
          <div style={{ flex: 1 }}>
            <div className="danger-title">Height Conflict — Slot 1</div>
            <div className="danger-body">
              Moving the Highlander XLE to Slot 1 creates a deck clearance conflict.
              At <strong style={{ color: '#FCA5A5', fontFamily: 'var(--mono)' }}>70.9"</strong> it
              exceeds the clearance of <strong style={{ fontFamily: 'var(--mono)' }}>60.5"</strong> by{' '}
              <strong style={{ color: '#FCA5A5', fontFamily: 'var(--mono)' }}>10.4 inches</strong>.
            </div>
          </div>
        </div>

        {/* Quick accept MONTAR's plan */}
        <div className="danger-quick-accept">
          <div className="danger-quick-copy">
            Prefer MONTAR's safe assignment? Accept it and go straight to the yard.
          </div>
          <button type="button" className="danger-quick-btn" onClick={acceptAndGoYard}>
            <span className="material-icons-round" style={{ fontSize: 16 }}>check</span>
            Accept plan
          </button>
        </div>
      </div>

      <div className="scroll">
        {/* ── MONTAR's reasoning for Slot 1 ── */}
        <div className="reason-card">
          <div className="reason-hdr">
            <div className="reason-title">
              Why {v1 ? `${v1.make} ${v1.model}` : 'this vehicle'} belongs in Slot 1
            </div>
            <div className="reason-sub">MONTAR's scoring for this assignment</div>
          </div>
          <div className="reason-row">
            <div className="ri-ok"><span className="material-icons-round">straighten</span></div>
            <div className="rl">
              <div className="rl-lbl">Height clearance</div>
              <div className="rl-val">
                {v1 ? `${v1.heightIn}"` : '56.9"'} · Deck 60.5" · Margin{' '}
                {v1 ? (60.5 - v1.heightIn).toFixed(1) : '3.6'}"
              </div>
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
              <div className="rl-val" style={{ color: 'var(--error)', fontWeight: 600 }}>
                70.9" exceeds clearance by 10.4"
              </div>
            </div>
            <span className="badge badge-err">Fail</span>
          </div>
        </div>

        {/* MONTAR recommendation block */}
        <div style={{
          margin: '10px 16px 0',padding: '14px 16px',
          background: 'var(--surface)',border: '1px solid var(--outline-var)',
          borderLeft: '4px solid var(--primary)',
          borderRadius: 'var(--card-r)',
        }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--on-surface)', marginBottom: 5, letterSpacing: '-.01em' }}>
            MONTAR's recommendation
          </div>
          <div style={{ fontSize: 13, color: 'var(--on-surface-var)', lineHeight: 1.6 }}>
            Keep {v1 ? `${v1.make} ${v1.model}` : 'the Camry XSE'} in Slot 1.
            The Highlander XLE has adequate clearance on the bottom deck in Slot 6
            and better weight distribution there.
          </div>
        </div>

        {/* ── Driver adjustment section ── */}
        <div className="section-lbl" style={{ paddingTop: 14 }}>Driver adjustment</div>
        <div style={{ padding: '0 16px' }}>
          <div
            className={`adj-option-card${adjChoice === 'keep' ? ' selected' : ''}`}
            onClick={() => { setAdjChoice('keep'); setOutcome(null); setAck(false); }}
          >
            <div className="adj-option-radio" />
            <div>
              <div className="adj-option-lbl">Keep MONTAR's assignment</div>
              <div className="adj-option-sub">
                Recommended · {v1 ? `${v1.make} ${v1.model}` : 'Camry XSE'} in Slot 1 · clearance safe
              </div>
            </div>
          </div>
          <div
            className={`adj-option-card${adjChoice === 'highlander' ? ' selected-danger' : ''}`}
            onClick={() => { setAdjChoice('highlander'); setOutcome(null); setAck(false); }}
          >
            <div className="adj-option-radio" />
            <div>
              <div className="adj-option-lbl" style={{ color: adjChoice === 'highlander' ? 'var(--error)' : undefined }}>
                Move Highlander XLE to Slot 1
              </div>
              <div className="adj-option-sub">
                Height conflict detected — requires driver acknowledgement
              </div>
            </div>
          </div>

          <textarea
            className="adj-note"
            placeholder="Driver note (optional): dealer staging request, chain placement…"
            value={driverNote}
            onChange={(e) => setDriverNote(e.target.value)}
          />

          <button
            type="button" className="btn-outline"
            style={{ width: '100%', justifyContent: 'center', marginTop: 10, height: 44 }}
            onClick={handleRecheck}
          >
            <span className="material-icons-round" style={{ fontSize: 18 }}>fact_check</span>
            Apply &amp; recheck feasibility
          </button>

          {outcome === 'ok' && (
            <div className="adj-outcome ok">
              MONTAR's plan is clearance-safe.{' '}
              {v1 ? `${v1.make} ${v1.model}` : 'Camry XSE'} in Slot 1 is the recommended assignment.
            </div>
          )}
          {outcome === 'bad' && (
            <>
              <div className="adj-outcome bad">
                <strong>Height conflict confirmed.</strong> Highlander XLE at 70.9" exceeds the 60.5" clearance
                for Slot 1 by <span style={{ fontFamily: 'var(--mono)', fontWeight: 700 }}>10.4 inches</span>.
                This override is the driver's sole responsibility.
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

      {/* ── Override action bar — serious, unambiguous ── */}
      <div className="override-bar">
        <button
          type="button" className="btn-err"
          id="btnAdjOverride"
          disabled={!isOverridable}
          onClick={handleOverride}
          style={{ cursor: isOverridable ? 'pointer' : 'not-allowed' }}
        >
          <span className="material-icons-round">warning</span>
          Override — I accept the risk
        </button>
        <button
          type="button" className="btn-fill"
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
