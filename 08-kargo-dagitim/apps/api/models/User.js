const mongoose = require('mongoose');
const { jsonAyarlari } = require('./ortak');

// Personel ve tacir kullanıcıları
// role: admin | operasyon | kurye | tacir
const kullaniciSemasi = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, required: true, enum: ['admin', 'operasyon', 'kurye', 'tacir'] },
    phone: String,
    branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    // Sadece tacir kullanıcılarında dolu
    merchant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant' },
    plate: String,           // kurye aracı
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
  },
  { toJSON: jsonAyarlari }
);

module.exports = mongoose.model('User', kullaniciSemasi);
