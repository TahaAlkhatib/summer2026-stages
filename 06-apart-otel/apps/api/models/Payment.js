const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation', required: true },
  amount: { type: Number, required: true },
  method: { type: String, default: 'nakit' }, // nakit | kredi_karti | havale
  date: { type: Date, default: Date.now },
  takenBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Payment', paymentSchema);
