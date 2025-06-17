import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Chip,
} from '@mui/material';
import api from '../../services/api';

interface Rental {
  id: string;
  warehouse_name: string;
  warehouse_location: string;
  start_date: string;
  end_date: string;
  status: string;
  total_price: number;
}
import { useTranslation } from 'react-i18next';
const Rentals = () => {
  const [rentals, setRentals] = useState<Rental[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { t } = useTranslation();
  useEffect(() => {
    fetchRentals();
  }, []);

  const fetchRentals = async () => {
    try {
      const response = await api.get('/users/my_rents');
      setRentals(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch rentals');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (id: string) => {
    navigate(`/rentals/${id}`);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'reserved':
        return 'success';
      case 'pending':
        return 'warning';
      case 'completed':
        return 'info';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString();
    } catch (error) {
      return 'Invalid Date';
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
         {t("my_rentals")}
      </Typography>

      <Grid container spacing={3}>
        {rentals.map((rental) => (
          <Grid item xs={12} md={6} key={rental.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {rental.warehouse_name}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Chip
                    label={rental.status.toUpperCase()}
                    color={getStatusColor(rental.status)}
                    size="small"
                    sx={{ mr: 1 }}
                  />
                </Box>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  {t("location")} {rental.warehouse_location}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                   {t("start_date")}: {formatDate(rental.start_date)}
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                   {t("end_date")}: {formatDate(rental.end_date)}
                </Typography>
                <Typography variant="h6" color="primary" sx={{ mt: 2 }}>
                   {t("total_price")}: ${rental.total_price.toFixed(2)}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => handleViewDetails(rental.id)}
                >
                  View Details
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Rentals; 