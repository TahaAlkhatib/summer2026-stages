const mongoose = require("mongoose");
const { jsonAyarlari } = require("./ortak");

const odemeSemasi = new mongoose.Schema(
  {
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    amount: { type: Number, required: true },
    method: { type: String, required: true, enum: ["nakit", "kart", "havale"] },
    received_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    created_at: { type: Date, default: Date.now },
  },
  { toJSON: jsonAyarlari }
);

odemeSemasi.index({ order_id: 1 });

module.exports = mongoose.model("Payment", odemeSemasi);
