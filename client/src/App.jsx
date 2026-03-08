import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar      from './components/Sidebar';
import EcoTips      from './components/EcoTips';
import Toast        from './components/Toast';
import AuthPage     from './pages/AuthPage';
import Dashboard    from './pages/Dashboard';
import DevicesPage  from './pages/DevicesPage';
import AIPage       from './pages/AIPage';
import { analyzeDevices } from './gemini';
import {
  fetchDevices,
  createDevice as createDeviceApi,
  deleteDevice as deleteDeviceApi,
  clearDevices as clearDevicesApi,
  setApiUser,
} from './api';
import './App.css';

function loadUser() {
  try {
    const raw = localStorage.getItem('user');
    if (raw) {
      const u = JSON.parse(raw);
      if (u && u.id) { setApiUser(u); return u; }
    }
  } catch { /* corrupted data */ }
  return null;
}

export default function App() {
  const [user,        setUser]        = useState(loadUser);
  const [page,        setPage]        = useState('dashboard');
  const [devices,     setDevices]     = useState([]);
  const [aiOutput,    setAiOutput]    = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toast,       setToast]       = useState(null);
  const toastRef = useRef(null);

  const showToast = useCallback((msg, type = 'success') => {
    clearTimeout(toastRef.current);
    setToast({ msg, type });
    toastRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  useEffect(() => {
    if (!user) return;

    let active = true;
    fetchDevices()
      .then((list) => {
        if (active) setDevices(list);
      })
      .catch((err) => {
        showToast(`❌ ${err.message}`, 'error');
      });

    return () => {
      active = false;
    };
  }, [user, showToast]);

  const handleLogin = useCallback((u) => {
    setApiUser(u);
    setUser(u);
    localStorage.setItem('user', JSON.stringify(u));
    setPage('dashboard');
  }, []);

  const handleLogout = useCallback(() => {
    setApiUser(null);
    setUser(null);
    localStorage.removeItem('user');
    setPage('dashboard');
    setDevices([]);
    setAiOutput(null);
  }, []);

  const addDevice = useCallback(async (raw) => {
    try {
      const created = await createDeviceApi(raw);
      setDevices(prev => [created, ...prev]);
      showToast(`✅ "${raw.name}" added`);
    } catch (err) {
      showToast(`❌ ${err.message}`, 'error');
    }
  }, [showToast]);

  const deleteDevice = useCallback(async (id) => {
    try {
      await deleteDeviceApi(id);
      setDevices(prev => prev.filter(d => d.id !== id));
      showToast('🗑️ Device removed', 'error');
    } catch (err) {
      showToast(`❌ ${err.message}`, 'error');
    }
  }, [showToast]);

  const clearAll = useCallback(async () => {
    try {
      await clearDevicesApi();
      setDevices([]);
      setAiOutput(null);
      showToast('🗑️ All devices cleared', 'error');
    } catch (err) {
      showToast(`❌ ${err.message}`, 'error');
    }
  }, [showToast]);

  const runAnalysis = useCallback(async () => {
    if (!devices.length) { showToast('⚠️ Add devices first', 'error'); return; }
    setIsAnalyzing(true);
    setAiOutput(null);
    try {
      const text = await analyzeDevices(devices);
      setAiOutput({ text, error: false });
      showToast('✅ AI analysis complete!');
    } catch (err) {
      setAiOutput({ text: err.message, error: true });
      showToast('❌ Analysis failed', 'error');
    } finally {
      setIsAnalyzing(false);
    }
  }, [devices, showToast]);

  // Auth gate
  if (!user) {
    return (
      <>
        <AuthPage onLogin={handleLogin} onShowToast={showToast} />
        {toast && <Toast msg={toast.msg} type={toast.type} onHide={() => setToast(null)} />}
      </>
    );
  }

  return (
    <div className="app-shell">
      <Sidebar page={page} onNavigate={setPage} user={user} onLogout={handleLogout} />

      <main className="app-main">
        {page === 'dashboard' && (
          <Dashboard devices={devices} user={user} onNavigate={setPage} onShowToast={showToast} />
        )}
        {page === 'devices' && (
          <DevicesPage
            devices={devices}
            onAdd={addDevice}
            onDelete={deleteDevice}
            onClearAll={clearAll}
          />
        )}
        {page === 'ai' && (
          <AIPage
            devices={devices}
            isAnalyzing={isAnalyzing}
            aiOutput={aiOutput}
            onAnalyze={runAnalysis}
          />
        )}
        {page === 'tips' && <EcoTips />}
      </main>

      {toast && <Toast msg={toast.msg} type={toast.type} onHide={() => setToast(null)} />}
    </div>
  );
}
