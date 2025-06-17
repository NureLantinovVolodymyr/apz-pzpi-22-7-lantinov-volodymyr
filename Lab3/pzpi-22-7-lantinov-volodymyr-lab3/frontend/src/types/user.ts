export interface User {
  id: string;
  username: string;
  role: 'seller' | 'buyer' | 'admin';
} 