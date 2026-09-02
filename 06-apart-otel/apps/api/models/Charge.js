const mongoose = require('mongoose');

// Rezervasyona islenen masraflar (konaklama + ekstralar)
const chargeSchema = new mongoose.Schema({
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
  // konaklama | kahvalti | minibar | otopark | camasir | hasar | diger
  type: { type: String, required: true },
  description: String,
  quantity: { type: Number, default: 1 },
  unitPrice: { type: Number, required: true },
  total: { type: Number, required: true },
  date: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Charge', chargeSchema);
