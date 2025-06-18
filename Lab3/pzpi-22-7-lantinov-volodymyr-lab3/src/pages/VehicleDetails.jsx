import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { vehicleAPI } from '../services/api'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts'
import { 
  ArrowLeft,
  Power,
  ShieldAlert,
  Thermometer,
  Fuel,
  Gauge,
  Brain,
  PlayCircle,
  StopCircle,
  AlertTriangle,
  Copy,
  Check
} from 'lucide-react'
import toast from 'react-hot-toast'

const VehicleDetails = () => {
  const { deviceId } = useParams()
  const navigate = useNavigate()
  const { t } = useLanguage()
  const [vehicle, setVehicle] = useState(null)
  const [vehicleData, setVehicleData] = useState([])
  const [recommendations, setRecommendations] = useState([])
  const [loading, setLoading] = useState(true)
  const [commandLoading, setCommandLoading] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    fetchVehicleDetails()
    fetchRecommendations()
    
    const interval = setInterval(fetchVehicleData, 10000) // Refresh every 10 seconds
    return () => clearInterval(interval)
  }, [deviceId])

  const copyDeviceId = async () => {
    try {
      await navigator.clipboard.writeText(deviceId)
      setCopied(true)
      toast.success('Device ID copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy Device ID')
    }
  }

  const fetchVehicleDetails = async () => {
    try {
      const [vehiclesRes, dataRes] = await Promise.all([
        vehicleAPI.getVehicles(),
        vehicleAPI.getVehicleData(deviceId, { limit: 50, hours: 24 })
      ])
      
      const foundVehicle = vehiclesRes.data.find(v => v.deviceId === deviceId)
      setVehicle(foundVehicle)
      setVehicleData(dataRes.data)
    } catch (error) {
      console.error('Error fetching vehicle details:', error)
      toast.error('Failed to load vehicle details')
    } finally {
      setLoading(false)
    }
  }

  const fetchVehicleData = async () => {
    try {
      const response = await vehicleAPI.getVehicleData(deviceId, { limit: 50, hours: 24 })
      setVehicleData(response.data)
    } catch (error) {
      console.error('Error refreshing vehicle data:', error)
    }
  }

  const fetchRecommendations = async () => {
    try {
      const response = await vehicleAPI.getRecommendations(deviceId)
      setRecommendations(response.data.recommendations || [])
    } catch (error) {
      console.error('Error fetching recommendations:', error)
    }
  }

  const sendCommand = async (command) => {
    setCommandLoading(true)
    try {
      await vehicleAPI.sendCommand(deviceId, command)
      toast.success(`Command sent: ${command}`)
      setTimeout(fetchVehicleData, 2000) // Refresh data after 2 seconds
    } catch (error) {
      toast.error('Failed to send command')
    } finally {
      setCommandLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  if (!vehicle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-4">Vehicle not found</h2>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-6 py-3 rounded-xl text-white font-medium"
            style={{ backgroundColor: '#FE5E41' }}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const latestData = vehicleData[0]
  const chartData = vehicleData.slice(0, 20).reverse().map((data, index) => ({
    time: new Date(data.timestamp).toLocaleTimeString(),
    temperature: data.engineTemp,
    speed: data.speed,
    fuel: data.fuelLevel
  }))

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <Sidebar />
        
        <main className="flex-1 p-6 overflow-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-4">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => navigate('/dashboard')}
                  className="p-3 rounded-full glass hover:bg-white hover:bg-opacity-20 transition-colors"
                >
                  <ArrowLeft className="w-6 h-6 text-white" />
                </motion.button>
                <div>
                  <h1 className="text-3xl font-bold text-white">{vehicle.name}</h1>
                  <p className="text-gray-300">{vehicle.model} • {vehicle.year}</p>
                  
                  {/* ДОБАВИТЬ DEVICE ID С КНОПКОЙ КОПИРОВАНИЯ */}
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-sm text-gray-400">Device ID:</span>
                    <code className="text-sm text-white bg-white bg-opacity-10 px-2 py-1 rounded">
                      {deviceId}
                    </code>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={copyDeviceId}
                      className="p-1 rounded hover:bg-white hover:bg-opacity-20 transition-colors"
                      title="Copy Device ID"
                    >
                      {copied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4 text-gray-400 hover:text-white" />
                      )}
                    </motion.button>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                  latestData && new Date() - new Date(latestData.timestamp) < 5 * 60 * 1000
                    ? 'bg-green-500 bg-opacity-20 text-green-400'
                    : 'bg-gray-500 bg-opacity-20 text-gray-400'
                }`}>
                  {latestData && new Date() - new Date(latestData.timestamp) < 5 * 60 * 1000 ? 'Online' : 'Offline'}
                </div>
              </div>
            </div>

            {/* Control Panel */}
            <div className="glass rounded-2xl p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Vehicle Controls</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => sendCommand('start_engine')}
                  disabled={commandLoading || latestData?.engineRunning}
                  className="flex items-center justify-center space-x-2 p-4 rounded-xl transition-colors disabled:opacity-50"
                  style={{ 
                    backgroundColor: latestData?.engineRunning ? '#878E88' : '#D8F1A0',
                    color: '#403D58'
                  }}
                >
                  <PlayCircle className="w-5 h-5" />
                  <span className="font-medium">{t('startEngine')}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => sendCommand('stop_engine')}
                  disabled={commandLoading || !latestData?.engineRunning}
                  className="flex items-center justify-center space-x-2 p-4 rounded-xl transition-colors disabled:opacity-50"
                  style={{ 
                    backgroundColor: !latestData?.engineRunning ? '#878E88' : '#FE5E41',
                    color: 'white'
                  }}
                >
                  <StopCircle className="w-5 h-5" />
                  <span className="font-medium">{t('stopEngine')}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => sendCommand('emergency_on')}
                  disabled={commandLoading || latestData?.emergencyMode}
                  className="flex items-center justify-center space-x-2 p-4 rounded-xl transition-colors disabled:opacity-50"
                  style={{ 
                    backgroundColor: latestData?.emergencyMode ? '#878E88' : '#FE5E41',
                    color: 'white'
                  }}
                >
                  <ShieldAlert className="w-5 h-5" />
                  <span className="font-medium">{t('enableEmergency')}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => sendCommand('emergency_off')}
                  disabled={commandLoading || !latestData?.emergencyMode}
                  className="flex items-center justify-center space-x-2 p-4 rounded-xl transition-colors disabled:opacity-50"
                  style={{ 
                    backgroundColor: !latestData?.emergencyMode ? '#878E88' : '#EFCEFA',
                    color: '#403D58'
                  }}
                >
                  <ShieldAlert className="w-5 h-5" />
                  <span className="font-medium">{t('disableEmergency')}</span>
                </motion.button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Current Status */}
              <div className="lg:col-span-2 space-y-6">
                {/* Status Cards */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-xl p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <Power className={`w-6 h-6 ${latestData?.engineRunning ? 'text-green-400' : 'text-gray-400'}`} />
                      <div>
                        <p className="text-sm text-gray-300">Engine</p>
                        <p className="font-semibold text-white">
                          {latestData?.engineRunning ? 'Running' : 'Stopped'}
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-xl p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <Thermometer 
                        className={`w-6 h-6 ${
                          latestData?.engineTemp > 100 ? 'text-red-400' : 'text-blue-400'
                        }`} 
                      />
                      <div>
                        <p className="text-sm text-gray-300">{t('temperature')}</p>
                        <p className="font-semibold text-white">
                          {latestData?.engineTemp || 0}°C
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-xl p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <Fuel 
                        className={`w-6 h-6 ${
                          latestData?.fuelLevel < 10 ? 'text-red-400' : 'text-green-400'
                        }`} 
                      />
                      <div>
                        <p className="text-sm text-gray-300">{t('fuelLevel')}</p>
                        <p className="font-semibold text-white">
                          {latestData?.fuelLevel || 0}%
                        </p>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass rounded-xl p-4"
                  >
                    <div className="flex items-center space-x-3">
                      <Gauge className="w-6 h-6 text-blue-400" />
                      <div>
                        <p className="text-sm text-gray-300">{t('speed')}</p>
                        <p className="font-semibold text-white">
                          {latestData?.speed || 0} km/h
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Charts */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="glass rounded-2xl p-6"
                >
                  <h3 className="text-xl font-bold text-white mb-4">Real-time Data</h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#403D58" />
                      <XAxis dataKey="time" stroke="#878E88" />
                      <YAxis stroke="#878E88" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#403D58', 
                          border: '1px solid #878E88',
                          borderRadius: '12px'
                        }} 
                      />
                      <Line 
                        type="monotone" 
                        dataKey="temperature" 
                        stroke="#FE5E41" 
                        strokeWidth={2}
                        name="Temperature (°C)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="speed" 
                        stroke="#D8F1A0" 
                        strokeWidth={2}
                        name="Speed (km/h)"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="fuel" 
                        stroke="#EFCEFA" 
                        strokeWidth={2}
                        name="Fuel (%)"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </motion.div>
              </div>

              {/* AI Recommendations */}
              <div>
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.6 }}
                  className="glass rounded-2xl p-6"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <Brain className="w-6 h-6" style={{ color: '#D8F1A0' }} />
                    <h3 className="text-xl font-bold text-white">AI Recommendations</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {recommendations.map((recommendation, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7 + index * 0.1 }}
                        className="p-3 rounded-xl"
                        style={{ backgroundColor: 'rgba(216, 241, 160, 0.1)' }}
                      >
                        <p className="text-sm text-white">{recommendation}</p>
                      </motion.div>
                    ))}
                    
                    {recommendations.length === 0 && (
                      <div className="text-center py-8">
                        <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                        <p className="text-gray-400">No recommendations available</p>
                        <button
                          onClick={fetchRecommendations}
                          className="mt-2 text-sm font-medium hover:underline"
                          style={{ color: '#D8F1A0' }}
                        >
                          Refresh Recommendations
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default VehicleDetails