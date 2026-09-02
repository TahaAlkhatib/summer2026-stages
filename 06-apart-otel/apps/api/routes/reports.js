const express = require('express');
const Room = require('../models/Room');
const Reservation = require('../models/Reservation');
const Charge = require('../models/Charge');
const Payment = require('../models/Payment');
const Task = require('../models/Task');
const { girisGerekli } = require('../auth');
const { gunBasi, bugun, gunEkle, gunMetni } = require('../tarih');

const router = express.Router();
router.use(girisGerekli);

// Panel ozeti
router.get('/summary', async (req, res) => {
  const gun = bugun();
  const yarin = gunEkle(gun, 1);

  const toplamOda = await Room.countDocuments();
  const doluOda = await Room.countDocuments({ status: 'dolu' });
  const temizlikOda = await Room.countDocuments({ status: 'temizlik' });
  const bakimOda = await Room.countDocuments({ status: 'bakim' });

  const bugunGiris = await Reservation.countDocuments({
    checkIn: { $gte: gun, $lt: yarin },
    status: 'onaylandi',
  });
  const bugunCikis = await Reservation.countDocuments({
    checkOut: { $gte: gun, $lt: yarin },
    status: 'giris_yapildi',
  });
  const icerideki = await Reservation.countDocuments({ status: 'giris_yapildi' });

  const bekleyenGorev = await Task.countDocuments({ status: { $in: ['bekliyor', 'basladi'] } });

  // Bu ayin geliri (tahsil edilen)
  const ayBasi = new Date(gun.getFullYear(), gun.getMonth(), 1);
  const ayOdemeleri = await Payment.find({ date: { $gte: ayBasi } });
  let ayGeliri = 0;
  ayOdemeleri.forEach((o) => { ayGeliri += o.amount; });

  // Acik bakiye: iceride olan rezervasyonlarin odenmemis tutari
  const acikRezervasyonlar = await Reservation.find({ status: 'giris_yapildi' });
  let acikBakiye = 0;
  for (const r of acikRezervasyonlar) {
    const masraflar = await Charge.find({ reservation: r._id });
    const odemeler = await Payment.find({ reservation: r._id });
    masraflar.forEach((m) => { acikBakiye += m.total; });
    odemeler.forEach((o) => { acikBakiye -= o.amount; });
  }

  res.json({
    date: gunMetni(gun),
    totalRooms: toplamOda,
    occupiedRooms: doluOda,
    cleaningRooms: temizlikOda,
    maintenanceRooms: bakimOda,
    availableRooms: toplamOda - doluOda - temizlikOda - bakimOda,
    occupancyRate: toplamOda > 0 ? Math.round((doluOda / toplamOda) * 100) : 0,
    todayCheckIns: bugunGiris,
    todayCheckOuts: bugunCikis,
    inHouse: icerideki,
    openTasks: bekleyenGorev,
    monthRevenue: ayGeliri,
    openBalance: acikBakiye,
  });
});

// Doluluk grafigi: gun gun kac oda dolu
router.get('/occupancy', async (req, res) => {
  const gunSayisi = Number(req.query.days) || 14;
  const baslangic = req.query.from ? gunBasi(req.query.from) : bugun();
  const toplamOda = await Room.countDocuments();

  const rezervasyonlar = await Reservation.find({
    status: { $ne: 'iptal' },
    checkIn: { $lt: gunEkle(baslangic, gunSayisi) },
    checkOut: { $gt: baslangic },
  });

  const gunler = [];
  for (let i = 0; i < gunSayisi; i++) {
    const gun = gunEkle(baslangic, i);
    const ertesi = gunEkle(baslangic, i + 1);

    // O gece odada olan rezervasyonlar
    const dolu = rezervasyonlar.filter(
      (r) => r.checkIn < ertesi && r.checkOut > gun
    ).length;

    gunler.push({
      date: gunMetni(gun),
      occupied: dolu,
      total: toplamOda,
      rate: toplamOda > 0 ? Math.round((dolu / toplamOda) * 100) : 0,
    });
  }

  res.json(gunler);
});

// Gun sonu raporu
router.get('/daily', async (req, res) => {
  const gun = req.query.date ? gunBasi(req.query.date) : bugun();
  const ertesi = gunEkle(gun, 1);

  const odemeler = await Payment.find({ date: { $gte: gun, $lt: ertesi } })
    .populate({
      path: 'reservation',
      populate: [{ path: 'guest' }, { path: 'room' }],
    });

  let nakit = 0;
  let kart = 0;
  let havale = 0;
  odemeler.forEach((o) => {
    if (o.method === 'nakit') nakit += o.amount;
    else if (o.method === 'kredi_karti') kart += o.amount;
    else havale += o.amount;
  });

  const girisler = await Reservation.find({ checkedInAt: { $gte: gun, $lt: ertesi } })
    .populate('guest').populate('room');
  const cikislar = await Reservation.find({ checkedOutAt: { $gte: gun, $lt: ertesi } })
    .populate('guest').populate('room');

  const tamamlananGorev = await Task.countDocuments({
    completedAt: { $gte: gun, $lt: ertesi },
  });

  res.json({
    date: gunMetni(gun),
    cash: nakit,
    card: kart,
    transfer: havale,
    total: nakit + kart + havale,
    paymentCount: odemeler.length,
    completedTasks: tamamlananGorev,
    payments: odemeler.map((o) => ({
      id: o._id,
      amount: o.amount,
      method: o.method,
      date: o.date,
      code: o.reservation ? o.reservation.code : '',
      guestName: o.reservation && o.reservation.guest ? o.reservation.guest.fullName : '',
      roomNumber: o.reservation && o.reservation.room ? o.reservation.room.number : '',
    })),
    checkIns: girisler.map((r) => ({
      code: r.code,
      guestName: r.guest ? r.guest.fullName : '',
      roomNumber: r.room ? r.room.number : '',
      at: r.checkedInAt,
    })),
    checkOuts: cikislar.map((r) => ({
      code: r.code,
      guestName: r.guest ? r.guest.fullName : '',
      roomNumber: r.room ? r.room.number : '',
      at: r.checkedOutAt,
    })),
  });
});

module.exports = router;
