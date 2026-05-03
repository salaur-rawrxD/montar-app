import { YARD_STOPS } from '../../data/sampleYards.js';

function pathRowA(sx) { return `M30,318 L30,165 L196,165 L196,78 L${sx},78 L${sx},52`; }
function pathRowC(sx) { return `M30,318 L30,165 L196,165 L196,198 L${sx},198 L${sx},208`; }

const STALL_META = {
  T042: { x: 72,  y: 26, cx: 76, cy: 29, txtX: 77,  txtY: 24, path: () => pathRowA(86),  nx: 'translate(0,0)'    },
  T043: { x: 104, y: 26, cx: 108,cy: 29, txtX: 109, txtY: 24, path: () => pathRowA(118), nx: 'translate(32,0)'   },
  T044: { x: 136, y: 26, cx: 140,cy: 29, txtX: 141, txtY: 24, path: () => pathRowA(152), nx: 'translate(64,0)'   },
  T045: { x: 168, y: 26, cx: 172,cy: 29, txtX: 173, txtY: 24, path: () => pathRowA(182), nx: 'translate(96,0)'   },
  T048: { x: 276, y: 26, cx: 280,cy: 29, txtX: 281, txtY: 24, path: () => pathRowA(292), nx: 'translate(206,0)'  },
  T049: { x: 308, y: 26, cx: 312,cy: 29, txtX: 313, txtY: 24, path: () => pathRowA(324), nx: 'translate(228,0)'  },
  T071: { x: 72,  y: 198, cx: 76, cy: 201, txtX: 77, txtY: 196, path: () => pathRowC(86),  nx: 'translate(0,177)'  },
  T072: { x: 104, y: 198, cx: 108,cy: 201, txtX: 109,txtY: 196, path: () => pathRowC(118), nx: 'translate(32,177)' },
  T073: { x: 212, y: 198, cx: 216,cy: 201, txtX: 217,txtY: 196, path: () => pathRowC(224), nx: 'translate(138,177)'},
};

const ALL_LOAD_STALLS = Object.keys(STALL_META);

