const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');

// Middleware Cek Admin (Kita bikin inline aja biar cepat)
const requireAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'ADMIN') { // Pastikan huruf besar 'ADMIN'
        next();
    } else {
        res.status(403).json({ error: 'Khusus Admin' });
    }
};

// Semua rute di sini diproteksi oleh satpam (authMiddleware)
router.post('/clock-in', authMiddleware, attendanceController.clockIn);
router.post('/clock-out', authMiddleware, attendanceController.clockOut);
router.get('/history', authMiddleware, attendanceController.getHistory);

// Rute Admin (BARU)
router.get('/daily-report', authMiddleware, requireAdmin, attendanceController.getDailyReport);

module.exports = router;