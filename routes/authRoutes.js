// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware'); 

// 1. Register User Baru
router.post('/register', authController.register);

// 2. Login User
router.post('/login', authController.login);

// 3. Ambil Daftar Semua Karyawan (Fitur Baru untuk Admin)
// Kita pasang authMiddleware agar tidak sembarang orang bisa lihat data ini
router.get('/employees', authMiddleware, authController.getAllEmployees);

module.exports = router;