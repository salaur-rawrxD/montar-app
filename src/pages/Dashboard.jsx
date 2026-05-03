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
      {/* Dark command header — operational context, not a greeting */}
      <div className="dash-header">
        <div className="dash-header-top">
          <div className="dash-wordmark">MONTAR</div>
          <div className="dash-header-icons">
            <button className="icon-btn"><span className="material-icons-round">notifications_none</span></button>
            <button className="icon-btn"><span className="material-icons-round">account_circle</span></button>
          </div>
        </div>
        <div className="dash-context">
          <div className="dash-context-left">
            <div className="dash-context-driver">ADAN ESPURO · SHIFT ACTIVE</div>
            <div className="dash-context-rig">{rig.name}</div>
          </div>
          <div className="dash-rig-pill">{rig.slots} slots</div>
        </div>
        {/* Compact metric strip — operational data only */}
        <div className="dash-metrics" style={{ marginBottom: 16 }}>
          <div className="dash-metric">
            <div className="dash-metric-n">7</div>
            <div className="dash-metric-l">Loads / week</div>
          </div>
          <div className="dash-metric">
            <div className="dash-metric-n">~52m</div>
            <div className="dash-metric-l">Avg yard time</div>
          </div>
          <div className="dash-metric">
            <div className="dash-metric-n">63</div>
            <div className="dash-metric-l">Units moved</div>
          </div>
        </div>
      </div>

      <div className="scroll">
        {/* Primary action — first thing driver sees in scroll */}
        <div style={{ padding: '16px 16px 4px' }}>
          <div
            className="load-action"
            id="btnOpenLoadSheetPicker"
            data-testid="add-load-sheet-button"
            role="button"
            tabIndex={0}
            onClick={openLoadSheetPicker}
            onKeyDown={(e) => e.key === 'Enter' && openLoadSheetPicker()}
          >
            <div className="load-action-icon">
              <span className="material-icons-round">post_add</span>
            </div>
            <div className="load-action-body">
              <div className="load-action-title">Add load sheet</div>
              <div className="load-action-sub">Photo, upload, or demo — reads VINs and builds pull order</div>
            </div>
            <span className="material-icons-round load-action-arrow">chevron_right</span>
          </div>
        </div>

        {/* Previous loads */}
        <div className="section-lbl">Previous loads</div>
        <div className="card-el" style={{ marginBottom: 0 }}>
          {rows.length === 0 ? (
            <div style={{ padding: '16px', fontSize: 13, color: 'var(--on-surface-var)' }}>No previous loads yet.</div>
          ) : rows.map((r, i) => (
            <div key={i} className="prev-load-row">
              <div className="pl-body">
                <div className="pl-date">{r.loadDate}</div>
                <div className="pl-route">
                  {r.origin}<span className="pl-arrow"> → </span>{r.destination}
                </div>
                {(r.yardMin || r.dealerMin) && (
                  <div className="pl-meta">
                    {r.yardMin && <><span>{r.yardMin} min</span> yard · </>}
                    {r.dealerMin && <><span>{r.dealerMin} min</span> dealer · </>}
                    <span>{r.vehicleCount}</span> units
                  </div>
                )}
              </div>
              <div className="pl-status">Done</div>
            </div>
          ))}
        </div>

        {/* Active rig summary */}
        <div className="section-lbl">Active Rig</div>
        <div className="card-fill">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--on-surface)' }}>{rig.name}</div>
              <div style={{ fontSize: 13, color: 'var(--on-surface-var)', marginTop: 3 }}>Plate: 7A82341</div>
            </div>
            <span className="badge badge-pri">{rig.slots}-car</span>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--on-surface-var)' }}>GVWR</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--on-surface)', marginTop: 3 }}>{rig.maxGrossLb?.toLocaleString()} lbs</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--on-surface-var)' }}>Tare</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--on-surface)', marginTop: 3 }}>~{rig.tareLb?.toLocaleString()} lbs</div>
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '.05em', textTransform: 'uppercase', color: 'var(--on-surface-var)' }}>Max cargo</div>
              <div style={{ fontFamily: 'var(--mono)', fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginTop: 3 }}>~{(rig.maxCargoLb / 1000).toFixed(0)}K lbs</div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav active="home" />

      {/* Hidden file inputs */}
      <input ref={cameraRef} type="file" className="visually-hidden-file" accept="image/*" capture="environment" aria-hidden="true" onChange={(e) => handleFile(e.target.files?.[0], 'camera')} />
      <input ref={uploadRef} type="file" className="visually-hidden-file" accept="image/*" aria-hidden="true" onChange={(e) => handleFile(e.target.files?.[0], 'upload')} />

      {/* Load Sheet Picker */}
      <div id="loadSheetPicker" className={`load-sheet-picker${loadSheetPickerOpen ? ' open' : ''}`} aria-hidden={!loadSheetPickerOpen}>
        <div className="load-sheet-picker-backdrop" onClick={closeLoadSheetPicker} aria-hidden="true" />
        <div className="load-sheet-picker-panel" role="dialog" aria-modal="true" aria-labelledby="loadSheetPickerTitle">
          <div className="lsp-kicker">Optimize your run · {rig.name}</div>
          <div className="lsp-title" id="loadSheetPickerTitle">Add your load sheet</div>
          <p className="lsp-desc">Choose how to bring in your BOL. We read VINs and build your optimized pull order.</p>
          <button type="button" className="lsp-opt" onClick={() => cameraRef.current?.click()}>
            <span className="material-icons-round">photo_camera</span>
            <span className="lsp-opt-text"><strong>Take photo</strong><span>Open camera and photograph the sheet</span></span>
            <span className="material-icons-round lsp-chev">chevron_right</span>
          </button>
          <button type="button" className="lsp-opt" onClick={() => uploadRef.current?.click()}>
            <span className="material-icons-round">add_photo_alternate</span>
            <span className="lsp-opt-text"><strong>Upload image</strong><span>Pick a photo or file from your library</span></span>
            <span className="material-icons-round lsp-chev">chevron_right</span>
          </button>
          <button type="button" className="lsp-opt" id="btnPickSampleSheet" data-testid="use-sample-sheet-button" onClick={initScanSample}>
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
