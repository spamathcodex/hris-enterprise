// utils/taxCalculator.js

// 1. DAFTAR PTKP (Penghasilan Tidak Kena Pajak) - Update 2024
const PTKP_RATES = {
    'TK/0': 54000000, // Tidak Kawin, 0 Tanggungan
    'TK/1': 58500000,
    'K/0':  58500000, // Kawin, 0 Tanggungan
    'K/1':  63000000, // Kawin, 1 Anak
    'K/2':  67500000,
    'K/3':  72000000
};

exports.calculatePPh21 = (monthlyGrossSalary, ptkpStatus) => {
    // A. Setahunkan Gaji (Annualize)
    const annualIncome = monthlyGrossSalary * 12;

    // B. Cari Pengurang (PTKP)
    const ptkp = PTKP_RATES[ptkpStatus] || 54000000; // Default TK/0

    // C. Cari PKP (Penghasilan Kena Pajak)
    let pkp = annualIncome - ptkp;
    
    // Kalau gaji kecil (di bawah PTKP), pajaknya 0
    if (pkp <= 0) return 0;

    // D. Hitung Pajak Progresif (Tarif Lapis)
    let annualTax = 0;

    // Lapis 1: 0 - 60 Juta (5%)
    if (pkp > 0) {
        const taxable = Math.min(pkp, 60000000);
        annualTax += taxable * 0.05;
        pkp -= taxable;
    }

    // Lapis 2: 60 - 250 Juta (15%)
    if (pkp > 0) {
        const taxable = Math.min(pkp, 190000000); // 250jt - 60jt
        annualTax += taxable * 0.15;
        pkp -= taxable;
    }

    // Lapis 3: 250 - 500 Juta (25%)
    if (pkp > 0) {
        const taxable = Math.min(pkp, 250000000);
        annualTax += taxable * 0.25;
        pkp -= taxable;
    }

    // Lapis 4: > 500 Juta (30%)
    if (pkp > 0) {
        annualTax += pkp * 0.30;
    }

    // E. Kembalikan Pajak Bulanan (Dibagi 12)
    return annualTax / 12;
};