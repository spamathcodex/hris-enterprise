const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');

// Karyawan: Kirim pengajuan & lihat riwayat cuti sendiri
router.post('/request', authMiddleware, leaveController.requestLeave);

// Manager: Lihat daftar cuti bawahan & beri keputusan (Approve/Reject)
router.post('/approve', authMiddleware, leaveController.approveLeave);

// API untuk melihat daftar cuti yang butuh approval (Khusus Manager)
router.get('/inbox', authMiddleware, async (req, res) => {
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    try {
        const requests = await prisma.leaveRequest.findMany({
            where: {
                employee: { manager_id: req.user.id }, // Hanya bawahan langsung
                status: 'PENDING'
            },
            include: { employee: true }
        });
        res.json(requests);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.get('/my-history', authMiddleware, leaveController.getMyLeaves);

module.exports = router;