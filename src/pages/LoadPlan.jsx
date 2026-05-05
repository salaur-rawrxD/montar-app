import { useState } from 'react';
import { useStore } from '../app/state/loadSessionStore.js';
import TrailerMap from '../components/planning/TrailerMap.jsx';

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
  const grossPct     = dotStatus
    ? Math.round((dotStatus.estimatedCargoLb / (loadPlan.maxCargoLb || 47000)) * 100)
    : 0;
  const progressPct  = totalSlots > 0 ? Math.round((confirmedCnt / totalSlots) * 100) : 0;

  /* Height margin from tallest vehicle vs 162" federal limit */
  const tallestIn    = dotStatus?.tallestVehicleIn ?? null;
  const heightMargin = tallestIn ? (162 - tallestIn) : null;
  const heightOk     = heightMargin !== null && heightMargin >= 0;

  function handleContinue() {
    initYardSession();
    goTo('map');
  }

  return (
    <div className="screen active" id="s-slots" data-testid="load-plan-screen"
      style={{ background: 'var(--surface-var)' }}>

      {/* ── App bar — dark shell ── */}
      <div className="app-bar">
        <div className="app-bar-inner">
          <button type="button" className="icon-btn" onClick={() => goBack('decode')} aria-label="Back">
            <span className="material-icons-round">arrow_back</span>
          </button>
          <div className="app-bar-title">Load Plan</div>
          <button type="button" className="icon-btn" id="btnPlanInfo" title="About this plan" aria-label="Plan info">
            <span className="material-icons-round">info_outline</span>
          </button>
        </div>
      </div>

      <div className="scroll">
        {/* ── Two-column metrics: weight + height ── */}
        <div className="plan-metrics-grid" style={{ marginTop: 12 }}>
          {/* Cargo weight */}
          <div className="plan-metric-cell">
            <div className="pmc-lbl">Cargo weight</div>
            <div className={`pmc-val${grossPct > 95 ? ' err' : grossPct > 85 ? ' warn' : ' ok'}`}>
              {dotStatus ? `${(dotStatus.estimatedCargoLb / 1000).toFixed(1)}K` : '—'}
            </div>
            <div className="pmc-sub">
              {dotStatus ? `${grossPct}% of ${(loadPlan.maxCargoLb / 1000).toFixed(0)}K lbs` : 'Limit not set'}
            </div>
          </div>
          {/* Height clearance */}
          <div className="plan-metric-cell">
            <div className="pmc-lbl">Height — tallest</div>
            <div className={`pmc-val${heightOk === false ? ' err' : 'ok'}`}>
              {tallestIn ? `${tallestIn}"` : '—'}
            </div>
            <div className="pmc-sub">
              {heightMargin !== null
                ? `${heightMargin}" margin to 13'6" limit`
                : 'Federal limit 162"'}
            </div>
          </div>
        </div>

        {/* ── Gross weight bar ── */}
        {dotStatus && (
          <div className="wt-card">
            <div className="wt-header">
              <div>
                <div className="wt-lbl">Estimated gross load weight</div>
                <div className="wt-val">{dotStatus.estimatedCargoLb?.toLocaleString()} lbs</div>
                <div className="wt-limit">
                  Cargo limit · {loadPlan.maxCargoLb?.toLocaleString()} lbs
                </div>
              </div>
              <div className="wt-ok">
                <span className="material-icons-round" style={{ fontSize: 14 }}>check_circle</span>
                Est. OK
              </div>
            </div>
            <div className="wt-track">
              <div className="wt-fill" style={{ width: `${Math.min(100, grossPct)}%` }} />
            </div>
            <div className="wt-labels">
              <span>0</span>
              <span style={{ fontFamily: 'var(--mono)' }}>
                {dotStatus.estimatedCargoLb?.toLocaleString()} / {loadPlan.maxCargoLb?.toLocaleString()} lbs ({grossPct}%)
              </span>
              <span>{(loadPlan.maxCargoLb / 1000).toFixed(0)}K</span>
            </div>
          </div>
        )}

        {/* ── Deck diagram ── */}
        <TrailerMap slots={loadPlan.slots} confirmedSlots={confirmedSlots} />

        {/* ── Slot progress ── */}
        <div className="plan-progress-bar" style={{ marginTop: 10 }}>
          <div className="plan-progress-track">
            <div className="plan-progress-fill" style={{ width: `${progressPct}%` }} />
          </div>
          <div className="plan-progress-label">{confirmedCnt}/{totalSlots} verified</div>
        </div>

        {/* ── Slot list — verify each placement ── */}
        <div className="section-lbl" style={{ paddingTop: 12 }}>Verify each placement</div>
        <div className="card-el" style={{ marginTop: 0 }} id="planCardList">
          {loadPlan.slots.map((s) => {
            const isConfirmed = confirmedSlots.includes(s.slot);
            const showReason  = openReasonSlot === s.slot;
            const vName = s.vehicle
              ? `${s.vehicle.year} ${s.vehicle.make} ${s.vehicle.model}`
              : '—';

            return (
              <div
                key={s.slot}
                className={`slot-list-item${isConfirmed ? ' is-confirmed' : ''}`}
                data-slot={s.slot}
              >
                <div className="sl-num">{s.slot}</div>
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
                    type="button" className="btn-why-montar"
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
                    {isConfirmed
                      ? <><span className="material-icons-round">check_circle</span>Confirmed</>
                      : 'Confirm'}
                  </button>
                </div>

                {showReason && (
                  <div className="sl-montar-detail">
                    {s.reasoning || 'Standard assignment based on weight and height scoring.'}
                    {s.vehicle && (
                      <div style={{
                        marginTop: 8,display: 'flex',gap: 6,flexWrap: 'wrap',
                        paddingTop: 8,borderTop: '1px solid var(--outline-var)',
                      }}>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
                          {s.vehicle.heightIn}" tall
                        </span>
                        <span style={{ color: 'var(--outline)' }}>·</span>
                        <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
                          {s.vehicle.weightLb?.toLocaleString()} lbs
                        </span>
                        <span style={{ color: 'var(--outline)' }}>·</span>
                        <span className="vbadge vbadge-demo" style={{ fontSize: 10 }}>
                          <span className="material-icons-round" style={{ fontSize: 11 }}>science</span>
                          Demo data
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Confidence disclaimer */}
        <div style={{
          margin: '4px 16px 4px',padding: '10px 14px',
          background: 'var(--surface)',border: '1px solid var(--outline-var)',
          borderRadius: 'var(--card-r-sm)',
          fontSize: 12,color: 'var(--muted)',lineHeight: 1.55,
        }}>
          <span className="vbadge vbadge-demo" style={{ marginRight: 6 }}>
            <span className="material-icons-round" style={{ fontSize: 11 }}>science</span>
            Demo data
          </span>
          Weights and heights are estimated. Verify at scale before departure. Operator is responsible for final compliance.
        </div>
      </div>

      {/* ── Bottom action bar ── */}
      <div className="confirm-bar plan-actions">
        {!allConfirmed ? (
          <>
            {/* Primary: trust MONTAR's plan */}
            <button
              type="button"
              className="btn-accept-montar-primary"
              id="btnAcceptMontarPlan"
              onClick={acceptMontarPlan}
            >
              <span className="material-icons-round">verified</span>
              Accept MONTAR's plan
            </button>
            {/* Continue — disabled until all confirmed */}
            <button
              type="button"
              className="btn-fill btn-yContinue"
              id="btnPlanContinue"
              data-testid="continue-to-yard-button"
              disabled
              style={{ opacity: .4 }}
            >
              <span className="material-icons-round">arrow_forward</span>
              Continue to yard loading
            </button>
            {/* Tertiary: manual adjustments */}
            <button
              type="button"
              className="btn-outline"
              id="btnPlanAdjust"
              onClick={() => goTo('warning')}
              style={{ height: 40, fontSize: 13 }}
            >
              <span className="material-icons-round">tune</span>
              Adjustments &amp; overrides
            </button>
            <p className="plan-foot">
              Confirm each slot individually — or accept the full plan above.
            </p>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn-fill btn-yContinue"
              id="btnPlanContinue"
              data-testid="continue-to-yard-button"
              onClick={handleContinue}
            >
              <span className="material-icons-round">arrow_forward</span>
              Continue to yard loading
            </button>
            <button
              type="button"
              className="btn-outline"
              id="btnPlanAdjust"
              onClick={() => goTo('warning')}
              style={{ height: 40, fontSize: 13 }}
            >
              <span className="material-icons-round">tune</span>
              Adjustments &amp; overrides
            </button>
          </>
        )}
      </div>
    </div>
  );
}
