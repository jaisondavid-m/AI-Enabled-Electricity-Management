export default function Header() {
  return (
    <header className="header">
      <div className="header-inner">
        <div className="logo">
          <span className="logo-icon"><i className="fa-solid fa-bolt" /></span>
          <span className="logo-text">EcoWatts <span className="ai-badge">AI</span></span>
        </div>
        <nav className="nav">
          <a href="#dashboard" className="nav-link">Dashboard</a>
          <a href="#devices"   className="nav-link">Devices</a>
          <a href="#analysis"  className="nav-link">AI Analysis</a>
          <a href="#tips"      className="nav-link">Eco Tips</a>
        </nav>
        <span className="co2-badge">
          <i className="fa-solid fa-leaf" /> Carbon Tracker
        </span>
      </div>
    </header>
  );
}
