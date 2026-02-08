require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

// --- IMPORT ROUTES ---
const authRoutes = require('./routes/authRoutes'); // <--- BARU
const attendanceRoutes = require('./routes/attendanceRoutes'); 
const leaveRoutes = require('./routes/leaveRoutes');
const payrollRoutes = require('./routes/payrollRoutes');

const app = express();
app.use(cors());
app.use(bodyParser.json());
app.use(express.static(__dirname));

// Tentukan rute utama (Pintu Depan)
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

// --- DAFTARKAN ROUTES ---

// Ganti app.post manual dengan ini:
app.use('/api', authRoutes); 
// Penjelasan: 
// - /api + /login     -> https://hris-enterprise-production.up.railway.app/api/login
// - /api + /register  -> https://hris-enterprise-production.up.railway.app/api/register
// - /api + /employees -> https://hris-enterprise-production.up.railway.app/api/employees

app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server Enterprise berjalan di port ${PORT}`);
});