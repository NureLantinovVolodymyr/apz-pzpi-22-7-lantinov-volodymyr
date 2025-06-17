import { useState } from 'react';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import type { SelectChangeEvent } from '@mui/material';
import { loginSuccess } from '../../store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import api from '../../services/api';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'customer',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: SelectChangeEvent) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError(t('password_mismatch'));
      setLoading(false);
      return;
    }

    try {
      const response = await api.post('/auth/register', {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      const tokenPayload = JSON.parse(atob(response.data.access_token.split('.')[1]));
      const user = {
        id: tokenPayload.sub,
        email: tokenPayload.sub,
        username: tokenPayload.sub.split('@')[0],
        role: tokenPayload.role
      };

      dispatch(loginSuccess({ user, token: response.data.access_token }));
      localStorage.setItem('token', response.data.access_token);
      navigate('/');
    } catch (err: any) {
      if (err.response?.data?.detail) {
        const validationErrors = err.response.data.detail;
        if (Array.isArray(validationErrors)) {
          setError(validationErrors.map(e => e.msg).join(', '));
        } else {
          setError(err.response.data.detail);
        }
      } else {
        setError(err.response?.data?.message || t('registration_failed'));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 8 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography component="h1" variant="h5" align="center" gutterBottom>
          {t('register')}
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label={t('username')}
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleInputChange}
            placeholder={t('username_placeholder')}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label={t('email')}
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder={t('email_placeholder')}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label={t('new_password')}
            type="password"
            id="password"
            autoComplete="new-password"
            value={formData.password}
            onChange={handleInputChange}
            placeholder={t('password_placeholder')}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label={t('confirm_password')}
            type="password"
            id="confirmPassword"
            autoComplete="new-password"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            placeholder={t('password_confirm_placeholder')}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">{t('role')}</InputLabel>
            <Select
              labelId="role-label"
              id="role"
              name="role"
              value={formData.role}
              label={t('role')}
              onChange={handleSelectChange}
            >
              <MenuItem value="customer">{t('customer')}</MenuItem>
              <MenuItem value="seller">{t('seller')}</MenuItem>
            </Select>
          </FormControl>
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
            disabled={loading}
          >
            {loading ? t('loading') : t('register')}
          </Button>
          <Box sx={{ textAlign: 'center' }}>
            <Link component={RouterLink} to="/login" variant="body2">
              {t('already_have_account')}
            </Link>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register; 