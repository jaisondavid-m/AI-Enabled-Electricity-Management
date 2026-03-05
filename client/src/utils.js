export const CO2_FACTOR   = 0.82; // kg CO₂ per kWh — India CEA 2023
export const COST_PER_KWH = 7;    // ₹ per unit (average India)

export const CAT_ICONS = {
  Lighting: '💡', Cooling: '❄️', Kitchen: '🍳',
  Laundry: '🫧', Entertainment: '📺', Office: '💻', Other: '🔌'
};

export function calcDevice(raw) {
  const kwhPerDay = (raw.watts / 1000) * raw.hours * (raw.days / 7);
  return {
    ...raw,
    id: Date.now() + Math.random(),
    kwhPerDay:    +kwhPerDay.toFixed(3),
    co2PerDay:    +(kwhPerDay * CO2_FACTOR).toFixed(3),
    costPerMonth: +(kwhPerDay * 30 * COST_PER_KWH).toFixed(1)
  };
}

/** Convert Gemini markdown response to safe HTML */
export function parseMarkdown(md) {
  // Escape HTML first (content is from Gemini, not user input, but be safe)
  let html = md
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    // Headings
    .replace(/^### (.+)$/gm, '<h3>$1</h3>')
    .replace(/^## (.+)$/gm,  '<h3>$1</h3>')
    .replace(/^#### (.+)$/gm,'<h4>$1</h4>')
    // Bold
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    // Bullet list items
    .replace(/^[-*•] (.+)$/gm, '<li>$1</li>')
    // Numbered list items
    .replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
    // Wrap consecutive <li> blocks in <ul>
    .replace(/(<li>[\s\S]*?<\/li>\n?)+/g, m => `<ul>${m}</ul>`)
    // Callout blocks
    .replace(/(💰[^\n]+)/g, '<div class="saving-box">$1</div>')
    .replace(/(⚡ #1 Quick Win[^\n]*)/g, '<div class="quick-win">$1</div>')
    // Paragraph breaks
    .replace(/\n\n+/g, '</p><p>')
    // Wrap stray text lines
    .replace(/^(?!<[hup]|<div|<li|<ul)(.+)$/gm, m => m.trim() ? `<p>${m}</p>` : '')
    .replace(/<p><\/p>/g, '');
  return html;
}
