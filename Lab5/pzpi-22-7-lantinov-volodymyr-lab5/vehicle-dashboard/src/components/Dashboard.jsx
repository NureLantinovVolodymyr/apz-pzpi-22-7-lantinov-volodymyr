import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import VehicleCard from './VehicleCard'
import AlertCard from './AlertCard'
import { 
  Car, 
  Activity, 
  AlertTriangle,
  Plus,
  BarChart3
} from 'lucide-react'

const Dashboard = ({ vehicles, alerts, onVehicleClick, onAddVehicle, onViewReports }) => {
  const { t } = useLanguage()
  
  const activeVehicles = vehicles.filter(v => v.latestData && 
    new Date() - new Date(v.latestData.timestamp) < 5 * 60 * 1000
  )

  const stats = [
    {
      title: t('totalVehicles'),
      value: vehicles.length,
      icon: Car,
      color: '#D8F1A0'
    },
    {
      title: t('activeVehicles'),
      value: activeVehicles.length,
      icon: Activity,
      color: '#FE5E41'
    },
    {
      title: t('alerts'),
      value: alerts.length,
      icon: AlertTriangle,
      color: '#EFCEFA'
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="space-y-8"
    >
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          {t('welcome')} 👋
        </h1>
        <p className="text-gray-300">
          Monitor your vehicle fleet in real-time
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass rounded-2xl p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-300 text-sm">{stat.title}</p>
                <p className="text-3xl font-bold text-white mt-1">
                  {stat.value}
                </p>
              </div>
              <div 
                className="p-3 rounded-full"
                style={{ backgroundColor: `${stat.color}20` }}
              >
                <stat.icon 
                  className="w-6 h-6" 
                  style={{ color: stat.color }} 
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Vehicles Section */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">{t('vehicles')}</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onAddVehicle}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl text-white font-medium"
              style={{ backgroundColor: '#FE5E41' }}
            >
              <Plus className="w-4 h-4" />
              <span>Add Vehicle</span>
            </motion.button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {vehicles.map((vehicle, index) => (
              <motion.div
                key={vehicle._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <VehicleCard
                  vehicle={vehicle}
                  data={vehicle.latestData}
                  onClick={() => onVehicleClick(vehicle.deviceId)}
                />
              </motion.div>
            ))}
          </div>

          {vehicles.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-12 glass rounded-2xl"
            >
              <Car className="w-16 h-16 mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-semibold text-white mb-2">
                No vehicles yet
              </h3>
              <p className="text-gray-300 mb-4">
                Start by registering your first vehicle
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddVehicle}
                className="px-6 py-3 rounded-xl text-white font-medium"
                style={{ backgroundColor: '#FE5E41' }}
              >
                Register Vehicle
              </motion.button>
            </motion.div>
          )}
        </div>

        {/* Alerts Section */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">{t('recentActivity')}</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={onViewReports}
              className="text-sm font-medium hover:underline"
              style={{ color: '#D8F1A0' }}
            >
              <BarChart3 className="w-4 h-4 inline mr-1" />
              View Reports
            </motion.button>
          </div>

          <div className="space-y-4">
            {alerts.slice(0, 5).map((alert, index) => (
              <motion.div
                key={alert._id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AlertCard alert={alert} />
              </motion.div>
            ))}
            
            {alerts.length === 0 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 glass rounded-xl"
              >
                <AlertTriangle className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                <p className="text-gray-300">No recent alerts</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default Dashboard