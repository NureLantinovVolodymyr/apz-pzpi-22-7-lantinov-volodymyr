import { useState } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useLanguage } from '../contexts/LanguageContext'
import { useVehicles } from '../hooks/useVehicles'
import Header from '../components/Header'
import Sidebar from '../components/Sidebar'
import VehicleCard from '../components/VehicleCard'
import LoadingSpinner from '../components/LoadingSpinner'
import { 
  Plus, 
  Search, 
  Filter,
  Car,
  LayoutGrid,
  List
} from 'lucide-react'
import toast from 'react-hot-toast'

const VehiclesList = () => {
  const { t } = useLanguage()
  const navigate = useNavigate()
  const { vehicles, loading, addAccess } = useVehicles() // ИСПОЛЬЗУЕМ addAccess ИЗ ХУКА
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' or 'list'
  const [filterStatus, setFilterStatus] = useState('all') // 'all', 'online', 'offline'
  const [showRegisterModal, setShowRegisterModal] = useState(false)
  const [registerForm, setRegisterForm] = useState({
    deviceId: '',
    ownerPassword: ''
  })

  const handleAddAccess = async (e) => {
    e.preventDefault()
    
    console.log('Form submitted with:', registerForm) // ОТЛАДКА
    
    if (!registerForm.deviceId || !registerForm.ownerPassword) {
      toast.error('Device ID and owner password are required')
      return
    }
    
    try {
      // ИСПОЛЬЗУЕМ МЕТОД ИЗ ХУКА, А НЕ НАПРЯМУЮ API
      await addAccess(registerForm)
      setShowRegisterModal(false)
      setRegisterForm({
        deviceId: '',
        ownerPassword: ''
      })
    } catch (error) {
      console.error('Add access failed:', error)
    }
  }

  const filteredVehicles = vehicles.filter(vehicle => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.deviceId.toLowerCase().includes(searchTerm.toLowerCase())
    
    if (filterStatus === 'all') return matchesSearch
    
    const isOnline = vehicle.latestData && 
      new Date() - new Date(vehicle.latestData.timestamp) < 5 * 60 * 1000
    
    if (filterStatus === 'online') return matchesSearch && isOnline
    if (filterStatus === 'offline') return matchesSearch && !isOnline
    
    return matchesSearch
  })

  if (loading) {
    return <LoadingSpinner />
  }

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
                  {t('vehicles')} 🚗
                </h1>
                <p className="text-gray-300">
                  Manage your fleet of vehicles
                </p>
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowRegisterModal(true)}
                className="flex items-center space-x-2 px-6 py-3 rounded-xl text-white font-medium"
                style={{ backgroundColor: '#FE5E41' }}
              >
                <Plus className="w-5 h-5" />
                <span>Add Device Access</span>
              </motion.button>
            </div>

            {/* Filters and Search */}
            <div className="glass rounded-2xl p-6 mb-8">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  {/* Search */}
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search vehicles..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10 pr-4 py-3 rounded-xl glass border-0 text-white placeholder-gray-300 focus:ring-2 focus:ring-coral outline-none w-full"
                      style={{ backgroundColor: 'rgba(64, 61, 88, 0.3)' }}
                    />
                  </div>

                  {/* Status Filter */}
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-3 rounded-xl glass border-0 text-white outline-none"
                    style={{ backgroundColor: 'rgba(64, 61, 88, 0.3)' }}
                  >
                    <option value="all">All Status</option>
                    <option value="online">Online</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>

                {/* View Mode Toggle */}
                <div className="flex items-center space-x-2 p-1 rounded-xl glass">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid' 
                        ? 'text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    style={viewMode === 'grid' ? { backgroundColor: '#FE5E41' } : {}}
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list' 
                        ? 'text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                    style={viewMode === 'list' ? { backgroundColor: '#FE5E41' } : {}}
                  >
                    <List className="w-5 h-5" />
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Vehicles List */}
            {filteredVehicles.length > 0 ? (
              <div className={`grid gap-6 ${
                viewMode === 'grid' 
                  ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' 
                  : 'grid-cols-1'
              }`}>
                {filteredVehicles.map((vehicle, index) => (
                  <motion.div
                    key={vehicle._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <VehicleCard
                      vehicle={vehicle}
                      data={vehicle.latestData}
                      onClick={() => navigate(`/vehicle/${vehicle.deviceId}`)}
                    />
                  </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-16 glass rounded-2xl"
              >
                <Car className="w-20 h-20 mx-auto mb-6 text-gray-400" />
                <h3 className="text-2xl font-semibold text-white mb-3">
                  {searchTerm || filterStatus !== 'all' ? 'No vehicles found' : 'No devices added'}
                </h3>
                <p className="text-gray-300 mb-6">
                  {searchTerm || filterStatus !== 'all' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Add access to an existing device to start monitoring'
                  }
                </p>
                {(!searchTerm && filterStatus === 'all') && (
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowRegisterModal(true)}
                    className="px-8 py-4 rounded-xl text-white font-medium"
                    style={{ backgroundColor: '#FE5E41' }}
                  >
                    Add Your First Device
                  </motion.button>
                )}
              </motion.div>
            )}
          </motion.div>

          {/* Add Device Access Modal */}
          {showRegisterModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-2xl p-8 w-full max-w-md"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Add Device Access</h2>
                <p className="text-gray-300 text-sm mb-6">
                  Get access to an existing device by providing its ID and the owner's password.
                </p>
                
                <form onSubmit={handleAddAccess} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Device ID *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Enter device ID to add access"
                      value={registerForm.deviceId}
                      onChange={(e) => setRegisterForm({...registerForm, deviceId: e.target.value})}
                      className="w-full p-3 rounded-xl glass border-0 text-white placeholder-gray-300 focus:ring-2 focus:ring-coral outline-none"
                      style={{ backgroundColor: 'rgba(64, 61, 88, 0.3)' }}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-white">
                      Owner's Password *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="Enter password of device owner"
                      value={registerForm.ownerPassword}
                      onChange={(e) => setRegisterForm({...registerForm, ownerPassword: e.target.value})}
                      className="w-full p-3 rounded-xl glass border-0 text-white placeholder-gray-300 focus:ring-2 focus:ring-coral outline-none"
                      style={{ backgroundColor: 'rgba(64, 61, 88, 0.3)' }}
                    />
                    <p className="text-xs text-gray-400 mt-1">
                      You need the password of the person who owns this device
                    </p>
                  </div>

                  <div className="flex space-x-4 pt-4">
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => {
                        setShowRegisterModal(false)
                        setRegisterForm({
                          deviceId: '',
                          ownerPassword: ''
                        })
                      }}
                      className="flex-1 py-3 rounded-xl font-medium text-gray-300 hover:text-white hover:bg-white hover:bg-opacity-10 transition-colors"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      className="flex-1 py-3 rounded-xl font-medium text-white"
                      style={{ backgroundColor: '#FE5E41' }}
                    >
                      Add Access
                    </motion.button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}

export default VehiclesList