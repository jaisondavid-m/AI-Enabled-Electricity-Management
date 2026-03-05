import { useState } from 'react';
import { CAT_ICONS } from '../utils';

const CATEGORIES = [
  { value: 'Lighting',      label: '💡 Lighting'          },
  { value: 'Cooling',       label: '❄️ Cooling / Heating' },
  { value: 'Kitchen',       label: '🍳 Kitchen Appliances'},
  { value: 'Laundry',       label: '🫧 Laundry'           },
  { value: 'Entertainment', label: '📺 Entertainment'     },
  { value: 'Office',        label: '💻 Office / Work'     },
  { value: 'Other',         label: '🔌 Other'             },
];

const PRESETS = [
  { name: 'LED Bulb',          category: 'Lighting',      watts: 9,    hours: 6  },
  { name: 'Ceiling Fan',       category: 'Cooling',       watts: 75,   hours: 8  },
  { name: 'Air Conditioner',   category: 'Cooling',       watts: 1500, hours: 6  },
  { name: 'Refrigerator',      category: 'Kitchen',       watts: 150,  hours: 24 },
  { name: 'Washing Machine',   category: 'Laundry',       watts: 500,  hours: 1  },
  { name: 'Television',        category: 'Entertainment', watts: 120,  hours: 4  },
  { name: 'Laptop',            category: 'Office',        watts: 65,   hours: 8  },
  { name: 'Water Heater',      category: 'Kitchen',       watts: 2000, hours: 0.5},
];

const INIT = { name:'', category:'', watts:'', hours:'', days:'7', time:'' };

