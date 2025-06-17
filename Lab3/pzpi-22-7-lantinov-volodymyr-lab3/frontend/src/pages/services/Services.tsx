import { useState, useEffect } from 'react';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import api from '../../services/api';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  category: string;
}

const Services = () => {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [requestDialogOpen, setRequestDialogOpen] = useState(false);
  const [requestNote, setRequestNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchServices();
  }, []);

  const fetchServices = async () => {
    try {
      const response = await api.get('/premium_services/');
      setServices(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch services');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestService = (service: Service) => {
    setSelectedService(service);
    setRequestDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setRequestDialogOpen(false);
    setSelectedService(null);
    setRequestNote('');
  };

  const handleSubmitRequest = async () => {
    if (!selectedService) return;

    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await api.post('/premium_services/request/', {
        serviceId: selectedService.id,
        note: requestNote,
      });
      setSuccess('Service request submitted successfully');
      handleCloseDialog();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to submit service request');
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Premium Services
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}

      <Grid container spacing={3}>
        {services.map((service) => (
          <Grid item xs={12} sm={6} md={4} key={service.id}>
            <Card>
              <CardContent>
                <Typography variant="h6" component="h2" gutterBottom>
                  {service.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {service.description}
                </Typography>
                <Typography variant="h6" color="primary">
                  ${service.price.toFixed(2)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Duration: {service.duration}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Category: {service.category}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  size="small"
                  color="primary"
                  onClick={() => handleRequestService(service)}
                >
                  Request Service
                </Button>
              </CardActions>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={requestDialogOpen} onClose={handleCloseDialog}>
        <DialogTitle>Request Service</DialogTitle>
        <DialogContent>
            <TextField
            autoFocus
            margin="dense"
            label="Additional Notes"
              fullWidth
              multiline
              rows={4}
              value={requestNote}
              onChange={(e) => setRequestNote(e.target.value)}
            disabled={submitting}
            />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog} disabled={submitting}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmitRequest}
            color="primary"
            disabled={submitting || !selectedService}
          >
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Services; 