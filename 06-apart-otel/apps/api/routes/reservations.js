const express = require('express');
const Reservation = require('../models/Reservation');
const Room = require('../models/Room');
const Guest = require('../models/Guest');
const Charge = require('../models/Charge');
const Payment = require('../models/Payment');
const Task = require('../models/Task');
const { girisGerekli } = require('../auth');
const { gunBasi, bugun, geceSayisi, gunMetni } = require('../tarih');

const router = express.Router();
router.use(girisGerekli);

// Bir oda, verilen tarih araliginda musait mi?
//
// Kural: giris gunu doludur, cikis gunu bostur (o gun baskasi girebilir).
// Bu yuzden cakisma sarti:  mevcut.giris < yeni.cikis  VE  mevcut.cikis > yeni.giris
async function cakismaVarMi(odaId, giris, cikis, haricRezervasyonId) {
  const sorgu = {
    room: odaId,
    status: { $ne: 'iptal' },
    checkIn: { $lt: cikis },
    checkOut: { $gt: giris },
  };
  if (haricRezervasyonId) {
    sorgu._id = { $ne: haricRezervasyonId };
  }
  return await Reservation.findOne(sorgu).populate('guest');
}

// Sirali rezervasyon kodu uret: RZ-2026-00001
async function kodUret() {
  const yil = new Date().getFullYear();
  const adet = await Reservation.countDocuments({ code: new RegExp('^RZ-' + yil) });
  return 'RZ-' + yil + '-' + String(adet + 1).padStart(5, '0');
}

// ---- Takvim / liste ----

// Takvim ekrani icin: verilen tarih araligina degen rezervasyonlar
router.get('/', async (req, res) => {
  const filtre = { status: { $ne: 'iptal' } };

  if (req.query.from && req.query.to) {
    filtre.checkIn = { $lt: gunBasi(req.query.to) };
    filtre.checkOut = { $gt: gunBasi(req.query.from) };
  }
  if (req.query.status) filtre.status = req.query.status;
  if (req.query.roomId) filtre.room = req.query.roomId;

  const liste = await Reservation.find(filtre)
    .populate('guest')
    .populate({ path: 'room', populate: { path: 'property' } })
    .sort({ checkIn: 1 });

  res.json(liste.map(bicimle));
});

function bicimle(r) {
  return {
    id: r._id,
    code: r.code,
    roomId: r.room ? r.room._id : null,
    roomNumber: r.room ? r.room.number : '',
    roomType: r.room ? r.room.type : '',
    propertyName: r.room && r.room.property ? r.room.property.name : '',
    guestId: r.guest ? r.guest._id : null,
    guestName: r.guest ? r.guest.fullName : '',
    guestPhone: r.guest ? r.guest.phone : '',
    checkIn: gunMetni(r.checkIn),
    checkOut: gunMetni(r.checkOut),
    nights: r.nights,
    adults: r.adults,
    children: r.children,
    nightlyRate: r.nightlyRate,
    status: r.status,
    channel: r.channel,
    notes: r.notes,
  };
}

// ---- Yeni rezervasyon ----

router.post('/', async (req, res) => {
  const { roomId, guestId, guest, checkIn, checkOut, adults, children, channel, notes } = req.body;

  if (!roomId || !checkIn || !checkOut) {
    return res.status(400).json({ message: 'Oda ve tarih bilgileri zorunludur.' });
  }

  const giris = gunBasi(checkIn);
  const cikis = gunBasi(checkOut);
  const gece = geceSayisi(giris, cikis);

  if (gece < 1) {
    return res.status(400).json({ message: 'Çıkış tarihi giriş tarihinden sonra olmalıdır.' });
  }

  const oda = await Room.findById(roomId);
  if (!oda) return res.status(400).json({ message: 'Oda bulunamadı.' });

  const cakisan = await cakismaVarMi(oda._id, giris, cikis, null);
  if (cakisan) {
    return res.status(400).json({
      message: `${oda.number} numaralı oda bu tarihlerde dolu (${cakisan.code} — ` +
        `${cakisan.guest ? cakisan.guest.fullName : 'misafir'}).`,
    });
  }

  // Misafir ya listeden secilir ya da yeni kaydedilir
  let misafirId = guestId;
  if (!misafirId) {
    if (!guest || !guest.fullName) {
      return res.status(400).json({ message: 'Misafir adı zorunludur.' });
    }
    const yeni = await Guest.create({
      fullName: guest.fullName,
      idNumber: guest.idNumber,
      phone: guest.phone,
      email: guest.email,
      country: guest.country || 'Türkiye',
    });
    misafirId = yeni._id;
  }

  const rezervasyon = await Reservation.create({
    code: await kodUret(),
    room: oda._id,
    guest: misafirId,
    checkIn: giris,
    checkOut: cikis,
    nights: gece,
    adults: adults || 1,
    children: children || 0,
    nightlyRate: oda.nightlyRate,
    status: 'onaylandi',
    channel: channel || 'telefon',
    notes: notes,
    createdBy: req.kullanici.id,
  });

  // Konaklama bedelini masraf olarak isliyoruz — hesap dokumunde gorunsun
  await Charge.create({
    reservation: rezervasyon._id,
    type: 'konaklama',
    description: `${gece} gece × ${oda.number} nolu oda`,
    quantity: gece,
    unitPrice: oda.nightlyRate,
    total: gece * oda.nightlyRate,
    date: giris,
  });

  res.status(201).json({ id: rezervasyon._id, code: rezervasyon.code });
});

