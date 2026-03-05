import AIAnalysis from '../components/AIAnalysis';

const TIPS_STATIC = [
  { icon: '🌙', title: 'Night Shift Scheduling',   body: 'Run washing machines and dishwashers after 10 PM — grid load is 30–40% lower, reducing carbon intensity per kWh.' },
  { icon: '🌡️', title: 'AC Temperature Hack',      body: 'Each degree above 24°C saves ~6% energy. Set to 26°C and use a ceiling fan to feel the same comfort.' },
  { icon: '🚿', title: 'Water Heater Timer',        body: 'Install a timer — heat water only 30 min before bathing. Eliminates standby losses that account for 15% of heater energy.' },
  { icon: '💡', title: 'Daylighting Strategy',      body: 'Open east-facing windows from 7–10 AM for natural light. Saves 2–3 kWh/day in a typical home.' },
  { icon: '🔌', title: 'Phantom Load Elimination',  body: 'TVs, chargers, and set-top boxes consume 5–10W in standby. Use smart power strips to eliminate 0.1–0.2 kWh/day.' },
  { icon: '❄️', title: 'Refrigerator Placement',   body: 'Keep the fridge 10 cm from walls for ventilation. Avoid placing near heat sources — reduces compressor run time by 15%.' },
];

export default function AIPage({ devices, isAnalyzing, aiOutput, onAnalyze }) {
  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 className="page-title">AI Energy Analysis</h1>
          <p className="page-sub">Personalized recommendations powered by DeepSeek AI for a greener home.</p>
        </div>
        <div className="ai-model-badge">
          <i className="fa-solid fa-microchip" /> DeepSeek via OpenRouter
        </div>
      </div>

      {devices.length === 0 ? (
        <div className="ai-empty-state">
          <div className="ai-empty-icon">🤖</div>
          <h3>No devices to analyse yet</h3>
          <p>Head over to <strong>Device Management</strong> and add your home appliances first. The AI needs data to generate personalised tips.</p>
        </div>
      ) : (
        <>
          {/* Analysis panel */}
          <div className="ai-analysis-wrap">
            <AIAnalysis
              devices={devices}
              isAnalyzing={isAnalyzing}
              aiOutput={aiOutput}
              onAnalyze={onAnalyze}
            />
          </div>

          {/* Static tips below */}
          <div className="eco-tips-section">
            <div className="section-heading">
              <i className="fa-solid fa-leaf" /> Universal Energy Saving Tips
            </div>
            <div className="tips-grid">
              {TIPS_STATIC.map((t, i) => (
                <div className="tip-card" key={i}>
                  <div className="tip-icon">{t.icon}</div>
                  <div className="tip-body">
                    <strong>{t.title}</strong>
                    <p>{t.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
