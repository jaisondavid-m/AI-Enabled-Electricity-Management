import { useState, useEffect, useRef } from 'react';

const RING_COLORS = [
  ['#22c55e','#16a34a'], ['#0ea5e9','#0284c7'],
  ['#f59e0b','#d97706'], ['#a855f7','#7c3aed'],
  ['#ef4444','#b91c1c'], ['#06b6d4','#0e7490'],
];

function MiniRing({ devices }) {
  const ref = useRef(null);
  const total = devices.reduce((s, d) => s + d.kwhPerDay, 0);
  useEffect(() => {
    const c = ref.current; if (!c) return;
    const ctx = c.getContext('2d');
    const cx = 90, cy = 90, r = 72, lw = 14;
    ctx.clearRect(0, 0, 180, 180);
    ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)'; ctx.lineWidth = lw; ctx.stroke();
    if (!devices.length || !total) return;
    ctx.lineCap = 'round';
    let start = -Math.PI / 2;
    devices.forEach((d, i) => {
      const sweep = (d.kwhPerDay / total) * Math.PI * 2 * 0.92;
      const [c1, c2] = RING_COLORS[i % RING_COLORS.length];
      const g = ctx.createLinearGradient(cx + r * Math.cos(start), cy + r * Math.sin(start), cx + r * Math.cos(start + sweep), cy + r * Math.sin(start + sweep));
      g.addColorStop(0, c1); g.addColorStop(1, c2);
      ctx.beginPath(); ctx.arc(cx, cy, r, start, start + sweep);
      ctx.strokeStyle = g; ctx.lineWidth = lw; ctx.stroke();
      start += sweep + 0.05;
    });
  }, [devices, total]);
  return (
    <div className="ring-wrap">
      <canvas ref={ref} width={180} height={180} />
      <div className="ring-center-text">
        <strong>{total.toFixed(1)}</strong>
        <span>kWh/day</span>
      </div>
    </div>
  );
}

function KpiCard({ icon, color, label, value, unit, trend }) {
  return (
    <div className={`kpi-card kpi-${color}`}>
      <div className="kpi-icon-wrap"><i className={`fa-solid ${icon}`} /></div>
      <div className="kpi-body">
        <span className="kpi-label">{label}</span>
        <div className="kpi-val-row">
          <span className="kpi-value">{value}</span>
          <span className="kpi-unit">{unit}</span>
        </div>
        {trend && <span className="kpi-trend">{trend}</span>}
      </div>
    </div>
  );
}

function BarChart({ devices }) {
  if (!devices.length) return (
    <div className="chart-empty"><i className="fa-solid fa-chart-bar" /><p>Add devices to see usage chart</p></div>
  );
  const max = Math.max(...devices.map(d => d.kwhPerDay), 0.01);
  return (
    <div className="bar-chart">
      {devices.map(d => (
        <div className="bar-row" key={d.id}>
          <span className="bar-label">{d.name}</span>
          <div className="bar-track">
            <div className="bar-fill" style={{ width: `${(d.kwhPerDay / max) * 100}%` }} />
          </div>
          <span className="bar-val">{d.kwhPerDay} kWh</span>
        </div>
      ))}
    </div>
  );
}

function Co2Gauge({ co2PerDay }) {
  const annual = co2PerDay * 365;
  const pct = Math.min((annual / 2000) * 100, 100);
  const color = pct < 33 ? '#22c55e' : pct < 66 ? '#f59e0b' : '#ef4444';
  const label = pct < 33 ? 'Low Impact' : pct < 66 ? 'Moderate' : 'High Impact';
  return (
    <div className="co2-gauge">
      <div className="gauge-ring-wrap">
        <svg viewBox="0 0 120 120" width="120" height="120">
          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
          <circle cx="60" cy="60" r="50" fill="none" stroke={color} strokeWidth="12"
            strokeDasharray={`${pct * 3.14} 314`}
            strokeDashoffset="78.5"
            strokeLinecap="round"
            transform="rotate(-90 60 60)"
            style={{ transition: 'stroke-dasharray 0.8s ease' }}
          />
        </svg>
        <div className="gauge-center">
          <strong style={{ color }}>{annual.toFixed(0)}</strong>
          <span>kg/yr</span>
        </div>
      </div>
      <span className="gauge-label" style={{ color }}>{label}</span>
    </div>
  );
}