// ---- Detay (hesap dokumu) ----

router.get('/:id', async (req, res) => {
  const r = await Reservation.findById(req.params.id)
    .populate('guest')
    .populate({ path: 'room', populate: { path: 'property' } });

  if (!r) return res.status(404).json({ message: 'Rezervasyon bulunamadı.' });

  const masraflar = await Charge.find({ reservation: r._id }).sort({ date: 1 });
  const odemeler = await Payment.find({ reservation: r._id }).sort({ date: 1 });

  let masrafToplam = 0;
  masraflar.forEach((m) => { masrafToplam += m.total; });

  let odemeToplam = 0;
  odemeler.forEach((o) => { odemeToplam += o.amount; });

  res.json({
    ...bicimle(r),
    guest: r.guest,
    checkedInAt: r.checkedInAt,
    checkedOutAt: r.checkedOutAt,
    charges: masraflar,
    payments: odemeler,
    totalCharges: masrafToplam,
    totalPayments: odemeToplam,
    balance: masrafToplam - odemeToplam,
  });
});

// ---- Takvimde surukle-birak (oda veya tarih degistirme) ----

router.put('/:id/move', async (req, res) => {
  const r = await Reservation.findById(req.params.id);
  if (!r) return res.status(404).json({ message: 'Rezervasyon bulunamadı.' });

  if (r.status === 'cikis_yapildi' || r.status === 'iptal') {
    return res.status(400).json({ message: 'Tamamlanmış rezervasyon taşınamaz.' });
  }

  const yeniOdaId = req.body.roomId || r.room;
  const giris = req.body.checkIn ? gunBasi(req.body.checkIn) : r.checkIn;
  const cikis = req.body.checkOut ? gunBasi(req.body.checkOut) : r.checkOut;
  const gece = geceSayisi(giris, cikis);

  if (gece < 1) {
    return res.status(400).json({ message: 'Çıkış tarihi giriş tarihinden sonra olmalıdır.' });
  }

  const oda = await Room.findById(yeniOdaId);
  if (!oda) return res.status(400).json({ message: 'Oda bulunamadı.' });

  const cakisan = await cakismaVarMi(oda._id, giris, cikis, r._id);
  if (cakisan) {
    return res.status(400).json({
      message: `${oda.number} numaralı oda bu tarihlerde dolu (${cakisan.code}).`,
    });
  }

  const eskiOdaId = r.room.toString();

  r.room = oda._id;
  r.checkIn = giris;
  r.checkOut = cikis;
  r.nights = gece;
  r.nightlyRate = oda.nightlyRate;
  await r.save();

  // Konaklama masrafini yeni tarihe/fiyata gore guncelle
  await Charge.findOneAndUpdate(
    { reservation: r._id, type: 'konaklama' },
    {
      description: `${gece} gece × ${oda.number} nolu oda`,
      quantity: gece,
      unitPrice: oda.nightlyRate,
      total: gece * oda.nightlyRate,
      date: giris,
    }
  );

  // Misafir icerideyken oda degistiyse eski odayi temizlige gonder
  if (r.status === 'giris_yapildi' && eskiOdaId !== oda._id.toString()) {
    await Room.findByIdAndUpdate(eskiOdaId, { status: 'temizlik' });
    await Task.create({
      room: eskiOdaId,
      reservation: r._id,
      type: 'temizlik',
      status: 'bekliyor',
      priority: 'normal',
      source: 'manuel',
      description: `${r.code} numaralı rezervasyon başka odaya taşındı.`,
    });
    oda.status = 'dolu';
    await oda.save();
  }

  res.json({ id: r._id, code: r.code, roomId: oda._id, nights: gece });
});

// ---- Giris ----

router.post('/:id/check-in', async (req, res) => {
  const r = await Reservation.findById(req.params.id).populate('room');
  if (!r) return res.status(404).json({ message: 'Rezervasyon bulunamadı.' });

  if (r.status !== 'onaylandi') {
    return res.status(400).json({ message: 'Bu rezervasyon için giriş yapılamaz.' });
  }
  if (r.room.status === 'temizlik' || r.room.status === 'bakim') {
    return res.status(400).json({
      message: `Oda henüz hazır değil (durum: ${r.room.status}). Önce görevi tamamlayın.`,
    });
  }

  r.status = 'giris_yapildi';
  r.checkedInAt = new Date();
  await r.save();

  await Room.findByIdAndUpdate(r.room._id, { status: 'dolu' });

  res.json({ id: r._id, status: r.status });
});

// ---- Cikis: buradan otomatik temizlik gorevi aciliyor ----

