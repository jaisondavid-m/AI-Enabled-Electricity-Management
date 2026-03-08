const nodemailer = require('nodemailer');

const SENDER = 'ecowattsai@gmail.com';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: SENDER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

function buildHtmlEmail(data) {
  const { userName, devices, summary, aiText } = data;

  const deviceRows = devices
    .sort((a, b) => b.kwhPerDay - a.kwhPerDay)
    .map(
      (d, i) => `
      <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#ffffff'}">
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0">${d.name}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0">${d.category}</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center">${d.watts}W</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:center">${d.hours}h</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right">${d.kwhPerDay} kWh</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right">${d.co2PerDay} kg</td>
        <td style="padding:10px 12px;border-bottom:1px solid #e2e8f0;text-align:right">Rs.${d.costPerMonth.toFixed(0)}</td>
      </tr>`,
    )
    .join('');

  // Convert markdown-like AI text to HTML
  const aiHtml = aiText
    .replace(/### (.+)/g, '<h3 style="color:#16a34a;margin:18px 0 8px;font-size:16px">$1</h3>')
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br>');

  const date = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif">
  <div style="max-width:680px;margin:0 auto;background:#ffffff">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#16a34a,#0ea5e9);padding:28px 32px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:26px">&#9889; EcoWatts AI</h1>
      <p style="color:rgba(255,255,255,0.9);margin:6px 0 0;font-size:14px">Monthly Energy &amp; Carbon Footprint Report</p>
    </div>

    <div style="padding:28px 32px">

      <!-- Greeting -->
      <p style="font-size:15px;color:#334155">Hi <strong>${userName}</strong>,</p>
      <p style="font-size:14px;color:#64748b;line-height:1.6">
        Here is your monthly energy report generated on <strong>${date}</strong>.
        Your detailed PDF report is attached to this email.
      </p>

      <!-- KPI Cards -->
      <table width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0">
        <tr>
          <td style="padding:6px">
            <div style="background:#f0fdf4;border-left:4px solid #16a34a;border-radius:8px;padding:14px 16px">
              <div style="font-size:11px;color:#64748b">Total Devices</div>
              <div style="font-size:22px;font-weight:800;color:#0f172a">${summary.totalDevices}</div>
            </div>
          </td>
          <td style="padding:6px">
            <div style="background:#eff6ff;border-left:4px solid #0ea5e9;border-radius:8px;padding:14px 16px">
              <div style="font-size:11px;color:#64748b">Daily Usage</div>
              <div style="font-size:22px;font-weight:800;color:#0f172a">${summary.dailyKwh} kWh</div>
            </div>
          </td>
          <td style="padding:6px">
            <div style="background:#fef2f2;border-left:4px solid #ef4444;border-radius:8px;padding:14px 16px">
              <div style="font-size:11px;color:#64748b">CO2/Day</div>
              <div style="font-size:22px;font-weight:800;color:#0f172a">${summary.dailyCo2} kg</div>
            </div>
          </td>
          <td style="padding:6px">
            <div style="background:#fffbeb;border-left:4px solid #f59e0b;border-radius:8px;padding:14px 16px">
              <div style="font-size:11px;color:#64748b">Monthly Bill</div>
              <div style="font-size:22px;font-weight:800;color:#0f172a">Rs.${summary.monthlyCost}</div>
            </div>
          </td>
        </tr>
      </table>

      <!-- Summary Table -->
      <h2 style="font-size:17px;color:#0f172a;margin:24px 0 10px;border-bottom:2px solid #16a34a;padding-bottom:6px">
        Monthly Usage Summary
      </h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden">
        ${[
          ['Daily Energy', `${summary.dailyKwh} kWh`],
          ['Monthly Energy (est.)', `${summary.monthlyKwh} kWh`],
          ['Daily CO2 Emissions', `${summary.dailyCo2} kg`],
          ['Monthly CO2 (est.)', `${summary.monthlyCo2} kg`],
          ['Annual CO2 (est.)', `${summary.annualCo2} kg`],
          ['Est. Monthly Bill', `Rs.${summary.monthlyCost}`],
          ['Potential Saving (25%)', `Rs.${summary.potentialSaving}`],
        ]
          .map(
            ([label, val], i) => `
          <tr style="background:${i % 2 === 0 ? '#f8fafc' : '#fff'}">
            <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#475569">${label}</td>
            <td style="padding:10px 14px;border-bottom:1px solid #e2e8f0;font-size:14px;font-weight:700;color:#0f172a;text-align:right">${val}</td>
          </tr>`,
          )
          .join('')}
      </table>

      <!-- Devices Table -->
      <h2 style="font-size:17px;color:#0f172a;margin:24px 0 10px;border-bottom:2px solid #0ea5e9;padding-bottom:6px">
        Device-wise Breakdown
      </h2>
      <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;font-size:13px">
        <thead>
          <tr style="background:#16a34a">
            <th style="padding:10px 12px;color:#fff;text-align:left">Device</th>
            <th style="padding:10px 12px;color:#fff;text-align:left">Category</th>
            <th style="padding:10px 12px;color:#fff;text-align:center">Watts</th>
            <th style="padding:10px 12px;color:#fff;text-align:center">Hrs/Day</th>
            <th style="padding:10px 12px;color:#fff;text-align:right">kWh/Day</th>
            <th style="padding:10px 12px;color:#fff;text-align:right">CO2/Day</th>
            <th style="padding:10px 12px;color:#fff;text-align:right">Cost/Mo</th>
          </tr>
        </thead>
        <tbody>
          ${deviceRows}
        </tbody>
      </table>

      <!-- AI Recommendations -->
      <h2 style="font-size:17px;color:#0f172a;margin:24px 0 10px;border-bottom:2px solid #16a34a;padding-bottom:6px">
        AI-Powered Recommendations
      </h2>
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:18px 20px;font-size:13px;color:#334155;line-height:1.7">
        ${aiHtml}
      </div>

    </div>

    <!-- Footer -->
    <div style="background:#0f172a;padding:20px 32px;text-align:center">
      <p style="color:#94a3b8;font-size:12px;margin:0">
        EcoWatts AI &mdash; UN SDG 13: Climate Action<br>
        <span style="color:#64748b">This is an automated report. Please do not reply.</span>
      </p>
    </div>

  </div>
</body>
</html>`;
}

async function sendReport(req, res) {
  const { email, userName, devices, summary, aiText, pdfBase64, filename } = req.body;

  if (!email || !devices || !aiText || !pdfBase64) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  if (!process.env.GMAIL_APP_PASSWORD) {
    return res
      .status(500)
      .json({ message: 'Email service not configured. Set GMAIL_APP_PASSWORD in .env' });
  }

  const html = buildHtmlEmail({ userName, devices, summary, aiText });

  const mailOptions = {
    from: `"EcoWatts AI" <${SENDER}>`,
    to: email,
    subject: `Your EcoWatts AI Monthly Energy Report - ${new Date().toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}`,
    html,
    attachments: [
      {
        filename: filename || 'EcoWatts-Report.pdf',
        content: Buffer.from(pdfBase64, 'base64'),
        contentType: 'application/pdf',
      },
    ],
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Report sent successfully!' });
  } catch (error) {
    console.error('Email send error:', error.message);
    res.status(500).json({ message: `Failed to send email: ${error.message}` });
  }
}

module.exports = { sendReport };
