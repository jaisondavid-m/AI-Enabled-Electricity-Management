import { useRef, useEffect } from 'react';

const RING_COLORS = [
  ['#00d4ff', '#0094c6'], ['#7c3aed', '#4f1fa0'],
  ['#10b981', '#0d7a5e'], ['#f59e0b', '#b8790a'],
  ['#ef4444', '#b01f1f'], ['#c026d3', '#8a1b94'],
  ['#06b6d4', '#0284c7'],
];

function RingChart({ devices }) {
  const canvasRef = useRef(null);
  const totalKwh  = devices.reduce((s, d) => s + d.kwhPerDay, 0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const cx = 120, cy = 120, r = 100, lw = 20;

    ctx.clearRect(0, 0, 240, 240);

    // Glow background ring
    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.04)';
    ctx.lineWidth = lw;
    ctx.stroke();

    if (!devices.length || totalKwh === 0) return;

    ctx.lineCap = 'round';
    let start = -Math.PI / 2;

    devices.forEach((d, i) => {
      const sweep = (d.kwhPerDay / totalKwh) * Math.PI * 2 * 0.92;
      const [c1, c2] = RING_COLORS[i % RING_COLORS.length];
      const grad = ctx.createLinearGradient(
        cx + r * Math.cos(start),        cy + r * Math.sin(start),
        cx + r * Math.cos(start + sweep), cy + r * Math.sin(start + sweep)
      );
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      ctx.beginPath();
      ctx.arc(cx, cy, r, start, start + sweep);
      ctx.strokeStyle = grad;
      ctx.lineWidth = lw;
      ctx.stroke();
      start += sweep + 0.04;
    });
  }, [devices, totalKwh]);

  return (
    <div className="ring-wrapper">
      <canvas ref={canvasRef} width={240} height={240} />
      <div className="ring-center">
        <span>{totalKwh.toFixed(1)}</span>
        <small>kWh/day</small>
      </div>
    </div>
  );
}

function StatCard({ icon, cls, label, value, decimals }) {
  return (
    <div className="stat-card">
      <i className={`fa-solid ${icon} stat-icon ${cls}`} />
      <div>
        <span className="stat-num">{typeof value === 'number' ? value.toFixed(decimals) : value}</span>
        <span className="stat-label">{label}</span>
      </div>
    </div>
  );
}

export default function Hero({ devices }) {
  const totalKwh  = devices.reduce((s, d) => s + d.kwhPerDay, 0);
  const totalCo2  = devices.reduce((s, d) => s + d.co2PerDay, 0);
  const totalCost = devices.reduce((s, d) => s + d.costPerMonth, 0);

  return (
    <section className="hero" id="dashboard">
      <div className="hero-content">
        <div className="hero-tag">
          <i className="fa-solid fa-microchip" /> Powered by Gemini AI
        </div>
        <h1>
          Smart Electricity<br />
          <span className="gradient-text">Management System</span>
        </h1>
        <p className="hero-sub">
          Add your home appliances and let our AI analyze energy patterns to
          reduce your carbon footprint and save money every month.
        </p>
        <div className="hero-stats">
          <StatCard icon="fa-plug"                 cls=""       label="Devices"     value={devices.length} decimals={0} />
          <StatCard icon="fa-bolt"                 cls="yellow" label="kWh/day"     value={totalKwh}       decimals={1} />
          <StatCard icon="fa-cloud"                cls="red"    label="kg CO₂/day"  value={totalCo2}       decimals={2} />
          <StatCard icon="fa-indian-rupee-sign"    cls="green"  label="₹/month"     value={totalCost}      decimals={0} />
        </div>
      </div>
      <div className="hero-visual">
        <RingChart devices={devices} />
      </div>
    </section>
  );
}
