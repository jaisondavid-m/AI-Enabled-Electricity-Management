import { useState } from 'react';
import { loginUser, registerUser } from '../api';

export default function AuthPage({ onLogin, onShowToast }) {
  const [tab, setTab]   = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [err, setErr]   = useState('');
  const [loading, setLoading] = useState(false);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setErr(''); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (loading) return;

    if (!form.email || !form.password) { setErr('Please fill in all fields.'); return; }
    if (tab === 'register' && !form.name) { setErr('Please enter your name.'); return; }

    try {
      setLoading(true);
      if (tab === 'register') {
        await registerUser({
          name: form.name,
          email: form.email,
          password: form.password,
        });

        onShowToast('Account Created Successfully', 'success');
        setTab('login');
        setForm((f) => ({ ...f, password: '' }));
        return;
      }

      const user = await loginUser({
        email: form.email,
        password: form.password,
      });
      onLogin(user);
    } catch (error) {
      setErr(error.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-root">
      {/* Left panel */}
      <div className="auth-left">
        <div className="auth-brand">
          <span className="auth-logo-icon"><i className="fa-solid fa-bolt" /></span>
          <span className="auth-logo-text">EcoWatts <span className="auth-ai">AI</span></span>
        </div>
        <div className="auth-left-body">
          <h2>AI-Enabled Electricity Management</h2>
          <p>Smart energy tracking and AI-powered recommendations to reduce your carbon footprint and save money.</p>
          <div className="auth-features">
            {[
              { icon: 'fa-chart-line',        text: 'Real-time energy monitoring'       },
              { icon: 'fa-robot',              text: 'AI-powered recommendations'        },
              { icon: 'fa-leaf',               text: 'Carbon footprint tracking'        },
              { icon: 'fa-indian-rupee-sign',  text: 'Monthly cost savings insights'    },
            ].map(f => (
              <div className="auth-feature" key={f.text}>
                <span className="auth-feat-icon"><i className={`fa-solid ${f.icon}`} /></span>
                <span>{f.text}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="auth-left-footer">
          <span className="auth-badge-sdg"><i className="fa-solid fa-seedling" /> UN SDG 13: Climate Action</span>
        </div>
      </div>

      {/* Right panel */}
      <div className="auth-right">
        <div className="auth-card">
          <div className="auth-card-header">
            <h3>{tab === 'login' ? 'Welcome back' : 'Create account'}</h3>
            <p>{tab === 'login' ? 'Sign in to your dashboard' : 'Start tracking your energy'}</p>
          </div>

          <div className="auth-tabs">
            <button className={tab === 'login'    ? 'active' : ''} onClick={() => { setTab('login');    setErr(''); }}>Login</button>
            <button className={tab === 'register' ? 'active' : ''} onClick={() => { setTab('register'); setErr(''); }}>Register</button>
          </div>

          <form onSubmit={handleSubmit} noValidate>
            {tab === 'register' && (
              <div className="auth-field">
                <label><i className="fa-solid fa-user" /> Full Name</label>
                <input type="text" placeholder="Rahul Sharma" value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
            )}
            <div className="auth-field">
              <label><i className="fa-solid fa-envelope" /> Email Address</label>
              <input type="email" placeholder="you@example.com" value={form.email} onChange={e => set('email', e.target.value)} />
            </div>
            <div className="auth-field">
              <label><i className="fa-solid fa-lock" /> Password</label>
              <input type="password" placeholder="••••••••" value={form.password} onChange={e => set('password', e.target.value)} />
            </div>
            {err && <div className="auth-error"><i className="fa-solid fa-circle-exclamation" /> {err}</div>}
            <button type="submit" className="auth-submit" disabled={loading}>
              {tab === 'login' ? <><i className="fa-solid fa-right-to-bracket" /> Sign In</> : <><i className="fa-solid fa-user-plus" /> Create Account</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
