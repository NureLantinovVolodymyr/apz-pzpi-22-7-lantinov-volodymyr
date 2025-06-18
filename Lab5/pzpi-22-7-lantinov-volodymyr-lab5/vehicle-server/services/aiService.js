const { GoogleGenerativeAI } = require('@google/generative-ai');
const VehicleData = require('../models/VehicleData');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class AIService {
  async generateRecommendations(deviceId) {
    try {
      console.log(`🤖 Generating recommendations for device: ${deviceId}`);
      
      // Get recent vehicle data
      const recentData = await VehicleData.find({ deviceId })
        .sort({ timestamp: -1 })
        .limit(100);

      console.log(`📊 Found ${recentData.length} records for analysis`);

      if (recentData.length === 0) {
        return { 
          recommendations: ['No data available for analysis. Please ensure vehicle is sending telemetry data.'],
          analysis: { message: 'No data available' }
        };
      }

      const dataAnalysis = this.analyzeData(recentData);
      console.log(`📈 Data analysis:`, dataAnalysis);
      
      const prompt = this.createPrompt(dataAnalysis);
      console.log(`🔤 Generated prompt for AI`);

      // ИСПРАВЛЯЕМ МОДЕЛЬ - используем gemini-1.5-flash
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      
      console.log(`🔄 Calling Gemini API...`);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      console.log(`✅ AI response received: ${text.length} characters`);
      
      // Парсим ответ на отдельные рекомендации
      const recommendations = text
        .split('\n')
        .filter(line => line.trim())
        .filter(line => line.includes('-') || line.includes('•') || line.includes('1.') || line.includes('2.') || line.includes('3.'))
        .map(line => line.replace(/^[-•*]\s*/, '').replace(/^\d+\.\s*/, '').trim())
        .filter(line => line.length > 10);

      return {
        recommendations: recommendations.length > 0 ? recommendations : [text.trim()],
        analysis: dataAnalysis,
        rawResponse: text
      };
      
    } catch (error) {
      console.error('❌ AI Service error:', error);
      
      // Если ошибка API, возвращаем базовые рекомендации
      const fallbackRecommendations = this.getFallbackRecommendations(deviceId);
      
      return { 
        recommendations: fallbackRecommendations,
        error: error.message,
        fallback: true
      };
    }
  }

  analyzeData(data) {
    const validData = data.filter(d => d.engineTemp != null && d.fuelLevel != null && d.speed != null);
    
    if (validData.length === 0) {
      return { message: 'No valid data for analysis' };
    }

    const avgTemp = validData.reduce((sum, d) => sum + d.engineTemp, 0) / validData.length;
    const avgFuel = validData.reduce((sum, d) => sum + d.fuelLevel, 0) / validData.length;
    const avgSpeed = validData.reduce((sum, d) => sum + d.speed, 0) / validData.length;
    const emergencyCount = validData.filter(d => d.emergencyMode).length;
    const maxTemp = Math.max(...validData.map(d => d.engineTemp));
    const minFuel = Math.min(...validData.map(d => d.fuelLevel));
    const maxSpeed = Math.max(...validData.map(d => d.speed));

    return { 
      avgTemp: Number(avgTemp.toFixed(1)), 
      avgFuel: Number(avgFuel.toFixed(1)), 
      avgSpeed: Number(avgSpeed.toFixed(1)), 
      emergencyCount, 
      maxTemp: Number(maxTemp.toFixed(1)),
      minFuel: Number(minFuel.toFixed(1)),
      maxSpeed: Number(maxSpeed.toFixed(1)),
      totalRecords: validData.length,
      timespan: validData.length > 0 ? `${Math.round((validData[0].timestamp - validData[validData.length - 1].timestamp) / 1000 / 60)} minutes` : 'N/A'
    };
  }

  createPrompt(analysis) {
    return `Analyze this vehicle telemetry data and provide 3-5 practical maintenance and driving recommendations:

VEHICLE DATA ANALYSIS:
- Average engine temperature: ${analysis.avgTemp}°C (Max: ${analysis.maxTemp}°C)
- Average fuel level: ${analysis.avgFuel}% (Minimum: ${analysis.minFuel}%)
- Average speed: ${analysis.avgSpeed} km/h (Maximum: ${analysis.maxSpeed} km/h)
- Emergency activations: ${analysis.emergencyCount}
- Data points analyzed: ${analysis.totalRecords} over ${analysis.timespan}

Please provide specific, actionable recommendations for:
1. Engine maintenance (based on temperature patterns)
2. Fuel efficiency improvements
3. Driving behavior optimization
4. Preventive maintenance suggestions
5. Safety considerations

Format each recommendation as a clear, concise bullet point. Focus on practical advice that can improve vehicle performance, safety, and longevity.`;
  }

  getFallbackRecommendations(deviceId) {
    return [
      "Regular engine maintenance: Check engine oil level and quality every 5,000 km",
      "Monitor engine temperature: Keep engine temperature below 90°C during normal operation",
      "Fuel efficiency: Maintain steady speeds between 50-80 km/h for optimal fuel consumption",
      "Tire pressure: Check tire pressure monthly to improve fuel efficiency and safety",
      "Emergency system: Test emergency systems monthly to ensure proper functionality"
    ];
  }
}

module.exports = new AIService();