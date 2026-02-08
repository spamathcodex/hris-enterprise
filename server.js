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

// --- DAFTARKAN ROUTES ---

// Ganti app.post manual dengan ini:
app.use('/api', authRoutes); 
// Penjelasan: 
// - /api + /login     -> http://localhost:3000/api/login
// - /api + /register  -> http://localhost:3000/api/register
// - /api + /employees -> http://localhost:3000/api/employees

app.use('/api/attendance', attendanceRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/payroll', payrollRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server Enterprise berjalan di port ${PORT}`);
});