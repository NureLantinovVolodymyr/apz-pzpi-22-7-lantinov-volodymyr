import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../services/api';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import {
  TrendingUp as TrendingUpIcon,
  AccountBalance as AccountBalanceIcon,
  CalendarToday as CalendarTodayIcon,
} from '@mui/icons-material';
import { useTranslation } from 'react-i18next';

interface RevenueData {
  total_revenue: number;
  monthly_revenue: number;
  active_rentals: number;
  revenue_by_warehouse: {
    warehouse_name: string;
    revenue: number;
  }[];
  revenue_by_month: {
    month: string;
    revenue: number;
  }[];
  revenue_by_service: {
    service_name: string;
    revenue: number;
  }[];
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const Revenue = () => {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('month');
  const { user } = useSelector((state: RootState) => state.auth);
  const { t } = useTranslation();

  useEffect(() => {
    fetchRevenueData();
  }, [timeRange]);

  const fetchRevenueData = async () => {
    try {
      const response = await api.get(`/revenue/seller?time_range=${timeRange}`);
      setRevenueData(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch revenue data');
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'seller') {
    return (
      <Container maxWidth="sm">
        <Alert severity="error" sx={{ mt: 4 }}>
          {t('access_denied')}
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

  if (!revenueData) {
    return (
      <Container maxWidth="sm">
        <Alert severity="error" sx={{ mt: 4 }}>
          {t('no_revenue_data')}
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 6, mb: 6 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1">
          {t('revenue_analytics')}
        </Typography>
        <FormControl sx={{ minWidth: 120 }}>
          <InputLabel>{t('time_range')}</InputLabel>
          <Select
            value={timeRange}
            label={t('time_range')}
            onChange={(e) => setTimeRange(e.target.value)}
          >
            <MenuItem value="week">{t('last_week')}</MenuItem>
            <MenuItem value="month">{t('last_month')}</MenuItem>
            <MenuItem value="year">{t('last_year')}</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3} sx={{ mb: 4 }} direction="column">
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <AccountBalanceIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    {t('total_revenue')}
                  </Typography>
                  <Typography variant="h4" color="primary">
                    ${revenueData.total_revenue.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <TrendingUpIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    {t('monthly_revenue')}
                  </Typography>
                  <Typography variant="h4" color="primary">
                    ${revenueData.monthly_revenue.toFixed(2)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2}>
                <CalendarTodayIcon color="primary" sx={{ fontSize: 40 }} />
                <Box>
                  <Typography variant="h6" color="text.secondary">
                    {t('active_rentals')}
                  </Typography>
                  <Typography variant="h4" color="primary">
                    {revenueData.active_rentals}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} direction="column">
        <Grid item xs={12}>
          <Paper sx={{ p: 3, minWidth: 320 }}>
            <Typography variant="h6" gutterBottom>
              {t('revenue_over_time')}
            </Typography>
            <Box sx={{ height: 400 }}>
              {revenueData.revenue_by_month.length === 0 ? (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <Typography color="text.secondary">{t('no_data_available')}</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData.revenue_by_month}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="revenue"
                      stroke="#8884d8"
                      name={t('total_revenue')}
                    />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 3, minWidth: 320 }}>
            <Typography variant="h6" gutterBottom>
              {t('revenue_by_warehouse')}
            </Typography>
            <Box sx={{ height: 400 }}>
              {revenueData.revenue_by_warehouse.length === 0 ? (
                <Box display="flex" alignItems="center" justifyContent="center" height="100%">
                  <Typography color="text.secondary">{t('no_data_available')}</Typography>
                </Box>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueData.revenue_by_warehouse}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="warehouse_name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="revenue" fill="#8884d8" name={t('total_revenue')} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Revenue; 