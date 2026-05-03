import { YARD_STOPS } from '../../data/sampleYards.js';

const ALL_STALL_IDS = YARD_STOPS.map((s) => s.stallId);

function pathRowA(sx) { return `M30,318 L30,165 L196,165 L196,78 L${sx},78 L${sx},52`; }
function pathRowC(sx) { return `M30,318 L30,165 L196,165 L196,198 L${sx},198 L${sx},208`; }

const STALL_META = {
  T042: { x: 72,  y: 26, cx: 76, cy: 29, row: 'A', path: (s) => pathRowA(86),  nx: 'translate(0,0)' },
  T043: { x: 104, y: 26, cx: 108,cy: 29, row: 'A', path: (s) => pathRowA(118), nx: 'translate(32,0)' },
  T044: { x: 136, y: 26, cx: 140,cy: 29, row: 'A', path: (s) => pathRowA(152), nx: 'translate(64,0)' },
  T045: { x: 168, y: 26, cx: 172,cy: 29, row: 'A', path: (s) => pathRowA(182), nx: 'translate(96,0)' },
  T048: { x: 276, y: 26, cx: 280,cy: 29, row: 'A', path: (s) => pathRowA(292), nx: 'translate(206,0)' },
  T049: { x: 308, y: 26, cx: 312,cy: 29, row: 'A', path: (s) => pathRowA(324), nx: 'translate(228,0)' },
  T071: { x: 72,  y: 198, cx: 76, cy: 201, row: 'C', path: (s) => pathRowC(86),  nx: 'translate(0,177)' },
  T072: { x: 104, y: 198, cx: 108,cy: 201, row: 'C', path: (s) => pathRowC(118), nx: 'translate(32,177)' },
  T073: { x: 212, y: 198, cx: 216,cy: 201, row: 'C', path: (s) => pathRowC(224), nx: 'translate(138,177)' },
};

