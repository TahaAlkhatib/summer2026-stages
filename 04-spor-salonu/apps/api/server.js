const express = require("express");
const cors = require("cors");
require("dotenv").config();

const auth = require("./auth");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ durum: "calisiyor" });
});

app.use("/api/auth", auth.router);
app.use("/api/members", require("./routes/members"));
app.use("/api/packages", require("./routes/packages"));
app.use("/api/checkins", require("./routes/checkins"));
app.use("/api/classes", require("./routes/classes"));
app.use("/api/pos", require("./routes/pos"));
app.use("/api/reports", require("./routes/reports"));
app.use("/api/member-portal", require("./routes/member-portal"));

const port = process.env.PORT || 3104;
app.listen(port, () => {
  console.log("Spor Salonu API çalışıyor: http://localhost:" + port);
});
