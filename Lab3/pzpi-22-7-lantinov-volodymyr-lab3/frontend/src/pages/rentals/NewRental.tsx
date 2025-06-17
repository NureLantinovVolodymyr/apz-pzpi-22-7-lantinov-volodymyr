import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Divider,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

interface Warehouse {
  id: number;
  name: string;
  location: string;
  price_per_day: number;
  busy_dates: string[];
}

interface PremiumService {
  id: number;
  name: string;
  description: string;
  price: number;
}

const NewRental = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
    console.log('All search params:', Object.fromEntries(searchParams));
  console.log('Raw searchParams:', searchParams);
  console.log('URL:', window.location.href);
  const warehouseId = new URLSearchParams(window.location.search).get('warehouse');

  console.log(warehouseId);

  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [services, setServices] = useState<PremiumService[]>([]);
  const [selectedServices, setSelectedServices] = useState<number[]>([]);
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (warehouseId) {
      fetchWarehouseDetails();
      fetchWarehouseServices();
    }
  }, [warehouseId]);

  const fetchWarehouseDetails = async () => {
    try {
      const response = await api.get(`/warehouses/${warehouseId}`);
      setWarehouse(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch warehouse details');
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouseServices = async () => {
    try {
      const response = await api.get(`/services/warehouse-services/${warehouseId}`);
      setServices(response.data);
    } catch (err: any) {
      console.error('Failed to fetch premium services:', err);
    }
  };

  const handleServiceChange = (serviceId: number) => {
    setSelectedServices(prev => {
      if (prev.includes(serviceId)) {
        return prev.filter(id => id !== serviceId);
      } else {
        return [...prev, serviceId];
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !warehouseId) return;

    setSubmitting(true);
    setError('');

    try {
      const response = await api.post(`/rent/${warehouseId}`, {
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
        selected_services: selectedServices
      });
      
      if (response.data.message === "Warehouse reserved successfully") {
        navigate('/rentals');
      } else {
        setError('Failed to create rental');
      }
    } catch (err: any) {
      setError(err.response?.data?.detail || 'Failed to create rental');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (!warehouse) {
    return (
      <Container maxWidth="sm" sx={{ mt: 4 }}>
        <Alert severity="error">Warehouse not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper sx={{ p: 4 }}>
        <Typography variant="h5" component="h1" align="center" gutterBottom>
          {t('new_rental')}
        </Typography>

        <Typography variant="h6" gutterBottom>
          {warehouse.name}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Location: {warehouse.location}
        </Typography>
        <Typography variant="body1" color="text.secondary" gutterBottom>
          Price: ${warehouse.price_per_day.toFixed(2)}/day
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mt: 2, mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 3 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <Box sx={{ mb: 3 }}>
              <DatePicker
                label={t('start_date')}
                value={startDate}
                onChange={(newValue) => setStartDate(newValue)}
                minDate={new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </Box>

            <Box sx={{ mb: 3 }}>
              <DatePicker
                label={t('end_date')}
                value={endDate}
                onChange={(newValue) => setEndDate(newValue)}
                minDate={startDate || new Date()}
                slotProps={{
                  textField: {
                    fullWidth: true,
                    required: true,
                  },
                }}
              />
            </Box>
          </LocalizationProvider>

          {services.length > 0 && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" gutterBottom>
                {t('premium_services')}
              </Typography>
              <FormGroup>
                {services.map((service) => (
                  <FormControlLabel
                    key={service.id}
                    control={
                      <Checkbox
                        checked={selectedServices.includes(service.id)}
                        onChange={() => handleServiceChange(service.id)}
                      />
                    }
                    label={
                      <Box>
                        <Typography variant="subtitle1">
                          {service.name} - ${service.price.toFixed(2)}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {service.description}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </FormGroup>
            </>
          )}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            size="large"
            disabled={submitting || !startDate || !endDate}
            sx={{ mt: 3 }}
          >
            {submitting ? t('creating_rental') : t('create_rental')}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default NewRental; 