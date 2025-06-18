import axios from 'axios'
import toast from 'react-hot-toast'

const API_BASE_URL = 'http://localhost:3001/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    
    const message = error.response?.data?.message || 'An error occurred'
    toast.error(message)
    
    return Promise.reject(error)
  }
)

export const vehicleAPI = {
  getVehicles: () => api.get('/vehicles'),
  registerVehicle: (data) => api.post('/vehicles/register', data),
  addAccess: (data) => api.post('/vehicles/add-access', data),
  getVehicleData: (deviceId, params) => api.get(`/vehicles/${deviceId}/data`, { params }),
  sendCommand: (deviceId, command) => api.post(`/vehicles/${deviceId}/command`, { command }),
  getRecommendations: (deviceId) => api.get(`/vehicles/${deviceId}/recommendations`)
}

export const alertAPI = {
  getAlerts: (params) => api.get('/alerts', { params }),
  getAlert: (alertId) => api.get(`/alerts/${alertId}`),
  dismissAlert: (alertId) => api.patch(`/alerts/${alertId}/dismiss`),
  resolveAlert: (alertId) => api.patch(`/alerts/${alertId}/resolve`)
}

export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getAdminStats: () => api.get('/analytics/admin')
}

export default api