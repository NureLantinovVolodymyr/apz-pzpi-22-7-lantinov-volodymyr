import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../hooks/useAuth'
import { useLanguage } from '../contexts/LanguageContext'
import { Car, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const { t, language, toggleLanguage } = useLanguage()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await login(formData)
      toast.success(t('loginSuccess'))
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass rounded-3xl p-8 w-full max-w-md"
      >
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center space-x-3">
            <Car className="w-8 h-8" style={{ color: '#FE5E41' }} />
            <h1 className="text-2xl font-bold text-white">VehicleOS</h1>
          </div>
          <button
            onClick={toggleLanguage}
            className="p-2 rounded-full glass hover:bg-white hover:bg-opacity-20 transition-colors"
          >
            <Globe className="w-5 h-5 text-white" />
            <span className="ml-1 text-sm text-white">{language.toUpperCase()}</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#EFCEFA' }}>
              {t('email')}
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 rounded-xl glass border-0 text-white placeholder-gray-300 focus:ring-2 focus:ring-coral outline-none"
              style={{ backgroundColor: 'rgba(64, 61, 88, 0.3)' }}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#EFCEFA' }}>
              {t('password')}
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-3 rounded-xl glass border-0 text-white placeholder-gray-300 focus:ring-2 focus:ring-coral outline-none"
              style={{ backgroundColor: 'rgba(64, 61, 88, 0.3)' }}
              placeholder="Enter your password"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50"
            style={{ backgroundColor: '#FE5E41' }}
          >
            {loading ? 'Signing in...' : t('login')}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-gray-300">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-medium hover:underline"
            style={{ color: '#D8F1A0' }}
          >
            {t('register')}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Login