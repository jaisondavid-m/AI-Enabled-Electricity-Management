const TIPS = [
  {
    icon: 'fa-lightbulb', cls: 'tip-green',
    title: 'Switch to LED',
    body: 'Replace incandescent / CFL bulbs with LEDs — they use 75% less energy and last 25× longer.',
    save: 'Save ~₹800/year per bulb',
  },
  {
    icon: 'fa-clock', cls: 'tip-blue',
    title: 'Off-Peak Scheduling',
    body: 'Run your washing machine, dishwasher, and water heater after 11 PM. Grid load is 40% lower.',
    save: 'Save ~30% on laundry bill',
  },
  {
    icon: 'fa-temperature-arrow-down', cls: 'tip-yellow',
    title: 'AC at 24 °C',
    body: 'Set your AC to 24 °C instead of 18 °C. Every extra degree of cooling costs 6% more electricity.',
    save: 'Save ~₹2,400/year',
  },
  {
    icon: 'fa-plug-circle-xmark', cls: 'tip-purple',
    title: 'Kill Phantom Load',
    body: 'Chargers, set-top boxes, and TVs on standby silently consume up to 10% of your total energy.',
    save: 'Save ~₹1,200/year',
  },
  {
    icon: 'fa-sun', cls: 'tip-green',
    title: 'Natural Light First',
    body: 'Open curtains before switching on lights. Free solar energy is available 6 AM – 6 PM daily.',
    save: 'Save ~₹500/year',
  },
  {
    icon: 'fa-star', cls: 'tip-blue',
    title: 'Choose 5-Star Appliances',
    body: 'A BEE 5-star-rated AC uses 40% less energy than a 1-star model of the same tonnage.',
    save: 'Save ~₹6,000/year',
  },
];

export default function EcoTips() {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Eco Tips Library</h1>
          <p className="page-sub">Quick wins to cut your carbon footprint starting today</p>
        </div>
      </div>
      <div className="tips-grid">
        {TIPS.map(t => (
          <div key={t.title} className="tip-card">
            <div className="tip-icon"><i className={`fa-solid ${t.icon}`} /></div>
            <div className="tip-body">
              <strong>{t.title}</strong>
              <p>{t.body}</p>
              <span style={{ fontSize:'12px', color:'var(--green)', fontWeight:600 }}>{t.save}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
