import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../contexts/LanguageContext'
import { useVehicles } from '../hooks/useVehicles'
import { Car, Globe, LogOut, User, Bell, X } from 'lucide-react'
import AlertCard from './AlertCard'

const Header = () => {
  const { user, logout } = useAuth()
  const { t, language, toggleLanguage } = useLanguage()
  const { alerts, dismissAlert } = useVehicles()
  const [showNotifications, setShowNotifications] = useState(false)

  const unreadAlerts = alerts.filter(alert => !alert.dismissed)

  return (
    <>
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="glass border-b border-white border-opacity-20 p-4 relative z-50"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Car className="w-8 h-8" style={{ color: '#FE5E41' }} />
            <h1 className="text-2xl font-bold text-white">VehicleOS</h1>
          </div>

          <div className="flex items-center space-x-4">
            {/* Notification Button */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 rounded-full glass hover:bg-white hover:bg-opacity-20 transition-colors relative"
              >
                <Bell className="w-5 h-5 text-white" />
                {unreadAlerts.length > 0 && (
                  <span 
                    className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs font-bold text-white flex items-center justify-center"
                    style={{ backgroundColor: '#FE5E41' }}
                  >
                    {unreadAlerts.length > 9 ? '9+' : unreadAlerts.length}
                  </span>
                )}
              </motion.button>

              {/* Notifications Dropdown */}
              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 top-full mt-2 w-96 rounded-2xl border border-white border-opacity-80 shadow-lg overflow-hidden bg-white bg-opacity-50 z-50"
                  >
                    <div className="p-4 border-b border-white border-opacity-10">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-white">
                          Notifications ({unreadAlerts.length})
                        </h3>
                        <button
                          onClick={() => setShowNotifications(false)}
                          className="p-1 rounded-full hover:bg-white hover:bg-opacity-20 transition-colors"
                        >
                          <X className="w-4 h-4 text-gray-400" />
                        </button>
                      </div>
                    </div>
                    
                    <div className="max-h-96 overflow-y-auto">
                      {unreadAlerts.length > 0 ? (
                        <div className="p-4 space-y-3">
                          {unreadAlerts.slice(0, 5).map((alert) => (
                            <AlertCard 
                              key={alert._id} 
                              alert={alert} 
                              onDismiss={(alertId) => {
                                dismissAlert(alertId)
                                if (unreadAlerts.length === 1) {
                                  setShowNotifications(false)
                                }
                              }}
                            />
                          ))}
                          {unreadAlerts.length > 5 && (
                            <p className="text-center text-gray-400 text-sm">
                              And {unreadAlerts.length - 5} more alerts...
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <Bell className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                          <p className="text-gray-300">No new notifications</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleLanguage}
              className="p-2 rounded-full glass hover:bg-white hover:bg-opacity-20 transition-colors flex items-center space-x-2"
            >
              <Globe className="w-5 h-5 text-white" />
              <span className="text-sm text-white">{language.toUpperCase()}</span>
            </motion.button>

            <div className="flex items-center space-x-3 px-3 py-2 rounded-full glass">
              <User className="w-5 h-5 text-white" />
              <span className="text-white font-medium">{user?.username}</span>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="p-2 rounded-full glass hover:bg-red-500 hover:bg-opacity-20 transition-colors"
            >
              <LogOut className="w-5 h-5 text-white" />
            </motion.button>
          </div>
        </div>
      </motion.header>

      {/* Overlay to close notifications */}
      {showNotifications && (
        <div 
          className="fixed inset-0 z-40" 
          onClick={() => setShowNotifications(false)}
        />
      )}
    </>
  )
}

export default Header