const mongoose = require('mongoose');
const { jsonAyarlari } = require('./ortak');

// Gönderiler
// status: olusturuldu | subede | dagitimda | teslim_edildi | teslim_edilemedi | iade
const gonderiSemasi = new mongoose.Schema(
  {
    barcode: { type: String, required: true, unique: true },   // KRG26000001
    merchant_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Merchant', required: true },
    origin_branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch', required: true },
    dest_branch_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Branch' },

    receiver_name: { type: String, required: true },
    receiver_phone: { type: String, required: true },
    receiver_address: { type: String, required: true },
    receiver_district: { type: String, required: true },
    receiver_city: { type: String, default: 'İstanbul' },

    desi: { type: Number, default: 1 },
    weight_kg: Number,
    content: String,
    payment_type: {
      type: String,
      default: 'gonderici_odemeli',
      enum: ['gonderici_odemeli', 'alici_odemeli'],
    },
    shipping_fee: { type: Number, default: 0 },
    cod_amount: { type: Number, default: 0 },   // kapıda tahsil edilecek

    status: { type: String, default: 'olusturuldu' },
    courier_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },

    // Teslimat doğrulaması
    otp_code: String,
    otp_sent_at: Date,
    delivered_at: Date,
    delivered_to: String,
    signature: String,          // imza görüntüsü (SVG metni)
    delivery_note: String,
    attempt_count: { type: Number, default: 0 },

    created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    created_at: { type: Date, default: Date.now },
  },
  { toJSON: jsonAyarlari }
);

gonderiSemasi.index({ status: 1 });
gonderiSemasi.index({ merchant_id: 1 });
gonderiSemasi.index({ courier_id: 1 });
gonderiSemasi.index({ dest_branch_id: 1 });

module.exports = mongoose.model('Shipment', gonderiSemasi);
