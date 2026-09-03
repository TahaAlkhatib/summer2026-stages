const mongoose = require("mongoose");
const { jsonAyarlari } = require("./ortak");

// Her kayıt fiziksel bir parça grubudur; barkod etiketi bu kayıt için basılır
const kalemSemasi = new mongoose.Schema(
  {
    order_id: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    service_id: { type: mongoose.Schema.Types.ObjectId, ref: "Service", required: true },
    item_name: { type: String, required: true },
    quantity: { type: Number, required: true },
    unit_price: { type: Number, required: true },
    line_total: { type: Number, required: true },
    barcode: { type: String, required: true, unique: true },
    notes: String,
  },
  { toJSON: jsonAyarlari }
);

module.exports = mongoose.model("OrderItem", kalemSemasi);
