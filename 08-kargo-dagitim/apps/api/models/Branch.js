const mongoose = require('mongoose');
const { jsonAyarlari } = require('./ortak');

// Şubeler. districts alanı virgülle ayrılmış hizmet ilçelerini tutar;
// gönderi kaydedilirken alıcının ilçesi bu listede aranır.
const subeSemasi = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },   // IST-KAD
    name: { type: String, required: true },
    city: { type: String, default: 'İstanbul' },
    districts: { type: String, required: true },
    address: String,
    phone: String,
    is_active: { type: Boolean, default: true },
  },
  { toJSON: jsonAyarlari }
);

module.exports = mongoose.model('Branch', subeSemasi);
