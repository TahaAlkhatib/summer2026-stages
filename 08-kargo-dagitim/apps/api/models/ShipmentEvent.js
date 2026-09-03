const mongoose = require('mongoose');
const { jsonAyarlari } = require('./ortak');

// Gönderi hareket geçmişi
const hareketSemasi = new mongoose.Schema(
  {
    shipment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true },
    status: { type: String, required: true },
    description: String,
    branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
  },
  { toJSON: jsonAyarlari }
);

hareketSemasi.index({ shipment_id: 1 });

module.exports = mongoose.model('ShipmentEvent', hareketSemasi);
