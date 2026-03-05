import { CAT_ICONS } from '../utils';

function Metric({ label, value, cls }) {
  return (
    <div className="device-metric">
      <div className="m-label">{label}</div>
      <div className={`m-val ${cls}`}>{value}</div>
    </div>
  );
}

export default function DeviceCard({ device, onDelete }) {
  const { id, name, category, watts, hours, days, time, kwhPerDay, co2PerDay, costPerMonth } = device;

  return (
    <div className="device-card">
      <div className="device-card-top">
        <div className="device-icon-wrap">{CAT_ICONS[category] || '🔌'}</div>
        <button className="device-delete" onClick={() => onDelete(id)} title="Remove device">
          <i className="fa-solid fa-xmark" />
        </button>
      </div>

      <div className="device-name">{name}</div>
      <div className="device-cat">{category} · {watts}W · {hours}h/day · {days}d/wk</div>

      <div className="device-metrics">
        <Metric label="kWh / day"    value={kwhPerDay}                  cls="kwh"  />
        <Metric label="CO₂ / day"    value={`${co2PerDay} kg`}          cls="co2"  />
        <Metric label="Cost / month" value={`₹${costPerMonth}`}         cls="cost" />
        <Metric label="kWh / month"  value={(kwhPerDay * 30).toFixed(1)} cls="kwh"  />
      </div>

      {time && (
        <div className="device-time-badge">
          <i className="fa-regular fa-clock" /> {time}
        </div>
      )}
    </div>
  );
}
