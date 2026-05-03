import { useRef } from 'react';
import { useStore } from '../app/state/loadSessionStore.js';
import BottomNav from '../components/shell/BottomNav.jsx';
import { buildPreviousLoadRows } from '../data/mockLoads.js';
import { RIG_CONFIGS } from '../data/trailerConfigs.js';

export default function Dashboard() {
  const openLoadSheetPicker  = useStore((s) => s.openLoadSheetPicker);
  const closeLoadSheetPicker = useStore((s) => s.closeLoadSheetPicker);
  const loadSheetPickerOpen  = useStore((s) => s.loadSheetPickerOpen);
  const initScanFromFile     = useStore((s) => s.initScanFromFile);
  const initScanSample       = useStore((s) => s.initScanSample);
  const previousLoads        = useStore((s) => s.previousLoads);
  const selectedRigIdx       = useStore((s) => s.selectedRigIdx);

  const cameraRef = useRef(null);
  const uploadRef = useRef(null);

  const rig = RIG_CONFIGS[selectedRigIdx] || RIG_CONFIGS[0];
  const rows = buildPreviousLoadRows(previousLoads);

  function handleFile(file, source) {
    if (!file) return;
    const url = URL.createObjectURL(file);
    initScanFromFile(source, url);
  }

  return (
    <div className="screen active" id="s-home" data-testid="dashboard-screen">
      <div className="app-bar">
        <div className="app-bar-inner">
          <div className="app-bar-title lg">MONTAR</div>
          <button className="icon-btn"><span className="material-icons-round">notifications_none</span></button>
          <button className="icon-btn"><span className="material-icons-round">account_circle</span></button>
        </div>
      </div>

      <div className="scroll">
        <div className="greeting-card">
          <div className="g-name">Good morning, Adan</div>
          <div className="g-title">Ready to load?</div>
          <div className="g-stats">
            <div className="g-stat"><div className="n">7</div><div className="l">Loads this week</div></div>
            <div className="g-stat"><div className="n">63</div><div className="l">Vehicles moved</div></div>
            <div className="g-stat"><div className="n">~52 min</div><div className="l">Avg load time (rolling)</div></div>
            <div className="g-stat"><div className="n">1.1</div><div className="l">Avg dealer stops / run</div></div>
          </div>
        </div>

        <div
          className="scan-action"
          id="btnOpenLoadSheetPicker"
          data-testid="add-load-sheet-button"
          role="button"
          tabIndex={0}
          aria-haspopup="dialog"
          onClick={openLoadSheetPicker}
          onKeyDown={(e) => e.key === 'Enter' && openLoadSheetPicker()}
        >
          <div className="scan-icon"><span className="material-icons-round">post_add</span></div>
          <div className="scan-text">
            <div className="t">Add load sheet</div>
            <div className="s">Snap or upload your BOL — we read VINs and prep your optimized pull · {rig.name}</div>
          </div>
          <span className="material-icons-round" style={{ color: '#fff', fontSize: 20 }}>arrow_forward</span>
        </div>

        <div className="section-lbl">Previous loads</div>
        <div className="card-el" style={{ marginBottom: 0 }} id="recentLoadsCard">
          {rows.length === 0 ? (
            <div style={{ padding: '16px', fontSize: 13, color: 'var(--on-surface-var)' }}>No previous loads yet.</div>
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

        <div className="section-lbl">Active Rig</div>
        <div className="card-fill">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--on-surface)' }}>{rig.name}</div>
              <div style={{ fontSize: 13, color: 'var(--on-surface-var)', marginTop: 2 }}>
                {rig.slots}-car stinger · Plate: 7A82341
              </div>
            </div>
            <span className="badge badge-pri">{rig.slots} slots</span>
          </div>
          <div style={{ display: 'flex', gap: 16, marginTop: 12 }}>
            <div><div style={{ fontSize: 11, color: 'var(--on-surface-var)' }}>GVWR Limit</div><div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', marginTop: 2 }}>{rig.maxGrossLb?.toLocaleString()} lbs</div></div>
            <div><div style={{ fontSize: 11, color: 'var(--on-surface-var)' }}>Tare Weight</div><div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--on-surface)', marginTop: 2 }}>~{rig.tareLb?.toLocaleString()} lbs</div></div>
            <div><div style={{ fontSize: 11, color: 'var(--on-surface-var)' }}>Max Cargo</div><div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 600, color: 'var(--primary)', marginTop: 2 }}>~{(rig.maxCargoLb / 1000).toFixed(0)}K lbs</div></div>
          </div>
        </div>
      </div>

      <BottomNav active="home" />

      {/* hidden file inputs */}
      <input
        ref={cameraRef}
        type="file"
        id="inputLoadSheetCamera"
        className="visually-hidden-file"
        accept="image/*"
        capture="environment"
        aria-hidden="true"
        onChange={(e) => handleFile(e.target.files?.[0], 'camera')}
      />
      <input
        ref={uploadRef}
        type="file"
        id="inputLoadSheetUpload"
        className="visually-hidden-file"
        accept="image/*"
        aria-hidden="true"
        onChange={(e) => handleFile(e.target.files?.[0], 'upload')}
      />

      {/* Load Sheet Picker */}
      <div
        id="loadSheetPicker"
        className={`load-sheet-picker${loadSheetPickerOpen ? ' open' : ''}`}
        aria-hidden={!loadSheetPickerOpen}
      >
        <div className="load-sheet-picker-backdrop" onClick={closeLoadSheetPicker} aria-hidden="true" />
        <div className="load-sheet-picker-panel" role="dialog" aria-modal="true" aria-labelledby="loadSheetPickerTitle">
          <div className="lsp-kicker">Optimize your run</div>
          <div className="lsp-title" id="loadSheetPickerTitle">Add your load sheet</div>
          <p className="lsp-desc">Choose how to bring in your BOL. We use it to read VINs and build your yard pull order — same rig, smarter sequence.</p>
          <button type="button" className="lsp-opt" onClick={() => cameraRef.current?.click()}>
            <span className="material-icons-round">photo_camera</span>
            <span className="lsp-opt-text"><strong>Take photo</strong><span>Open the camera and photograph the sheet</span></span>
            <span className="material-icons-round lsp-chev">chevron_right</span>
          </button>
          <button type="button" className="lsp-opt" onClick={() => uploadRef.current?.click()}>
            <span className="material-icons-round">add_photo_alternate</span>
            <span className="lsp-opt-text"><strong>Upload image</strong><span>Pick a photo or file from your library</span></span>
            <span className="material-icons-round lsp-chev">chevron_right</span>
          </button>
          <button
            type="button"
            className="lsp-opt"
            id="btnPickSampleSheet"
            data-testid="use-sample-sheet-button"
            onClick={initScanSample}
          >
            <span className="material-icons-round">auto_awesome</span>
            <span className="lsp-opt-text"><strong>Use sample sheet</strong><span>Demo mode — loads the built-in BOL</span></span>
            <span className="material-icons-round lsp-chev">chevron_right</span>
          </button>
          <button type="button" className="lsp-cancel" onClick={closeLoadSheetPicker}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
