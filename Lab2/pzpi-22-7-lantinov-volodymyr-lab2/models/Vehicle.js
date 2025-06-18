const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Original owner
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Current user (if different from owner)
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  name: { type: String, default: 'Vehicle' },
  model: String,
  year: Number,
  status: { type: String, enum: ['active', 'inactive', 'maintenance'], default: 'active' },
  lastSeen: { type: Date, default: Date.now },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Vehicle', vehicleSchema);