export default function YardMap({ stops = [], activeIdx = 0 }) {
  const loadStallIds  = stops.map((s) => s.stallId);
  const activeStall   = stops[activeIdx]?.stallId;
  const doneStalls    = stops.slice(0, activeIdx).map((s) => s.stallId);
  const activeMeta    = activeStall ? STALL_META[activeStall] : null;

  function stallClass(id) {
    if (!loadStallIds.includes(id)) return 'stall-base';
    if (doneStalls.includes(id)) return 'stall-done';
    if (id === activeStall) return 'stall-hot-pulse';
    return 'stall-hot';
  }

  return (
    <div className="map-cont map-style-gmaps">
      <div className="map-vignette-gm" />
      <div className="map-hud-top">BNSF Orillia · Renton, WA · Yard guide</div>
      <details className="map-inline-tip">
        <summary><span className="material-icons-round">info_outline</span>Map key</summary>
        <div className="map-tip-body">
          <p className="mit-lede"><strong>This run only.</strong> Route updates as you confirm each pull.</p>
          <ul>
            <li><strong style={{ color: '#1a73e8' }}>Pulsing stall</strong> — your current pull target.</li>
            <li><strong style={{ color: '#1a73e8' }}>Blue path</strong> — walk from rig to stall.</li>
            <li><strong style={{ color: '#1e8e3e' }}>Green stalls</strong> — loaded and done.</li>
          </ul>
        </div>
      </details>

      <svg className="map-tesla-svg" viewBox="0 0 393 330" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="Yard map">
        <defs>
          <pattern id="ymGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="#c4c7c5" strokeOpacity=".2" strokeWidth="0.5"/>
          </pattern>
          <marker id="arrGm" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
            <path d="M0,0 L0,9 L9,4.5 z" fill="#1a73e8"/>
          </marker>
        </defs>

        {/* Base */}
        <rect width="393" height="330" fill="#e8e4df"/>
        <rect width="393" height="330" fill="url(#ymGrid)" opacity=".4"/>

        {/* Lots */}
        <rect x="0" y="72" width="393" height="86" className="ym-lot" rx="2"/>
        <rect x="0" y="168" width="393" height="86" className="ym-lot" rx="2"/>

        {/* Roads */}
        <rect x="0" y="48" width="393" height="24" className="ym-road" rx="3"/>
        <rect x="0" y="134" width="393" height="22" className="ym-road" rx="3"/>
        <rect x="0" y="220" width="393" height="22" className="ym-road" rx="3"/>
        <rect x="184" y="24" width="26" height="306" className="ym-road" rx="3"/>

        {/* Row labels — 9px */}
        <text x="10" y="43" className="ym-row-lbl">ROW T-A</text>
        <text x="10" y="129" className="ym-row-lbl">ROW T-B</text>
        <text x="10" y="215" className="ym-row-lbl">ROW T-C</text>
        <text x="10" y="299" className="ym-row-lbl">ROW T-D</text>

        {/* ── ROW T-A stalls ── */}
        <rect x="8" y="26" width="28" height="18" rx="3" className="stall-base"/>
        <rect x="40" y="26" width="28" height="18" rx="3" className="stall-base"/>
        {['T042','T043','T044','T045'].map(id => (
          <rect key={id} x={STALL_META[id].x} y={STALL_META[id].y} width="28" height="18" rx="3" className={stallClass(id)}/>
        ))}
        <rect x="212" y="26" width="28" height="18" rx="3" className="stall-base"/>
        <rect x="244" y="26" width="28" height="18" rx="3" className="stall-base"/>
        {['T048','T049'].map(id => (
          <rect key={id} x={STALL_META[id].x} y={STALL_META[id].y} width="28" height="18" rx="3" className={stallClass(id)}/>
        ))}
        <rect x="340" y="26" width="28" height="18" rx="3" className="stall-base"/>

        {/* Car icons row A */}
        {['T042','T043','T044','T045','T048','T049'].filter(id => loadStallIds.includes(id) && !doneStalls.includes(id)).map(id => {
          const m = STALL_META[id];
          return (
            <g key={id} transform={`translate(${m.cx},${m.cy})`}>
              <rect width="20" height="11" rx="2.5" className="map-car-icon"/>
              <rect x="5" y="2" width="10" height="4" rx="1" className="map-car-glass"/>
            </g>
          );
        })}

        {/* Stall ID labels row A — 9px bold */}
        {['T042','T043','T044','T045','T048','T049'].map(id => (
          <text key={id} x={STALL_META[id].txtX} y={STALL_META[id].txtY} className="ym-stall-id">{id}</text>
        ))}

        {/* ── ROW T-B (non-load stalls) ── */}
        <rect x="8" y="112" width="28" height="18" rx="3" className="stall-base"/>
        <rect x="40" y="112" width="28" height="18" rx="3" className="stall-base"/>
        <rect x="72" y="112" width="28" height="18" rx="3" className="stall-base"/>
        <rect x="104" y="112" width="28" height="18" rx="3" className="stall-base"/>

        {/* ── ROW T-C stalls ── */}
        <rect x="8"   y="198" width="28" height="18" rx="3" className="stall-base"/>
        <rect x="40"  y="198" width="28" height="18" rx="3" className="stall-base"/>
        {['T071','T072','T073'].map(id => (
          <rect key={id} x={STALL_META[id].x} y={STALL_META[id].y} width="28" height="18" rx="3" className={stallClass(id)}/>
        ))}

        {/* Car icons row C */}
        {['T071','T072','T073'].filter(id => loadStallIds.includes(id) && !doneStalls.includes(id)).map(id => {
          const m = STALL_META[id];
          return (
            <g key={id} transform={`translate(${m.cx},${m.cy})`}>
              <rect width="20" height="11" rx="2.5" className="map-car-icon"/>
              <rect x="5" y="2" width="10" height="4" rx="1" className="map-car-glass"/>
            </g>
          );
        })}
        {['T071','T072','T073'].map(id => (
          <text key={id} x={STALL_META[id].txtX} y={STALL_META[id].txtY} className="ym-stall-id">{id}</text>
        ))}

        {/* ── ROW T-D ── */}
        <rect x="8"  y="284" width="28" height="18" rx="3" className="stall-base"/>
        <rect x="40" y="284" width="28" height="18" rx="3" className="stall-base"/>

        {/* ── Route path ── */}
        {activeMeta && (
          <g id="yardRoutePaths">
            <path className="route-glow" d={activeMeta.path()} />
            <path className="route-line" markerEnd="url(#arrGm)" d={activeMeta.path()} />
          </g>
        )}

        {/* ── NEXT badge ── */}
        {activeMeta && (
          <g id="yardNextPullGroup" transform={activeMeta.nx}>
            <rect x="62" y="13" width="48" height="18" rx="9" fill="#E8620A"/>
            <text x="86" y="25" textAnchor="middle" fill="#fff" fontFamily="'Roboto Mono',monospace" fontSize="9" fontWeight="800">NEXT</text>
          </g>
        )}

        {/* ── Rig position — simplified ── */}
        <circle cx="30" cy="318" r="9" className="rig-marker"/>
        <text x="45" y="313" fill="#1a73e8" fontFamily="'Roboto Mono',monospace" fontSize="9" fontWeight="700">YOUR RIG</text>
      </svg>

      <div className="map-legend-bar">
        <span>Route</span><span style={{ color: '#1a73e8' }}>━━</span>
        <span>Active</span><span style={{ color: '#E8620A' }}>◉</span>
        <span>Done</span><span style={{ color: '#1e8e3e' }}>■</span>
      </div>
    </div>
  );
}
