const express = require("express");
const db = require("../db");
const { verifyToken } = require("../auth");

const router = express.Router();
router.use(verifyToken);

// Büfe ürünleri
router.get("/products", async (req, res) => {
  try {
    let sql = "SELECT * FROM products";
    if (req.query.active === "1") {
      sql += " WHERE is_active = true";
    }
    sql += " ORDER BY name";
    const [satirlar] = await db.query(sql);
    res.json(satirlar);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Ürünler getirilemedi." });
  }
});

router.post("/products", async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Bu işlem için yetkiniz yok." });
  }
  const { code, name, price, stock_quantity } = req.body;
  if (!code || !name || !price) {
    return res.status(400).json({ message: "Ürün kodu, adı ve fiyatı zorunludur." });
  }
  try {
    const [sonuc] = await db.query(
      "INSERT INTO products (code, name, price, stock_quantity) VALUES (?, ?, ?, ?)",
      [code, name, price, stock_quantity || 0]
    );
    res.status(201).json({ id: sonuc.insertId, code, name });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(400).json({ message: "Bu ürün kodu zaten kayıtlı." });
    }
    console.error(err);
    res.status(500).json({ message: "Ürün kaydedilemedi." });
  }
});

// Kasa satışı — stoktan düşer
router.post("/sales", async (req, res) => {
  const { member_id, items, method } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: "Satışa en az bir ürün eklenmelidir." });
  }
  if (!["nakit", "kart"].includes(method)) {
    return res.status(400).json({ message: "Ödeme yöntemi nakit veya kart olmalıdır." });
  }

  const baglanti = await db.getConnection();
  try {
    await baglanti.beginTransaction();

    // Satış numarası
    const yil = new Date().getFullYear();
    const [sayac] = await baglanti.query(
      "SELECT COUNT(*) AS adet FROM sales WHERE sale_no LIKE ?", ["ST-" + yil + "-%"]
    );
    const satisNo = "ST-" + yil + "-" + String(sayac[0].adet + 1).padStart(5, "0");

    const [satis] = await baglanti.query(
      "INSERT INTO sales (sale_no, member_id, total_amount, method, sold_by) VALUES (?, ?, 0, ?, ?)",
      [satisNo, member_id || null, method, req.user.id]
    );
    const satisId = satis.insertId;

    let toplam = 0;
    for (const kalem of items) {
      const [urunler] = await baglanti.query("SELECT * FROM products WHERE id = ?", [kalem.product_id]);
      if (urunler.length === 0) {
        await baglanti.rollback();
        return res.status(400).json({ message: "Seçilen ürün bulunamadı." });
      }
      const urun = urunler[0];
      const adet = Number(kalem.quantity);

      if (!adet || adet <= 0) {
        await baglanti.rollback();
        return res.status(400).json({ message: "Miktar sıfırdan büyük olmalıdır." });
      }
      if (urun.stock_quantity < adet) {
        await baglanti.rollback();
        return res.status(400).json({
          message: urun.name + " için stok yetersiz. Kalan: " + urun.stock_quantity,
        });
      }

      const satirToplam = Number(urun.price) * adet;
      toplam += satirToplam;

      await baglanti.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, line_total)
         VALUES (?, ?, ?, ?, ?)`,
        [satisId, urun.id, adet, urun.price, satirToplam]
      );
      await baglanti.query(
        "UPDATE products SET stock_quantity = stock_quantity - ? WHERE id = ?",
        [adet, urun.id]
      );
    }

    await baglanti.query("UPDATE sales SET total_amount = ? WHERE id = ?", [toplam, satisId]);
    await baglanti.commit();

    res.status(201).json({ id: satisId, sale_no: satisNo, total_amount: toplam });
  } catch (err) {
    await baglanti.rollback();
    console.error(err);
    res.status(500).json({ message: "Satış kaydedilemedi." });
  } finally {
    baglanti.release();
  }
});

router.get("/sales", async (req, res) => {
  const tarih = req.query.date;
  try {
    let sql = `SELECT s.*, u.full_name AS member_name, p.full_name AS sold_by_name
               FROM sales s
               LEFT JOIN members u ON u.id = s.member_id
               LEFT JOIN users p ON p.id = s.sold_by
               WHERE 1 = 1`;
    const params = [];
    if (tarih) {
      sql += " AND DATE(s.created_at) = ?";
      params.push(tarih);
    }
    sql += " ORDER BY s.created_at DESC LIMIT 100";

    const [satirlar] = await db.query(sql, params);
    res.json(satirlar);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Satışlar getirilemedi." });
  }
});

module.exports = router;
