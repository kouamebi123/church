import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Button, Paper, MenuItem, Menu, IconButton, Avatar, Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Divider } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import {
  ArrowDropDown,
  Groups,
  EventAvailable,
  DashboardCustomize,
  EventNote,
  Logout,
  Dashboard as DashboardIcon,
  AccountCircle
} from '@mui/icons-material';
import { logout } from '../features/auth/authSlice';

const Navbar = () => {
  const [isScrolled, setIsScrolled] = React.useState(false);

  React.useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // Menu utilisateur
  const [anchorEl, setAnchorEl] = React.useState(null);

  // Mobile drawer
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  const handleDashboard = () => {
    handleMenuClose();
    navigate('/dashboard');
  };

  const handleLogout = () => {
    handleMenuClose();
    dispatch(logout());
    navigate('/login');
  };


  return (
    <Box component="nav"
      sx={{
        bgcolor: isScrolled ? 'white' : 'primary.main',
        color: isScrolled ? 'primary.main' : 'white',
        py: 2,
        px: '3%',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        zIndex: 1000,
        height: '70px',
        boxShadow: isScrolled ? '0 4px 16px rgba(76, 0, 130, 0.14)' : '0 2px 10px rgba(0,0,0,0.1)',
        transition: 'all 0.3s',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          cursor: 'pointer'
        }}
        onClick={() => navigate('/')}
      >
        <img src={isScrolled ? "/logo-sm-acer (1).png" : "/logo-sm-acer.png"} alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
        <Typography sx={{ cursor: 'pointer', color: isScrolled ? 'primary.main' : 'white', transition: 'color 0.3s' }} variant="h6">Portail Cultes et Réseaux</Typography>
      </Box>

      {/* Menu hamburger visible sur mobile */}
      <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
        <IconButton
          color="inherit"
          aria-label="open drawer"
          edge="end"
          onClick={handleDrawerToggle}
        >
          <MenuIcon />
        </IconButton>
      </Box>

      {/* Navigation classique visible sur desktop */}
      <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 3 }}>
        <Box sx={{ display: 'flex', gap: 2 }}>
          {(user?.role === 'superviseur' || user?.role === 'admin' || user?.role === 'super-admin' || user?.role === 'collecteur_reseaux') && (
            <Button
              variant=""
              color="white"
              onClick={() => navigate('/networks')}
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
                px: 2,
              }}
            >
              Réseaux
            </Button>
          )}
          <Box
            sx={{
              position: 'relative',
              '&:hover': {
                '& .menu-dropdown': {
                  opacity: 1,
                  visibility: 'visible',
                  transform: 'translateY(0)'
                }
              }
            }}
          >
            <Button
              variant=""
              color="white"
              endIcon={<ArrowDropDown />}
              sx={{
                borderRadius: '20px',
                textTransform: 'none',
                px: 2,
              }}
            >
              Cultes
            </Button>
            <Paper
              className="menu-dropdown"
              sx={{
                position: 'absolute',
                top: '100%',
                right: 0,
                mt: 1,
                minWidth: '200px',
                borderRadius: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                zIndex: 1000,
                bgcolor: 'background.paper',
                py: 1,
                opacity: 0,
                visibility: 'hidden',
                transform: 'translateY(-10px)',
                transition: 'all 0.2s ease-in-out'
              }}
            >
              {(user?.role === 'superviseur' || user?.role === 'admin' || user?.role === 'super-admin') && (
                <MenuItem
                  onClick={() => navigate('/services/list')}
                  sx={{
                    py: 1,
                    px: 2,
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  Consulter les cultes
                </MenuItem>
              )}
              {(user?.role === 'collecteur_culte' || user?.role === 'admin' || user?.role === 'super-admin') && (
                <MenuItem
                  onClick={() => navigate('/services/new')}
                  sx={{
                    py: 1,
                    px: 2,
                    '&:hover': {
                      bgcolor: 'rgba(0,0,0,0.04)'
                    }
                  }}
                >
                  Enregistrer un culte
                </MenuItem>
              )}
            </Paper>
          </Box>
        </Box>

        {user && (
          <Box>
            <IconButton
              color="inherit"
              onClick={handleMenuOpen}
              sx={{ ml: 2 }}
              size="large"
            >
              <Avatar sx={{ width: 33, height: 33, bgcolor: 'primary.main' }}>
                <AccountCircle sx={{ width: 33, height: 33 }} />
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              {user && (user.role === 'admin' || user.role === 'super-admin') && (
                <MenuItem onClick={handleDashboard}>
                  <DashboardIcon sx={{ mr: 1 }} /> Dashboard
                </MenuItem>
              )}
              <MenuItem onClick={handleLogout}>
                <Logout sx={{ mr: 1 }} /> Déconnexion
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Box>
      {/* Drawer pour mobile */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: 270,
            bgcolor: 'background.paper',
            boxShadow: 6,
          },
        }}
      >
        <Box
          sx={{ width: 270, p: 0 }}
          role="presentation"
          onClick={handleDrawerToggle}
          onKeyDown={handleDrawerToggle}
        >
          {/* Header/logo du menu */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, p: 2, bgcolor: 'primary.main', color: 'white' }}>
            <Typography variant="h6" sx={{ ml: 1, fontWeight: 700, color: 'white' }}>Menu</Typography>
          </Box>
          <Divider />
          <List sx={{ p: 0 }}>
            {(user?.role === 'superviseur' || user?.role === 'admin' || user?.role === 'super-admin' || user?.role === 'collecteur_reseaux') && (
              <ListItem disablePadding>
                <ListItemButton onClick={() => navigate('/networks')} sx={{ py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <Groups color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Réseaux" primaryTypographyProps={{ fontWeight: 500 }} />
                </ListItemButton>
              </ListItem>
            )}

            <Divider sx={{ my: 1 }} />

            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/services/list')} sx={{ py: 2 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <EventAvailable color="primary" />
                </ListItemIcon>
                <ListItemText primary="Consulter les cultes" primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>

            <ListItem disablePadding>
              <ListItemButton onClick={() => navigate('/services/new')} sx={{ py: 2 }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <EventNote  color="primary" />
                </ListItemIcon>
                <ListItemText primary="Enregistrer un culte" primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>

            <Divider sx={{ my: 1 }} />

            {user && (user.role === 'admin' || user.role === 'super-admin') && (
              <ListItem disablePadding>
                <ListItemButton onClick={handleDashboard} sx={{ py: 2 }}>
                  <ListItemIcon sx={{ minWidth: 36 }}>
                    <DashboardCustomize color="primary" />
                  </ListItemIcon>
                  <ListItemText primary="Dashboard" primaryTypographyProps={{ fontWeight: 500 }} />
                </ListItemButton>
              </ListItem>
            )}

            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout} sx={{ py: 2, color: 'error.main' }}>
                <ListItemIcon sx={{ minWidth: 36 }}>
                  <Logout color="error" />
                </ListItemIcon>
                <ListItemText primary="Déconnexion" primaryTypographyProps={{ fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>

          </List>
        </Box>
      </Drawer>
    </Box>
  );
};

export default Navbar;
