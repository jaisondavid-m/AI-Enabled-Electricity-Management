import { useRef, useEffect } from 'react';
import { parseMarkdown } from '../utils';

export default function AIAnalysis({ devices, isAnalyzing, aiOutput, onAnalyze }) {
  const outputRef = useRef(null);

  useEffect(() => {
    if (aiOutput && outputRef.current) {
      outputRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [aiOutput]);

  return (
    <section className="section" id="analysis">
      <div className="section-header">
        <h2><i className="fa-solid fa-brain" /> AI Energy Analysis</h2>
        <p>Get personalised recommendations powered by Google Gemini AI</p>
      </div>

      <div className="analyze-bar">
        <div className="analyze-info">
          <div className="analyze-robot-wrap">
            <i className="fa-solid fa-robot" />
          </div>
          <div>
            <strong>DeepSeek AI is Ready</strong>
            <span>
              {devices.length === 0
                ? 'Add devices above, then click Analyze to get personalised tips'
                : `${devices.length} device${devices.length > 1 ? 's' : ''} loaded — click Analyze to get AI recommendations`}
            </span>
          </div>
        </div>
        <button className="btn-ai" onClick={onAnalyze} disabled={isAnalyzing}>
          {isAnalyzing
            ? <><i className="fa-solid fa-spinner fa-spin" /> Analyzing…</>
            : <><i className="fa-solid fa-wand-magic-sparkles" /> Analyze with AI</>}
        </button>
      </div>

      {(isAnalyzing || aiOutput) && (
        <div className="ai-output-container" ref={outputRef}>
          <div className="ai-output-header">
            <span><i className="fa-solid fa-robot" /> Gemini AI Analysis</span>
            <span className="ai-model-tag">DeepSeek via OpenRouter</span>
          </div>
          <div className="ai-output">
            {isAnalyzing && (
              <div className="ai-loading">
                <div className="loading-dots">
                  <span /><span /><span />
                </div>
                <p>Analyzing your energy consumption patterns…</p>
              </div>
            )}
            {!isAnalyzing && aiOutput && (
              aiOutput.error
                ? (
                  <div className="error-box">
                    <i className="fa-solid fa-triangle-exclamation" />
                    <div>
                      <strong>Analysis Error</strong>
                      <span>{aiOutput.text}</span>
                    </div>
                  </div>
                )
                : (
                  <div
                    className="ai-result"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(aiOutput.text) }}
                  />
                )
            )}
          </div>
        </div>
      )}
    </section>
  );
}