export default function DevicesPage({ devices, onAdd, onDelete, onClearAll }) {
  const [form, setForm]       = useState(INIT);
  const [errors, setErrors]   = useState({});
  const [showForm, setShowForm] = useState(true);
  const [search, setSearch]   = useState('');

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErrors(e => ({ ...e, [k]: '' })); };

  const applyPreset = (p) => setForm(f => ({ ...f, name: p.name, category: p.category, watts: String(p.watts), hours: String(p.hours) }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())                             e.name     = 'Required';
    if (!form.category)                                e.category = 'Required';
    if (!form.watts || +form.watts <= 0)               e.watts    = 'Must be > 0';
    if (!form.hours || +form.hours <= 0 || +form.hours > 24) e.hours = '0.1 – 24';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    onAdd({ name: form.name.trim(), category: form.category, watts: +form.watts, hours: +form.hours, days: +form.days || 7, time: form.time.trim() });
    setForm(INIT); setErrors({});
  };

  const filtered = devices.filter(d => d.name.toLowerCase().includes(search.toLowerCase()) || d.category.toLowerCase().includes(search.toLowerCase()));

  const totalKwh  = devices.reduce((s, d) => s + d.kwhPerDay,    0);
  const totalCost = devices.reduce((s, d) => s + d.costPerMonth, 0);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">Device Management</h1>
          <p className="page-sub">Add and manage your home appliances — {devices.length} device{devices.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button className="btn-action" onClick={() => setShowForm(s => !s)}>
          <i className={`fa-solid ${showForm ? 'fa-minus' : 'fa-plus'}`} />
          {showForm ? ' Hide Form' : ' Add Device'}
        </button>
      </div>

      {/* Summary strip */}
      <div className="device-summary-strip">
        <div className="ds-item"><i className="fa-solid fa-plug" /><span>{devices.length} Devices</span></div>
        <div className="ds-sep" />
        <div className="ds-item"><i className="fa-solid fa-bolt" style={{ color:'var(--accent)' }} /><span>{totalKwh.toFixed(1)} kWh/day</span></div>
        <div className="ds-sep" />
        <div className="ds-item"><i className="fa-solid fa-indian-rupee-sign" style={{ color:'var(--yellow)' }} /><span>₹{totalCost.toFixed(0)}/month</span></div>
        {devices.length > 0 && (
          <>
            <div className="ds-sep" />
            <button className="ds-clear" onClick={() => { if (window.confirm('Remove all devices?')) onClearAll(); }}>
              <i className="fa-solid fa-trash" /> Clear All
            </button>
          </>
        )}
      </div>

      <div className="devices-layout">
        {/* Add form */}
        {showForm && (
          <div className="add-card">
            <div className="add-card-top">
              <h3><i className="fa-solid fa-circle-plus" /> Add New Device</h3>
            </div>

            {/* Presets */}
            <p className="preset-label"><i className="fa-solid fa-wand-sparkles" /> Quick Presets</p>
            <div className="presets-grid">
              {PRESETS.map(p => (
                <button key={p.name} className="preset-btn" onClick={() => applyPreset(p)}>
                  {CAT_ICONS[p.category]} {p.name}
                </button>
              ))}
            </div>

            <div className="form-divider"><span>or enter manually</span></div>

            <form onSubmit={handleSubmit} noValidate>
              <div className="form-2col">
                <div className={`af-group ${errors.name ? 'has-error' : ''}`}>
                  <label><i className="fa-solid fa-tag" /> Device Name</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} placeholder="e.g. Samsung AC" />
                  {errors.name && <span className="af-error">{errors.name}</span>}
                </div>
                <div className={`af-group ${errors.category ? 'has-error' : ''}`}>
                  <label><i className="fa-solid fa-layer-group" /> Category</label>
                  <select value={form.category} onChange={e => set('category', e.target.value)}>
                    <option value="">Select…</option>
                    {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                  </select>
                  {errors.category && <span className="af-error">{errors.category}</span>}
                </div>
                <div className={`af-group ${errors.watts ? 'has-error' : ''}`}>
                  <label><i className="fa-solid fa-bolt" /> Power (Watts)</label>
                  <input type="number" value={form.watts} onChange={e => set('watts', e.target.value)} placeholder="e.g. 1500" min="1" />
                  {errors.watts && <span className="af-error">{errors.watts}</span>}
                </div>
                <div className={`af-group ${errors.hours ? 'has-error' : ''}`}>
                  <label><i className="fa-solid fa-clock" /> Hours / Day</label>
                  <input type="number" value={form.hours} onChange={e => set('hours', e.target.value)} placeholder="e.g. 6" min="0.1" max="24" step="0.5" />
                  {errors.hours && <span className="af-error">{errors.hours}</span>}
                </div>
                <div className="af-group">
                  <label><i className="fa-solid fa-calendar-days" /> Days / Week</label>
                  <input type="number" value={form.days} onChange={e => set('days', e.target.value)} min="1" max="7" />
                </div>
                <div className="af-group">
                  <label><i className="fa-solid fa-sun" /> Typical Time</label>
                  <input value={form.time} onChange={e => set('time', e.target.value)} placeholder="e.g. Night 10 PM – 11 PM" />
                </div>
              </div>
              <button type="submit" className="btn-submit-full">
                <i className="fa-solid fa-circle-plus" /> Add Device
              </button>
            </form>
          </div>
        )}

        {/* Device list */}
        <div className="device-list-panel">
          <div className="dlp-header">
            <h3><i className="fa-solid fa-list-check" /> Your Devices</h3>
            <div className="search-wrap">
              <i className="fa-solid fa-magnifying-glass" />
              <input placeholder="Search devices…" value={search} onChange={e => setSearch(e.target.value)} />
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state tall">
              <i className="fa-solid fa-plug-circle-plus" />
              <p>{devices.length === 0 ? 'No devices yet. Use the form to add your first device.' : 'No devices match your search.'}</p>
            </div>
          ) : (
            <div className="device-table">
              <div className="dtable-head">
                <span>Device</span><span>Power</span><span>Usage</span><span>kWh/day</span><span>CO₂/day</span><span>₹/month</span><span></span>
              </div>
              {filtered.map(d => (
                <div className="dtable-row" key={d.id}>
                  <div className="dcell-device">
                    <span className="dcell-icon">{CAT_ICONS[d.category] || '🔌'}</span>
                    <div>
                      <span className="dcell-name">{d.name}</span>
                      <span className="dcell-cat">{d.category}</span>
                    </div>
                  </div>
                  <span className="dcell">{d.watts}W</span>
                  <span className="dcell">{d.hours}h · {d.days}d/wk</span>
                  <span className="dcell kwh">{d.kwhPerDay}</span>
                  <span className="dcell co2">{d.co2PerDay} kg</span>
                  <span className="dcell cost">₹{d.costPerMonth}</span>
                  <button className="dtable-del" onClick={() => onDelete(d.id)}>
                    <i className="fa-solid fa-trash-can" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}