import { useRef, useEffect } from 'react';
import { useStore } from '../app/state/loadSessionStore.js';
import { RIG_CONFIGS } from '../data/trailerConfigs.js';

const RIG_SUBS = [
  '9-car · Stinger-steer · QuickLoader',
  '7-car · Stinger-steer · Standard',
  '9-car · Hydraulic deck · Wide body',
  '9-car · Stinger · Aluminum frame',
  '5-car · Single deck · Short haul',
  '5-car · Stinger · Regional routes',
];

export default function RigPicker() {
  const selectedRigIdx = useStore((s) => s.selectedRigIdx);
  const selectRig      = useStore((s) => s.selectRig);
  const confirmRig     = useStore((s) => s.confirmRig);
  const listRef = useRef(null);

  const rig = RIG_CONFIGS[selectedRigIdx] || RIG_CONFIGS[0];

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    el.scrollTop = selectedRigIdx * 56;

    function onScroll() {
      const idx = Math.round(el.scrollTop / 56);
      const clamped = Math.max(0, Math.min(RIG_CONFIGS.length - 1, idx));
      if (clamped !== selectedRigIdx) selectRig(clamped);
    }
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, [selectedRigIdx, selectRig]);

  return (
    <div className="screen active" id="s-rig" data-testid="rig-picker-screen" style={{ background: 'var(--navy)' }}>
      <div className="app-bar" style={{ background: 'transparent' }}>
        <div className="app-bar-inner" style={{ paddingTop: 0 }}>
          <div style={{ width: 48 }} />
          <div className="app-bar-title" style={{ color: '#fff', textAlign: 'center', paddingLeft: 0 }}>Select Your Rig</div>
          <div style={{ width: 48 }} />
        </div>
      </div>

      <div className="scroll" style={{ paddingBottom: 0 }}>
        <div className="rig-intro">
          <div className="rig-intro-title">What are you<br />hauling in today?</div>
          <div className="rig-intro-sub">MONTAR calibrates load logic to your specific trailer configuration.</div>
        </div>

        <div className="picker-wrap" id="rigPicker">
          <div className="picker-fade-top" />
          <div className="picker-fade-bot" />
          <div className="picker-selector" />
          <div className="picker-list" ref={listRef} id="pickerList">
            {RIG_CONFIGS.map((r, i) => (
              <div
                key={r.id}
                className={`picker-item${i === selectedRigIdx ? ' selected' : ''}`}
                data-idx={i}
                onClick={() => {
                  selectRig(i);
                  if (listRef.current) listRef.current.scrollTop = i * 56;
                }}
              >
                <div>
                  <div className="pi-name">{r.name}</div>
                  <div className="pi-sub">{RIG_SUBS[i] || ''}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rig-details" id="rigDetails">
          <div className="rig-details-title">Specs — operator verification required</div>
          <div className="rig-specs" id="rigSpecs">
            <div className="rig-spec">
              <div className="rs-val">{rig.slots}</div>
              <div className="rs-lbl">Slots</div>
            </div>
            <div className="rig-spec">
              <div className="rs-val">{rig.len}</div>
              <div className="rs-lbl">Length</div>
            </div>
            <div className="rig-spec">
              <div className="rs-val">{rig.cargo}</div>
              <div className="rs-lbl">Max cargo</div>
            </div>
          </div>
        </div>
      </div>

      <div className="rig-cta">
        <button type="button" id="btnConfirmRig" className="btn-fill" onClick={confirmRig}>
          <span className="material-icons-round">check</span>
          Confirm Rig — Start Loading
        </button>
      </div>
    </div>
  );
}
