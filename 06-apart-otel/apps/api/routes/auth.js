const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { tokenUret, girisGerekli } = require('../auth');

const router = express.Router();

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Kullanıcı adı ve şifre zorunludur.' });
  }

  const kullanici = await User.findOne({ username: username, isActive: true });
  if (!kullanici || !bcrypt.compareSync(password, kullanici.passwordHash)) {
    return res.status(401).json({ message: 'Kullanıcı adı veya şifre hatalı.' });
  }

  res.json({
    token: tokenUret(kullanici),
    user: {
      id: kullanici._id,
      fullName: kullanici.fullName,
      username: kullanici.username,
      role: kullanici.role,
    },
  });
});

router.get('/me', girisGerekli, (req, res) => {
  res.json(req.kullanici);
});

module.exports = router;
