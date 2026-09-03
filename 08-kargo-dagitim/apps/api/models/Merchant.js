const mongoose = require('mongoose');
const { jsonAyarlari } = require('./ortak');

// Tacirler (gönderici firmalar)
const tacirSemasi = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },   // TCR-001
    company_name: { type: String, required: true },
    contact_name: String,
    phone: String,
    email: String,
    address: String,
    district: String,
    // Anlaşmalı taşıma ücreti ve kapıda ödeme komisyon oranı
    base_price: { type: Number, default: 90 },
    price_per_desi: { type: Number, default: 12 },
    cod_commission: { type: Number, default: 2 },
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
  },
  { toJSON: jsonAyarlari }
);

module.exports = mongoose.model('Merchant', tacirSemasi);
