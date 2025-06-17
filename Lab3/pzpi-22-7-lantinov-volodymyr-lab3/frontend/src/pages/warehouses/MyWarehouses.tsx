import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../../store';
import {
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Box,
  CircularProgress,
  Alert,
  IconButton,
  TextField,
  Grid,
  Paper,
  Slider,
  FormControlLabel,
  Switch,
} from '@mui/material';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import StraightenIcon from '@mui/icons-material/Straighten';
import FilterListIcon from '@mui/icons-material/FilterList';
import api from '../../services/api';
import { useTranslation } from 'react-i18next';

interface Warehouse {
  id: number;
  name: string;
  location: string;
  size_sqm: number;
  price_per_day: number;
  is_blocked: boolean;
}

interface Filters {
  name: string;
  location: string;
  minPrice: number;
  maxPrice: number;
  minSize: number;
  maxSize: number;
  showBlocked: boolean;
}

const MyWarehouses = () => {
  const { t } = useTranslation();
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [filteredWarehouses, setFilteredWarehouses] = useState<Warehouse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    name: '',
    location: '',
    minPrice: 0,
    maxPrice: 1000,
    minSize: 0,
    maxSize: 1000,
    showBlocked: true,
  });
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth?.user);

  useEffect(() => {
    fetchMyWarehouses();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [warehouses, filters]);

  const fetchMyWarehouses = async () => {
    try {
      const response = await api.get('/warehouses/my-warehouses');
      setWarehouses(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || t('warehouses_fetch_failed'));
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...warehouses];

    if (filters.name) {
      filtered = filtered.filter(w => 
        w.name.toLowerCase().includes(filters.name.toLowerCase())
      );
    }

    if (filters.location) {
      filtered = filtered.filter(w => 
        w.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    filtered = filtered.filter(w => 
      w.price_per_day >= filters.minPrice && 
      w.price_per_day <= filters.maxPrice
    );

    filtered = filtered.filter(w => 
      w.size_sqm >= filters.minSize && 
      w.size_sqm <= filters.maxSize
    );

    if (!filters.showBlocked) {
      filtered = filtered.filter(w => !w.is_blocked);
    }

    setFilteredWarehouses(filtered);
  };

  const handleFilterChange = (field: keyof Filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleViewDetails = (id: number) => {
    navigate(`/warehouses/${id}`);
  };

  const handleCreateWarehouse = () => {
    navigate('/warehouses/create');
  };

  if (!user || user.role !== 'seller') {
    return (
      <Container maxWidth="sm">
        <Alert severity="error" sx={{ mt: 4 }}>
          {t('access_denied_seller_warehouses')}
        </Alert>
      </Container>
    );
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          {t('my_warehouses')}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={() => setShowFilters(!showFilters)}
            sx={{ mr: 2 }}
          >
            {showFilters ? t('hide_filters') : t('show_filters')}
          </Button>
          <Button variant="contained" color="primary" onClick={handleCreateWarehouse}>
            {t('create_warehouse')}
          </Button>
        </Box>
      </Box>

      {showFilters && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label={t('warehouse_name')}
                value={filters.name}
                onChange={(e) => handleFilterChange('name', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                fullWidth
                label={t('location')}
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography gutterBottom>{t('price_range')}</Typography>
              <Slider
                value={[filters.minPrice, filters.maxPrice]}
                onChange={(_, value) => {
                  const [min, max] = value as number[];
                  handleFilterChange('minPrice', min);
                  handleFilterChange('maxPrice', max);
                }}
                valueLabelDisplay="auto"
                min={0}
                max={1000}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Typography gutterBottom>{t('size_range')}</Typography>
              <Slider
                value={[filters.minSize, filters.maxSize]}
                onChange={(_, value) => {
                  const [min, max] = value as number[];
                  handleFilterChange('minSize', min);
                  handleFilterChange('maxSize', max);
                }}
                valueLabelDisplay="auto"
                min={0}
                max={1000}
              />
            </Grid>
            <Grid item xs={12}>
              <FormControlLabel
                control={
                  <Switch
                    checked={filters.showBlocked}
                    onChange={(_, checked) => handleFilterChange('showBlocked', checked)}
                  />
                }
                label={t('show_blocked_warehouses')}
              />
            </Grid>
          </Grid>
        </Paper>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {filteredWarehouses.length === 0 ? (
          <Grid item xs={12}>
            <Typography align="center" color="text.secondary">
              {t('no_warehouses_found')}
            </Typography>
          </Grid>
        ) : (
          filteredWarehouses.map((warehouse) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={warehouse.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {warehouse.name}
                    {warehouse.is_blocked && (
                      <Typography
                        component="span"
                        sx={{
                          ml: 1,
                          color: '#ff6b6b',
                          fontSize: '0.8rem',
                          fontWeight: 'normal',
                        }}
                      >
                        {t('blocked')}
                      </Typography>
                    )}
                  </Typography>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <LocationOnIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {warehouse.location}
                    </Typography>
                  </Box>
                  <Box display="flex" alignItems="center" gap={1} mb={1}>
                    <StraightenIcon fontSize="small" color="action" />
                    <Typography variant="body2" color="text.secondary">
                      {t('size')}: {warehouse.size_sqm} m²
                    </Typography>
                  </Box>
                  <Typography variant="h6" color="primary" fontWeight={700} mb={1}>
                    {t('price_per_day')}: ${warehouse.price_per_day.toFixed(2)}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button size="small" onClick={() => handleViewDetails(warehouse.id)}>
                    {t('view_details')}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>
    </Container>
  );
};

export default MyWarehouses; 