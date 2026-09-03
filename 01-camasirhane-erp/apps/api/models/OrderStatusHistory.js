const mongoose = require("mongoose");
const { jsonAyarlari } = require("./ortak");

const gecmisSemasi = new mongoose.Schema(
  {
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    status: { type: String, required: true },
    changed_by: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    changed_at: { type: Date, default: Date.now },
    note: String,
  },
  { toJSON: jsonAyarlari }
);

gecmisSemasi.index({ order_id: 1 });

module.exports = mongoose.model("OrderStatusHistory", gecmisSemasi);
