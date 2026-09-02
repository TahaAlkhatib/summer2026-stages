const express = require('express');
const Guest = require('../models/Guest');
const Reservation = require('../models/Reservation');
const { girisGerekli } = require('../auth');

const router = express.Router();
router.use(girisGerekli);

router.get('/', async (req, res) => {
  const filtre = {};
  if (req.query.q) {
    // Turkce karakterler icin buyuk/kucuk harf duyarsiz arama
    const desen = new RegExp(req.query.q, 'i');
    filtre.$or = [{ fullName: desen }, { phone: desen }, { idNumber: desen }];
  }

  const liste = await Guest.find(filtre).sort({ fullName: 1 }).limit(100);

  // Her misafirin kac kez konakladigini da gonderelim
  const sonuc = [];
  for (const m of liste) {
    const adet = await Reservation.countDocuments({ guest: m._id, status: { $ne: 'iptal' } });
    sonuc.push({
      id: m._id,
      fullName: m.fullName,
      idNumber: m.idNumber,
      phone: m.phone,
      email: m.email,
      country: m.country,
      stayCount: adet,
    });
  }

  res.json(sonuc);
});

router.post('/', async (req, res) => {
  if (!req.body.fullName) {
    return res.status(400).json({ message: 'Misafir adı zorunludur.' });
  }

  const misafir = await Guest.create({
    fullName: req.body.fullName,
    idNumber: req.body.idNumber,
    phone: req.body.phone,
    email: req.body.email,
    country: req.body.country || 'Türkiye',
    notes: req.body.notes,
  });

  res.status(201).json(misafir);
});

module.exports = router;
