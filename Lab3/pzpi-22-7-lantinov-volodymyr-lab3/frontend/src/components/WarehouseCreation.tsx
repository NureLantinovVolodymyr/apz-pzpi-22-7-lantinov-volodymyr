import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../store';
import { createWarehouse } from '../api/warehouse';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  InputAdornment,
  CircularProgress,
  IconButton,
  Divider,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import api from '../services/api';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';

interface WarehouseFormData {
  name: string;
  location: string;
  size_sqm: number;
  price_per_day: number;
  lock_ip: string;
  premium_services: PremiumService[];
}

interface PremiumService {
  name: string;
  description: string;
  price: number;
}

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  marginTop: theme.spacing(4),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
}));

const WarehouseCreation: React.FC = () => {
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth?.user);
  const [formData, setFormData] = useState<WarehouseFormData>({
    name: '',
    location: '',
    size_sqm: 0,
    price_per_day: 0,
    lock_ip: '',
    premium_services: [],
  });
  const [error, setError] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [newService, setNewService] = useState<PremiumService>({
    name: '',
    description: '',
    price: 0,
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'size_sqm' || name === 'price_per_day' ? parseFloat(value) : value,
    }));
  };

  const handleServiceInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewService((prev) => ({
      ...prev,
      [name]: name === 'price' ? parseFloat(value) : value,
    }));
  };

  const handleAddService = () => {
    if (!newService.name || !newService.description || newService.price <= 0) {
      setError('Please fill in all service fields');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      premium_services: [...prev.premium_services, { ...newService }],
    }));
    setNewService({ name: '', description: '', price: 0 });
  };

  const handleRemoveService = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      premium_services: prev.premium_services.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      // First create the warehouse
      const warehouseResponse = await createWarehouse({
        name: formData.name,
        location: formData.location,
        size_sqm: formData.size_sqm,
        price_per_day: formData.price_per_day,
      });

      const warehouseId = warehouseResponse.id;

      // Then create the lock for the warehouse
      await api.post('/locks', {
        warehouse_id: warehouseId,
        ip: formData.lock_ip,
      });

      // Finally create all premium services
      for (const service of formData.premium_services) {
        await api.post('/services/', {
          warehouse_id: warehouseId,
          name: service.name,
          description: service.description,
          price: service.price,
        });
      }

      navigate('/warehouses');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create warehouse');
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || user.role !== 'seller') {
    return (
      <Container maxWidth="sm">
        <Alert severity="error" sx={{ mt: 4 }}>
          Access denied. Only sellers can create warehouses.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Create New Warehouse
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <TextField
            required
            fullWidth
            label="Warehouse Name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
          />

          <TextField
            required
            fullWidth
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleInputChange}
          />

          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              required
              fullWidth
              type="number"
              label="Size (m²)"
              name="size_sqm"
              value={formData.size_sqm}
              onChange={handleInputChange}
              inputProps={{ min: 0, step: 0.01 }}
            />

            <TextField
              required
              fullWidth
              type="number"
              label="Price per Day ($)"
              name="price_per_day"
              value={formData.price_per_day}
              onChange={handleInputChange}
              inputProps={{ min: 0, step: 0.01 }}
            />
          </Box>

          <TextField
            required
            fullWidth
            label="Lock IP Address"
            name="lock_ip"
            value={formData.lock_ip}
            onChange={handleInputChange}
            helperText="Enter the IP address of the smart lock device"
          />

          <Divider sx={{ my: 2 }} />
          <Typography variant="h6" gutterBottom>
            Premium Services
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
            <TextField
              fullWidth
              label="Service Name"
              name="name"
              value={newService.name}
              onChange={handleServiceInputChange}
            />
            <TextField
              fullWidth
              label="Description"
              name="description"
              value={newService.description}
              onChange={handleServiceInputChange}
            />
            <TextField
              fullWidth
              type="number"
              label="Price ($)"
              name="price"
              value={newService.price}
              onChange={handleServiceInputChange}
              inputProps={{ min: 0, step: 0.01 }}
            />
            <IconButton
              color="primary"
              onClick={handleAddService}
              sx={{ mt: 1 }}
            >
              <AddIcon />
            </IconButton>
          </Box>

          {formData.premium_services.map((service, index) => (
            <Paper key={index} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1">{service.name}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="body2">{service.description}</Typography>
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1">${service.price}</Typography>
                </Box>
                <IconButton
                  color="error"
                  onClick={() => handleRemoveService(index)}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Paper>
          ))}

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={submitting}
            fullWidth
          >
            {submitting ? <CircularProgress size={24} /> : 'Create Warehouse'}
          </Button>
        </Box>
      </Paper>
    </Container>
  );
};

export default WarehouseCreation; 