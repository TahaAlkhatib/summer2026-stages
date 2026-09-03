const mongoose = require("mongoose");
const { jsonAyarlari } = require("./ortak");

// Hizmet listesi ve fiyatlar (yıkama, kuru temizleme, ütü, leke çıkarma)
const hizmetSemasi = new mongoose.Schema(
  {
    name: { type: String, required: true },
    category: {
      type: String,
      required: true,
      enum: ["yikama", "kuru_temizleme", "utu", "leke"],
    },
    unit: { type: String, required: true, enum: ["adet", "kg", "m2"] },
    price: { type: Number, required: true },
    is_active: { type: Boolean, default: true },
  },
  { toJSON: jsonAyarlari }
);

module.exports = mongoose.model("Service", hizmetSemasi);
