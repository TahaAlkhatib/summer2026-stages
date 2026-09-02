const mongoose = require('mongoose');

// Oda / daire
const roomSchema = new mongoose.Schema({
  property: { type: mongoose.Schema.Types.ObjectId, ref: 'Property', required: true },
  number: { type: String, required: true },
  type: { type: String, required: true },   // Tek Kişilik, Çift Kişilik, Suit, 1+1 Daire...
  capacity: { type: Number, default: 2 },
  floor: { type: Number, default: 0 },
  nightlyRate: { type: Number, required: true },
  // musait | dolu | temizlik | bakim
  status: { type: String, default: 'musait' },
  notes: String,
});

module.exports = mongoose.model('Room', roomSchema);
