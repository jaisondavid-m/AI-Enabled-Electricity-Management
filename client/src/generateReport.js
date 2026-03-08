import jsPDF from 'jspdf';

/* ── Color Palette ── */
const C = {
  primary:  [22, 163, 74],
  primaryDk:[16, 120, 54],
  accent:   [14, 165, 233],
  dark:     [15, 23, 42],
  text:     [51, 65, 85],
  text2:    [100, 116, 139],
  white:    [255, 255, 255],
  altRow:   [248, 250, 252],
  border:   [226, 232, 240],
  red:      [239, 68, 68],
  yellow:   [245, 158, 11],
  green:    [22, 163, 74],
  blue:     [14, 165, 233],
};

const M = 14;          // page margin
const PW = 210;        // A4 width mm
const CW = PW - M * 2; // content width

/* ── Helpers ── */
function sanitize(str) {
  // Replace Unicode chars that Helvetica can't render
  return String(str)
    .replace(/\u20B9/g, 'Rs.')    // ₹ → Rs.
    .replace(/\u2082/g, '2')      // ₂ → 2
    .replace(/\u2103/g, 'C')      // ℃ → C
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\u2013/g, '-')
    .replace(/\u2014/g, '--')
    .replace(/\u2026/g, '...')
    .replace(/[^\x00-\x7F]/g, ''); // strip remaining non-ASCII
}

function ensureSpace(doc, y, need) {
  if (y + need > doc.internal.pageSize.getHeight() - 18) {
    doc.addPage();
    return 20;
  }
  return y;
}

/* ── Header Banner ── */
function drawHeader(doc, user) {
  // Gradient-like header (two-tone)
  doc.setFillColor(...C.primary);
  doc.rect(0, 0, PW, 40, 'F');
  doc.setFillColor(...C.primaryDk);
  doc.rect(0, 36, PW, 4, 'F');

  // Brand
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(...C.white);
  doc.text('EcoWatts AI', M, 15);

  // Subtitle
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Monthly Energy & Carbon Footprint Report', M, 23);

  // Date & user info on right
  const date = new Date().toLocaleDateString('en-IN', {
    day: 'numeric', month: 'long', year: 'numeric',
  });
  doc.setFontSize(9);
  doc.text(sanitize(`${date}  |  ${user.name}`), PW - M, 15, { align: 'right' });
  doc.text('UN SDG 13: Climate Action', PW - M, 23, { align: 'right' });

  // Thin accent line
  doc.setDrawColor(...C.accent);
  doc.setLineWidth(0.8);
  doc.line(M, 41, PW - M, 41);
}

/* ── Section Title with colored bar ── */
function sectionTitle(doc, y, title, color) {
  y = ensureSpace(doc, y, 16);
  doc.setFillColor(...(color || C.primary));
  doc.roundedRect(M, y - 4, 3, 10, 1.5, 1.5, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(...C.dark);
  doc.text(sanitize(title), M + 7, y + 3);
  return y + 12;
}

/* ── KPI Cards Row ── */
function drawKpiCards(doc, y, devices) {
  const totalKwh = devices.reduce((s, d) => s + d.kwhPerDay, 0);
  const totalCo2 = devices.reduce((s, d) => s + d.co2PerDay, 0);
  const totalCost = devices.reduce((s, d) => s + d.costPerMonth, 0);

  y = ensureSpace(doc, y, 28);

  const cards = [
    { label: 'Total Devices', value: String(devices.length), color: C.green },
    { label: 'Daily Usage', value: `${totalKwh.toFixed(1)} kWh`, color: C.blue },
    { label: 'CO2/Day', value: `${totalCo2.toFixed(2)} kg`, color: C.red },
    { label: 'Monthly Bill', value: `Rs.${totalCost.toFixed(0)}`, color: C.yellow },
  ];

  const cardW = (CW - 9) / 4; // 3 gaps of 3mm
  cards.forEach((c, i) => {
    const x = M + i * (cardW + 3);

    // Card background
    doc.setFillColor(248, 250, 252);
    doc.roundedRect(x, y, cardW, 22, 2, 2, 'F');

    // Colored left strip
    doc.setFillColor(...c.color);
    doc.roundedRect(x, y, 2.5, 22, 1.2, 1.2, 'F');

    // Label
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...C.text2);
    doc.text(c.label, x + 6, y + 8);

    // Value
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(...C.dark);
    doc.text(sanitize(c.value), x + 6, y + 17);
  });

  return y + 30;
}

