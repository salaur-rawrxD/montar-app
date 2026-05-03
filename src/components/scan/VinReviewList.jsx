import { vehicleDisplayName, weightBadgeClass } from '../../data/mockVehicles.js';

export default function VinReviewList({ vehicles, acceptedIdxs, onAccept }) {
  return (
    <>
      {vehicles.map((v, i) => {
        const accepted = acceptedIdxs.includes(i);
        return (
          <div
            key={v.vin}
            className={`veh-card veh-card-decode${accepted ? ' vin-accepted' : ''}`}
            data-vix={i}
          >
            <div className="veh-rank">{i + 1}</div>
            <div className="veh-info">
              <div className="veh-name">{vehicleDisplayName(v)}</div>
              <div className="veh-vin vin-text">{v.vin}</div>
            </div>
            <div className="veh-meta">
              <span className={`badge ${weightBadgeClass(v.weightLb)}`}>{v.weightLb?.toLocaleString()} lbs</span>
              {v.stallId && v.stallId !== '—' && (
                <span className="badge badge-pri" style={{ fontSize: 10 }}>{v.stallId}</span>
              )}
            </div>
            <div className="veh-actions">
              <button
                type="button"
                className={`btn-mini${accepted ? ' success' : ' primary'}`}
                data-testid="accept-vin-button"
                title="Accept VIN"
                onClick={() => onAccept(i)}
              >
                <span className="material-icons-round">{accepted ? 'check_circle' : 'check'}</span>
              </button>
              <button type="button" className="btn-mini" title="Edit VIN">
                <span className="material-icons-round">edit</span>
              </button>
            </div>
          </div>
        );
      })}
    </>
  );
}
