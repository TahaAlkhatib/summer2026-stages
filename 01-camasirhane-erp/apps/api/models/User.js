const mongoose = require("mongoose");
const { jsonAyarlari } = require("./ortak");

// Personel: admin, kasiyer, kurye
const kullaniciSemasi = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    password_hash: { type: String, required: true },
    role: { type: String, required: true, enum: ["admin", "kasiyer", "kurye"] },
    phone: String,
    is_active: { type: Boolean, default: true },
    created_at: { type: Date, default: Date.now },
  },
  { toJSON: jsonAyarlari }
);

module.exports = mongoose.model("User", kullaniciSemasi);
