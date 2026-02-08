# 🏢 HRIS Enterprise - Sistem Informasi SDM Terintegrasi

![NodeJS](https://img.shields.io/badge/Node.js-18.x-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14.x-blue) ![Prisma](https://img.shields.io/badge/ORM-Prisma-white) ![License](https://img.shields.io/badge/License-MIT-yellow)

Aplikasi **Human Resource Information System (HRIS)** lengkap yang dibangun dengan arsitektur **MVC** (Model-View-Controller) menggunakan Node.js dan PostgreSQL. Sistem ini dirancang untuk menangani siklus hidup karyawan mulai dari absensi harian, pengajuan cuti berjenjang, hingga penggajian otomatis dengan perhitungan pajak PPh 21.

## 🌟 Fitur Unggulan

### 1. 🔐 Authentication & Authorization
* **Secure Login:** Menggunakan JWT (JSON Web Token) dan Bcrypt untuk hashing password.
* **Role-Based Access Control (RBAC):** Pemisahan akses antara **Admin (HRD)** dan **Employee (Karyawan)**.
* **Middleware Proteksi:** Menjaga endpoint sensitif dari akses tanpa izin.

### 2. 📅 Manajemen Absensi (Attendance)
* **Real-time Clock In/Out:** Mencatat waktu kehadiran secara presisi.
* **Riwayat Absensi:** Karyawan dapat melihat log kehadiran mereka sendiri.
* **Laporan Harian:** Admin dapat memantau siapa yang hadir, terlambat, atau tidak masuk secara real-time.

### 3. 🏖️ Manajemen Cuti & Approval (Workflow)
* **Self-Referential Hierarchy:** Struktur atasan-bawahan (Manager membawahi Staff).
* **Pengajuan Cuti:** Form pengajuan dengan validasi kuota cuti.
* **Approval System:** Manager hanya bisa menyetujui/menolak cuti bawahannya sendiri.
* **Status Tracking:** Karyawan bisa memantau status pengajuan (Pending/Approved/Rejected).

### 4. 💰 Payroll & Pajak (Financial Module)
* **Automated Calculation:** Menghitung Gaji Pokok + Tunjangan Kehadiran secara otomatis.
* **Pajak PPh 21:** Algoritma perhitungan pajak progresif (Metode Pasal 17) berdasarkan gaji setahun.
* **Payslip Generation:** Admin dapat men-generate gaji massal dalam satu klik.
* **PDF Download:** Karyawan dapat mengunduh Slip Gaji resmi dalam format PDF.

## 🛠️ Teknologi yang Digunakan

* **Backend:** Node.js, Express.js
* **Database:** PostgreSQL
* **ORM:** Prisma (Schema Management, Migrations, Type-safety)
* **Frontend:** HTML5, CSS3 (Grid/Flexbox), Vanilla JavaScript (Fetch API)
* **Libraries:**
    * `jsonwebtoken` & `bcryptjs` (Keamanan)
    * `pdfkit` (Generator Dokumen)
    * `cors` & `dotenv` (Konfigurasi)

## 🚀 Cara Instalasi & Menjalankan

Ikuti langkah ini untuk menjalankan proyek di komputer lokal Anda:

### 1. Clone Repository
```bash
git clone [https://github.com/username-anda/proyek-hris.git](https://github.com/username-anda/proyek-hris.git)
cd proyek-hris

2. Install Dependencies
Bash
npm install
3. Konfigurasi Environment
Buat file .env di root folder dan isi dengan konfigurasi database Anda:

Cuplikan kode
DATABASE_URL="postgresql://user:password@localhost:5432/hris_db?schema=public"
JWT_SECRET="rahasia_negara_api_key_hris_2026"
PORT=3000
4. Setup Database (Prisma)
Sinkronisasi skema Prisma ke PostgreSQL lokal Anda:

Bash
npx prisma db push
5. Seeding Data (Penting!)
Untuk mencoba fitur gaji dan hirarki, jalankan script seed yang tersedia:

Bash
# Set hierarki Manager & Bawahan
node test-hierarchy.js

# Set Gaji Pokok Karyawan
node seed-salary.js
6. Jalankan Server
Bash
# Mode Development (Auto-reload)
npm run dev

# Atau Mode Biasa
node server.js
Akses aplikasi di browser: http://localhost:3000

📂 Struktur Proyek
proyek-hris/
├── controllers/      # Logika Bisnis (Auth, Attendance, Leave, Payroll)
├── middleware/       # Autentikasi & Proteksi Rute
├── prisma/           # Skema Database & Migrasi
├── public/           # (Opsional) Aset Statis
├── routes/           # Definisi API Endpoints
├── utils/            # Helper (Kalkulator Pajak)
├── .env              # Environment Variables
├── admin.html        # Dashboard Admin (HRD)
├── index.html        # Dashboard Karyawan
├── manager.html      # Dashboard Approval Cuti
└── server.js         # Entry Point Aplikasi

🤝 Kontribusi
Pull requests dipersilakan. Untuk perubahan besar, harap buka issue terlebih dahulu untuk mendiskusikan apa yang ingin Anda ubah.

📝 Lisensi
MIT
