import { useStore } from '../../app/state/loadSessionStore.js';

const NAV_ITEMS = [
  { icon: 'home',         label: 'Home',    id: 'home',     screen: 'home' },
  { icon: 'receipt_long', label: 'Loads',   id: 'loads',    screen: 'history' },
  { icon: 'map',          label: 'Yards',   id: 'yards',    screen: null },
  { icon: 'person',       label: 'Profile', id: 'profile',  screen: 'settings' },
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