export default function YardMap({ stops = [], activeIdx = 0 }) {
  const loadStallIds = stops.map((s) => s.stallId);
  const activeStall  = stops[activeIdx]?.stallId;
  const doneStalls   = stops.slice(0, activeIdx).map((s) => s.stallId);
  const activeMeta   = activeStall ? STALL_META[activeStall] : null;

  function stallClass(id) {
    if (doneStalls.includes(id)) return 'stall-done';
    if (loadStallIds.includes(id) && !doneStalls.includes(id)) return 'stall-hot';
    return 'stall-base';
  }

  return (
    <div className="map-cont map-style-gmaps">
      <div className="map-vignette-gm" />
      <div className="map-hud-top">BNSF Orillia · Renton · Yard map</div>
      <details className="map-inline-tip">
        <summary><span className="material-icons-round">info_outline</span>Map key</summary>
        <div className="map-tip-body">
          <p className="mit-lede"><strong style={{ color: '#202124' }}>This leg only.</strong> The blue line updates when you confirm each pull.</p>
          <ul>
            <li><strong style={{ color: '#1a73e8' }}>Path</strong> — walk from your rig to the active stall.</li>
            <li><strong style={{ color: '#1a73e8' }}>Blue stalls</strong> — this load. Gray — other / empty.</li>
            <li><strong style={{ color: '#5f6368' }}>Shapes</strong> — vehicles; bottom dot — your rig.</li>
          </ul>
        </div>
      </details>

      <svg className="map-tesla-svg" viewBox="0 0 393 330" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" aria-label="Yard map">
        <defs>
          <pattern id="ymGrid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M20 0H0V20" fill="none" stroke="#c4c7c5" strokeOpacity=".25" strokeWidth="0.5"/>
          </pattern>
          <marker id="arrGm" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
            <path d="M0,0 L0,6 L7,3 z" fill="#1a73e8"/>
          </marker>
        </defs>
        <rect width="393" height="330" fill="#e8e4df"/>
        <rect width="393" height="330" fill="url(#ymGrid)" opacity=".45"/>
        <rect x="0" y="72" width="393" height="86" className="ym-lot" rx="2"/>
        <rect x="0" y="168" width="393" height="86" className="ym-lot" rx="2"/>
        <rect x="0" y="48" width="393" height="24" className="ym-road" rx="3"/>
        <rect x="0" y="134" width="393" height="22" className="ym-road" rx="3"/>
        <rect x="0" y="220" width="393" height="22" className="ym-road" rx="3"/>
        <rect x="184" y="24" width="26" height="306" className="ym-road" rx="3"/>
        <text x="10" y="42" className="ym-row-lbl">ROW T-A</text>
        <text x="10" y="128" className="ym-row-lbl">ROW T-B</text>
        <text x="10" y="214" className="ym-row-lbl">ROW T-C</text>
        <text x="10" y="298" className="ym-row-lbl">ROW T-D</text>

        {/* Row T-A stalls */}
        <rect x="8" y="26" width="28" height="18" rx="3" className="stall-base"/>
        <rect x="40" y="26" width="28" height="18" rx="3" className="stall-base"/>
        <rect x="72"  y="26" width="28" height="18" rx="3" className={stallClass('T042')}/>
        <rect x="104" y="26" width="28" height="18" rx="3" className={stallClass('T043')}/>
        <rect x="136" y="26" width="28" height="18" rx="3" className={stallClass('T044')}/>
        <rect x="168" y="26" width="28" height="18" rx="3" className={stallClass('T045')}/>
        <rect x="212" y="26" width="28" height="18" rx="3" className="stall-base"/>
        <rect x="244" y="26" width="28" height="18" rx="3" className="stall-base"/>
        <rect x="276" y="26" width="28" height="18" rx="3" className={stallClass('T048')}/>
        <rect x="308" y="26" width="28" height="18" rx="3" className={stallClass('T049')}/>
        <rect x="340" y="26" width="28" height="18" rx="3" className="stall-base"/>

        {/* Car icons row A */}
        {['T042','T043','T044','T045','T048','T049'].filter(id => loadStallIds.includes(id)).map(id => {
          const m = STALL_META[id];
          return (
            <g key={id} transform={`translate(${m.cx},${m.cy})`}>
              <rect width="20" height="11" rx="2.5" className="map-car-icon"/>
              <rect x="5" y="2" width="10" height="4" rx="1" className="map-car-glass"/>
            </g>
          );
        })}
        <text x="78"  y="24" className="ym-stall-id">T042</text>
        <text x="110" y="24" className="ym-stall-id">T043</text>
        <text x="142" y="24" className="ym-stall-id">T044</text>
        <text x="174" y="24" className="ym-stall-id">T045</text>
        <text x="282" y="24" className="ym-stall-id">T048</text>
        <text x="314" y="24" className="ym-stall-id">T049</text>

        {/* Row T-B */}
        <rect x="8" y="112" width="28" height="18" rx="3" className="stall-base"/>
        <rect x="40" y="112" width="28" height="18" rx="3" className="stall-base"/>
        <rect x="72" y="112" width="28" height="18" rx="3" className="stall-base"/>
        <rect x="104" y="112" width="28" height="18" rx="3" className="stall-base"/>

        {/* Row T-C stalls */}
        <rect x="8"   y="198" width="28" height="18" rx="3" className="stall-base"/>
        <rect x="40"  y="198" width="28" height="18" rx="3" className="stall-base"/>
        <rect x="72"  y="198" width="28" height="18" rx="3" className={stallClass('T071')}/>
        <rect x="104" y="198" width="28" height="18" rx="3" className={stallClass('T072')}/>
        <rect x="212" y="198" width="28" height="18" rx="3" className={stallClass('T073')}/>

        {/* Car icons row C */}
        {['T071','T072','T073'].filter(id => loadStallIds.includes(id)).map(id => {
          const m = STALL_META[id];
          return (
            <g key={id} transform={`translate(${m.cx},${m.cy})`}>
              <rect width="20" height="11" rx="2.5" className="map-car-icon"/>
              <rect x="5" y="2" width="10" height="4" rx="1" className="map-car-glass"/>
            </g>
          );
        })}
        <text x="78"  y="196" className="ym-stall-id">T071</text>
        <text x="110" y="196" className="ym-stall-id">T072</text>
        <text x="218" y="196" className="ym-stall-id">T073</text>

        {/* Row T-D */}
        <rect x="8"  y="284" width="28" height="18" rx="3" className="stall-base"/>
        <rect x="40" y="284" width="28" height="18" rx="3" className="stall-base"/>

        {/* Route paths */}
        <g id="yardRoutePaths">
          {activeMeta && (
            <>
              <path className="route-glow" d={activeMeta.path()} />
              <path className="route-line" markerEnd="url(#arrGm)" d={activeMeta.path()} />
            </>
          )}
        </g>

        {/* Next pull indicator */}
        {activeMeta && (
          <g id="yardNextPullGroup" transform={activeMeta.nx}>
            <rect x="66" y="15" width="40" height="16" rx="8" fill="#fff" stroke="#1a73e8" strokeWidth="1.2"/>
            <text x="86" y="26" textAnchor="middle" fill="#1a73e8" fontFamily="Roboto Mono,monospace" fontSize="7" fontWeight="700">NEXT</text>
          </g>
        )}

        {/* Rig marker */}
        <circle cx="30" cy="318" r="8" className="rig-marker"/>
        <text x="44" y="314" fill="#1a73e8" fontFamily="Roboto Mono,monospace" fontSize="8.5" fontWeight="700">You</text>
        <text x="44" y="324" fill="#5f6368" fontFamily="Roboto Mono,monospace" fontSize="6.5">Rig position</text>
      </svg>

      <div className="map-legend-bar">
        <span>Path</span><span style={{ color: '#1a73e8' }}>━━</span>
        <span>Load stall</span><span style={{ color: '#1a73e8' }}>■</span>
        <span>Vehicle</span><span style={{ color: '#5f6368' }}>▭</span>
      </div>
    </div>
  );
}
