import { Outlet } from 'react-router-dom';
import { Box, Container } from '@mui/material';
import Navbar from '../components/Navbar';
import { useSelector } from 'react-redux';
import type { RootState } from '../store';
import { Link } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';

const MainLayout = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <Container 
        component="main" 
        sx={{ 
          flexGrow: 1, 
          py: 3,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          width: '100%'
        }}
      >
        <Outlet />
      </Container>
      <List>
        <ListItem disablePadding>
          <ListItemButton component={Link} to="/warehouses">
            <ListItemIcon>
              <WarehouseIcon />
            </ListItemIcon>
            <ListItemText primary="Warehouses" />
          </ListItemButton>
        </ListItem>
        {user?.role !== 'ADMIN' && (
          <ListItem disablePadding>
            <ListItemButton component={Link} to="/rentals">
              <ListItemIcon>
                <CalendarMonthIcon />
              </ListItemIcon>
              <ListItemText primary="Rentals" />
            </ListItemButton>
          </ListItem>
        )}
      </List>
    </Box>
  );
};

export default MainLayout; 