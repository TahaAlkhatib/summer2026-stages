const mongoose = require('mongoose');

// Temizlik / bakim gorevi.
// Cikis yapildiginda sistem bu kaydi OTOMATIK olusturur.
const taskSchema = new mongoose.Schema({
  room: { type: mongoose.Schema.Types.ObjectId, ref: 'Room', required: true },
  reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'Reservation' },
  type: { type: String, required: true },        // temizlik | bakim
  // bekliyor | basladi | tamamlandi | iptal
  status: { type: String, default: 'bekliyor' },
  priority: { type: String, default: 'normal' }, // dusuk | normal | acil
  description: String,
  // cikis (otomatik) | manuel
  source: { type: String, default: 'manuel' },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now },
  startedAt: Date,
  completedAt: Date,
  completionNote: String,
});

module.exports = mongoose.model('Task', taskSchema);