/* ── Professional Table ── */
function drawTable(doc, y, headers, rows, opts = {}) {
  const colW = opts.colWidths || Array(headers.length).fill(CW / headers.length);
  const rowH = opts.rowHeight || 7.5;
  const fs = opts.fontSize || 9;

  y = ensureSpace(doc, y, rowH + 4);

  // Header
  doc.setFillColor(...C.primary);
  doc.roundedRect(M, y, CW, rowH + 1, 1.5, 1.5, 'F');
  // Fill bottom corners to be straight
  doc.setFillColor(...C.primary);
  doc.rect(M, y + 3, CW, rowH - 2, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(fs);
  doc.setTextColor(...C.white);
  let x = M;
  headers.forEach((h, i) => {
    doc.text(sanitize(h), x + 3, y + rowH - 1.5);
    x += colW[i];
  });
  y += rowH + 1;

  // Body
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(fs);

  rows.forEach((row, ri) => {
    y = ensureSpace(doc, y, rowH + 1);

    // Alternating row bg
    if (ri % 2 === 0) {
      doc.setFillColor(...C.altRow);
      doc.rect(M, y, CW, rowH, 'F');
    }

    // Bottom border
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.2);
    doc.line(M, y + rowH, M + CW, y + rowH);

    doc.setTextColor(...C.text);
    x = M;
    row.forEach((cell, ci) => {
      const txt = sanitize(cell);
      const maxChars = Math.floor(colW[ci] / (fs * 0.22));
      const clipped = txt.length > maxChars ? txt.slice(0, maxChars - 1) + '..' : txt;
      doc.text(clipped, x + 3, y + rowH - 2);
      x += colW[ci];
    });
    y += rowH;
  });

  // Bottom border of table
  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(M, y, M + CW, y);

  return y + 8;
}

/* ── Summary Stats Table ── */
function summarySection(doc, y, devices) {
  const totalKwh = devices.reduce((s, d) => s + d.kwhPerDay, 0);
  const totalCo2 = devices.reduce((s, d) => s + d.co2PerDay, 0);
  const totalCost = devices.reduce((s, d) => s + d.costPerMonth, 0);

  y = sectionTitle(doc, y, 'Monthly Usage Summary', C.primary);

  const stats = [
    ['Total Devices', String(devices.length)],
    ['Daily Energy Usage', `${totalKwh.toFixed(1)} kWh`],
    ['Monthly Energy (est.)', `${(totalKwh * 30).toFixed(0)} kWh`],
    ['Daily CO2 Emissions', `${totalCo2.toFixed(2)} kg`],
    ['Monthly CO2 (est.)', `${(totalCo2 * 30).toFixed(1)} kg`],
    ['Annual CO2 (est.)', `${(totalCo2 * 365).toFixed(0)} kg`],
    ['Est. Monthly Bill', `Rs.${totalCost.toFixed(0)}`],
    ['Potential Saving (25%)', `Rs.${(totalCost * 0.25).toFixed(0)}`],
  ];

  return drawTable(doc, y, ['Metric', 'Value'], stats, {
    colWidths: [CW * 0.55, CW * 0.45],
    fontSize: 10,
    rowHeight: 8,
  });
}

/* ── Devices Table ── */
function devicesTable(doc, y, devices) {
  y = sectionTitle(doc, y, 'Device-wise Breakdown', C.blue);

  const rows = [...devices]
    .sort((a, b) => b.kwhPerDay - a.kwhPerDay)
    .map(d => [
      d.name,
      d.category,
      `${d.watts}W`,
      `${d.hours}h`,
      `${d.kwhPerDay} kWh`,
      `${d.co2PerDay} kg`,
      `Rs.${d.costPerMonth.toFixed(0)}`,
    ]);

  const w = CW;
  return drawTable(doc, y,
    ['Device', 'Category', 'Watts', 'Hrs/Day', 'kWh/Day', 'CO2/Day', 'Cost/Mo'],
    rows,
    {
      colWidths: [w*0.20, w*0.15, w*0.10, w*0.10, w*0.15, w*0.15, w*0.15],
      fontSize: 9,
    },
  );
}

