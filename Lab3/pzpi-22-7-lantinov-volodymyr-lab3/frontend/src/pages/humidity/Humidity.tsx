import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  CardActions,
  Button,
  Slider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import {
  WaterDrop as WaterDropIcon,
  Warning as WarningIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import api from '../../services/api';

interface HumidityData {
  id: string;
  warehouseId: string;
  warehouseName: string;
  currentHumidity: number;
  targetHumidity: number;
  lastUpdated: string;
  status: 'normal' | 'warning' | 'critical';
}

const Humidity = () => {
  const [humidityData, setHumidityData] = useState<HumidityData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchHumidityData();
    // Set up polling for real-time updates
    const interval = setInterval(fetchHumidityData, 30000); // Poll every 30 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchHumidityData = async () => {
    try {
      const response = await api.get('/humidity/');
      setHumidityData(response.data);
      if (response.data.length > 0 && !selectedWarehouse) {
        setSelectedWarehouse(response.data[0].id);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch humidity data');
    } finally {
      setLoading(false);
    }
  };

  const handleWarehouseChange = (event: SelectChangeEvent) => {
    setSelectedWarehouse(event.target.value);
  };

  const handleTargetHumidityChange = async (value: number) => {
    if (!selectedWarehouse) return;

    setUpdating(true);
    setError('');

    try {
      await api.put(`/humidity/${selectedWarehouse}/`, {
        targetHumidity: value,
      });
      fetchHumidityData(); // Refresh data after update
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update target humidity');
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'normal':
        return 'success.main';
      case 'warning':
        return 'warning.main';
      case 'critical':
        return 'error.main';
      default:
        return 'text.secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'normal':
        return <CheckCircleIcon color="success" />;
      case 'warning':
        return <WarningIcon color="warning" />;
      case 'critical':
        return <WarningIcon color="error" />;
      default:
        return <WaterDropIcon />;
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Humidity Monitoring
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
                {humidityData.map((data) => (
          <Grid item xs={12} md={6} key={data.id}>
                <Card>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  {getStatusIcon(data.status)}
                  <Typography variant="h6" component="h2" sx={{ ml: 1 }}>
                        {data.warehouseName}
                      </Typography>
                    </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Current Humidity: {data.currentHumidity}%
                      </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Target Humidity: {data.targetHumidity}%
                      </Typography>
                    <Typography variant="body2" color="text.secondary">
                  Last Updated: {new Date(data.lastUpdated).toLocaleString()}
                    </Typography>
                <Box sx={{ mt: 2 }}>
                  <Typography gutterBottom>Adjust Target Humidity</Typography>
                  <Slider
                    value={data.targetHumidity}
                    onChange={(_, value) => handleTargetHumidityChange(value as number)}
                    min={0}
                    max={100}
                    disabled={updating}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value}%`}
                  />
                </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
      </Grid>
    </Container>
  );
};

export default Humidity; 