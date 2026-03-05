const NAV = [
  { key: 'dashboard', icon: 'fa-gauge-high',      label: 'Dashboard'         },
  { key: 'devices',   icon: 'fa-plug',             label: 'Devices'           },
  { key: 'ai',        icon: 'fa-robot',            label: 'AI Analysis'       },
  { key: 'tips',      icon: 'fa-leaf',             label: 'Eco Tips'          },
];

export default function Sidebar({ page, onNavigate, user, onLogout }) {
  const initials = user?.name
    ? user.name.split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('')
    : 'U';

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sb-brand">
        <div className="sb-logo">
          <i className="fa-solid fa-bolt" />
        </div>
        <div>
          <div className="sb-brand-name">EcoWatts</div>
          <div className="sb-brand-sub">AI Energy Manager</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="sb-nav">
        <p className="sb-nav-label">MAIN MENU</p>
        {NAV.map(n => (
          <button
            key={n.key}
            className={`sb-link ${page === n.key ? 'active' : ''}`}
            onClick={() => onNavigate(n.key)}
          >
            <i className={`fa-solid ${n.icon}`} />
            <span>{n.label}</span>
            {page === n.key && <span className="sb-dot" />}
          </button>
        ))}
      </nav>

      {/* Bottom — SDG & User profile */}
      <div className="sb-bottom">
        <div className="sb-sdg">
          <span className="sdg-badge">SDG 7 &amp; 13</span>
          <span className="sdg-text">Affordable Clean Energy &amp; Climate Action</span>
        </div>

        <div className="sb-profile">
          <div className="sb-avatar">{initials}</div>
          <div className="sb-user-info">
            <div className="sb-user-name">{user?.name || 'User'}</div>
            <div className="sb-user-email">{user?.email || ''}</div>
          </div>
          <button className="sb-logout" onClick={onLogout} title="Logout">
            <i className="fa-solid fa-right-from-bracket" />
          </button>
        </div>
      </div>
    </aside>
  );
}
