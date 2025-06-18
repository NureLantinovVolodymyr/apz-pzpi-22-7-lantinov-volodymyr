import { useState, useEffect, useCallback } from 'react'
import { vehicleAPI, analyticsAPI, alertAPI } from '../services/api'
import toast from 'react-hot-toast'

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState([])
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  const fetchVehicles = useCallback(async () => {
    try {
      const [dashboardRes, alertsRes] = await Promise.all([
        analyticsAPI.getDashboard(),
        alertAPI.getAlerts({ dismissed: 'false', limit: 20 }) // ИСПОЛЬЗУЕМ НОВЫЙ API
      ])
      
      setVehicles(dashboardRes.data.vehicles)
      setAlerts(alertsRes.data) // АЛЕРТЫ ИЗ ОТДЕЛЬНОГО API
    } catch (error) {
      console.error('Error fetching vehicles:', error)
      toast.error('Failed to load vehicles')
    } finally {
      setLoading(false)
    }
  }, [])

  const sendCommand = async (deviceId, command) => {
    try {
      await vehicleAPI.sendCommand(deviceId, command)
      toast.success(`Command sent: ${command}`)
      setTimeout(fetchVehicles, 2000)
    } catch (error) {
      toast.error('Failed to send command')
    }
  }

  const registerVehicle = async (vehicleData) => {
    try {
      await vehicleAPI.registerVehicle(vehicleData)
      toast.success('Vehicle registered successfully')
      fetchVehicles()
    } catch (error) {
      toast.error('Failed to register vehicle')
      throw error
    }
  }

  const addAccess = async (accessData) => {
    try {
      await vehicleAPI.addAccess(accessData)
      toast.success('Access granted! Device added to your account.')
      fetchVehicles()
    } catch (error) {
      toast.error('Failed to add device access')
      throw error
    }
  }

  const dismissAlert = useCallback(async (alertId) => {
    try {
      await alertAPI.dismissAlert(alertId)
      setAlerts(prev => prev.filter(alert => alert._id !== alertId))
      toast.success('Alert dismissed')
    } catch (error) {
      toast.error('Failed to dismiss alert')
    }
  }, [])

  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles])

  return {
    vehicles,
    alerts,
    loading,
    refetch: fetchVehicles,
    sendCommand,
    registerVehicle,
    addAccess,
    dismissAlert
  }
}