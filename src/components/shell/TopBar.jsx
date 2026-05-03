import { useStore } from '../../app/state/loadSessionStore.js';

export default function TopBar({ title, onBack, backTarget, rightIcon, onRight, titleClass = '', style }) {
  const goBack = useStore((s) => s.goBack);

  const handleBack = () => {
    if (onBack) { onBack(); return; }
    if (backTarget) goBack(backTarget);
  };

  return (
    <div className="app-bar" style={style}>
      <div className="app-bar-inner">
        {(onBack || backTarget) ? (
          <button className="icon-btn" onClick={handleBack}>
            <span className="material-icons-round">arrow_back</span>
          </button>
        ) : (
          <div style={{ width: 48 }} />
        )}
        <div className={`app-bar-title ${titleClass}`}>{title}</div>
        {rightIcon ? (
          <button className="icon-btn" onClick={onRight}>
            <span className="material-icons-round">{rightIcon}</span>
          </button>
        ) : (
          <div style={{ width: 48 }} />
        )}
      </div>
    </div>
  );
}
