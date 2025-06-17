import { api } from './api';

export const getRevenue = async () => {
  const response = await api.get('/warehouses/revenue/');
  return response.data;
}; 