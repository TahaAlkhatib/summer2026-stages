require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', require('./routes/auth'));
app.use('/api/rooms', require('./routes/rooms'));
app.use('/api/reservations', require('./routes/reservations'));
app.use('/api/guests', require('./routes/guests'));
app.use('/api/tasks', require('./routes/tasks'));
app.use('/api/reports', require('./routes/reports'));

// Tanimsiz adresler
app.use((req, res) => {
  res.status(404).json({ message: 'Böyle bir adres yok.' });
});

// Beklenmeyen hatalari Turkce mesajla dondur
app.use((hata, req, res, next) => {
  console.error(hata);
  res.status(500).json({ message: 'Sunucuda beklenmeyen bir hata oluştu.' });
});

const port = process.env.PORT || 3106;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => {
    console.log('MongoDB bağlantısı kuruldu.');
    app.listen(port, () => {
      console.log(`API çalışıyor: http://localhost:${port}`);
    });
  })
  .catch((hata) => {
    console.error('MongoDB bağlantısı kurulamadı:', hata.message);
    process.exit(1);
  });
