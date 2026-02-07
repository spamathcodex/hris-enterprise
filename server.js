// server.js (VERSI ENTERPRISE - BERSIH)
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import Controller & Middleware
const authController = require('./controllers/authController');
const authMiddleware = require('./middleware/authMiddleware')
const attendanceRoutes = require('./routes/attendanceRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());

// --- ROUTES ---
// Login (Sekarang pakai controller)
app.post('/api/register', authController.register);
app.post('/api/login', authController.login);
app.use('/api/attendance', attendanceRoutes);

// --- MIDDLEWARE KHUSUS ADMIN ---
const requireAdmin = (req, res, next) => {
    // Cek apakah tokennya valid & role-nya admin
    if (req.user && req.user.role === 'admin') {
        next(); // Silakan masuk bos!
    } else {
        res.status(403).json({ error: 'Akses Ditolak! Khusus HRD.' });
    }
};

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server Enterprise berjalan di port ${PORT}`);
});