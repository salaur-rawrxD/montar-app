export default function TrailerMap({ slots = [], confirmedSlots = [] }) {
  const topSlots    = slots.filter((s) => s.deck === 'top').sort((a, b) => a.slot - b.slot);
  const bottomSlots = slots.filter((s) => s.deck === 'bottom').sort((a, b) => a.slot - b.slot);

  function shortName(v) {
    if (!v) return '';
    const name = `${v.model}`.split(' ')[0];
    return v.type === 'truck' ? 'Tacoma' : name;
  }

  function slotClass(s) {
    const confirmed = confirmedSlots.includes(s.slot);
    if (confirmed) return 'slot confirmed';
    if (s.reversed) return 'slot rev';
    if (s.vehicle) return 'slot filled';
    return 'slot';
  }

  return (
    <div className="rig-vis">
      <div className="rv-lbl">Deck diagram — confirms turn green as you verify</div>
      <div className="deck-row">
        <div className="deck-lbl">Top</div>
        {topSlots.map((s) => (
          <div key={s.slot} className={slotClass(s)} data-slot={s.slot}>
            <div className="sn">{s.slot}</div>
            <div className="sv" style={s.reversed ? { color: '#7B5800' } : {}}>
              {s.reversed ? `${shortName(s.vehicle)}↺` : shortName(s.vehicle)}
            </div>
          </div>
        ))}
      </div>
      {bottomSlots.length > 0 && (
        <div className="deck-row">
          <div className="deck-lbl">Bot</div>
          {bottomSlots.map((s) => (
            <div key={s.slot} className={slotClass(s)} data-slot={s.slot}>
              <div className="sn">{s.slot}</div>
              <div className="sv">{shortName(s.vehicle)}</div>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: 8, fontSize: 11, color: 'var(--on-surface-var)', display: 'flex', alignItems: 'center', gap: 4 }}>
        <span className="material-icons-round" style={{ fontSize: 14, color: 'var(--warning)' }}>shield</span>
        Slot 1 loads reversed (cab-over). Swaps that break clearance are flagged in Adjustments.
      </div>
    </div>
  );
}
