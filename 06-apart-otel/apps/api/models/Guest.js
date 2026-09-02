const mongoose = require('mongoose');

const guestSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  idNumber: String,          // TC kimlik no
  phone: String,
  email: String,
  country: { type: String, default: 'Türkiye' },
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Guest', guestSchema);
