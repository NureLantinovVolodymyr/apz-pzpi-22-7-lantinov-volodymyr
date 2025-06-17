import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  Grid,
  Box,
  Button,
  CircularProgress,
  Alert,
  Chip,
  Divider,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { getWarehouse } from '../../api/warehouse';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface Warehouse {
  id: number;
  name: string;
  location: string;
  price_per_day: number;
  busy_dates: string[];
  is_blocked: boolean;
  owned_by: number;
}

interface PremiumService {
  id: number;
  name: string;
  description: string;
  price: number;
}

const WarehouseDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [services, setServices] = useState<PremiumService[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (id) {
      fetchWarehouseDetails();
      fetchWarehouseServices();
    }
  }, [id]);

  const fetchWarehouseDetails = async () => {
    try {
      const data = await getWarehouse(id!);
      setWarehouse(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch warehouse details');
    } finally {
      setLoading(false);
    }
  };

  const fetchWarehouseServices = async () => {
    try {
      const response = await api.get(`/services/warehouse-services/${id}`);
      setServices(response.data);
    } catch (err: any) {
      console.error('Failed to fetch premium services:', err);
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
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">Warehouse not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6, mb: 6, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <Paper elevation={3} sx={{ p: { xs: 2, sm: 4 }, width: '100%', maxWidth: 700 }}>
        <Box display="flex" flexDirection={{ xs: 'column', md: 'row' }} alignItems={{ md: 'flex-start' }} justifyContent="space-between" gap={4}>
          <Box flex={1}>
            <Typography variant="h4" component="h1" gutterBottom>
              {warehouse.name}
            </Typography>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }}>
                {error}
              </Alert>
            )}
            <Typography variant="h6" gutterBottom>
              Details
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationIcon color="action" />
                <Typography>{warehouse.location}</Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <MoneyIcon color="action" />
                <Typography>
                  Price: <b>${warehouse.price_per_day.toFixed(2)}</b>/day
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarIcon color="action" />
                <Typography>
                  Busy Dates: <b>{warehouse.busy_dates.length}</b> days
                </Typography>
              </Box>
            </Box>
            {services.length > 0 && (
              <>
                <Divider sx={{ my: 3 }} />
                <Typography variant="h6" gutterBottom>
                  Premium Services
                </Typography>
                <List>
                  {services.map((service) => (
                    <ListItem key={service.id} alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <StarIcon color="primary" fontSize="small" />
                            <Typography variant="subtitle1">{service.name}</Typography>
                          </Box>
                        }
                        secondary={
                          <Box sx={{ mt: 1 }}>
                            <Typography variant="body2" color="text.secondary">
                              {service.description}
                            </Typography>
                            <Typography variant="subtitle2" color="primary" sx={{ mt: 0.5 }}>
                              ${service.price.toFixed(2)}
                            </Typography>
                          </Box>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Box>
          <Box minWidth={220} display="flex" flexDirection="column" alignItems="center" gap={2}>
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              {user?.role !== 'admin' && (
            <Button
              variant="contained"
              color="primary"
                  onClick={() => navigate(`/rentals/new?warehouse=${warehouse.id}`)}
                  disabled={warehouse.is_blocked}
                >
                  Rent Warehouse
                </Button>
              )}
              {user?.role === 'seller' && warehouse.owned_by === user.id && (
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={() => navigate(`/warehouses/${warehouse.id}/edit`)}
            >
                  Edit Warehouse
            </Button>
              )}
            </Box>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default WarehouseDetails; 