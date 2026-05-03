export default function DeliveryMap({ dealer }) {
  const name    = dealer?.name    || 'Renton Toyota';
  const address = dealer?.address || '501 SW 41st St, Renton, WA 98057';
  const eta     = dealer?.etaMin  || 24;

  return (
    <div className="dealer-hero">
      {/* Light map scheme — matches yard map aesthetic */}
      <div className="dealer-map-preview">
        {/* Roads — light */}
        <div className="dmap-road-h" style={{ top: 0, left: 0, right: 0, height: 24 }} />
        <div className="dmap-road-h" style={{ bottom: 0, left: 0, right: 0, height: 20 }} />
        <div className="dmap-road-v" style={{ left: 0, top: 0, bottom: 0, width: 20 }} />
        <div className="dmap-road-v" style={{ right: 60, top: 0, bottom: 0, width: 18 }} />
        {/* Background */}
        <div style={{ position: 'absolute', inset: 0, background: '#e8e4df' }} />
        {/* City blocks */}
        <div className="dmap-block" style={{ left: 24, top: 28, width: 110, height: 50 }} />
        <div className="dmap-block" style={{ left: 24, top: 84, right: 82, height: 40 }} />
        {/* Dealer lot */}
        <div className="dmap-dealer" style={{ left: 140, top: 28, width: 110, height: 96 }}>
          <div className="dmap-dealer-lbl">{name.toUpperCase().split(' ').slice(0, 2).join(' ')}</div>
        </div>
        {/* Approach arrow */}
        <svg className="dmap-route" viewBox="0 0 393 140" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <marker id="darr" markerWidth="9" markerHeight="9" refX="6" refY="4.5" orient="auto">
              <path d="M0,0 L0,9 L9,4.5 z" fill="#E8620A"/>
            </marker>
          </defs>
          <path d="M315,140 L315,80 L254,80 L254,40" stroke="#E8620A" strokeWidth="3" fill="none" markerEnd="url(#darr)" opacity=".95"/>
        </svg>
        {/* You marker */}
        <div className="dmap-you" style={{ left: 315, top: 130 }}>
          <div className="dmap-ring"><div className="dmap-dot" /></div>
        </div>
        {/* Labels */}
        <div style={{ position: 'absolute', left: 148, top: 12, fontFamily: 'var(--mono)', fontSize: 8, fontWeight: 700, color: 'var(--primary)', letterSpacing: '.05em' }}>MAIN ENTRANCE</div>
        <div style={{ position: 'absolute', right: 7, top: 55, fontFamily: 'var(--mono)', fontSize: 7, color: '#5f6368', letterSpacing: '.04em', writingMode: 'vertical-lr', fontWeight: 600 }}>RAINIER AVE N</div>
        <div style={{ position: 'absolute', top: 4, left: '50%', transform: 'translateX(-50%)', fontFamily: 'var(--mono)', fontSize: 7, color: '#5f6368', letterSpacing: '.04em', fontWeight: 600 }}>SW 41ST ST</div>
      </div>
      {/* Dealer info */}
      <div className="dealer-info">
        <div className="di-name">{name}</div>
        <div className="di-addr">{address}</div>
        <div className="dealer-badge-row">
          <span className="badge badge-pri">
            <span className="material-icons-round" style={{ fontSize: 12 }}>local_shipping</span>9 units
          </span>
          <span className="badge badge-ok">
            <span className="material-icons-round" style={{ fontSize: 12 }}>access_time</span>~{eta} min
          </span>
          <span className="badge badge-neu">New vehicles</span>
        </div>
      </div>
    </div>
  );
}
