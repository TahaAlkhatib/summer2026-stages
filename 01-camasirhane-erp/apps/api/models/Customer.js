const mongoose = require("mongoose");
const { jsonAyarlari } = require("./ortak");

const musteriSemasi = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    phone: { type: String, required: true },
    address: String,
    district: String,
    city: { type: String, default: "İstanbul" },
    notes: String,
    created_at: { type: Date, default: Date.now },
  },
  { toJSON: jsonAyarlari }
);

// Telefonla arama sık yapılıyor
musteriSemasi.index({ phone: 1 });

module.exports = mongoose.model("Customer", musteriSemasi);
