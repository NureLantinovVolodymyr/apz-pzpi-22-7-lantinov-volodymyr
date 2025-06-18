import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useLanguage } from '../contexts/LanguageContext'
import { Car, Globe, User, Mail, Lock } from 'lucide-react'
import { authService } from '../services/auth'
import toast from 'react-hot-toast'

const Register = () => {
  const [formData, setFormData] = useState({ 
    username: '', 
    email: '', 
    password: '',
    confirmPassword: ''
  })
  const [loading, setLoading] = useState(false)
  const { t, language, toggleLanguage } = useLanguage()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match')
      return
    }

    setLoading(true)
    
    try {
      await authService.register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      })
      toast.success('Registration successful! Please login.')
      navigate('/login')
    } catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#EFCEFA' }}>
              <User className="w-4 h-4 inline mr-2" />
              {t('username')}
            </label>
            <input
              type="text"
              required
              value={formData.username}
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              className="w-full p-3 rounded-xl glass border-0 text-white placeholder-gray-300 focus:ring-2 focus:ring-coral outline-none"
              style={{ backgroundColor: 'rgba(64, 61, 88, 0.3)' }}
              placeholder="Enter username"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#EFCEFA' }}>
              <Mail className="w-4 h-4 inline mr-2" />
              {t('email')}
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className="w-full p-3 rounded-xl glass border-0 text-white placeholder-gray-300 focus:ring-2 focus:ring-coral outline-none"
              style={{ backgroundColor: 'rgba(64, 61, 88, 0.3)' }}
              placeholder="Enter email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#EFCEFA' }}>
              <Lock className="w-4 h-4 inline mr-2" />
              {t('password')}
            </label>
            <input
              type="password"
              required
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className="w-full p-3 rounded-xl glass border-0 text-white placeholder-gray-300 focus:ring-2 focus:ring-coral outline-none"
              style={{ backgroundColor: 'rgba(64, 61, 88, 0.3)' }}
              placeholder="Enter password"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: '#EFCEFA' }}>
              <Lock className="w-4 h-4 inline mr-2" />
              Confirm Password
            </label>
            <input
              type="password"
              required
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              className="w-full p-3 rounded-xl glass border-0 text-white placeholder-gray-300 focus:ring-2 focus:ring-coral outline-none"
              style={{ backgroundColor: 'rgba(64, 61, 88, 0.3)' }}
              placeholder="Confirm password"
            />
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full p-3 rounded-xl font-semibold text-white transition-colors disabled:opacity-50 mt-6"
            style={{ backgroundColor: '#FE5E41' }}
          >
            {loading ? 'Creating account...' : t('register')}
          </motion.button>
        </form>

        <p className="mt-6 text-center text-gray-300">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-medium hover:underline"
            style={{ color: '#D8F1A0' }}
          >
            {t('login')}
          </Link>
        </p>
      </motion.div>
    </div>
  )
}

export default Register