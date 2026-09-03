// MongoDB bağlantısı (Mongoose)
const mongoose = require('mongoose');
require('dotenv').config();

async function baglan() {
  await mongoose.connect(process.env.MONGO_URL);
  console.log('MongoDB bağlantısı kuruldu.');
}

module.exports = { mongoose, baglan };
