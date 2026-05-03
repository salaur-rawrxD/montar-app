export default function MobileFrame({ children }) {
  return (
    <div className="frame">
      <div className="status-bar light" id="statusBar">
        <span className="st">9:41</span>
        <div className="si">
          <span className="material-icons-round">signal_cellular_4_bar</span>
          <span className="material-icons-round">wifi</span>
          <span className="material-icons-round">battery_full</span>
        </div>
      </div>
      <div className="home-ind" />
      {children}
    </div>
  );
}
