// controllers/leaveController.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. PENGAJUAN CUTI (Karyawan)
exports.requestLeave = async (req, res) => {
    const { start_date, end_date, reason } = req.body;
    const employee_id = req.user.id;

    try {
        const employee = await prisma.employee.findUnique({ where: { id: employee_id } });
        
        // Validasi: Cek Sisa Kuota
        const duration = (new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24) + 1;
        if (employee.leave_quota < duration) {
            return res.status(400).json({ error: 'Jatah cuti tidak mencukupi!' });
        }

        const leave = await prisma.leaveRequest.create({
            data: {
                start_date: new Date(start_date),
                end_date: new Date(end_date),
                reason,
                employee_id
            }
        });

        res.json({ message: 'Permohonan cuti berhasil dikirim, menunggu persetujuan atasan.', data: leave });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 2. APPROVAL (Oleh Manager)
exports.approveLeave = async (req, res) => {
    const { requestId, status } = req.body; // status: 'APPROVED' atau 'REJECTED'
    const manager_id = req.user.id;

    try {
        // Cari request cuti dan pastikan yang approve adalah managernya
        const leave = await prisma.leaveRequest.findUnique({
            where: { id: requestId },
            include: { employee: true }
        });

        if (!leave || leave.employee.manager_id !== manager_id) {
            return res.status(403).json({ error: 'Anda tidak memiliki otoritas untuk menyetujui cuti ini.' });
        }

        // DATABASE TRANSACTION
        // Jika Approved, kurangi kuota. Jika Rejected, hanya ubah status.
        await prisma.$transaction(async (tx) => {
            const updatedLeave = await tx.leaveRequest.update({
                where: { id: requestId },
                data: { status }
            });

            if (status === 'APPROVED') {
                const duration = (new Date(leave.end_date) - new Date(leave.start_date)) / (1000 * 60 * 60 * 24) + 1;
                await tx.employee.update({
                    where: { id: leave.employee_id },
                    data: { leave_quota: { decrement: duration } }
                });
            }
            return updatedLeave;
        });

        res.json({ message: `Cuti telah di-${status.toLowerCase()}` });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. RIWAYAT CUTI SAYA (Karyawan melihat statusnya sendiri)
exports.getMyLeaves = async (req, res) => {
    const employee_id = req.user.id;
    try {
        const myLeaves = await prisma.leaveRequest.findMany({
            where: { employee_id: employee_id },
            orderBy: { created_at: 'desc' }
        });
        res.json(myLeaves);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};