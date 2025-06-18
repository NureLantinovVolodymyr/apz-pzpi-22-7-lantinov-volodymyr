const express = require('express');
const Alert = require('../models/Alert');
const Vehicle = require('../models/Vehicle');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get alerts for user's vehicles
router.get('/', auth, async (req, res) => {
  try {
    const { limit = 50, dismissed = 'false' } = req.query;
    
    console.log(`🔍 Getting alerts for user: ${req.user._id}`);
    
    // Get user's vehicles
    const userVehicles = await Vehicle.find({
      $or: [
        { ownerId: req.user._id },
        { sharedWith: req.user._id }
      ]
    });
    
    const deviceIds = userVehicles.map(v => v.deviceId);
    console.log(`📱 User has access to devices: ${deviceIds.join(', ')}`);
    
    // Build query
    const query = { deviceId: { $in: deviceIds } };
    
    if (dismissed === 'false') {
      query.dismissed = false;
    } else if (dismissed === 'true') {
      query.dismissed = true;
    }
    // if dismissed === 'all', don't add dismissed filter
    
    const alerts = await Alert.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .populate('dismissedBy', 'username');
    
    console.log(`✅ Found ${alerts.length} alerts`);
    res.json(alerts);
  } catch (error) {
    console.error('❌ Error getting alerts:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get alert by ID
router.get('/:alertId', auth, async (req, res) => {
  try {
    const { alertId } = req.params;
    
    const alert = await Alert.findById(alertId).populate('dismissedBy', 'username');
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Check if user has access to this device
    const vehicle = await Vehicle.findOne({
      deviceId: alert.deviceId,
      $or: [
        { ownerId: req.user._id },
        { sharedWith: req.user._id }
      ]
    });
    
    if (!vehicle) {
      return res.status(403).json({ message: 'Access denied to this alert' });
    }
    
    res.json(alert);
  } catch (error) {
    console.error('❌ Error getting alert:', error);
    res.status(500).json({ message: error.message });
  }
});

// Dismiss alert
router.patch('/:alertId/dismiss', auth, async (req, res) => {
  try {
    const { alertId } = req.params;
    
    console.log(`🔄 Dismissing alert: ${alertId} by user: ${req.user._id}`);
    
    const alert = await Alert.findById(alertId);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Check if user has access to this device
    const vehicle = await Vehicle.findOne({
      deviceId: alert.deviceId,
      $or: [
        { ownerId: req.user._id },
        { sharedWith: req.user._id }
      ]
    });
    
    if (!vehicle) {
      return res.status(403).json({ message: 'Access denied to this alert' });
    }
    
    // Update alert to dismissed
    alert.dismissed = true;
    alert.dismissedAt = new Date();
    alert.dismissedBy = req.user._id;
    
    await alert.save();
    
    console.log(`✅ Alert dismissed: ${alertId}`);
    res.json({ message: 'Alert dismissed successfully', alert });
  } catch (error) {
    console.error('❌ Error dismissing alert:', error);
    res.status(500).json({ message: error.message });
  }
});

// Resolve alert
router.patch('/:alertId/resolve', auth, async (req, res) => {
  try {
    const { alertId } = req.params;
    
    console.log(`🔄 Resolving alert: ${alertId} by user: ${req.user._id}`);
    
    const alert = await Alert.findById(alertId);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // Check if user has access to this device
    const vehicle = await Vehicle.findOne({
      deviceId: alert.deviceId,
      $or: [
        { ownerId: req.user._id },
        { sharedWith: req.user._id }
      ]
    });
    
    if (!vehicle) {
      return res.status(403).json({ message: 'Access denied to this alert' });
    }
    
    // Update alert to resolved
    alert.resolved = true;
    alert.resolvedAt = new Date();
    alert.resolvedBy = req.user._id;
    
    await alert.save();
    
    console.log(`✅ Alert resolved: ${alertId}`);
    res.json({ message: 'Alert resolved successfully', alert });
  } catch (error) {
    console.error('❌ Error resolving alert:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;