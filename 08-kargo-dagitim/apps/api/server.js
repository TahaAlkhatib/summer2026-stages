require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
// İmza görüntüleri base64 olarak geldiği için gövde sınırını yükseltiyoruz
app.use(express.json({ limit: '5mb' }));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/shipments', require('./routes/shipments'));
app.use('/api/manifests', require('./routes/manifests'));
app.use('/api/delivery', require('./routes/delivery'));
app.use('/api/reports', require('./routes/reports'));

app.use((req, res) => {
  res.status(404).json({ message: 'Böyle bir adres yok.' });
});

app.use((hata, req, res, next) => {
  console.error(hata);
  res.status(500).json({ message: 'Sunucuda beklenmeyen bir hata oluştu.' });
});

const port = process.env.PORT || 3108;
app.listen(port, () => {
  console.log(`API çalışıyor: http://localhost:${port}`);
});
