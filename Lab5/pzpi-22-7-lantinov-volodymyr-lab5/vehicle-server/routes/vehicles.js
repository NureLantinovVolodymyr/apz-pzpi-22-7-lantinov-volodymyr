const express = require('express');
const Vehicle = require('../models/Vehicle');
const VehicleData = require('../models/VehicleData');
const aiService = require('../services/aiService');
const mqttClient = require('../services/mqttClient');
const { auth } = require('../middleware/auth');

const router = express.Router();

// Get user vehicles 
router.get('/', auth, async (req, res) => {
  try {
    console.log(`🔍 Getting vehicles for user: ${req.user._id}`);
    
    // Находим девайсы где пользователь владелец ИЛИ имеет доступ
    // УЧИТЫВАЕМ И СТАРОЕ ПОЛЕ userId И НОВОЕ ownerId
    const vehicles = await Vehicle.find({
      $or: [
        { ownerId: req.user._id },
        { userId: req.user._id }, // СТАРОЕ ПОЛЕ ДЛЯ СОВМЕСТИМОСТИ
        { sharedWith: req.user._id }
      ]
    }).populate('ownerId', 'username email').populate('userId', 'username email');
    
    // Мигрируем старые записи и добавляем информацию о типе доступа
    const vehiclesWithAccess = await Promise.all(vehicles.map(async (vehicle) => {
      // МИГРАЦИЯ: если есть userId но нет ownerId
      if (vehicle.userId && !vehicle.ownerId) {
        console.log(`🔄 Migrating vehicle ${vehicle.deviceId}: moving userId to ownerId`);
        vehicle.ownerId = vehicle.userId;
        vehicle.sharedWith = vehicle.sharedWith || [];
        await vehicle.save();
        // Перезагружаем с populate
        const updatedVehicle = await Vehicle.findById(vehicle._id)
          .populate('ownerId', 'username email');
        vehicle = updatedVehicle;
      }
      
      const ownerId = vehicle.ownerId || vehicle.userId;
      const accessType = ownerId && ownerId._id.toString() === req.user._id.toString() ? 'owner' : 'shared';
      
      return {
        ...vehicle.toObject(),
        accessType,
        ownerInfo: vehicle.ownerId || vehicle.userId
      };
    }));
    
    console.log(`✅ Found ${vehicles.length} vehicles (owned + shared)`);
    res.json(vehiclesWithAccess);
  } catch (error) {
    console.error('❌ Error getting vehicles:', error);
    res.status(500).json({ message: error.message });
  }
});

// Add access to existing vehicle 
router.post('/add-access', auth, async (req, res) => {
  try {
    const { deviceId, ownerPassword } = req.body;
    console.log(`🔄 Adding access to device: ${deviceId} for user: ${req.user._id}`);
    
    // Проверяем что все обязательные поля есть
    if (!deviceId || !ownerPassword) {
      console.log(`❌ Missing required fields:`, { deviceId: !!deviceId, ownerPassword: !!ownerPassword });
      return res.status(400).json({ 
        message: 'Device ID and owner password are required' 
      });
    }
    
    // Находим девайс
    let vehicle = await Vehicle.findOne({ deviceId });
    if (!vehicle) {
      console.log(`❌ Device not found: ${deviceId}`);
      return res.status(404).json({ message: 'Device not found' });
    }
    
    console.log(`🔍 Found vehicle:`, {
      id: vehicle._id,
      deviceId: vehicle.deviceId,
      ownerId: vehicle.ownerId,
      userId: vehicle.userId, // СТАРОЕ ПОЛЕ
      name: vehicle.name
    });
    
    // МИГРАЦИЯ: если есть userId но нет ownerId, переносим
    if (vehicle.userId && !vehicle.ownerId) {
      console.log(`🔄 Migrating vehicle: moving userId to ownerId`);
      vehicle.ownerId = vehicle.userId;
      vehicle.sharedWith = vehicle.sharedWith || [];
      await vehicle.save();
    }
    
    // Проверяем что у vehicle есть ownerId
    if (!vehicle.ownerId) {
      console.log(`❌ Vehicle has no owner: ${deviceId}`);
      return res.status(500).json({ message: 'Vehicle has no owner assigned' });
    }
    
    // Проверяем что req.user._id существует
    if (!req.user || !req.user._id) {
      console.log(`❌ Invalid user session`);
      return res.status(401).json({ message: 'Invalid user session' });
    }
    
    // Проверяем что пользователь еще не имеет доступ
    const ownerIdString = vehicle.ownerId.toString();
    const userIdString = req.user._id.toString();
    
    console.log(`🔍 Checking access: owner=${ownerIdString}, user=${userIdString}`);
    
    if (ownerIdString === userIdString) {
      return res.status(400).json({ message: 'You are already the owner of this device' });
    }
    
    if (vehicle.sharedWith && vehicle.sharedWith.some(id => id.toString() === userIdString)) {
      return res.status(400).json({ message: 'You already have access to this device' });
    }
    
    // Проверяем пароль владельца
    const bcrypt = require('bcryptjs');
    const User = require('../models/User');
    const owner = await User.findById(vehicle.ownerId);
    
    if (!owner) {
      console.log(`❌ Owner not found for device: ${deviceId}, ownerId: ${vehicle.ownerId}`);
      return res.status(404).json({ message: 'Device owner not found' });
    }
    
    console.log(`🔍 Found owner: ${owner.username} (${owner._id})`);
    
    const isPasswordValid = await bcrypt.compare(ownerPassword, owner.password);
    
    if (!isPasswordValid) {
      console.log(`❌ Invalid owner password for device: ${deviceId}`);
      return res.status(400).json({ message: 'Invalid owner password' });
    }
    
    // Добавляем пользователя к списку с доступом
    if (!vehicle.sharedWith) {
      vehicle.sharedWith = [];
    }
    vehicle.sharedWith.push(req.user._id);
    await vehicle.save();
    
    console.log(`✅ Access granted to device ${deviceId} for user: ${req.user._id}`);
    res.status(200).json({ 
      message: 'Access granted successfully',
      vehicle: {
        ...vehicle.toObject(),
        accessType: 'shared'
      }
    });
  } catch (error) {
    console.error('❌ Error adding device access:', error);
    console.error('❌ Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Server error'
    });
  }
});

