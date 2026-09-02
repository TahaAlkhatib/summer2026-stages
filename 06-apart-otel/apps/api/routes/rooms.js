const express = require('express');
const Room = require('../models/Room');
const Property = require('../models/Property');
const Task = require('../models/Task');
const { girisGerekli } = require('../auth');

const router = express.Router();
router.use(girisGerekli);

// Tesis listesi
router.get('/properties', async (req, res) => {
  const liste = await Property.find().sort({ name: 1 });
  res.json(liste);
});

// Oda listesi
router.get('/', async (req, res) => {
  const filtre = {};
  if (req.query.propertyId) filtre.property = req.query.propertyId;
  if (req.query.status) filtre.status = req.query.status;

  // Once tesise, sonra oda numarasina gore siralaniyor
  const odalar = await Room.find(filtre).populate('property').sort({ property: 1, number: 1 });
  res.json(odalar);
});

// Oda durumunu elle degistirme (resepsiyon)
router.put('/:id/status', async (req, res) => {
  const gecerli = ['musait', 'dolu', 'temizlik', 'bakim'];
  if (!gecerli.includes(req.body.status)) {
    return res.status(400).json({ message: 'Geçersiz oda durumu.' });
  }

  const oda = await Room.findById(req.params.id);
  if (!oda) return res.status(404).json({ message: 'Oda bulunamadı.' });

  oda.status = req.body.status;
  await oda.save();

  // Bakima alinan odaya otomatik gorev acalim ki teknik ekip gorsun
  if (req.body.status === 'bakim') {
    await Task.create({
      room: oda._id,
      type: 'bakim',
      status: 'bekliyor',
      priority: 'normal',
      source: 'manuel',
      description: req.body.note || 'Oda bakıma alındı.',
    });
  }

  res.json(oda);
});

module.exports = router;
