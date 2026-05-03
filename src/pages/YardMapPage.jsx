import { useStore } from '../app/state/loadSessionStore.js';
import YardMap from '../components/maps/YardMap.jsx';

export default function YardMapPage() {
  const goBack      = useStore((s) => s.goBack);
  const goTo        = useStore((s) => s.goTo);
  const yardStops   = useStore((s) => s.yardStops);
  const yardIdx     = useStore((s) => s.yardIdx);
  const markYardStop = useStore((s) => s.markYardStop);

  const current  = yardStops[yardIdx] || null;
  const next     = yardStops[yardIdx + 1] || null;
  const allDone  = yardIdx >= yardStops.length;

  function shortName(title) {
    const m = title?.match(/—\s*(.+)/);
    return m ? m[1] : title;
  }

  return (
    <div className="screen active" id="s-map" data-testid="yard-map-screen">
      <div className="app-bar">
        <div className="app-bar-inner">
          <button type="button" className="icon-btn" onClick={() => goBack('slots')}>
            <span className="material-icons-round">arrow_back</span>
          </button>
          <div className="app-bar-title">Yard loading</div>
          <button type="button" className="icon-btn">
            <span className="material-icons-round">layers</span>
          </button>
        </div>
      </div>

      <div className="yard-scroll">
        <YardMap stops={yardStops} activeIdx={yardIdx} />

        <div className="map-sheet">
          <div className="sheet-handle" />

          {current && (
            <div className="yard-pull-card" id="yardNextCard">
              <div className="yard-seq-badge" id="yardNextNum">{yardIdx + 1}</div>
              <div className="yard-pull-main">
                <div className="yard-pull-kicker">Current pull</div>
                <div className="yard-pull-title" id="yardNextName">{current.title}</div>
                <div className="yard-meta-row">
                  <div className="yard-meta-item">
                    <span className="material-icons-round">straighten</span>
                    <div><strong>Distance</strong><br /><span id="yardNextDist">{current.dist}</span></div>
                  </div>
                  <div className="yard-meta-item">
                    <span className="material-icons-round">directions_walk</span>
                    <div><strong>Walk</strong><br /><span id="yardNextWalkInline">{current.walk}</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {next && (
            <div className="yard-next-strip" id="yardUpNextWrap">
              <span className="material-icons-round yn-ic" style={{ fontSize: 20 }}>arrow_circle_right</span>
              <div>
                <div className="yn-lbl" id="yardUpNextLbl">Up next</div>
                <div className="yn-title" id="yardUpNextName">{next.title}</div>
                <div className="yn-hint" id="yardUpNextHint">{current?.upNextHint || ''}</div>
              </div>
            </div>
          )}

          <div className="stop-q" id="yardStopQ">
            {yardStops.map((s, i) => {
              const isDone   = i < yardIdx;
              const isActive = i === yardIdx;
              return (
                <div
                  key={s.stallId}
                  className={`sq-chip${isActive ? ' active' : ''}${isDone ? ' loaded' : ''}`}
                  data-yi={i}
                  onClick={() => isActive && markYardStop()}
                >
                  <div className="sqn">{i + 1}</div>
                  <div className="sql">{s.stallId}</div>
                  <div className="sqv">{shortName(s.title)}</div>
                </div>
              );
            })}
          </div>

          <div className="map-load-cta">
            {allDone ? (
              <button
                type="button"
                className="btn-outline"
                id="btnYardAllDone"
                data-testid="finish-yard-button"
                style={{ width: '100%', justifyContent: 'center', minHeight: 44, borderRadius: 12, fontSize: 14, borderColor: '#dadce0', color: '#1a73e8', display: 'flex', alignItems: 'center', gap: 8 }}
                onClick={() => goTo('loadcomplete')}
              >
                <span className="material-icons-round">flag</span>
                All {yardStops.length} loaded — finish yard
              </button>
            ) : (
              <button
                type="button"
                className="btn-fill btn-yard-primary"
                id="btnYardMarkLoaded"
                data-testid="load-next-vehicle-button"
                onClick={markYardStop}
              >
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-icons-round" style={{ fontSize: 22 }}>check_circle</span>
                  <span id="btnYardMarkTitle">Strapped &amp; loaded</span>
                </span>
                <span className="btn-yard-sub" id="btnYardMarkSub">
                  Vehicle {yardIdx + 1} of {yardStops.length} · confirm, then continue to next stall
                </span>
              </button>
            )}
          </div>
          <p className="yard-foot-hint">Highlighted chip = active stall. Tap it to confirm, or use the button above.</p>
        </div>
      </div>
    </div>
  );
}
