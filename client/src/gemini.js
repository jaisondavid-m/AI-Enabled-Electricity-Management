const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;
const URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-chat';

export async function analyzeDevices(devices) {
  const totalKwh  = devices.reduce((s, d) => s + d.kwhPerDay, 0).toFixed(2);
  const totalCo2  = devices.reduce((s, d) => s + d.co2PerDay, 0).toFixed(2);
  const totalCost = devices.reduce((s, d) => s + d.costPerMonth, 0).toFixed(1);

  const deviceList = devices.map(d =>
    `- ${d.name} (${d.category}): ${d.watts}W, used ${d.hours}h/day, ${d.days} days/week` +
    `${d.time ? `, typical time: "${d.time}"` : ''}, consumes ${d.kwhPerDay} kWh/day, emits ${d.co2PerDay} kg CO₂/day`
  ).join('\n');

  const prompt = `You are an AI energy efficiency expert for Indian households. Analyze the appliances below and give actionable recommendations to reduce carbon footprint and electricity bills.

HOUSEHOLD APPLIANCES:
${deviceList}

SUMMARY:
- Daily energy: ${totalKwh} kWh
- Daily CO₂: ${totalCo2} kg
- Monthly electricity cost: ₹${totalCost}

Provide a response with EXACTLY these 5 sections using ### for headings:

### Overall Assessment
Rate energy usage as Low / Medium / High. Mention the biggest energy consumer by name. Estimate annual CO₂ emissions.

### Top 5 Recommendations
Numbered list. Be device-specific. Examples: "Replace your [device name] with an LED equivalent to save 75% energy", "Run your [device] at 11 PM instead of peak hours to reduce grid load by 30%", "Set your AC to 24°C to save 6% per degree". Each tip must name the actual device.

### Smart Scheduling
Tell the user exactly WHEN to use each high-consumption device (morning / afternoon / night / off-peak). Mention that 10 PM – 6 AM is off-peak in most Indian states.

### Estimated Monthly Savings
If ALL recommendations are followed, estimate: CO₂ saved (kg/month), money saved (₹/month). Show optimistic and conservative estimates.

### ⚡ #1 Quick Win
One single action the user can do RIGHT NOW today. Make it compelling and specific.

Use Indian context: ₹ currency, Indian grid CO₂ factor of 0.82 kg/kWh, summer AC usage patterns, Indian appliance names where relevant. Be specific, practical, and motivating.`;

  const res = await fetch(URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
      'HTTP-Referer': 'https://ecowatts.ai',
      'X-Title': 'EcoWatts AI'
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.75,
      max_tokens: 1800
    })
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `API error: HTTP ${res.status}`);
  }

  const data = await res.json();
  const text = data?.choices?.[0]?.message?.content;
  if (!text) throw new Error('Empty response received from DeepSeek. Please try again.');
  return text;
}
