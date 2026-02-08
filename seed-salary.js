const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    // Update Gaji Budi (ID 1) - Boss
    await prisma.employee.update({
        where: { id: 1 },
        data: { 
            base_salary: 10000000, // 10 Juta
            daily_allowance: 100000 // Uang makan 100rb/hari
        }
    });

    // Update Gaji Siti (ID 2) - Staf
    // Pastikan ID-nya benar (cek di pgAdmin kalau ragu)
    await prisma.employee.update({
        where: { id: 2 },
        data: { 
            base_salary: 5000000, // 5 Juta
            daily_allowance: 50000 // Uang makan 50rb/hari
        }
    });

    console.log("✅ Sukses! Gaji Budi & Siti sudah di-set.");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());