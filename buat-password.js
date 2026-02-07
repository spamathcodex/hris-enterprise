const bcrypt = require('bcryptjs');

const passwordAsli = "rahasia";
const salt = bcrypt.genSaltSync(10);
const hashBaru = bcrypt.hashSync(passwordAsli, salt);

console.log("=== COPY KODE DI BAWAH INI KE PGADMIN ===");
console.log(`UPDATE employees SET password_hash = '${hashBaru}' WHERE id = 1;`);
console.log("=========================================");