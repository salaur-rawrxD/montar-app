import { useState } from 'react';

export default function SlotCard({ assignment, isConfirmed, onConfirm }) {
  const [showReason, setShowReason] = useState(false);
  const { slot, vehicle, label, reasoning } = assignment;
  const vName = vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : '—';

  return (
    <div
      className={`slot-list-item${isConfirmed ? ' is-confirmed' : ''}${showReason ? ' show-reason' : ''}`}
      data-slot={slot}
    >
      <div className="sl-num">{slot}</div>
      <div className="sl-info">
        <div className="sl-name">{vName}</div>
        <div className="sl-vin">{vehicle?.vin}</div>
      </div>
      <div className="sl-right">
        <div className="sl-wt">{vehicle?.weightLb?.toLocaleString()} lbs</div>
        <div className="sl-reason">{label}</div>
      </div>
      <div className="sl-ack-row">
        <button type="button" className="btn-why-montar" onClick={() => setShowReason((v) => !v)}>
          <span className="material-icons-round">help_outline</span>
          Why this slot?
        </button>
        <button
          type="button"
          className={`btn-ack-slot${isConfirmed ? ' done' : ''}`}
          data-testid="confirm-slot-button"
          data-slot={slot}
          onClick={() => onConfirm(slot)}
        >
          {isConfirmed ? (
            <><span className="material-icons-round">check_circle</span>Confirmed</>
          ) : 'Confirm'}
        </button>
      </div>
      {showReason && (
        <div className="sl-montar-detail" style={{ display: 'block' }}>
          {reasoning || 'Standard assignment based on weight and height scoring.'}
        </div>
      )}
    </div>
  );
}
