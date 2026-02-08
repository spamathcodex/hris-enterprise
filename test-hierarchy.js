// Contoh script untuk menghubungkan Siti (ID 2) ke Budi (ID 1)
// Budi (Manager) -> Siti (Subordinate)
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function setManager() {
    await prisma.employee.update({
        where: { id: 2 }, // ID Siti
        data: { manager_id: 1 } // Jadikan Budi (ID 1) sebagai managernya
    });
    console.log("Hierarchy Updated!");
}
setManager();