const NAV_ITEMS = [
  { icon: 'home',         label: 'Home',    id: 'home' },
  { icon: 'receipt_long', label: 'Loads',   id: 'loads' },
  { icon: 'map',          label: 'Yards',   id: 'yards' },
  { icon: 'person',       label: 'Profile', id: 'profile' },
];

export default function BottomNav({ active = 'home' }) {
  return (
    <div className="nav-bar">
      {NAV_ITEMS.map(({ icon, label, id }) => (
        <div key={id} className={`nav-item${active === id ? ' active' : ''}`}>
          <div className="nav-ind">
            <span className="material-icons-round">{icon}</span>
          </div>
          <span className="nav-lbl">{label}</span>
        </div>
      ))}
    </div>
  );
}
