import { useStore } from '../../app/state/loadSessionStore.js';

const NAV_ITEMS = [
  { id: 'home',    icon: 'home',     label: 'Home',    screen: 'home' },
  { id: 'scan',    icon: 'document_scanner', label: 'Scan',    screen: 'scan' },
  { id: 'history', icon: 'history',  label: 'History', screen: 'history' },
  { id: 'settings',icon: 'settings', label: 'Settings',screen: 'settings' },
];

export default function BottomNav({ active = 'home' }) {
  const goTo = useStore((s) => s.goTo);

  return (
    <div className="nav-bar">
      {NAV_ITEMS.map(({ icon, label, id, screen }) => (
        <div
          key={id}
          className={`nav-item${active === id ? ' active' : ''}${!screen ? ' nav-item--disabled' : ''}`}
          onClick={screen ? () => goTo(screen) : undefined}
        >
          <div className="nav-ind">
            <span className="material-icons-round">{icon}</span>
          </div>
          <span className="nav-lbl">{label}</span>
        </div>
      ))}
    </div>
  );
}
