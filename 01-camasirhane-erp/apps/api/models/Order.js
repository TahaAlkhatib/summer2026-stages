const mongoose = require("mongoose");
const { jsonAyarlari } = require("./ortak");

const siparisSemasi = new mongoose.Schema(
  {
    order_no: { type: String, required: true, unique: true },
    customer_id: { type: mongoose.Schema.Types.ObjectId, ref: "Customer", required: true },
    status: {
      type: String,
      default: "alindi",
      enum: ["alindi", "yikamada", "utude", "hazir", "teslim_edildi", "iptal"],
    },
    delivery_type: { type: String, default: "magaza", enum: ["magaza", "kurye"] },
    total_amount: { type: Number, default: 0 },
    paid_amount: { type: Number, default: 0 },
    promised_date: Date,
    courier_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    created_by: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    notes: String,
    created_at: { type: Date, default: Date.now },
    delivered_at: Date,
  },
  { toJSON: jsonAyarlari }
);

siparisSemasi.index({ status: 1 });
siparisSemasi.index({ customer_id: 1 });
siparisSemasi.index({ created_at: -1 });

// Sıradaki sipariş numarasını üretir: SP-2026-00001
siparisSemasi.statics.yeniNumara = async function () {
  const yil = new Date().getFullYear();
  const adet = await this.countDocuments({ order_no: new RegExp("^SP-" + yil + "-") });
  return "SP-" + yil + "-" + String(adet + 1).padStart(5, "0");
};

module.exports = mongoose.model("Order", siparisSemasi);
