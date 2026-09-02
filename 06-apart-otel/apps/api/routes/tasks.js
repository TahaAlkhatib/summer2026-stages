const express = require('express');
const Task = require('../models/Task');
const Room = require('../models/Room');
const User = require('../models/User');
const { girisGerekli } = require('../auth');

const router = express.Router();
router.use(girisGerekli);

function bicimle(g) {
  return {
    id: g._id,
    roomId: g.room ? g.room._id : null,
    roomNumber: g.room ? g.room.number : '',
    roomType: g.room ? g.room.type : '',
    propertyName: g.room && g.room.property ? g.room.property.name : '',
    floor: g.room ? g.room.floor : 0,
    type: g.type,
    status: g.status,
    priority: g.priority,
    description: g.description,
    source: g.source,
    assignedTo: g.assignedTo ? g.assignedTo._id : null,
    assignedName: g.assignedTo ? g.assignedTo.fullName : null,
    createdAt: g.createdAt,
    startedAt: g.startedAt,
    completedAt: g.completedAt,
    completionNote: g.completionNote,
  };
}

// Gorev listesi.
// Temizlik/teknik personeli mobil uygulamada "mine=1" ile kendi gorevlerini ceker.
router.get('/', async (req, res) => {
  const filtre = {};

  if (req.query.status) filtre.status = req.query.status;
  if (req.query.type) filtre.type = req.query.type;

  if (req.query.mine === '1') {
    // Personel kendi gorevlerini ve henuz kimseye atanmamis gorevleri gorur
    filtre.$or = [{ assignedTo: req.kullanici.id }, { assignedTo: null }];

    // Temizlikci bakim isini, teknisyen temizlik isini gormesin
    if (!req.query.type) {
      if (req.kullanici.role === 'temizlik') filtre.type = 'temizlik';
      if (req.kullanici.role === 'teknik') filtre.type = 'bakim';
    }
  } else if (req.query.assignedTo) {
    filtre.assignedTo = req.query.assignedTo;
  }

  const liste = await Task.find(filtre)
    .populate({ path: 'room', populate: { path: 'property' } })
    .populate('assignedTo')
    .sort({ status: 1, createdAt: -1 })
    .limit(200);

  res.json(liste.map(bicimle));
});

// Elle gorev acma (resepsiyon / yonetici)
router.post('/', async (req, res) => {
  if (!req.body.roomId || !req.body.type) {
    return res.status(400).json({ message: 'Oda ve görev türü zorunludur.' });
  }
  if (!['temizlik', 'bakim'].includes(req.body.type)) {
    return res.status(400).json({ message: 'Görev türü temizlik veya bakım olmalıdır.' });
  }

  const oda = await Room.findById(req.body.roomId);
  if (!oda) return res.status(400).json({ message: 'Oda bulunamadı.' });

  const gorev = await Task.create({
    room: oda._id,
    type: req.body.type,
    status: 'bekliyor',
    priority: req.body.priority || 'normal',
    description: req.body.description || '',
    source: 'manuel',
    assignedTo: req.body.assignedTo || null,
  });

  // Bakim gorevi acildiginda oda satisa kapanir
  if (req.body.type === 'bakim' && oda.status !== 'dolu') {
    oda.status = 'bakim';
    await oda.save();
  }

  res.status(201).json({ id: gorev._id });
});

// Gorevi personele atama
router.put('/:id/assign', async (req, res) => {
  const gorev = await Task.findById(req.params.id);
  if (!gorev) return res.status(404).json({ message: 'Görev bulunamadı.' });

  const personel = await User.findById(req.body.userId);
  if (!personel) return res.status(400).json({ message: 'Personel bulunamadı.' });

  gorev.assignedTo = personel._id;
  await gorev.save();

  res.json({ id: gorev._id, assignedName: personel.fullName });
});

// Personel goreve basliyor
router.put('/:id/start', async (req, res) => {
  const gorev = await Task.findById(req.params.id);
  if (!gorev) return res.status(404).json({ message: 'Görev bulunamadı.' });

  if (gorev.status !== 'bekliyor') {
    return res.status(400).json({ message: 'Bu görev zaten başlatılmış.' });
  }

  gorev.status = 'basladi';
  gorev.startedAt = new Date();
  // Isi ilk alan personelin uzerine gecer
  if (!gorev.assignedTo) gorev.assignedTo = req.kullanici.id;
  await gorev.save();

  res.json({ id: gorev._id, status: gorev.status });
});

// Gorev tamamlandi — oda tekrar satisa acilir
router.put('/:id/complete', async (req, res) => {
  const gorev = await Task.findById(req.params.id).populate('room');
  if (!gorev) return res.status(404).json({ message: 'Görev bulunamadı.' });

  if (gorev.status === 'tamamlandi') {
    return res.status(400).json({ message: 'Bu görev zaten tamamlanmış.' });
  }

  gorev.status = 'tamamlandi';
  gorev.completedAt = new Date();
  gorev.completionNote = req.body.note || '';
  if (!gorev.assignedTo) gorev.assignedTo = req.kullanici.id;
  await gorev.save();

  // Odada baska bekleyen is yoksa oda musaite doner
  const kalan = await Task.countDocuments({
    room: gorev.room._id,
    status: { $in: ['bekliyor', 'basladi'] },
  });

  let odaDurumu = gorev.room.status;
  if (kalan === 0 && gorev.room.status !== 'dolu') {
    odaDurumu = 'musait';
    await Room.findByIdAndUpdate(gorev.room._id, { status: 'musait' });
  }

  res.json({
    id: gorev._id,
    status: gorev.status,
    roomStatus: odaDurumu,
    message: kalan === 0
      ? `${gorev.room.number} nolu oda satışa açıldı.`
      : `${gorev.room.number} nolu odada ${kalan} iş daha var.`,
  });
});

module.exports = router;
