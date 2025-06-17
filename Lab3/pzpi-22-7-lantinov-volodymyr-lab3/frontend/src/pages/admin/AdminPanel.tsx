import { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Paper,
  Box,
  Button,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import api from '../../services/api';

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  is_blocked?: boolean;
}

const AdminPanel = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [blockLoading, setBlockLoading] = useState<number | null>(null);
  const [success, setSuccess] = useState('');
  const [backupLoading, setBackupLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await api.get('/users/');
      setUsers(response.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleBlockUser = async (userId: number) => {
    setBlockLoading(userId);
    setError('');
    setSuccess('');
    try {
      await api.get(`/users/block_user?user_id=${userId}`);
      setSuccess('User blocked successfully');
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to block user');
    } finally {
      setBlockLoading(null);
    }
  };

  const handleUnblockUser = async (userId: number) => {
    setBlockLoading(userId);
    setError('');
    setSuccess('');
    try {
      await api.get(`/users/unblock_user?user_id=${userId}`);
      setSuccess('User unblocked successfully');
      fetchUsers();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to unblock user');
    } finally {
      setBlockLoading(null);
    }
  };

  const handleDownloadBackup = async () => {
    setBackupLoading(true);
    setError('');
    setSuccess('');
    try {
      const response = await api.get('/backup', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'db_backup.zip');
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      setSuccess('Backup downloaded successfully');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to download backup');
    } finally {
      setBackupLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Admin Panel
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Download Database Backup
        </Typography>
        <Button
          variant="contained"
          color="secondary"
          onClick={handleDownloadBackup}
          disabled={backupLoading}
        >
          {backupLoading ? 'Downloading...' : 'Download Backup'}
        </Button>
      </Paper>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Users
        </Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight="20vh">
            <CircularProgress />
          </Box>
        ) : (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ID</TableCell>
                  <TableCell>Username</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {users.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.id}</TableCell>
                    <TableCell>{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>{user.is_blocked ? 'Blocked' : 'Active'}</TableCell>
                    <TableCell>
                      {user.is_blocked ? (
                        <Button
                          variant="outlined"
                          color="success"
                          size="small"
                          disabled={blockLoading === user.id}
                          onClick={() => handleUnblockUser(user.id)}
                        >
                          {blockLoading === user.id ? 'Unblocking...' : 'Unblock'}
                        </Button>
                      ) : (
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                          disabled={blockLoading === user.id}
                        onClick={() => handleBlockUser(user.id)}
                      >
                        {blockLoading === user.id ? 'Blocking...' : 'Block'}
                      </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Container>
  );
};

export default AdminPanel; 