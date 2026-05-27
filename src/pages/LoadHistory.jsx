import { useStore } from '../app/state/loadSessionStore.js';
import BottomNav from '../components/shell/BottomNav.jsx';
import { buildPreviousLoadRows } from '../data/mockLoadSheets.js';

export default function LoadHistory() {
  const previousLoads = useStore((s) => s.previousLoads);
  const rows = buildPreviousLoadRows(previousLoads);

  return (
    <div className="screen active">
      <div className="app-bar">
        <div className="app-bar-inner">
          <div style={{ width: 48 }} />
          <div className="app-bar-title lg">Load History</div>
          <div style={{ width: 48 }} />
        </div>
      </div>
      <div className="scroll">
        <div className="section-lbl">All loads</div>
        <div className="card-el" style={{ marginBottom: 0 }}>
          {rows.length === 0 ? (
            <div style={{ padding: 16, fontSize: 13, color: 'var(--on-surface-var)' }}>No loads recorded yet.</div>
          ) : rows.map((r, i) => (
            <div key={i} className="prev-load-row">
              <div className="pl-body">
                <div className="pl-date">{r.loadDate}</div>
                <div className="pl-route">
                  {r.origin}<span className="pl-arrow">→</span>{r.destination}
                </div>
                {(r.yardMin || r.dealerMin) && (
                  <div className="pl-meta">
                    {r.yardMin && <><span>{r.yardMin} min</span> yard · </>}
                    {r.dealerMin && <><span>{r.dealerMin} min</span> dealer · </>}
                    <span>{r.vehicleCount}</span> vehicles
                  </div>
                )}
              </div>
              <div className="pl-status">Done</div>
            </div>
          ))}
        </div>
      </div>
      <BottomNav active="loads" />
    </div>
  );
}
