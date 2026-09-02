const express = require('express');
const bcrypt = require('bcryptjs');
const { sorgu, tek } = require('../db');
const { tokenUret, girisGerekli } = require('../auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Kullanıcı adı ve şifre zorunludur.' });
  }

  const kullanici = await tek(
    `SELECT u.*, b.name AS branch_name, b.code AS branch_code, m.company_name
       FROM users u
       LEFT JOIN branches b ON b.id = u.branch_id
       LEFT JOIN merchants m ON m.id = u.merchant_id
      WHERE u.username = $1 AND u.is_active = TRUE`,
    [username]
  );

  if (!kullanici || !bcrypt.compareSync(password, kullanici.password_hash)) {
    return res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı.' });
  }

  res.json({
    token: tokenUret(kullanici),
    user: {
      id: kullanici.id,
      fullName: kullanici.full_name,
      username: kullanici.username,
      role: kullanici.role,
      phone: kullanici.phone,
      plate: kullanici.plate,
      branchId: kullanici.branch_id,
      branchName: kullanici.branch_name,
      merchantId: kullanici.merchant_id,
      merchantName: kullanici.company_name,
    },
  });
});

router.get('/me', girisGerekli, (req, res) => {
  res.json(req.kullanici);
});

// Kurye listesi — dağıtım irsaliyesi hazırlarken kullanılıyor
router.get('/couriers', girisGerekli, async (req, res) => {
  const liste = await sorgu(
    `SELECT u.id, u.full_name, u.phone, u.plate, b.name AS branch_name
       FROM users u LEFT JOIN branches b ON b.id = u.branch_id
      WHERE u.role = 'kurye' AND u.is_active = TRUE
      ORDER BY u.full_name`
  );
  res.json(liste);
});

router.get('/branches', girisGerekli, async (req, res) => {
  const liste = await sorgu(
    `SELECT * FROM branches WHERE is_active = TRUE ORDER BY name`
  );
  res.json(liste);
});

router.get('/merchants', girisGerekli, async (req, res) => {
  const liste = await sorgu(
    `SELECT * FROM merchants WHERE is_active = TRUE ORDER BY company_name`
  );
  res.json(liste);
});

module.exports = router;
