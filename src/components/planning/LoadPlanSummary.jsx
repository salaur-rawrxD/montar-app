export default function LoadPlanSummary({ loadPlan, dotStatus }) {
  if (!loadPlan || !dotStatus) return null;

  const pct = Math.round((dotStatus.estimatedCargoLb / (loadPlan.maxCargoLb || 47000)) * 100);

  return (
    <div className="wt-card">
      <div className="wt-header">
        <div>
          <div className="wt-lbl">Total Load Weight</div>
          <div className="wt-val">{dotStatus.estimatedCargoLb?.toLocaleString()} lbs</div>
          <div className="wt-limit">Limit: {loadPlan.maxCargoLb?.toLocaleString()} lbs available cargo</div>
        </div>
        <div className={`wt-ok`}>
          <span className="material-icons-round" style={{ fontSize: 14 }}>
            {dotStatus.grossStatus === 'ok' ? 'check_circle' : 'warning'}
          </span>
          {dotStatus.grossStatus === 'ok' ? 'DOT OK' : 'Review'}
        </div>
      </div>
      <div className="wt-track">
        <div className="wt-fill" style={{ width: `${Math.min(100, pct)}%` }} />
      </div>
      <div className="wt-labels">
        <span>0</span>
        <span>{dotStatus.estimatedCargoLb?.toLocaleString()} / {loadPlan.maxCargoLb?.toLocaleString()} lbs ({pct}%)</span>
        <span>{(loadPlan.maxCargoLb / 1000).toFixed(0)}K</span>
      </div>
    </div>
  );
}
