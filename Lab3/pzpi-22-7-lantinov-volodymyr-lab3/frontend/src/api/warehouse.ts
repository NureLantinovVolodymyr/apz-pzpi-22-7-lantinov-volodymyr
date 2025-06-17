import { api } from './api';

interface WarehouseData {
  name: string;
  location: string;
  size_sqm: number;
  price_per_day: number;
}

export const createWarehouse = async (data: WarehouseData) => {
  const response = await api.post('/warehouses', data);
  return response.data;
};

export const getWarehouses = async () => {
  const response = await api.get('/warehouses');
  return response.data;
};

export const getWarehouse = async (id: string) => {
  const response = await api.get(`/warehouses/${id}`);
  return response.data;
}; 