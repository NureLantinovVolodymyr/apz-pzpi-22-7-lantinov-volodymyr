const mqtt = require('mqtt');
const VehicleData = require('../models/VehicleData');
const Vehicle = require('../models/Vehicle');
const Alert = require('../models/Alert'); // НОВЫЙ ИМПОРТ

class MQTTService {
  constructor() {
    this.client = null;
  }

  connect() {
    console.log(`Connecting to MQTT broker: ${process.env.MQTT_BROKER}`);
    this.client = mqtt.connect(`mqtt://${process.env.MQTT_BROKER}`);

    this.client.on('connect', () => {
      console.log('✅ MQTT connected successfully');
      
      // Subscribe to all vehicle topics
      const topics = [
        'vehicle-monitor/data',
        'vehicle-monitor/device/+',
        'vehicle-monitor/alerts'
      ];
      
      topics.forEach(topic => {
        this.client.subscribe(topic, (err) => {
          if (err) {
            console.error(`❌ Failed to subscribe to ${topic}:`, err);
          } else {
            console.log(`✅ Subscribed to: ${topic}`);
          }
        });
      });
    });

    this.client.on('message', async (topic, message) => {
      console.log(`📨 Received message on topic: ${topic}`);
      console.log(`📨 Message length: ${message.length} bytes`);
      
      try {
        const data = JSON.parse(message.toString());
        console.log(`📨 Parsed JSON:`, data);
        await this.handleMessage(topic, data);
      } catch (error) {
        console.error('❌ MQTT message parsing error:', error);
        console.error('❌ Raw message was:', message.toString());
      }
    });

    this.client.on('error', (error) => {
      console.error('❌ MQTT connection error:', error);
    });

    this.client.on('close', () => {
      console.log('🔴 MQTT connection closed');
    });

    this.client.on('offline', () => {
      console.log('🔴 MQTT client offline');
    });
  }

  async handleMessage(topic, data) {
    try {
      console.log(`🔄 Processing message from topic: ${topic}`);
      
      if (topic.includes('/data') || topic.includes('/device/')) {
        await this.saveVehicleData(data);
      }

      if (topic.includes('/alerts')) {
        await this.saveAlert(data);
      }
      
    } catch (error) {
      console.error('❌ Error handling MQTT message:', error);
      console.error('❌ Topic was:', topic);
      console.error('❌ Data was:', JSON.stringify(data, null, 2));
    }
  }

  async saveVehicleData(data) {
    console.log(`💾 Saving vehicle data for device: ${data.deviceId}`);
    
    if (!data.deviceId) {
      console.error('❌ No deviceId in data!');
      return;
    }
    
    const currentTime = new Date();
    console.log(`🕒 Using server time: ${currentTime}`);
    
    const vehicleData = new VehicleData({
      deviceId: data.deviceId,
      timestamp: currentTime,
      engineTemp: data.engineTemp,
      fuelLevel: data.fuelLevel,
      speed: data.speed,
      engineRunning: data.engineRunning,
      emergencyMode: data.emergencyMode
    });
    
    const saved = await vehicleData.save();
    console.log(`✅ Vehicle data saved with ID: ${saved._id}`);

    // Update vehicle last seen
    const updateResult = await Vehicle.updateOne(
      { deviceId: data.deviceId },
      { lastSeen: new Date() }
    );
    console.log(`🔄 Vehicle lastSeen update:`, updateResult.modifiedCount > 0 ? 'SUCCESS' : 'NO_CHANGE');
  }

  async saveAlert(data) {
    console.log(`🚨 Saving alert for device: ${data.deviceId}`);
    
    if (!data.deviceId || !data.alertType) {
      console.error('❌ Missing required alert fields:', { deviceId: !!data.deviceId, alertType: !!data.alertType });
      return;
    }

    // Создаем сообщение на основе типа алерта
    let message = '';
    switch (data.alertType) {
      case 'ENGINE_OVERHEAT':
        message = `Engine overheating: ${data.temperature}°C`;
        break;
      case 'LOW_FUEL':
        message = `Low fuel level: ${data.fuelLevel}%`;
        break;
      case 'EMERGENCY_MODE':
        message = 'Emergency mode activated';
        break;
      default:
        message = `Alert: ${data.alertType}`;
    }

    const alert = new Alert({
      deviceId: data.deviceId,
      alertType: data.alertType,
      severity: data.severity || 'MEDIUM',
      message: message,
      timestamp: new Date(),
      data: {
        temperature: data.temperature,
        fuelLevel: data.fuelLevel,
        speed: data.speed,
        engineRunning: data.engineRunning,
        emergencyMode: data.emergencyMode
      }
    });
    
    const saved = await alert.save();
    console.log(`✅ Alert saved with ID: ${saved._id}`);
  }

  sendCommand(deviceId, command) {
    const topic = 'vehicle-monitor/config';
    const message = JSON.stringify({ command, deviceId });
    
    console.log(`📤 Sending command to topic: ${topic}`);
    console.log(`📤 Command message: ${message}`);
    
    this.client.publish(topic, message, (error) => {
      if (error) {
        console.error('❌ Failed to send command:', error);
      } else {
        console.log(`✅ Command sent successfully: ${command} to ${deviceId}`);
      }
    });
  }
}

module.exports = new MQTTService();