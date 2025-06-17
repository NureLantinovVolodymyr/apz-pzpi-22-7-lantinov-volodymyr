import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Paper,
  TextField,
  Button,
  Box,
  CircularProgress,
  Alert,
} from '@mui/material';
import { getWarehouse } from '../../api/warehouse';
import api from '../../services/api';
import { useSelector } from 'react-redux';
import type { RootState } from '../../store';

interface Warehouse {
  id: number;
  name: string;
  location: string;
  size_sqm: number;
  price_per_day: number;
  owned_by: number;
}

const EditWarehouse = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [warehouse, setWarehouse] = useState<Warehouse | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    location: '',
    size_sqm: 0,
    price_per_day: 0,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { user } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (id) {
      fetchWarehouseDetails();
    }
  }, [id]);

  const fetchWarehouseDetails = async () => {
    try {
      const data = await getWarehouse(id!);
      setWarehouse(data);
      setFormData({
        name: data.name,
        location: data.location,
        size_sqm: data.size_sqm,
        price_per_day: data.price_per_day,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch warehouse details');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'size_sqm' || name === 'price_per_day' ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      await api.put(`/warehouses/${id}`, formData);
      navigate(`/warehouses/${id}`);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to update warehouse');
    } finally {
      setSaving(false);
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
    <Container maxWidth="md" sx={{ mt: 6, mb: 6 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Edit Warehouse
        </Typography>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Warehouse Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="location"
            label="Location"
            name="location"
            value={formData.location}
            onChange={handleChange}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="size_sqm"
            label="Size (m²)"
            name="size_sqm"
            type="number"
            value={formData.size_sqm}
            onChange={handleChange}
            inputProps={{ min: 1 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="price_per_day"
            label="Price per Day ($)"
            name="price_per_day"
            type="number"
            value={formData.price_per_day}
            onChange={handleChange}
            inputProps={{ min: 0, step: 0.01 }}
          />
          <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={saving}
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate(`/warehouses/${id}`)}
            >
              Cancel
            </Button>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default EditWarehouse; 