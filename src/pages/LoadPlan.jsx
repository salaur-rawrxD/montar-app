import { useState } from 'react';
import { useStore } from '../app/state/loadSessionStore.js';
import TrailerMap from '../components/planning/TrailerMap.jsx';
import LoadPlanSummary from '../components/planning/LoadPlanSummary.jsx';

export default function LoadPlan() {
  const goBack           = useStore((s) => s.goBack);
  const goTo             = useStore((s) => s.goTo);
  const loadPlan         = useStore((s) => s.loadPlan);
  const dotStatus        = useStore((s) => s.dotStatus);
  const confirmedSlots   = useStore((s) => s.confirmedSlots);
  const confirmSlot      = useStore((s) => s.confirmSlot);
  const acceptMontarPlan = useStore((s) => s.acceptMontarPlan);
  const initYardSession  = useStore((s) => s.initYardSession);

  const [openReasonSlot, setOpenReasonSlot] = useState(null);

  if (!loadPlan) return null;

  const totalSlots   = loadPlan.slots.length;
  const confirmedCnt = confirmedSlots.length;
  const allConfirmed = confirmedCnt === totalSlots;

  const grossPct     = dotStatus ? Math.round((dotStatus.estimatedCargoLb / (loadPlan.maxCargoLb || 47000)) * 100) : 0;

  function handleContinue() {
    initYardSession();
    goTo('map');
  }

  function handleAdjust() {
    goTo('warning');
  }

  return (
    <div className="screen active" id="s-slots" data-testid="load-plan-screen">
      <div className="app-bar">
        <div className="app-bar-inner">
          <button type="button" className="icon-btn" onClick={() => goBack('decode')}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <div className="app-bar-title">Load Plan</div>
          <button type="button" className="icon-btn" id="btnPlanInfo" title="About this plan">
            <span className="material-icons-round">info_outline</span>
          </button>
        </div>
      </div>

      <div className="scroll">
        <div className="plan-intro">
          <div className="plan-intro-title">
            <span className="material-icons-round" style={{ fontSize: 18, color: 'var(--primary)' }}>touch_app</span>
            You're in the loop
          </div>
          <div className="plan-intro-body">
            Confirm each slot when you're satisfied. Optional: open <strong>Why this slot?</strong> for MONTAR's reasoning. Adjustments stay available with guardrails.
          </div>
        </div>

        <div className="plan-progress" id="planProgress">
          {confirmedCnt} of {totalSlots} vehicles confirmed
        </div>

        {dotStatus && (
          <div className="wt-card">
            <div className="wt-header">
              <div>
                <div className="wt-lbl">Total Load Weight</div>
                <div className="wt-val">{dotStatus.estimatedCargoLb?.toLocaleString()} lbs</div>
                <div className="wt-limit">Limit: {loadPlan.maxCargoLb?.toLocaleString()} lbs available cargo</div>
              </div>
              <div className="wt-ok">
                <span className="material-icons-round" style={{ fontSize: 14 }}>check_circle</span>
                DOT OK
              </div>
            </div>
            <div className="wt-track">
              <div className="wt-fill" style={{ width: `${Math.min(100, grossPct)}%` }} />
            </div>
            <div className="wt-labels">
              <span>0</span>
              <span>{dotStatus.estimatedCargoLb?.toLocaleString()} / {loadPlan.maxCargoLb?.toLocaleString()} lbs ({grossPct}%)</span>
              <span>{(loadPlan.maxCargoLb / 1000).toFixed(0)}K</span>
            </div>
          </div>
        )}

        <TrailerMap slots={loadPlan.slots} confirmedSlots={confirmedSlots} />

        <div className="section-lbl">Verify each placement</div>
        <div className="card-el" style={{ marginTop: 0 }} id="planCardList">
          {loadPlan.slots.map((s) => {
            const isConfirmed  = confirmedSlots.includes(s.slot);
            const showReason   = openReasonSlot === s.slot;
            const vName = s.vehicle ? `${s.vehicle.year} ${s.vehicle.make} ${s.vehicle.model}` : '—';

            return (
              <div
                key={s.slot}
                className={`slot-list-item${isConfirmed ? ' is-confirmed' : ''}${showReason ? ' show-reason' : ''}`}
                data-slot={s.slot}
              >
                <div className={`sl-num${!s.vehicle ? ' ' : ''}`}
                  style={!s.vehicle ? { background: 'var(--surface-container)', color: 'var(--on-surface-var)' } : {}}
                >
                  {s.slot}
                </div>
                <div className="sl-info">
                  <div className="sl-name">{vName}</div>
                  <div className="sl-vin">{s.vehicle?.vin}</div>
                </div>
                <div className="sl-right">
                  <div className="sl-wt">{s.vehicle?.weightLb?.toLocaleString()} lbs</div>
                  <div className="sl-reason">{s.label}</div>
                </div>
                <div className="sl-ack-row">
                  <button
                    type="button"
                    className="btn-why-montar"
                    onClick={() => setOpenReasonSlot(showReason ? null : s.slot)}
                  >
                    <span className="material-icons-round">help_outline</span>
                    Why this slot?
                  </button>
                  <button
                    type="button"
                    className={`btn-ack-slot${isConfirmed ? ' done' : ''}`}
                    data-testid="confirm-slot-button"
                    data-slot={s.slot}
                    onClick={() => confirmSlot(s.slot)}
                  >
                    {isConfirmed ? (
                      <><span className="material-icons-round">check_circle</span>Confirmed</>
                    ) : 'Confirm'}
                  </button>
                </div>
                {showReason && (
                  <div className="sl-montar-detail" style={{ display: 'block' }}>
                    {s.reasoning || 'Standard assignment based on weight and height scoring.'}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="confirm-bar plan-actions">
        <p className="plan-foot-short">Trust the full plan, review adjustments, or confirm each row — your call.</p>
        <button
          type="button"
          className="btn-outline btn-accept-montar-outline"
          id="btnAcceptMontarPlan"
          onClick={acceptMontarPlan}
        >
          <span className="material-icons-round">verified</span>
          Accept MONTAR's plan
        </button>
        <button type="button" className="btn-outline" id="btnPlanAdjust" onClick={handleAdjust}>
          <span className="material-icons-round">tune</span>
          Adjustments &amp; overrides
        </button>
        <button
          type="button"
          className="btn-fill btn-yContinue"
          id="btnPlanContinue"
          data-testid="continue-to-yard-button"
          disabled={!allConfirmed}
          onClick={handleContinue}
        >
          <span className="material-icons-round">arrow_forward</span>
          Continue to yard loading
        </button>
      </div>
    </div>
  );
}
