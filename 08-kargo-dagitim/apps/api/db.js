const { Pool } = require('pg');

// Tüm sorgular bu havuz üzerinden gidiyor
const havuz = new Pool({ connectionString: process.env.DATABASE_URL });

async function sorgu(metin, degerler) {
  const sonuc = await havuz.query(metin, degerler);
  return sonuc.rows;
}

// Tek satır bekleyen sorgular için kısayol
async function tek(metin, degerler) {
  const satirlar = await sorgu(metin, degerler);
  return satirlar[0] || null;
}

module.exports = { havuz, sorgu, tek };
