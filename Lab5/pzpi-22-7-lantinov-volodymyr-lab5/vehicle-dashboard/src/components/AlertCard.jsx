import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { 
  AlertTriangle, 
  Thermometer, 
  Fuel, 
  ShieldAlert,
  Clock,
  X
} from 'lucide-react'

const AlertCard = ({ alert, onDismiss }) => {
  const { t } = useLanguage()

  const handleDismiss = async (e) => {
    e.stopPropagation()
    
    if (onDismiss) {
      await onDismiss(alert._id)
    }
  }

  const getAlertIcon = () => {
    switch (alert.alertType) {
      case 'ENGINE_OVERHEAT':
        return <Thermometer className="w-5 h-5" />
      case 'LOW_FUEL':
        return <Fuel className="w-5 h-5" />
      case 'EMERGENCY_MODE':
        return <ShieldAlert className="w-5 h-5" />
      default:
        return <AlertTriangle className="w-5 h-5" />
    }
  }

  const getSeverityColor = () => {
    switch (alert.severity) {
      case 'CRITICAL':
        return '#FE5E41'
      case 'HIGH':
        return '#FE5E41'
      case 'MEDIUM':
        return '#D8F1A0'
      case 'LOW':
        return '#878E88'
      default:
        return '#878E88'
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -50 }}
      className="glass rounded-xl p-4 border-l-4 group relative"
      style={{ borderLeftColor: getSeverityColor() }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3 flex-1">
          <div 
            className="p-2 rounded-full"
            style={{ backgroundColor: `${getSeverityColor()}20` }}
          >
            <div style={{ color: getSeverityColor() }}>
              {getAlertIcon()}
            </div>
          </div>
          
          <div className="flex-1">
            <p className="text-white font-medium">{alert.message}</p>
            <p className="text-sm text-gray-300">Device: {alert.deviceId}</p>
            <div className="flex items-center space-x-1 mt-1 text-xs text-gray-400">
              <Clock className="w-3 h-3" />
              <span>{new Date(alert.timestamp).toLocaleString()}</span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <div 
            className="px-2 py-1 rounded-full text-xs font-medium"
            style={{ 
              backgroundColor: `${getSeverityColor()}20`,
              color: getSeverityColor()
            }}
          >
            {alert.severity}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleDismiss}
            className="p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-white hover:bg-opacity-20"
            title="Dismiss alert"
          >
            <X className="w-4 h-4 text-gray-400 hover:text-white" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}

export default AlertCard