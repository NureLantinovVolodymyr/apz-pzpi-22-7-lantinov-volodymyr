import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { Provider } from 'react-redux';
import theme from './theme';
import store from './store';
// Layouts
import MainLayout from './layouts/MainLayout';
// Components
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ResetPassword from './pages/auth/ResetPassword';
import Warehouses from './pages/warehouses/Warehouses';
import MyWarehouses from './pages/warehouses/MyWarehouses';
import WarehouseDetails from './pages/warehouses/WarehouseDetails';
import EditWarehouse from './pages/warehouses/EditWarehouse';
import WarehouseCreation from './components/WarehouseCreation';
import Rentals from './pages/rentals/Rentals';
import RentalDetails from './pages/rentals/RentalDetails';
import NewRental from './pages/rentals/NewRental';
import Profile from './pages/profile/Profile';
import Services from './pages/services/Services';
import Messages from './pages/messages/Messages';
import Humidity from './pages/humidity/Humidity';
import Revenue from './components/Revenue';
import AdminPanel from './pages/admin/AdminPanel';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<MainLayout />}>
                <Route path="/" element={<Navigate to="/warehouses" replace />} />
                <Route path="/warehouses" element={<Warehouses />} />
                <Route path="/my-warehouses" element={<MyWarehouses />} />
                <Route path="/warehouses/create" element={<WarehouseCreation />} />
                <Route path="/warehouses/:id" element={<WarehouseDetails />} />
                <Route path="/warehouses/:id/edit" element={<EditWarehouse />} />
                <Route path="/rentals" element={<Rentals />} />
                <Route path="/rentals/new" element={<NewRental />} />
                <Route path="/rentals/:id" element={<RentalDetails />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/services" element={<Services />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="/humidity" element={<Humidity />} />
                <Route path="/revenue" element={<Revenue />} />
                <Route path="/admin" element={<AdminPanel />} />
              </Route>
            </Route>

            {/* Catch all route - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