router.post('/:id/check-out', async (req, res) => {
  const r = await Reservation.findById(req.params.id).populate('room');
  if (!r) return res.status(404).json({ message: 'Rezervasyon bulunamadı.' });

  if (r.status !== 'giris_yapildi') {
    return res.status(400).json({ message: 'Bu rezervasyon için çıkış yapılamaz.' });
  }

  // Hesap kapanmadan cikis verilmesin
  const masraflar = await Charge.find({ reservation: r._id });
  const odemeler = await Payment.find({ reservation: r._id });

  let borc = 0;
  masraflar.forEach((m) => { borc += m.total; });
  odemeler.forEach((o) => { borc -= o.amount; });

  if (borc > 0.01 && req.body.force !== true) {
    return res.status(400).json({
      message: `Ödenmemiş ${borc.toFixed(2)} ₺ bakiye var. Önce tahsilat alın.`,
      balance: borc,
    });
  }

  r.status = 'cikis_yapildi';
  r.checkedOutAt = new Date();
  await r.save();

  // Oda temizlige duser ve temizlik gorevi OTOMATIK acilir
  await Room.findByIdAndUpdate(r.room._id, { status: 'temizlik' });

  const gorev = await Task.create({
    room: r.room._id,
    reservation: r._id,
    type: 'temizlik',
    status: 'bekliyor',
    priority: 'normal',
    source: 'cikis',
    description: `${r.code} çıkış yaptı — oda temizliği gerekiyor.`,
  });

  res.json({
    id: r._id,
    status: r.status,
    taskId: gorev._id,
    message: `Çıkış tamamlandı. ${r.room.number} nolu oda için temizlik görevi oluşturuldu.`,
  });
});

// ---- Iptal ----

router.put('/:id/cancel', async (req, res) => {
  const r = await Reservation.findById(req.params.id);
  if (!r) return res.status(404).json({ message: 'Rezervasyon bulunamadı.' });

  if (r.status === 'cikis_yapildi') {
    return res.status(400).json({ message: 'Çıkış yapılmış rezervasyon iptal edilemez.' });
  }

  if (r.status === 'giris_yapildi') {
    await Room.findByIdAndUpdate(r.room, { status: 'temizlik' });
  }

  r.status = 'iptal';
  await r.save();

  res.json({ id: r._id, status: r.status });
});

// ---- Masraf ve tahsilat ----

router.post('/:id/charges', async (req, res) => {
  const r = await Reservation.findById(req.params.id);
  if (!r) return res.status(404).json({ message: 'Rezervasyon bulunamadı.' });

  const adet = Number(req.body.quantity) || 1;
  const fiyat = Number(req.body.unitPrice);

  if (!req.body.type || !fiyat || fiyat <= 0) {
    return res.status(400).json({ message: 'Masraf türü ve tutarı zorunludur.' });
  }

  const masraf = await Charge.create({
    reservation: r._id,
    type: req.body.type,
    description: req.body.description || '',
    quantity: adet,
    unitPrice: fiyat,
    total: adet * fiyat,
  });

  res.status(201).json(masraf);
});

router.post('/:id/payments', async (req, res) => {
  const r = await Reservation.findById(req.params.id);
  if (!r) return res.status(404).json({ message: 'Rezervasyon bulunamadı.' });

  const tutar = Number(req.body.amount);
  if (!tutar || tutar <= 0) {
    return res.status(400).json({ message: 'Tahsilat tutarı sıfırdan büyük olmalıdır.' });
  }

  const odeme = await Payment.create({
    reservation: r._id,
    amount: tutar,
    method: req.body.method || 'nakit',
    takenBy: req.kullanici.id,
  });

  res.status(201).json(odeme);
});

// ---- Musaitlik sorgusu (yeni rezervasyon ekranı için) ----

router.get('/availability/search', async (req, res) => {
  const { from, to, propertyId } = req.query;
  if (!from || !to) {
    return res.status(400).json({ message: 'Giriş ve çıkış tarihi gereklidir.' });
  }

  const giris = gunBasi(from);
  const cikis = gunBasi(to);
  if (geceSayisi(giris, cikis) < 1) {
    return res.status(400).json({ message: 'Çıkış tarihi giriş tarihinden sonra olmalıdır.' });
  }

  const filtre = {};
  if (propertyId) filtre.property = propertyId;
  const odalar = await Room.find(filtre).populate('property').sort({ number: 1 });

  const dolular = await Reservation.find({
    status: { $ne: 'iptal' },
    checkIn: { $lt: cikis },
    checkOut: { $gt: giris },
  });

  const doluOdaIdleri = dolular.map((r) => r.room.toString());

  res.json(
    odalar.map((o) => ({
      id: o._id,
      number: o.number,
      type: o.type,
      capacity: o.capacity,
      floor: o.floor,
      nightlyRate: o.nightlyRate,
      status: o.status,
      propertyName: o.property ? o.property.name : '',
      available: !doluOdaIdleri.includes(o._id.toString()),
    }))
  );
});

module.exports = router;
