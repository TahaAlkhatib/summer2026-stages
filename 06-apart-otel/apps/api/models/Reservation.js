const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true },  // RZ-2026-00001
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  guest: { type: mongoose.Schema.Types.ObjectId, ref: 'Guest', required: true },

  // Tarihler gunun basi (00:00) olarak saklanir, saat bilgisi tutulmaz
  checkIn: { type: Date, required: true },
  checkOut: { type: Date, required: true },
  nights: { type: Number, required: true },

  adults: { type: Number, default: 1 },
  children: { type: Number, default: 0 },

  nightlyRate: { type: Number, required: true },
  // onaylandi | giris_yapildi | cikis_yapildi | iptal
  status: { type: String, default: 'onaylandi' },
  channel: { type: String, default: 'telefon' }, // telefon | walkin | internet
  notes: String,

  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  checkedInAt: Date,
  checkedOutAt: Date,
});

module.exports = mongoose.model('Reservation', reservationSchema);
