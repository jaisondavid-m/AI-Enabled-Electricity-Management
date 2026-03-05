import { useState, useEffect, useCallback, useRef } from 'react';
import Sidebar      from './components/Sidebar';
import EcoTips      from './components/EcoTips';
import Toast        from './components/Toast';
import AuthPage     from './pages/AuthPage';
import Dashboard    from './pages/Dashboard';
import DevicesPage  from './pages/DevicesPage';
import AIPage       from './pages/AIPage';
import { calcDevice } from './utils';
import { analyzeDevices } from './gemini';
import './App.css';

function loadDevices() {
  try { return JSON.parse(localStorage.getItem('ecowatts_devices') || '[]'); }
  catch { return []; }
}

function loadUser() {
  try { return JSON.parse(localStorage.getItem('ecowatts_user') || 'null'); }
  catch { return null; }
}

export default function App() {
  const [user,        setUser]        = useState(loadUser);
  const [page,        setPage]        = useState('dashboard');
  const [devices,     setDevices]     = useState(loadDevices);
  const [aiOutput,    setAiOutput]    = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [toast,       setToast]       = useState(null);
  const toastRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('ecowatts_devices', JSON.stringify(devices));
  }, [devices]);

  const showToast = useCallback((msg, type = 'success') => {
    clearTimeout(toastRef.current);
    setToast({ msg, type });
    toastRef.current = setTimeout(() => setToast(null), 3500);
  }, []);

  const handleLogin = useCallback((u) => {
    localStorage.setItem('ecowatts_user', JSON.stringify(u));
    setUser(u);
    setPage('dashboard');
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('ecowatts_user');
    setUser(null);
    setPage('dashboard');
  }, []);

  const addDevice = useCallback((raw) => {
    setDevices(prev => [...prev, calcDevice(raw)]);
    showToast(`✅ "${raw.name}" added`);
  }, [showToast]);

  const deleteDevice = useCallback((id) => {
    setDevices(prev => prev.filter(d => d.id !== id));
    showToast('🗑️ Device removed', 'error');
  }, [showToast]);

  const clearAll = useCallback(() => {
    setDevices([]);
    setAiOutput(null);
    showToast('🗑️ All devices cleared', 'error');
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
  if (!user) return <AuthPage onLogin={handleLogin} />;

  return (
    <div className="app-shell">
      <Sidebar page={page} onNavigate={setPage} user={user} onLogout={handleLogout} />

      <main className="app-main">
        {page === 'dashboard' && (
          <Dashboard devices={devices} user={user} onNavigate={setPage} />
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
