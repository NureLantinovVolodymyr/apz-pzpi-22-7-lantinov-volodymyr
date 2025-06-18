const mongoose = require('mongoose');

const vehicleDataSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  engineTemp: Number,
  fuelLevel: Number,
  speed: Number,
  engineRunning: Boolean,
  emergencyMode: Boolean,
  alertType: String,
  severity: String,
  dismissed: { type: Boolean, default: false },
  dismissedAt: { type: Date },
  dismissedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, 
  location: {
    latitude: Number,
    longitude: Number
  }
});

vehicleDataSchema.index({ deviceId: 1, timestamp: -1 });

module.exports = mongoose.model('VehicleData', vehicleDataSchema);