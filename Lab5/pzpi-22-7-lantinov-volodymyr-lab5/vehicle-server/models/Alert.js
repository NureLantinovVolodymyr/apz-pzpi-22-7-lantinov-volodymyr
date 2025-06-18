const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  alertType: { 
    type: String, 
    required: true,
    enum: ['ENGINE_OVERHEAT', 'LOW_FUEL', 'EMERGENCY_MODE', 'MAINTENANCE', 'CONNECTION_LOST']
  },
  severity: { 
    type: String, 
    required: true,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
  },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  dismissed: { type: Boolean, default: false },
  dismissedAt: { type: Date },
  dismissedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  data: {
    temperature: Number,
    fuelLevel: Number,
    speed: Number,
    engineRunning: Boolean,
    emergencyMode: Boolean
  },
  resolved: { type: Boolean, default: false },
  resolvedAt: { type: Date },
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

alertSchema.index({ deviceId: 1, timestamp: -1 });
alertSchema.index({ dismissed: 1, resolved: 1 });

module.exports = mongoose.model('Alert', alertSchema);