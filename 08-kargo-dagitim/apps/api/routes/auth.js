const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Branch = require('../models/Branch');
const Merchant = require('../models/Merchant');
const { tokenUret, girisGerekli } = require('../auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Kullanıcı adı ve şifre zorunludur.' });
  }

  const kullanici = await User.findOne({ username: username, is_active: true })
    .populate('branch_id')
    .populate('merchant_id');

  if (!kullanici || !bcrypt.compareSync(password, kullanici.password_hash)) {
    return res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı.' });
  }

  res.json({
    token: tokenUret(kullanici),
    user: {
      id: kullanici._id.toString(),
      fullName: kullanici.full_name,
      username: kullanici.username,
      role: kullanici.role,
      phone: kullanici.phone,
      plate: kullanici.plate,
      branchId: kullanici.branch_id ? kullanici.branch_id._id.toString() : null,
      branchName: kullanici.branch_id ? kullanici.branch_id.name : null,
      merchantId: kullanici.merchant_id ? kullanici.merchant_id._id.toString() : null,
      merchantName: kullanici.merchant_id ? kullanici.merchant_id.company_name : null,
    },
  });
});

router.get('/me', girisGerekli, (req, res) => {
  res.json(req.kullanici);
});

// Kurye listesi — dağıtım irsaliyesi hazırlarken kullanılıyor
router.get('/couriers', girisGerekli, async (req, res) => {
  const kuryeler = await User.find({ role: 'kurye', is_active: true })
    .populate('branch_id')
    .sort({ full_name: 1 });

  res.json(
    kuryeler.map((k) => ({
      id: k._id.toString(),
      full_name: k.full_name,
      phone: k.phone,
      plate: k.plate,
      branch_name: k.branch_id ? k.branch_id.name : null,
    }))
  );
});

router.get('/branches', girisGerekli, async (req, res) => {
  const liste = await Branch.find({ is_active: true }).sort({ name: 1 });
  res.json(liste);
});

router.get('/merchants', girisGerekli, async (req, res) => {
  const liste = await Merchant.find({ is_active: true }).sort({ company_name: 1 });
  res.json(liste);
});

module.exports = router;