// Register new vehicle (for original owner)
router.post('/register', auth, async (req, res) => {
  try {
    const { deviceId, name, model, year } = req.body;
    console.log(`🔄 Registering NEW device: ${deviceId} for owner: ${req.user._id}`);
    
    if (!deviceId || !name) {
      return res.status(400).json({ 
        message: 'Device ID and name are required' 
      });
    }
    
    // Проверяем что deviceId еще не зарегистрирован
    const existingVehicle = await Vehicle.findOne({ deviceId });
    if (existingVehicle) {
      console.log(`❌ Device ${deviceId} already registered`);
      return res.status(400).json({ message: 'Device ID already registered. Use "Add Access" instead.' });
    }
    
    const vehicle = new Vehicle({
      deviceId,
      ownerId: req.user._id, // ОСНОВНОЙ ВЛАДЕЛЕЦ
      sharedWith: [], // ПУСТОЙ СПИСОК ПОЛЬЗОВАТЕЛЕЙ С ДОСТУПОМ
      name,
      model: model || 'Unknown',
      year: year || new Date().getFullYear()
    });
    
    await vehicle.save();
    console.log(`✅ NEW device registered: ${vehicle._id}`);
    res.status(201).json({
      ...vehicle.toObject(),
      accessType: 'owner'
    });
  } catch (error) {
    console.error('❌ Error registering new device:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get vehicle data 
router.get('/:deviceId/data', auth, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { limit = 50, hours = 24 } = req.query;
    
    console.log(`🔍 Getting data for device: ${deviceId}`);
    console.log(`📊 Params - limit: ${limit}, hours: ${hours}`);
    
    // ИСПРАВЛЕННАЯ ПРОВЕРКА - учитываем ownerId И sharedWith
    const vehicle = await Vehicle.findOne({ 
      deviceId: deviceId,
      $or: [
        { ownerId: req.user._id },
        { sharedWith: req.user._id }
      ]
    });
    
    if (!vehicle) {
      console.log(`❌ Vehicle not found or access denied: ${deviceId}`);
      return res.status(404).json({ message: 'Vehicle not found or access denied' });
    }
    
    console.log(`✅ Vehicle found: ${vehicle.name} (${vehicle._id})`);
    
    const since = new Date(Date.now() - hours * 60 * 60 * 1000);
    console.log(`📅 Getting data since: ${since}`);
    
    const data = await VehicleData.find({
      deviceId: deviceId,
      timestamp: { $gte: since }
    })
    .sort({ timestamp: -1 })
    .limit(parseInt(limit));
    
    console.log(`✅ Found ${data.length} records in time range for device: ${deviceId}`);
    res.json(data);
  } catch (error) {
    console.error('❌ Error getting vehicle data:', error);
    res.status(500).json({ message: error.message });
  }
});

// Send command to vehicle 
router.post('/:deviceId/command', auth, async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { command } = req.body;
    
    console.log(`🎮 Sending command: ${command} to device: ${deviceId}`);
    
    // ИСПРАВЛЕННАЯ ПРОВЕРКА
    const vehicle = await Vehicle.findOne({ 
      deviceId: deviceId,
      $or: [
        { ownerId: req.user._id },
        { sharedWith: req.user._id }
      ]
    });
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found or access denied' });
    }
    
    mqttClient.sendCommand(deviceId, command);
    console.log(`✅ Command sent: ${command} to ${deviceId}`);
    res.json({ message: 'Command sent', command, deviceId });
  } catch (error) {
    console.error('❌ Error sending command:', error);
    res.status(500).json({ message: error.message });
  }
});

// Get AI recommendations 
router.get('/:deviceId/recommendations', auth, async (req, res) => {
  try {
    const { deviceId } = req.params;
    console.log(`🤖 Getting AI recommendations for: ${deviceId}`);
    
    // ИСПРАВЛЕННАЯ ПРОВЕРКА
    const vehicle = await Vehicle.findOne({ 
      deviceId: deviceId,
      $or: [
        { ownerId: req.user._id },
        { sharedWith: req.user._id }
      ]
    });
    
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found or access denied' });
    }
    
    const recommendations = await aiService.generateRecommendations(deviceId);
    console.log(`✅ Generated ${recommendations.recommendations.length} recommendations`);
    res.json(recommendations);
  } catch (error) {
    console.error('❌ Error getting recommendations:', error);
    res.status(500).json({ message: error.message });
  }
});

// Dismiss alert
router.patch('/alerts/:alertId/dismiss', auth, async (req, res) => {
  try {
    const { alertId } = req.params;
    
    console.log(`🔄 Dismissing alert: ${alertId} by user: ${req.user._id}`);
    
    const alert = await VehicleData.findById(alertId);
    
    if (!alert) {
      return res.status(404).json({ message: 'Alert not found' });
    }
    
    // ИСПРАВЛЕННАЯ ПРОВЕРКА
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

module.exports = router;