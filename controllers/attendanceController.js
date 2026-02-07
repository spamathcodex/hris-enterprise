const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// 1. CLOCK IN (Versi Pro)
exports.clockIn = async (req, res) => {
    const employee_id = req.user.id; // Dari Token JWT

    try {
        // Cek hari ini (Logic bisnis tetap sama)
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);
        
        const cekDouble = await prisma.attendanceLog.findFirst({
            where: {
                employee_id: employee_id,
                date: {
                    gte: startOfDay // Lebih besar atau sama dengan jam 00:00 hari ini
                }
            }
        });

        if (cekDouble) {
            return res.status(400).json({ error: 'Anda sudah absen masuk hari ini!' });
        }

        // Simpan Absen (Lihat betapa bersihnya ini!)
        const newLog = await prisma.attendanceLog.create({
            data: {
                employee_id: employee_id,
                clock_in: new Date(),
                status: 'present'
            }
        });

        res.json({ message: 'Berhasil Clock In!', data: newLog });

    } catch (err) {
        console.error(err); // Log error untuk developer
        res.status(500).json({ error: 'Terjadi kesalahan sistem.' });
    }
};

// 2. CLOCK OUT (Versi Pro)
exports.clockOut = async (req, res) => {
    const employee_id = req.user.id;
    
    try {
        // Cari absen hari ini yang clock_out-nya masih kosong
        const startOfDay = new Date();
        startOfDay.setHours(0,0,0,0);

        const logHariIni = await prisma.attendanceLog.findFirst({
            where: {
                employee_id: employee_id,
                date: { gte: startOfDay },
                clock_out: null // Cari yang belum pulang
            }
        });

        if (!logHariIni) {
            return res.status(400).json({ error: 'Gagal. Anda belum absen masuk atau sudah pulang.' });
        }

        // Update waktu pulang
        const updatedLog = await prisma.attendanceLog.update({
            where: { id: logHariIni.id }, // Update berdasarkan ID log yang ditemukan
            data: {
                clock_out: new Date()
            }
        });

        res.json({ message: 'Hati-hati di jalan!', data: updatedLog });

    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// 3. HISTORY (Versi Pro)
exports.getHistory = async (req, res) => {
    const employee_id = req.user.id;
    try {
        const history = await prisma.attendanceLog.findMany({
            where: { employee_id: employee_id },
            orderBy: { date: 'desc' },
            take: 10 // Limit 10
        });
        res.json(history);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// --- FUNGSI BARU: KHUSUS DASHBOARD ADMIN ---
exports.getDailyReport = async (req, res) => {
    try {
        // 1. Tentukan Rentang Waktu Hari Ini (Mulai 00:00 sd 23:59)
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        const endOfDay = new Date();
        endOfDay.setHours(23, 59, 59, 999);

        // 2. Query Pakai Prisma (Ambil Log + Data Karyawannya)
        const logs = await prisma.attendanceLog.findMany({
            where: {
                // Cari yang tanggalnya DI ANTARA awal & akhir hari ini
                clock_in: {
                    gte: startOfDay,
                    lte: endOfDay
                }
            },
            include: {
                employee: true // JOIN otomatis ke tabel Employee
            },
            orderBy: {
                clock_in: 'asc'
            }
        });

        // 3. Format Data agar sesuai request Frontend
        const laporan = logs.map(log => ({
            name: log.employee.name,
            role: log.employee.role,
            clock_in: log.clock_in,
            clock_out: log.clock_out
        }));

        res.json(laporan);

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal mengambil laporan harian.' });
    }
};