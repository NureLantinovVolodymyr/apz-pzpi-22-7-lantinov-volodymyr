import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  Alert,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  Warehouse as WarehouseIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon,
  
} from '@mui/icons-material';
import api from '../../services/api';
import LockIcon from '@mui/icons-material/Lock';
interface Rental {
  id: string;
  warehouseId: string;
  warehouseName: string;
  startDate: string;
  endDate: string;
  totalAmount: number;
  status: 'active' | 'completed' | 'cancelled';
  paymentStatus: 'pending' | 'paid' | 'refunded';
  createdAt: string;
}
import { useTranslation } from 'react-i18next';
const RentalDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rental, setRental] = useState<Rental | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const { t } = useTranslation();

  useEffect(() => {
    fetchRentalDetails();
  }, [id]);

  const fetchRentalDetails = async () => {
    try {
      const response = await api.get(`/users/my_rents/${id}`);
      setRental(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch rental details');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!rental) return;

    setCancelling(true);
    setError('');

    try {
      await api.post(`/rentals/${id}/cancel`);
      fetchRentalDetails();
      setCancelDialogOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel rental');
    } finally {
      setCancelling(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };



  // Helper function to safely capitalize strings
  const capitalizeString = (str: string | undefined | null): string => {
    if (!str) return 'Unknown';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // if (loading) {
  //   return (
  //     <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
  //       <CircularProgress />
  //     </Box>
  //   );
  // }

  if (!rental) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Rental not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4" component="h1">
            {t('rental_details')}
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Chip
              label={capitalizeString(rental.status)}
              color={getStatusColor(rental.status || '')}
            />

          </Box>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Paper elevation={2} sx={{ p: 3 }}>
              <Typography variant="h6" gutterBottom>
                {t('rental_info')}
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <WarehouseIcon sx={{ mr: 1 }} />
                <Typography>
                 {t('warehouse_name')}: {rental.warehouse_name || 'Unknown'}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <CalendarIcon sx={{ mr: 1 }} />
                <Typography>
                  {t('period')}: {new Date(rental.start_date).toLocaleDateString()} - {new Date(rental.end_date).toLocaleDateString()}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MoneyIcon sx={{ mr: 1 }} />
                <Typography>
                  {t('total_price')}: ${(rental.total_price || 0).toFixed(2)}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LockIcon sx={{ mr: 1 }} />
                <Typography>
                  {t('access_code')}: {rental.code }
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                 {t('selected_services')}
                </Typography>
                {rental.services && rental.services.length > 0 ? (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {rental.services.map((service, index: number) => (
                      <Chip 
                        key={`${service.name}-${index}`} 
                        label={`${service.name} - $${service.price.toFixed(2)}`}
                        variant="outlined"
                      />
                    ))}
                  </Box>
                ) : (
                  <Typography>{t('no_addition_service_selected')}</Typography>
                )}
              </Box>
              {/* <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <ReceiptIcon sx={{ mr: 1 }} />
                <Typography>
                  Created: {new Date(rental.created_at).toLocaleString()}
                </Typography>
              </Box> */}
            </Paper>
          </Grid>

      
        </Grid>
      </Paper>

      <Dialog open={cancelDialogOpen} onClose={() => setCancelDialogOpen(false)}>
        <DialogTitle>Cancel Rental</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to cancel this rental? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCancelDialogOpen(false)}>No, Keep It</Button>
          <Button
            onClick={handleCancel}
            color="error"
            variant="contained"
            disabled={cancelling}
          >
            {cancelling ? 'Cancelling...' : 'Yes, Cancel Rental'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default RentalDetails;