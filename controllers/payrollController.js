const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { calculatePPh21 } = require('../utils/taxCalculator'); // Panggil Otak Pajak
const PDFDocument = require('pdfkit');

exports.generatePayroll = async (req, res) => {
    const { month, year } = req.body; // Contoh: { "month": 2, "year": 2026 }

    try {
        // 1. Ambil semua karyawan
        const employees = await prisma.employee.findMany();
        const results = [];

        // 2. Loop setiap karyawan (Proses Batch)
        for (const emp of employees) {
            
            const startDate = new Date(year, month - 1, 1);
            const endDate = new Date(year, month, 0);

            const attendanceCount = await prisma.attendanceLog.count({
                where: {
                    employee_id: emp.id,
                    clock_in: { gte: startDate, lte: endDate }
                }
            });

            // HITUNG DUIT
            const basic = emp.base_salary;
            const allowance = emp.daily_allowance * attendanceCount;
            // Panggil fungsi pajak (pastikan sudah di-import di atas)
            // const { calculatePPh21 } = require('../utils/taxCalculator'); 
            // Kalau belum import, pakai 0 dulu sementara:
            const tax = 0; 
            
            const netSalary = basic + allowance - tax;

            // --- LOGIKA BARU: UPSERT (Update or Insert) ---
            const existingPayroll = await prisma.payroll.findFirst({
                where: { employee_id: emp.id, month: month, year: year }
            });

            if (existingPayroll) {
                // KASUS A: SUDAH ADA -> UPDATE (Timpa data lama)
                const updated = await prisma.payroll.update({
                    where: { id: existingPayroll.id },
                    data: {
                        basic_salary: basic,
                        allowance_total: allowance,
                        tax_amount: tax,
                        net_salary: netSalary,
                        status: 'PAID' // Paksa status PAID
                    }
                });
                results.push(updated);
            } else {
                // KASUS B: BELUM ADA -> CREATE BARU
                const created = await prisma.payroll.create({
                    data: {
                        employee_id: emp.id,
                        month,
                        year,
                        basic_salary: basic,
                        allowance_total: allowance,
                        tax_amount: tax,
                        net_salary: netSalary,
                        status: 'PAID'
                    }
                });
                results.push(created);
            }
        }

        res.json({ 
            message: `Sukses generate gaji untuk ${results.length} karyawan.`,
            data: results 
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

// Fungsi LIHAT SLIP SAYA
exports.getMyPayrolls = async (req, res) => {
    try {
        const payrolls = await prisma.payroll.findMany({
            where: { employee_id: req.user.id },
            orderBy: [
                { year: 'desc' },
                { month: 'desc' }
            ]
        });
        res.json(payrolls);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

// FUNGSI BARU: DOWNLOAD PDF
exports.downloadPayslip = async (req, res) => {
    const { id } = req.params; // ID Slip Gaji

    try {
        // 1. Ambil Data Slip Gaji + Info Karyawan
        const payroll = await prisma.payroll.findUnique({
            where: { id: parseInt(id) },
            include: { employee: true }
        });

        // 2. Validasi Keamanan (Cuma boleh download punya sendiri, kecuali Admin)
        if (!payroll) return res.status(404).json({ error: "Slip gaji tidak ditemukan" });
        
        if (req.user.role !== 'ADMIN' && payroll.employee_id !== req.user.id) {
            return res.status(403).json({ error: "Anda tidak berhak mengakses dokumen ini." });
        }

        // 3. Setup Response Header (Biar browser tahu ini file PDF)
        const filename = `Payslip-${payroll.employee.name}-${payroll.month}-${payroll.year}.pdf`;
        res.setHeader('Content-disposition', `attachment; filename="${filename}"`);
        res.setHeader('Content-type', 'application/pdf');

        // 4. KANVAS PDF (Mulai Menggambar!)
        const doc = new PDFDocument();
        doc.pipe(res); // Kirim hasil gambar langsung ke response

        // --- DESAIN SLIP GAJI ---
        
        // Header Perusahaan
        doc.fontSize(20).text('PT MAJU MUNDUR SEJAHTERA', { align: 'center' });
        doc.fontSize(10).text('Jalan Coding No. 1, Jakarta Selatan', { align: 'center' });
        doc.moveDown();
        doc.lineWidth(2).moveTo(50, 100).lineTo(550, 100).stroke(); // Garis pembatas
        
        doc.moveDown();
        doc.fontSize(16).text('SLIP GAJI (PAYSLIP)', { align: 'center', underline: true });
        doc.moveDown();

        // Info Karyawan
        doc.fontSize(12);
        doc.text(`Nama       : ${payroll.employee.name}`);
        doc.text(`Jabatan    : ${payroll.employee.role}`);
        doc.text(`Periode    : ${payroll.month} / ${payroll.year}`);
        doc.text(`ID Pegawai : #${payroll.employee_id}`);
        
        doc.moveDown();
        doc.text('------------------------------------------------------------');
        doc.moveDown();

        // Rincian Penghasilan
        doc.text('PENGHASILAN (EARNINGS)', { underline: true });
        doc.moveDown(0.5);
        
        // Format Rupiah Helper
        const formatRp = (num) => 'Rp ' + num.toLocaleString('id-ID');

        // Posisi X=50 (Label), X=300 (Nilai)
        doc.text('Gaji Pokok', 50);
        doc.text(formatRp(payroll.basic_salary), 300, doc.y - 12, { align: 'right' });
        
        doc.text('Tunjangan Kehadiran', 50);
        doc.text(formatRp(payroll.allowance_total), 300, doc.y - 12, { align: 'right' });
        
        doc.moveDown();

        // Rincian Potongan
        doc.text('POTONGAN (DEDUCTIONS)', { underline: true });
        doc.moveDown(0.5);
        
        doc.text('Pajak PPh 21', 50);
        doc.text(`(${formatRp(payroll.tax_amount)})`, 300, doc.y - 12, { align: 'right', color: 'red' });

        doc.moveDown();
        doc.lineWidth(1).moveTo(50, doc.y).lineTo(400, doc.y).stroke();
        doc.moveDown();

        // Total Gaji Bersih
        doc.fontSize(14).font('Helvetica-Bold');
        doc.text('TAKE HOME PAY', 50);
        doc.fillColor('green').text(formatRp(payroll.net_salary), 300, doc.y - 14, { align: 'right' });

        // Footer
        doc.fillColor('black').fontSize(10).font('Helvetica');
        doc.moveDown(4);
        doc.text('Generated by HRIS System', { align: 'center', color: 'grey' });
        doc.text(new Date().toLocaleString(), { align: 'center', color: 'grey' });
        doc.text('CONFIDENTIAL / RAHASIA', { align: 'center', color: 'red' });

        // Selesai Menggambar
        doc.end();

    } catch (err) {
        console.error(err);
        res.status(500).end(); // Jangan kirim JSON kalau error saat stream
    }
};