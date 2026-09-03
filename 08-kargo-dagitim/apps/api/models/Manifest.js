const mongoose = require('mongoose');
const { jsonAyarlari } = require('./ortak');

// Sevk irsaliyeleri (şubeler arası veya kuryeye çıkış)
// type: sube_sevk | kurye_dagitim
//
// NOT: İlişkisel tasarımda bir "manifest_items" ara tablosu gerekiyordu.
// MongoDB'de irsaliyeye ait gönderi kimliklerini doğrudan bir dizide
// tutmak daha doğal; ayrı bir koleksiyona gerek kalmıyor.
const irsaliyeSemasi = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true },   // IRS-2026-00001
    type: { type: String, required: true, enum: ['sube_sevk', 'kurye_dagitim'] },
    origin_branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    dest_branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    courier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    items: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' }],
    item_count: { type: Number, default: 0 },
    notes: String,
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
  },
  { toJSON: jsonAyarlari }
);

module.exports = mongoose.model('Manifest', irsaliyeSemasi);
