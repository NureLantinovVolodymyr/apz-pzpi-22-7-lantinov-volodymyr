import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Tooltip } from '@mui/material';
import { AccountCircle } from '@mui/icons-material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../store';
import type { User } from '../types/user';
import { logout } from '../store/slices/authSlice';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from './LanguageSwitcher';

const Navbar = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.auth);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <AppBar position="static">
      <Toolbar>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          {t('app_name')}
        </Typography>

        {user ? (
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <LanguageSwitcher />
              {user.role === 'admin' && (
                <Tooltip title={t('admin_panel')}>
                  <Button color="inherit" onClick={() => navigate('/admin')}>
                    {t('admin_panel')}
                  </Button>
                </Tooltip>
              )}
              {user.role === 'seller' && (
                <>
                  <Tooltip title={t('my_warehouses')}>
                    <Button color="inherit" onClick={() => navigate('/my-warehouses')}>
                      {t('my_warehouses')}
                    </Button>
                  </Tooltip>
                  <Tooltip title={t('revenue')}>
                    <Button color="inherit" onClick={() => navigate('/revenue')}>
                      {t('revenue')}
                    </Button>
                  </Tooltip>
                </>
              )}
              {user.role !== 'admin' && (
                <Tooltip title={t('rentals')}>
                  <Button color="inherit" onClick={() => navigate('/rentals')}>
                    {t('rentals')}
                  </Button>
                </Tooltip>
              )}
              <Tooltip title={t('warehouses')}>
                <Button color="inherit" onClick={() => navigate('/warehouses')}>
                  {t('warehouses')}
                </Button>
              </Tooltip>
              <Tooltip title={t('account_menu')}>
                <IconButton
                  size="large"
                  aria-label={t('account_of_current_user')}
                  aria-controls="menu-appbar"
                  aria-haspopup="true"
                  onClick={handleMenu}
                  color="inherit"
                >
                  <AccountCircle />
                </IconButton>
              </Tooltip>
              <Menu
                id="menu-appbar"
                anchorEl={anchorEl}
                anchorOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                keepMounted
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                open={Boolean(anchorEl)}
                onClose={handleClose}
              >
                <MenuItem onClick={() => { handleClose(); navigate('/profile'); }}>
                  {t('profile')}
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); navigate('/messages'); }}>
                  {t('messages')}
                </MenuItem>
                <MenuItem onClick={() => { handleClose(); handleLogout(); }}>
                  {t('logout')}
                </MenuItem>
              </Menu>
            </Box>
          </>
        ) : (
          <Button color="inherit" onClick={() => navigate('/login')}>
            {t('login')}
          </Button>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar; 