import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { 
  Car, 
  Thermometer, 
  Fuel, 
  Gauge, 
  Power,
  AlertTriangle
} from 'lucide-react'

const VehicleCard = ({ vehicle, data, onClick }) => {
  const { t } = useLanguage()
  
  const isOnline = data && new Date() - new Date(data.timestamp) < 5 * 60 * 1000 // 5 minutes
  const hasAlerts = data?.emergencyMode || data?.engineTemp > 100 || data?.fuelLevel < 10

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="glass rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:shadow-lg"
      style={{
        background: hasAlerts 
          ? 'linear-gradient(135deg, rgba(254, 94, 65, 0.2) 0%, rgba(64, 61, 88, 0.1) 100%)'
          : 'rgba(255, 255, 255, 0.1)'
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <Car className="w-8 h-8 text-white" />
          <div>
            <div className="flex items-center space-x-2 mb-1">
              <h3 className="text-lg font-semibold text-white">{vehicle.name}</h3>
              {/* Access Type Badge */}
              <span 
                className="px-2 py-1 rounded-full text-xs font-medium"
                style={{
                  backgroundColor: vehicle.accessType === 'owner' ? '#D8F1A020' : '#EFCEFA20',
                  color: vehicle.accessType === 'owner' ? '#D8F1A0' : '#EFCEFA'
                }}
              >
                {vehicle.accessType === 'owner' ? 'Owner' : 'Shared'}
              </span>
            </div>
            <p className="text-sm text-gray-300">{vehicle.model} • {vehicle.year}</p>
            {vehicle.accessType === 'shared' && vehicle.ownerInfo && (
              <p className="text-xs text-gray-400">Owner: {vehicle.ownerInfo.username}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {hasAlerts && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <AlertTriangle className="w-5 h-5" style={{ color: '#FE5E41' }} />
            </motion.div>
          )}
          <div 
            className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-400' : 'bg-gray-400'}`}
          />
        </div>
      </div>

      {data ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center space-x-2">
            <Power 
              className={`w-4 h-4 ${data.engineRunning ? 'text-green-400' : 'text-gray-400'}`} 
            />
            <span className="text-sm text-white">
              {data.engineRunning ? t('engineRunning') : t('engineStopped')}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Thermometer 
              className={`w-4 h-4 ${data.engineTemp > 100 ? 'text-red-400' : 'text-blue-400'}`} 
            />
            <span className="text-sm text-white">{data.engineTemp}°C</span>
          </div>

          <div className="flex items-center space-x-2">
            <Fuel 
              className={`w-4 h-4 ${data.fuelLevel < 10 ? 'text-red-400' : 'text-green-400'}`} 
            />
            <span className="text-sm text-white">{data.fuelLevel}%</span>
          </div>

          <div className="flex items-center space-x-2">
            <Gauge className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-white">{data.speed} km/h</span>
          </div>
        </div>
      ) : (
        <div className="text-center py-4">
          <p className="text-gray-400">No data available</p>
        </div>
      )}
    </motion.div>
  )
}

export default VehicleCard