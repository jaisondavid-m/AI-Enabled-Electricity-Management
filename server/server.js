require('dotenv').config();
const cors = require('cors');
const express = require('express');
const { initializeDatabase } = require('./src/models/db');
const deviceRoutes = require('./src/routes/deviceRoutes');
const authRoutes = require('./src/routes/authRoutes');
const emailRoutes = require('./src/routes/emailRoutes');

const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

app.get('/api/health', (_req, res) => {
	res.status(200).json({ ok: true, message: 'Server is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/devices', deviceRoutes);
app.use('/api/email', emailRoutes);

app.use((err, _req, res, _next) => {
	console.error(err);
	res.status(500).json({ message: 'Internal server error' });
});

async function startServer() {
	try {
		await initializeDatabase();
		app.listen(PORT, () => {
			console.log(`Server running on http://localhost:${PORT}`);
		});
	} catch (error) {
		console.error('Failed to start server:', error.message);
		process.exit(1);
	}
}

startServer();