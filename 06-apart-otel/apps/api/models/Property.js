const mongoose = require('mongoose');

// Tesis: bir apart binasi veya otel
const propertySchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, default: 'apart' }, // apart | otel
  address: String,
  district: String,
  city: { type: String, default: 'İstanbul' },
  phone: String,
});

module.exports = mongoose.model('Property', propertySchema);
