const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');
const authMiddleware = require('../middleware/authMiddleware');

// Generate Gaji (Hanya Admin)
// Note: Kita butuh middleware requireAdmin di sini nanti
router.post('/generate', authMiddleware, payrollController.generatePayroll);

// Lihat Slip Gaji Sendiri
router.get('/my-history', authMiddleware, payrollController.getMyPayrolls);

// Download Slip Gaji (Parameter :id adalah ID dari tabel Payroll)
router.get('/:id/download', authMiddleware, payrollController.downloadPayslip);

module.exports = router;