// prisma/seed.js
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
    console.log("🌱 Memulai Seeding Database...");

    // Password seragam biar gampang diingat: "123456"
    const passwordHash = await bcrypt.hash('123456', 10);

    // 1. BUAT ADMIN (HRD)
    const admin = await prisma.employee.upsert({
        where: { email: 'admin@hris.com' },
        update: {}, // Kalau sudah ada, jangan diapa-apain
        create: {
            name: 'Super Admin',
            email: 'admin@hris.com',
            password: passwordHash,
            role: 'ADMIN',
            base_salary: 20000000,
            daily_allowance: 150000
        },
    });
    console.log(`✅ Akun Admin siap: ${admin.email}`);

    // 2. BUAT MANAGER (BUDI)
    const budi = await prisma.employee.upsert({
        where: { email: 'budi@manager.com' },
        update: { 
            base_salary: 10000000, 
            daily_allowance: 100000 
        },
        create: {
            name: 'Budi Manager',
            email: 'budi@manager.com',
            password: passwordHash,
            role: 'EMPLOYEE', // Di sistem kita Manager juga Employee
            base_salary: 10000000,
            daily_allowance: 100000
        },
    });
    console.log(`✅ Akun Manager siap: ${budi.email}`);

    // 3. BUAT STAF (SITI) - Sekalian set Atasannya Budi
    const siti = await prisma.employee.upsert({
        where: { email: 'siti@staf.com' },
        update: {
            manager_id: budi.id, // Update bosnya kalau berubah
            base_salary: 5000000,
            daily_allowance: 50000
        },
        create: {
            name: 'Siti Bendahara',
            email: 'siti@staf.com',
            password: passwordHash,
            role: 'EMPLOYEE',
            manager_id: budi.id, // Link ke Budi
            base_salary: 5000000,
            daily_allowance: 50000
        },
    });
    console.log(`✅ Akun Staf siap: ${siti.email} (Bawahan Budi)`);

    console.log("🚀 Seeding Selesai! Login pakai pass: 123456");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });