import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { vehicleAPI } from '../services/api'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  Download, 
  Calendar, 
  TrendingUp, 
  Fuel,
  Thermometer,
  Clock
} from 'lucide-react'

const WeeklyReport = () => {
  const { t } = useLanguage()
  const [reportData, setReportData] = useState(null)
  const [selectedVehicle, setSelectedVehicle] = useState('all')
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    fetchVehicles()
  }, [])

  useEffect(() => {
    if (vehicles.length > 0) {
      generateReport()
    }
  }, [vehicles, selectedVehicle, dateRange])

  const fetchVehicles = async () => {
    try {
      const response = await vehicleAPI.getVehicles()
      setVehicles(response.data)
    } catch (error) {
      console.error('Error fetching vehicles:', error)
    }
  }

  const generateReport = async () => {
    setLoading(true)
    try {
      const vehiclesToAnalyze = selectedVehicle === 'all' 
        ? vehicles 
        : vehicles.filter(v => v.deviceId === selectedVehicle)

      const reportPromises = vehiclesToAnalyze.map(async (vehicle) => {
        const hours = Math.ceil((new Date(dateRange.end) - new Date(dateRange.start)) / (1000 * 60 * 60))
        const response = await vehicleAPI.getVehicleData(vehicle.deviceId, { 
          hours: hours,
          limit: 1000 
        })
        return {
          vehicle,
          data: response.data
        }
      })

      const results = await Promise.all(reportPromises)
      const processedData = processReportData(results)
      setReportData(processedData)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  const processReportData = (results) => {
    const dailyStats = {}
    const vehicleStats = {}
    let totalDistance = 0
    let totalFuelUsed = 0

    results.forEach(({ vehicle, data }) => {
      vehicleStats[vehicle.deviceId] = {
        name: vehicle.name,
        avgTemp: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        totalRecords: data.length,
        alertCount: data.filter(d => d.alertType).length
      }

      if (data.length > 0) {
        vehicleStats[vehicle.deviceId].avgTemp = 
          data.reduce((sum, d) => sum + (d.engineTemp || 0), 0) / data.length
        vehicleStats[vehicle.deviceId].avgSpeed = 
          data.reduce((sum, d) => sum + (d.speed || 0), 0) / data.length
        vehicleStats[vehicle.deviceId].maxSpeed = 
          Math.max(...data.map(d => d.speed || 0))
      }

      data.forEach(record => {
        const date = new Date(record.timestamp).toLocaleDateString()
        if (!dailyStats[date]) {
          dailyStats[date] = {
            date,
            avgTemp: 0,
            avgSpeed: 0,
            fuelLevel: 0,
            records: []
          }
        }
        dailyStats[date].records.push(record)
      })
    })

    // Calculate daily averages
    Object.keys(dailyStats).forEach(date => {
      const records = dailyStats[date].records
      dailyStats[date].avgTemp = records.reduce((sum, r) => sum + (r.engineTemp || 0), 0) / records.length
      dailyStats[date].avgSpeed = records.reduce((sum, r) => sum + (r.speed || 0), 0) / records.length
      dailyStats[date].fuelLevel = records.reduce((sum, r) => sum + (r.fuelLevel || 0), 0) / records.length
    })

    return {
      dailyStats: Object.values(dailyStats).sort((a, b) => new Date(a.date) - new Date(b.date)),
      vehicleStats,
      summary: {
        totalVehicles: results.length,
        totalRecords: results.reduce((sum, r) => sum + r.data.length, 0),
        totalAlerts: results.reduce((sum, r) => sum + r.data.filter(d => d.alertType).length, 0),
        avgEfficiency: Object.values(vehicleStats).reduce((sum, v) => sum + v.avgSpeed, 0) / Object.keys(vehicleStats).length || 0
      }
    }
  }

  const exportToPDF = () => {
    window.print()
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const chartColors = ['#FE5E41', '#D8F1A0', '#EFCEFA', '#878E88', '#403D58']

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
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {t('weeklyReport')} 📊
                </h1>
                <p className="text-gray-300">
                  Detailed analysis of your vehicle performance
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={exportToPDF}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white font-medium"
                style={{ backgroundColor: '#FE5E41' }}
              >
                <Download className="w-4 h-4" />
                <span>{t('exportPDF')}</span>
              </motion.button>
            </div>

            {/* Filters */}
            <div className="glass rounded-2xl p-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Vehicle
                  </label>
                  <select
                    value={selectedVehicle}
                    onChange={(e) => setSelectedVehicle(e.target.value)}
                    className="w-full p-3 rounded-xl glass border-0 text-white outline-none"
                    style={{ backgroundColor: 'rgba(64, 61, 88, 0.3)' }}
                  >
                    <option value="all">All Vehicles</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.deviceId} value={vehicle.deviceId}>
                        {vehicle.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full p-3 rounded-xl glass border-0 text-white outline-none"
                    style={{ backgroundColor: 'rgba(64, 61, 88, 0.3)' }}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-white">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full p-3 rounded-xl glass border-0 text-white outline-none"
                    style={{ backgroundColor: 'rgba(64, 61, 88, 0.3)' }}
                  />
                </div>
              </div>
            </div>

            {reportData && (
              <>
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">Vehicles Analyzed</p>
                        <p className="text-2xl font-bold text-white">
                          {reportData.summary.totalVehicles}
                        </p>
                      </div>
                      <div 
                        className="p-3 rounded-full"
                        style={{ backgroundColor: '#D8F1A020' }}
                      >
                        <Calendar className="w-6 h-6" style={{ color: '#D8F1A0' }} />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="glass rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">Data Points</p>
                        <p className="text-2xl font-bold text-white">
                          {reportData.summary.totalRecords.toLocaleString()}
                        </p>
                      </div>
                      <div 
                        className="p-3 rounded-full"
                        style={{ backgroundColor: '#FE5E4120' }}
                      >
                        <TrendingUp className="w-6 h-6" style={{ color: '#FE5E41' }} />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="glass rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">Total Alerts</p>
                        <p className="text-2xl font-bold text-white">
                          {reportData.summary.totalAlerts}
                        </p>
                      </div>
                      <div 
                        className="p-3 rounded-full"
                        style={{ backgroundColor: '#EFCEFA20' }}
                      >
                        <Clock className="w-6 h-6" style={{ color: '#EFCEFA' }} />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass rounded-2xl p-6"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-300 text-sm">Avg Speed</p>
                        <p className="text-2xl font-bold text-white">
                          {reportData.summary.avgEfficiency.toFixed(1)} km/h
                        </p>
                      </div>
                      <div 
                        className="p-3 rounded-full"
                        style={{ backgroundColor: '#878E8820' }}
                      >
                        <Fuel className="w-6 h-6" style={{ color: '#878E88' }} />
                      </div>
                    </div>
                  </motion.div>
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Daily Temperature Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass rounded-2xl p-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-4">
                      Daily Average Temperature
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={reportData.dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#403D58" />
                        <XAxis dataKey="date" stroke="#878E88" />
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
                          dataKey="avgTemp" 
                          stroke="#FE5E41" 
                          strokeWidth={3}
                          dot={{ fill: '#FE5E41', strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>

                  {/* Daily Speed Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass rounded-2xl p-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-4">
                      Daily Average Speed
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={reportData.dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#403D58" />
                        <XAxis dataKey="date" stroke="#878E88" />
                        <YAxis stroke="#878E88" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#403D58', 
                            border: '1px solid #878E88',
                            borderRadius: '12px'
                          }} 
                        />
                        <Bar dataKey="avgSpeed" fill="#D8F1A0" radius={[8, 8, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>

                  {/* Fuel Level Chart */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="glass rounded-2xl p-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-4">
                      Daily Fuel Levels
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={reportData.dailyStats}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#403D58" />
                        <XAxis dataKey="date" stroke="#878E88" />
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
                          dataKey="fuelLevel" 
                          stroke="#EFCEFA" 
                          strokeWidth={3}
                          dot={{ fill: '#EFCEFA', strokeWidth: 2, r: 6 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </motion.div>

                  {/* Vehicle Performance */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="glass rounded-2xl p-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-4">
                      Vehicle Performance Summary
                    </h3>
                    <div className="space-y-4">
                      {Object.entries(reportData.vehicleStats).map(([deviceId, stats], index) => (
                        <div 
                          key={deviceId}
                          className="p-4 rounded-xl"
                          style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                        >
                          <h4 className="font-semibold text-white mb-2">{stats.name}</h4>
                          <div className="grid grid-cols-3 gap-4 text-sm">
                            <div>
                              <p className="text-gray-300">Avg Temp</p>
                              <p className="text-white font-medium">{stats.avgTemp.toFixed(1)}°C</p>
                            </div>
                            <div>
                              <p className="text-gray-300">Avg Speed</p>
                              <p className="text-white font-medium">{stats.avgSpeed.toFixed(1)} km/h</p>
                            </div>
                            <div>
                              <p className="text-gray-300">Alerts</p>
                              <p className="text-white font-medium">{stats.alertCount}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default WeeklyReport