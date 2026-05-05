import { useEffect } from 'react';
import { useStore } from '../app/state/loadSessionStore.js';

export default function Splash() {
  const goTo = useStore((s) => s.goTo);

  useEffect(() => {
    const t = setTimeout(() => goTo('rig', { silent: true }), 1400);
    return () => clearTimeout(t);
  }, [goTo]);

  return (
    <div className="screen active" id="s-splash" data-testid="splash-screen" style={{ background: 'var(--bg)' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div className="splash-logo">
          <div className="splash-m">MONTAR</div>
          <div className="splash-bar" />
          <div className="splash-name">Field operations · car haulers</div>
          <div className="splash-tag">Load faster. Move more cars.</div>
        </div>
      </div>
    </div>
  );
}
