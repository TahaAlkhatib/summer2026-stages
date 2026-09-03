const mongoose = require("mongoose");
const { jsonAyarlari } = require("./ortak");

// Kurye alma / teslim görevleri
const gorevSemasi = new mongoose.Schema(
  {
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    courier_id: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    task_type: { type: String, required: true, enum: ["alma", "teslim"] },
    status: {
      type: String,
      default: "bekliyor",
      enum: ["bekliyor", "yolda", "tamamlandi", "basarisiz"],
    },
    address: String,
    scheduled_at: Date,
    completed_at: Date,
    note: String,
  },
  { toJSON: jsonAyarlari }
);

gorevSemasi.index({ courier_id: 1, status: 1 });

module.exports = mongoose.model("CourierTask", gorevSemasi);
