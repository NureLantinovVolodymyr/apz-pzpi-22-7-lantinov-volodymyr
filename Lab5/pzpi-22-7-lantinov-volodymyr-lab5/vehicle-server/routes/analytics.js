const express = require('express');
const Alert = require('../models/Alert'); // НОВЫЙ ИМПОРТ
const Vehicle = require('../models/Vehicle');
const VehicleData = require('../models/VehicleData');
const { auth, adminAuth } = require('../middleware/auth');

const router = express.Router();

// Get analytics dashboard data - ОБНОВЛЕННЫЙ
router.get('/dashboard', auth, async (req, res) => {
  try {
    const userVehicles = await Vehicle.find({
      $or: [
        { ownerId: req.user._id },
        { sharedWith: req.user._id }
      ]
    });
    
    const deviceIds = userVehicles.map(v => v.deviceId);
    
    // Recent alerts from Alert model - ИСПОЛЬЗУЕМ НОВУЮ МОДЕЛЬ
    const alerts = await Alert.find({
      deviceId: { $in: deviceIds },
      dismissed: false,
      timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
    }).sort({ timestamp: -1 }).limit(10);

    // Vehicle status summary with latest data
    const summary = await Promise.all(
      userVehicles.map(async (vehicle) => {
        const latestData = await VehicleData.findOne({ deviceId: vehicle.deviceId })
          .sort({ timestamp: -1 });
        
        return {
          ...vehicle.toObject(),
          latestData
        };
      })
    );

    console.log(`📊 Dashboard: Found ${alerts.length} active alerts for user`);
    res.json({ alerts, vehicles: summary });
  } catch (error) {
    console.error('❌ Error getting dashboard analytics:', error);
    res.status(500).json({ message: error.message });
  }
});

// Admin analytics - ОБНОВЛЕННЫЙ
router.get('/admin', auth, adminAuth, async (req, res) => {
  try {
    const totalVehicles = await Vehicle.countDocuments();
    const activeVehicles = await Vehicle.countDocuments({
      lastSeen: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });
    
    // Total alerts from Alert model - ИСПОЛЬЗУЕМ НОВУЮ МОДЕЛЬ
    const totalAlerts = await Alert.countDocuments({
      timestamp: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });

    const criticalAlerts = await Alert.countDocuments({
      severity: 'CRITICAL',
      dismissed: false,
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
    });

    res.json({ 
      totalVehicles, 
      activeVehicles, 
      totalAlerts, 
      criticalAlerts 
    });
  } catch (error) {
    console.error('❌ Error getting admin analytics:', error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;