export default function Dashboard({ devices, user, onNavigate }) {
  const totalKwh  = devices.reduce((s, d) => s + d.kwhPerDay, 0);
  const totalCo2  = devices.reduce((s, d) => s + d.co2PerDay, 0);
  const totalCost = devices.reduce((s, d) => s + d.costPerMonth, 0);
  const topDevice = devices.length ? devices.reduce((a, b) => a.kwhPerDay > b.kwhPerDay ? a : b) : null;

  return (
    <div className="page-content">
      {/* Page header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-sub">Welcome back, <strong>{user.name}</strong> · {new Date().toLocaleDateString('en-IN', { weekday:'long', day:'numeric', month:'long' })}</p>
        </div>
        <button className="btn-action" onClick={() => onNavigate('devices')}>
          <i className="fa-solid fa-plus" /> Add Device
        </button>
      </div>

      {/* KPI row */}
      <div className="kpi-grid">
        <KpiCard icon="fa-plug"               color="green"  label="Total Devices"     value={devices.length} unit="devices"  />
        <KpiCard icon="fa-bolt"               color="blue"   label="Daily Usage"       value={totalKwh.toFixed(1)} unit="kWh/day" trend="↑ Real-time" />
        <KpiCard icon="fa-cloud"              color="red"    label="Carbon Footprint"  value={totalCo2.toFixed(2)} unit="kg CO₂/day" />
        <KpiCard icon="fa-indian-rupee-sign"  color="yellow" label="Est. Monthly Bill" value={`₹${totalCost.toFixed(0)}`} unit="/month" />
      </div>

      {/* Charts row */}
      <div className="charts-row">
        <div className="dash-card dash-card-lg">
          <div className="dash-card-header">
            <span><i className="fa-solid fa-chart-bar" /> Device Usage Breakdown</span>
            <span className="badge-info">{devices.length} devices</span>
          </div>
          <BarChart devices={devices} />
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <span><i className="fa-solid fa-circle-half-stroke" /> Energy Split</span>
          </div>
          <div className="ring-center-wrap">
            <MiniRing devices={devices} />
          </div>
        </div>

        <div className="dash-card">
          <div className="dash-card-header">
            <span><i className="fa-solid fa-leaf" /> CO₂ Impact</span>
          </div>
          <div style={{ display:'flex', justifyContent:'center', paddingTop:'8px' }}>
            <Co2Gauge co2PerDay={totalCo2} />
          </div>
          <div className="gauge-info">
            <p>India average: <strong>0.82 kg CO₂ / kWh</strong></p>
            <p>Your daily: <strong style={{ color:'var(--green)' }}>{totalCo2.toFixed(2)} kg</strong></p>
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="bottom-row">
        {/* Top consuming devices */}
        <div className="dash-card dash-card-md">
          <div className="dash-card-header">
            <span><i className="fa-solid fa-fire" /> Top Energy Consumers</span>
            <button className="link-btn" onClick={() => onNavigate('devices')}>View all →</button>
          </div>
          {devices.length === 0 ? (
            <div className="empty-state"><i className="fa-solid fa-plug" /><p>No devices added yet</p></div>
          ) : (
            <div className="top-devices">
              {[...devices].sort((a, b) => b.kwhPerDay - a.kwhPerDay).slice(0, 4).map((d, i) => (
                <div className="top-device-row" key={d.id}>
                  <span className="top-rank">{i + 1}</span>
                  <div className="top-device-info">
                    <span className="top-name">{d.name}</span>
                    <span className="top-cat">{d.category}</span>
                  </div>
                  <div className="top-bar-mini">
                    <div className="top-bar-fill" style={{ width: `${topDevice ? (d.kwhPerDay / topDevice.kwhPerDay) * 100 : 0}%` }} />
                  </div>
                  <span className="top-kwh">{d.kwhPerDay} kWh</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick AI tip */}
        <div className="dash-card dash-card-sm ai-teaser">
          <div className="dash-card-header">
            <span><i className="fa-solid fa-robot" /> AI Quick Tip</span>
            <span className="live-dot" />
          </div>
          <div className="ai-teaser-body">
            <div className="ai-tip-icon"><i className="fa-solid fa-wand-magic-sparkles" /></div>
            <p>
              {devices.length === 0
                ? 'Add your devices to get personalised AI energy-saving recommendations.'
                : `Your top consumer is "${topDevice?.name}". Run high-load appliances after 10 PM to cut grid tariff by up to 30%.`}
            </p>
          </div>
          <button className="btn-action btn-full" onClick={() => onNavigate('ai')}>
            <i className="fa-solid fa-brain" /> Get Full AI Analysis
          </button>
        </div>

        {/* Monthly trend */}
        <div className="dash-card dash-card-sm">
          <div className="dash-card-header">
            <span><i className="fa-solid fa-calendar" /> Monthly Estimate</span>
          </div>
          <div className="monthly-stats">
            {[
              { label: 'Units consumed', val: `${(totalKwh * 30).toFixed(0)} kWh`, icon: 'fa-bolt',  color: 'var(--accent)' },
              { label: 'CO₂ emitted',    val: `${(totalCo2 * 30).toFixed(1)} kg`,  icon: 'fa-cloud', color: 'var(--red)'    },
              { label: 'Est. cost',       val: `₹${totalCost.toFixed(0)}`,          icon: 'fa-rupee-sign', color: 'var(--yellow)' },
              { label: 'Potential save',  val: `₹${(totalCost * 0.25).toFixed(0)}`, icon: 'fa-piggy-bank', color: 'var(--green)'  },
            ].map(s => (
              <div className="monthly-row" key={s.label}>
                <i className={`fa-solid ${s.icon}`} style={{ color: s.color }} />
                <span className="monthly-label">{s.label}</span>
                <span className="monthly-val" style={{ color: s.color }}>{s.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
