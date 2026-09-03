const mongoose = require('mongoose');
const { jsonAyarlari } = require('./ortak');

// Kapıda ödeme tahsilatları
const tahsilatSemasi = new mongoose.Schema(
  {
    shipment_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true },
    amount: { type: Number, required: true },
    method: { type: String, default: 'nakit', enum: ['nakit', 'kredi_karti'] },
    courier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    // Tacire ödeme yapıldı mı?
    settled: { type: Boolean, default: false },
    settled_at: Date,
    collected_at: { type: Date, default: Date.now },
  },
  { toJSON: jsonAyarlari }
);

tahsilatSemasi.index({ shipment_id: 1 });

module.exports = mongoose.model('CodCollection', tahsilatSemasi);
