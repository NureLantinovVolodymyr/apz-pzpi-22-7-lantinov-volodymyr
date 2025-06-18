import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Login from './pages/Login'
import Register from './pages/Register'
import UserDashboard from './pages/UserDashboard'
import AdminPanel from './pages/AdminPanel'
import WeeklyReport from './pages/WeeklyReport'
import VehicleDetails from './pages/VehicleDetails'
import VehiclesList from './pages/VehiclesList' 
import LoadingSpinner from './components/LoadingSpinner'

function App() {
  const { user, loading } = useAuth()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="min-h-screen">
      <Routes>
        <Route 
          path="/login" 
          element={!user ? <Login /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/register" 
          element={!user ? <Register /> : <Navigate to="/dashboard" />} 
        />
        <Route 
          path="/dashboard" 
          element={user ? <UserDashboard /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/vehicles" 
          element={user ? <VehiclesList /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/vehicle/:deviceId" 
          element={user ? <VehicleDetails /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/reports" 
          element={user ? <WeeklyReport /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/admin" 
          element={user?.role === 'admin' ? <AdminPanel /> : <Navigate to="/dashboard" />} 
        />
        <Route path="/" element={<Navigate to="/dashboard" />} />
      </Routes>
    </div>
  )
}

export default App