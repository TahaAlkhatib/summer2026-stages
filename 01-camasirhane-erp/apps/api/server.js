const express = require("express");
const cors = require("cors");
require("dotenv").config();

const { baglan } = require("./db");
const auth = require("./auth");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ durum: "calisiyor" });
});

app.use("/api/auth", auth.router);
app.use("/api/customers", require("./routes/customers"));
app.use("/api/services", require("./routes/services"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/payments", require("./routes/payments"));
app.use("/api/couriers", require("./routes/couriers"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/track", require("./routes/track"));

const port = process.env.PORT || 3101;

// Önce veritabanına bağlan, sonra sunucuyu başlat
baglan()
  .then(() => {
    app.listen(port, () => {
      console.log("Çamaşırhane API çalışıyor: http://localhost:" + port);
    });
  })
  .catch((err) => {
    console.error("MongoDB bağlantısı kurulamadı:", err.message);
    process.exit(1);
  });
