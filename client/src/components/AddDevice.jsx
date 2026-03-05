import { useState } from 'react';

const CATEGORIES = [
  { value: 'Lighting',       label: '💡 Lighting'           },
  { value: 'Cooling',        label: '❄️ Cooling / Heating'  },
  { value: 'Kitchen',        label: '🍳 Kitchen Appliances' },
  { value: 'Laundry',        label: '🫧 Laundry'            },
  { value: 'Entertainment',  label: '📺 Entertainment'      },
  { value: 'Office',         label: '💻 Office / Work'      },
  { value: 'Other',          label: '🔌 Other'              },
];

const INIT = { name: '', category: '', watts: '', hours: '', days: '7', time: '' };

function Field({ label, icon, error, children }) {
  return (
    <div className={`form-group${error ? ' has-error' : ''}`}>
      <label><i className={`fa-solid ${icon}`} /> {label}</label>
      {children}
      {error && <span className="field-error"><i className="fa-solid fa-circle-exclamation" /> {error}</span>}
    </div>
  );
}

export default function AddDevice({ onAdd }) {
  const [form, setForm]     = useState(INIT);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim())                           e.name     = 'Device name is required';
    if (!form.category)                              e.category = 'Please select a category';
    if (!form.watts || +form.watts <= 0)             e.watts    = 'Enter a valid wattage (> 0)';
    if (!form.hours || +form.hours <= 0 || +form.hours > 24) e.hours = 'Enter hours between 0.1 and 24';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    onAdd({
      name:     form.name.trim(),
      category: form.category,
      watts:    +form.watts,
      hours:    +form.hours,
      days:     +form.days || 7,
      time:     form.time.trim(),
    });
    setForm(INIT);
  };

  return (
    <form className="add-device-card" onSubmit={handleSubmit} noValidate>
      <div className="form-grid">
        <Field label="Device Name" icon="fa-tag" error={errors.name}>
          <input
            value={form.name}
            onChange={e => set('name', e.target.value)}
            placeholder="e.g. LED Bulb, AC, Washing Machine"
          />
        </Field>

        <Field label="Category" icon="fa-layer-group" error={errors.category}>
          <select value={form.category} onChange={e => set('category', e.target.value)}>
            <option value="">Select Category</option>
            {CATEGORIES.map(c => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Power (Watts)" icon="fa-bolt" error={errors.watts}>
          <input
            type="number" value={form.watts}
            onChange={e => set('watts', e.target.value)}
            placeholder="e.g. 60" min="1"
          />
        </Field>

        <Field label="Usage (hours/day)" icon="fa-clock" error={errors.hours}>
          <input
            type="number" value={form.hours}
            onChange={e => set('hours', e.target.value)}
            placeholder="e.g. 5" min="0.1" max="24" step="0.5"
          />
        </Field>

        <Field label="Days Used / Week" icon="fa-calendar-days">
          <input
            type="number" value={form.days}
            onChange={e => set('days', e.target.value)}
            min="1" max="7"
          />
        </Field>

        <Field label="Typical Usage Time" icon="fa-clock-rotate-left">
          <input
            value={form.time}
            onChange={e => set('time', e.target.value)}
            placeholder="e.g. Morning 6–8 AM, Night 10 PM"
          />
        </Field>
      </div>

      <button type="submit" className="btn-primary">
        <i className="fa-solid fa-circle-plus" /> Add Device
      </button>
    </form>
  );
}