/* ── AI Recommendations with markdown bold parsing ── */
function aiSection(doc, y, aiText) {
  y = sectionTitle(doc, y, 'AI-Powered Recommendations', C.green);

  const pageH = doc.internal.pageSize.getHeight();
  const lines = aiText.split('\n');

  // Draw a subtle background box start indicator
  doc.setDrawColor(...C.green);
  doc.setLineWidth(0.4);
  doc.line(M, y - 4, M + CW, y - 4);

  for (const line of lines) {
    const trimmed = line.trim();

    if (trimmed.startsWith('### ')) {
      y = ensureSpace(doc, y + 3, 12);
      // Sub-section header with accent
      doc.setFillColor(...C.green);
      doc.roundedRect(M, y - 3, CW, 9, 1.5, 1.5, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...C.white);
      doc.text(sanitize(trimmed.replace(/^###\s*/, '')), M + 4, y + 3);
      y += 10;
      continue;
    }

    if (trimmed.length === 0) {
      y += 2;
      continue;
    }

    y = ensureSpace(doc, y, 7);

    // Parse inline **bold** segments
    const clean = sanitize(trimmed);
    const segments = [];
    let remaining = clean;
    const boldRe = /\*\*(.+?)\*\*/;
    while (true) {
      const m = boldRe.exec(remaining);
      if (!m) { segments.push({ text: remaining, bold: false }); break; }
      if (m.index > 0) segments.push({ text: remaining.slice(0, m.index), bold: false });
      segments.push({ text: m[1], bold: true });
      remaining = remaining.slice(m.index + m[0].length);
    }

    // Render segments with word-wrap
    const maxW = CW - 2;
    let lineX = M + 2;
    const lineH = 4.8;

    for (const seg of segments) {
      doc.setFont('helvetica', seg.bold ? 'bold' : 'normal');
      doc.setFontSize(9.5);
      doc.setTextColor(...C.text);

      const words = seg.text.split(' ');
      for (const word of words) {
        if (!word) continue;
        const ww = doc.getTextWidth(word + ' ');
        if (lineX + ww > M + maxW) {
          y += lineH;
          y = ensureSpace(doc, y, lineH + 2);
          lineX = M + 2;
        }
        doc.text(word + ' ', lineX, y);
        lineX += ww;
      }
    }

    y += lineH + 0.5;
    lineX = M + 2;
  }

  return y + 4;
}

/* ── Footer ── */
function drawFooter(doc) {
  const pages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pages; i++) {
    doc.setPage(i);
    const ph = doc.internal.pageSize.getHeight();

    // Footer line
    doc.setDrawColor(...C.border);
    doc.setLineWidth(0.3);
    doc.line(M, ph - 14, PW - M, ph - 14);

    // Left: branding
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(...C.text2);
    doc.text('EcoWatts AI  |  UN SDG 13: Climate Action', M, ph - 9);

    // Right: page number
    doc.text(`Page ${i} of ${pages}`, PW - M, ph - 9, { align: 'right' });
  }
}

/* ── Main Export ── */
export async function generateMonthlyReport(devices, user, getAiAnalysis) {
  const aiText = await getAiAnalysis(devices);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  // Page 1: Header + KPIs + Summary + Devices
  drawHeader(doc, user);

  let y = 50;
  y = drawKpiCards(doc, y, devices);
  y = summarySection(doc, y, devices);
  y = devicesTable(doc, y, devices);

  // AI section (may span pages)
  y = ensureSpace(doc, y, 40);
  y = aiSection(doc, y, aiText);

  drawFooter(doc);

  const month = new Date().toLocaleDateString('en-IN', {
    month: 'short', year: 'numeric',
  }).replace(' ', '-');
  const filename = `EcoWatts-Report-${month}.pdf`;

  doc.save(filename);

  // Return blob + metadata for email
  const blob = doc.output('blob');
  return { blob, filename, aiText };
}