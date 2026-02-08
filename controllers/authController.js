const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Joi = require('joi'); // Satpam Validasi Input

// --- SKEMA VALIDASI (SATPOL PP DATA) ---
// Kita tentukan aturan main input di sini. Kalau melanggar, tolak di depan pintu.

const registerSchema = Joi.object({
    name: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('EMPLOYEE', 'ADMIN').optional() // Bisa pilih role (opsional)
});

const loginSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
});

// --- FUNGSI 1: REGISTER (DAFTAR BARU) ---
exports.register = async (req, res) => {
    // 1. Cek Validasi Input
    const { error } = registerSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { name, email, password, role } = req.body;

    try {
        // 2. Cek apakah email sudah dipakai?
        const existingUser = await prisma.employee.findUnique({
            where: { email: email }
        });

        if (existingUser) {
            return res.status(400).json({ error: 'Email sudah terdaftar!' });
        }

        // 3. Enkripsi Password (Hashing)
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Simpan ke Database via Prisma
        const newUser = await prisma.employee.create({
            data: {
                name: name,
                email: email,
                password_hash: hashedPassword,
                role: role || 'EMPLOYEE' // Default jadi Employee kalau tidak diisi
            }
        });

        res.status(201).json({ message: 'Registrasi Berhasil', data: { name: newUser.name, email: newUser.email } });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Gagal mendaftarkan user.' });
    }
};

// --- FUNGSI 2: LOGIN (MASUK) ---
exports.login = async (req, res) => {
    // 1. Validasi Input
    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ error: error.details[0].message });

    const { email, password } = req.body;

    try {
        // 2. Cari User pakai Prisma (Lebih bersih daripada "SELECT * FROM...")
        const employee = await prisma.employee.findUnique({
            where: { email: email }
        });

        // 3. Cek User Ada atau Tidak
        if (!employee) return res.status(400).json({ error: 'Email atau Password salah' });

        // 4. Cek Password
        const validPass = await bcrypt.compare(password, employee.password_hash);
        if (!validPass) return res.status(400).json({ error: 'Email atau Password salah' });

        // 5. Buat Token JWT
        const token = jwt.sign(
            { 
                id: employee.id, 
                role: employee.role,
                name: employee.name 
            },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ message: 'Login Sukses', token, role: employee.role, name: employee.name });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Terjadi kesalahan pada server.' });
    }
};

// FUNGSI BARU: AMBIL SEMUA KARYAWAN (UNTUK ADMIN)
exports.getAllEmployees = async (req, res) => {
    try {
        const employees = await prisma.employee.findMany({
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                base_salary: true // Sekalian kita tampilkan gajinya biar Admin tau
            },
            orderBy: { name: 'asc' }
        });
        res.json(employees);
    } catch (err) {
        res.status(500).json({ error: "Gagal mengambil data karyawan" });
    }
};