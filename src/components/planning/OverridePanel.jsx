import { useState } from 'react';

export default function OverridePanel({ slot, vehicle, onAcceptMontar, onOverride }) {
  const [choice, setChoice] = useState('keep');
  const [note, setNote]     = useState('');
  const [outcome, setOutcome] = useState(null);
  const [showAck, setShowAck] = useState(false);
  const [ackChecked, setAck]  = useState(false);

  function recheck() {
    if (choice === 'keep') {
      setOutcome('ok');
      setShowAck(false);
    } else {
      setOutcome('bad');
      setShowAck(true);
    }
  }

  return (
    <div className="adj-panel" id="adjPanel">
      <div className="adj-panel-h">
        <span className="material-icons-round">tune</span>
        Try a change (driver choice)
      </div>
      <label className="adj-opt">
        <input type="radio" name="adjSlot" value="keep" checked={choice === 'keep'} onChange={() => setChoice('keep')} />
        <span className="adj-opt-lbl">Keep MONTAR's assignment <small>Recommended — clearance safe</small></span>
      </label>
      <label className="adj-opt">
        <input type="radio" name="adjSlot" value="change" checked={choice === 'change'} onChange={() => setChoice('change')} />
        <span className="adj-opt-lbl">Override this slot <small>Requires review — may conflict with deck limits</small></span>
      </label>
      <textarea
        className="adj-note"
        placeholder="Driver note (optional): e.g. dealer staging request, chain placement…"
        value={note}
        onChange={(e) => setNote(e.target.value)}
      />
      <div className="adj-actions">
        <button type="button" className="btn-outline btn-adj-check" onClick={recheck}>
          <span className="material-icons-round" style={{ fontSize: 18 }}>fact_check</span>
          Apply &amp; recheck feasibility
        </button>
      </div>
      {outcome === 'ok' && (
        <div className="adj-outcome ok">MONTAR's plan is clearance-safe. Recommended assignment confirmed.</div>
      )}
      {outcome === 'bad' && (
        <div className="adj-outcome bad">Conflict detected. This override requires driver acknowledgement.</div>
      )}
      {showAck && (
        <label className="adj-ack-row show">
          <input type="checkbox" checked={ackChecked} onChange={(e) => setAck(e.target.checked)} />
          <span>I understand this may conflict with deck limits and accept responsibility if I proceed.</span>
        </label>
      )}
    </div>
  );
}
