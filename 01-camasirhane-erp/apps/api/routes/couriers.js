const express = require("express");
const pool = require("../db");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

const GOREV_ETIKETLERI = { alma: "Alma", teslim: "Teslim" };

// Kurye görev listesi
router.get("/tasks", async (req, res) => {
  try {
    let sql = `SELECT t.*, o.order_no, o.total_amount, o.paid_amount,
                      c.full_name AS customer_name, c.phone AS customer_phone
               FROM courier_tasks t
               JOIN orders o ON o.id = t.order_id
               JOIN customers c ON c.id = o.customer_id
               WHERE 1 = 1`;
    const params = [];

    // Kurye sadece kendi görevlerini görür
    if (req.user.role === "kurye") {
      params.push(req.user.id);
      sql += " AND t.courier_id = $" + params.length;
    }
    if (req.query.status) {
      params.push(req.query.status);
      sql += " AND t.status = $" + params.length;
    }
    sql += " ORDER BY t.scheduled_at";

    const result = await pool.query(sql, params);
    res.json(result.rows.map((g) => ({ ...g, task_type_label: GOREV_ETIKETLERI[g.task_type] })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Görevler getirilemedi." });
  }
});

// Görev durumunu güncelle
router.put("/tasks/:id/status", async (req, res) => {
  const { status, note } = req.body;
  if (!["bekliyor", "yolda", "tamamlandi", "basarisiz"].includes(status)) {
    return res.status(400).json({ message: "Geçersiz görev durumu." });
  }

  try {
    const gorev = await pool.query("SELECT * FROM courier_tasks WHERE id = $1", [req.params.id]);
    if (gorev.rows.length === 0) {
      return res.status(404).json({ message: "Görev bulunamadı." });
    }
    if (req.user.role === "kurye" && gorev.rows[0].courier_id !== req.user.id) {
      return res.status(403).json({ message: "Bu görev size ait değil." });
    }

    const tamamlanmaTarihi = status === "tamamlandi" ? new Date() : null;
    const guncel = await pool.query(
      `UPDATE courier_tasks
       SET status = $1, note = $2, completed_at = COALESCE($3, completed_at)
       WHERE id = $4 RETURNING *`,
      [status, note || gorev.rows[0].note, tamamlanmaTarihi, req.params.id]
    );

    // Teslim görevi tamamlandıysa siparişi de teslim edildi yap
    if (status === "tamamlandi" && gorev.rows[0].task_type === "teslim") {
      await pool.query(
        "UPDATE orders SET status = 'teslim_edildi', delivered_at = NOW() WHERE id = $1",
        [gorev.rows[0].order_id]
      );
      await pool.query(
        "INSERT INTO order_status_history (order_id, status, changed_by, note) VALUES ($1, 'teslim_edildi', $2, 'Kurye teslim etti')",
        [gorev.rows[0].order_id, req.user.id]
      );
    }

    res.json(guncel.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Görev güncellenemedi." });
  }
});

module.exports = router;
