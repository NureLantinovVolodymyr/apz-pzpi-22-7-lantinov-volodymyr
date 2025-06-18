import { motion } from 'framer-motion'
import { NavLink } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useAuth } from '../hooks/useAuth'
import { 
  LayoutDashboard, 
  Car, 
  FileText, 
  Settings,
  Shield
} from 'lucide-react'

const Sidebar = () => {
  const { t } = useLanguage()
  const { user } = useAuth()

  const navItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/vehicles', icon: Car, label: t('vehicles') }, // ЭТОТ РОУТ ТЕПЕРЬ СУЩЕСТВУЕТ
    { to: '/reports', icon: FileText, label: t('reports') },
    ...(user?.role === 'admin' ? [
      { to: '/admin', icon: Shield, label: t('admin') }
    ] : [])
  ]

  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="w-64 glass border-r border-white border-opacity-20 p-6"
    >
      <nav className="space-y-2">
        {navItems.map((item, index) => (
          <motion.div
            key={item.to}
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 * index }}
          >
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                `flex items-center space-x-3 p-3 rounded-xl transition-colors ${
                  isActive
                    ? 'text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                }`
              }
              style={({ isActive }) => isActive ? { backgroundColor: '#FE5E41' } : {}}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 p-4 rounded-xl glass"
        style={{ backgroundColor: 'rgba(216, 241, 160, 0.1)' }}
      >
        <h3 className="text-sm font-semibold mb-2" style={{ color: '#D8F1A0' }}>
          System Status
        </h3>
        <div className="space-y-2 text-sm text-gray-300">
          <div className="flex justify-between">
            <span>Connection:</span>
            <span className="text-green-400">●</span>
          </div>
          <div className="flex justify-between">
            <span>MQTT:</span>
            <span className="text-green-400">●</span>
          </div>
        </div>
      </motion.div>
    </motion.aside>
  )
}

export default Sidebar