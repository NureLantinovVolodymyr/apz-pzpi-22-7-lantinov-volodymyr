import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { analyticsAPI, vehicleAPI } from '../services/api'
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
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts'
import { 
  Users, 
  Car, 
  AlertTriangle, 
  Activity,
  TrendingUp,
  Database,
  Shield,
  Settings,
  UserPlus,
  Trash2,
  Edit,
  Search
} from 'lucide-react'
import toast from 'react-hot-toast'

const AdminPanel = () => {
  const { t } = useLanguage()
  const [adminStats, setAdminStats] = useState(null)
  const [users, setUsers] = useState([])
  const [vehicles, setVehicles] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    try {
      const [statsRes, vehiclesRes] = await Promise.all([
        analyticsAPI.getAdminStats(),
        vehicleAPI.getVehicles()
      ])
      
      setAdminStats(statsRes.data)
      setVehicles(vehiclesRes.data)
      
      // Mock users data (you would get this from a real API)
      setUsers([
        { id: 1, username: 'admin', email: 'admin@example.com', role: 'admin', status: 'active', vehicles: 2 },
        { id: 2, username: 'user1', email: 'user1@example.com', role: 'user', status: 'active', vehicles: 1 },
        { id: 3, username: 'user2', email: 'user2@example.com', role: 'user', status: 'inactive', vehicles: 0 }
      ])
    } catch (error) {
      console.error('Error fetching admin data:', error)
      toast.error('Failed to load admin data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const overviewStats = [
    {
      title: 'Total Users',
      value: users.length,
      icon: Users,
      color: '#D8F1A0',
      change: '+12%'
    },
    {
      title: t('totalVehicles'),
      value: adminStats?.totalVehicles || 0,
      icon: Car,
      color: '#FE5E41',
      change: '+8%'
    },
    {
      title: t('activeVehicles'),
      value: adminStats?.activeVehicles || 0,
      icon: Activity,
      color: '#EFCEFA',
      change: '+5%'
    },
    {
      title: 'Total Alerts',
      value: adminStats?.totalAlerts || 0,
      icon: AlertTriangle,
      color: '#878E88',
      change: '-3%'
    }
  ]

  const chartData = [
    { name: 'Mon', users: 12, vehicles: 8, alerts: 3 },
    { name: 'Tue', users: 15, vehicles: 12, alerts: 5 },
    { name: 'Wed', users: 8, vehicles: 15, alerts: 2 },
    { name: 'Thu', users: 20, vehicles: 18, alerts: 7 },
    { name: 'Fri', users: 25, vehicles: 22, alerts: 4 },
    { name: 'Sat', users: 18, vehicles: 16, alerts: 6 },
    { name: 'Sun', users: 14, vehicles: 10, alerts: 1 }
  ]

  const pieData = [
    { name: 'Active Users', value: users.filter(u => u.status === 'active').length, color: '#D8F1A0' },
    { name: 'Inactive Users', value: users.filter(u => u.status === 'inactive').length, color: '#878E88' }
  ]

  const filteredUsers = users.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'users', label: t('userManagement'), icon: Users },
    { id: 'vehicles', label: 'Vehicle Management', icon: Car },
    { id: 'system', label: 'System Settings', icon: Settings }
  ]

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
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">
                  {t('admin')} 🛡️
                </h1>
                <p className="text-gray-300">
                  System administration and user management
                </p>
              </div>
              
              <div className="flex items-center space-x-3">
                <Shield className="w-8 h-8" style={{ color: '#FE5E41' }} />
                <span className="text-white font-medium">Admin Mode</span>
              </div>
            </div>

            {/* Tabs */}
            <div className="glass rounded-2xl p-2 mb-8">
              <div className="flex space-x-2">
                {tabs.map(tab => (
                  <motion.button
                    key={tab.id}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'text-white'
                        : 'text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10'
                    }`}
                    style={activeTab === tab.id ? { backgroundColor: '#FE5E41' } : {}}
                  >
                    <tab.icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-8"
              >
                {/* Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {overviewStats.map((stat, index) => (
                    <motion.div
                      key={stat.title}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="glass rounded-2xl p-6"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div 
                          className="p-3 rounded-full"
                          style={{ backgroundColor: `${stat.color}20` }}
                        >
                          <stat.icon 
                            className="w-6 h-6" 
                            style={{ color: stat.color }} 
                          />
                        </div>
                        <span 
                          className="text-sm font-medium"
                          style={{ color: stat.change.startsWith('+') ? '#D8F1A0' : '#FE5E41' }}
                        >
                          {stat.change}
                        </span>
                      </div>
                      <p className="text-gray-300 text-sm mb-1">{stat.title}</p>
                      <p className="text-3xl font-bold text-white">{stat.value}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Charts */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className="glass rounded-2xl p-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-4">Weekly Activity</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#403D58" />
                        <XAxis dataKey="name" stroke="#878E88" />
                        <YAxis stroke="#878E88" />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#403D58', 
                            border: '1px solid #878E88',
                            borderRadius: '12px'
                          }} 
                        />
                        <Bar dataKey="users" fill="#D8F1A0" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="vehicles" fill="#FE5E41" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="alerts" fill="#EFCEFA" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="glass rounded-2xl p-6"
                  >
                    <h3 className="text-xl font-bold text-white mb-4">User Distribution</h3>
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={pieData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={120}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {pieData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: '#403D58', 
                            border: '1px solid #878E88',
                            borderRadius: '12px'
                          }} 
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center space-x-6 mt-4">
                      {pieData.map((item, index) => (
                        <div key={index} className="flex items-center space-x-2">
                          <div 
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <span className="text-sm text-gray-300">{item.name}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                {/* Search and Actions */}
                <div className="flex justify-between items-center">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search users..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-3 rounded-xl glass border-0 text-white placeholder-gray-300 focus:ring-2 focus:ring-coral outline-none w-80"
                      style={{ backgroundColor: 'rgba(64, 61, 88, 0.3)' }}
                    />
                  </div>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white font-medium"
                    style={{ backgroundColor: '#FE5E41' }}
                  >
                    <UserPlus className="w-5 h-5" />
                    <span>Add User</span>
                  </motion.button>
                </div>

                {/* Users Table */}
                <div className="glass rounded-2xl overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-white border-opacity-10">
                          <th className="text-left p-6 text-gray-300 font-medium">User</th>
                          <th className="text-left p-6 text-gray-300 font-medium">Email</th>
                          <th className="text-left p-6 text-gray-300 font-medium">Role</th>
                          <th className="text-left p-6 text-gray-300 font-medium">Status</th>
                          <th className="text-left p-6 text-gray-300 font-medium">Vehicles</th>
                          <th className="text-left p-6 text-gray-300 font-medium">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredUsers.map((user, index) => (
                          <motion.tr
                            key={user.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="border-b border-white border-opacity-5 hover:bg-white hover:bg-opacity-5 transition-colors"
                          >
                            <td className="p-6">
                              <div className="flex items-center space-x-3">
                                <div 
                                  className="w-10 h-10 rounded-full flex items-center justify-center"
                                  style={{ backgroundColor: '#D8F1A020' }}
                                >
                                  <span className="text-white font-medium">
                                    {user.username.charAt(0).toUpperCase()}
                                  </span>
                                </div>
                                <span className="text-white font-medium">{user.username}</span>
                              </div>
                            </td>
                            <td className="p-6 text-gray-300">{user.email}</td>
                            <td className="p-6">
                              <span 
                                className="px-3 py-1 rounded-full text-sm font-medium"
                                style={{
                                  backgroundColor: user.role === 'admin' ? '#FE5E4120' : '#D8F1A020',
                                  color: user.role === 'admin' ? '#FE5E41' : '#D8F1A0'
                                }}
                              >
                                {user.role}
                              </span>
                            </td>
                            <td className="p-6">
                              <span 
                                className="px-3 py-1 rounded-full text-sm font-medium"
                                style={{
                                  backgroundColor: user.status === 'active' ? '#D8F1A020' : '#878E8820',
                                  color: user.status === 'active' ? '#D8F1A0' : '#878E88'
                                }}
                              >
                                {user.status}
                              </span>
                            </td>
                            <td className="p-6 text-white">{user.vehicles}</td>
                            <td className="p-6">
                              <div className="flex items-center space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-2 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors"
                                >
                                  <Edit className="w-4 h-4 text-gray-400 hover:text-white" />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="p-2 rounded-lg hover:bg-red-500 hover:bg-opacity-20 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-400" />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Vehicles Tab */}
            {activeTab === 'vehicles' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">All Vehicles</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {vehicles.map((vehicle, index) => (
                      <motion.div
                        key={vehicle._id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="p-4 rounded-xl"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
                      >
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-semibold text-white">{vehicle.name}</h4>
                          <div className={`w-3 h-3 rounded-full ${
                            vehicle.status === 'active' ? 'bg-green-400' : 'bg-gray-400'
                          }`} />
                        </div>
                        <p className="text-sm text-gray-300 mb-2">{vehicle.model} • {vehicle.year}</p>
                        <p className="text-xs text-gray-400">Device: {vehicle.deviceId}</p>
                        <p className="text-xs text-gray-400">Last seen: {new Date(vehicle.lastSeen).toLocaleString()}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* System Tab */}
            {activeTab === 'system' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="space-y-6"
              >
                <div className="glass rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">System Configuration</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <div>
                        <h4 className="font-medium text-white">MQTT Broker Status</h4>
                        <p className="text-sm text-gray-300">broker.hivemq.com</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full" />
                        <span className="text-green-400 text-sm">Connected</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <div>
                        <h4 className="font-medium text-white">Database Status</h4>
                        <p className="text-sm text-gray-300">MongoDB Atlas</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full" />
                        <span className="text-green-400 text-sm">Connected</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                      <div>
                        <h4 className="font-medium text-white">AI Service</h4>
                        <p className="text-sm text-gray-300">Google Gemini API</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-400 rounded-full" />
                        <span className="text-green-400 text-sm">Available</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="glass rounded-2xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4">System Metrics</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <Database className="w-8 h-8 mx-auto mb-2" style={{ color: '#D8F1A0' }} />
                      <p className="text-2xl font-bold text-white">99.9%</p>
                      <p className="text-sm text-gray-300">Uptime</p>
                    </div>
                    <div className="text-center">
                      <Activity className="w-8 h-8 mx-auto mb-2" style={{ color: '#FE5E41' }} />
                      <p className="text-2xl font-bold text-white">45ms</p>
                      <p className="text-sm text-gray-300">Avg Response</p>
                    </div>
                    <div className="text-center">
                      <TrendingUp className="w-8 h-8 mx-auto mb-2" style={{ color: '#EFCEFA' }} />
                      <p className="text-2xl font-bold text-white">2.1GB</p>
                      <p className="text-sm text-gray-300">Data Storage</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </motion.div>
        </main>
      </div>
    </div>
  )
}

export default AdminPanel