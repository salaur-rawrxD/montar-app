import { useStore } from '../app/state/loadSessionStore.js';
import BottomNav from '../components/shell/BottomNav.jsx';
import { RIG_CONFIGS } from '../data/trailerConfigs.js';

export default function Settings() {
  const selectedRigIdx = useStore((s) => s.selectedRigIdx);
  const goTo = useStore((s) => s.goTo);
  const rig = RIG_CONFIGS[selectedRigIdx] || RIG_CONFIGS[0];

  return (
    <div className="screen active">
      <div className="app-bar">
        <div className="app-bar-inner">
          <div style={{ width: 48 }} />
          <div className="app-bar-title lg">Profile</div>
          <div style={{ width: 48 }} />
        </div>
      </div>
      <div className="scroll">
        <div className="section-lbl">Driver</div>
        <div className="card-el" style={{ marginBottom: 0 }}>
          <div className="list-item">
            <div className="li-lead"><span className="material-icons-round">person</span></div>
            <div className="li-content">
              <div className="li-headline">Adan Espuro</div>
              <div className="li-support">aispuro_ar@outlook.com</div>
            </div>
          </div>
        </div>
        <div className="section-lbl">Active Rig</div>
        <div className="card-fill">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface)' }}>{rig.name}</div>
              <div style={{ fontSize: 13, color: 'var(--on-surface-var)', marginTop: 2 }}>{rig.slots}-car · {rig.len}</div>
            </div>
            <button
              type="button"
              className="btn-outline"
              style={{ height: 36, padding: '0 14px', fontSize: 13 }}
              onClick={() => goTo('rig')}
            >
              Change
            </button>
          </div>
        </div>
        <div className="section-lbl">About</div>
        <div className="card-el">
          <div className="list-item">
            <div className="li-lead"><span className="material-icons-round">info_outline</span></div>
            <div className="li-content">
              <div className="li-headline">MONTAR v0.1</div>
              <div className="li-support">Load planning assistant for car haulers</div>
            </div>
          </div>
        </div>
      </div>
      <BottomNav active="profile" />
    </div>
  );
}
