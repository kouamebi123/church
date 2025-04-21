import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Box, Typography, Button, Paper, MenuItem } from '@mui/material';
import { AccountTree, ArrowDropDown, Logout } from '@mui/icons-material';
import { logout } from '../../features/auth/authSlice';
import Footer from '../Footer';

const Navbar = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  return (
    <Box component="nav" sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 2,
          px: '4%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          zIndex: 1000,
          height: '70px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
        }}>
          <Box 
            sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 2, 
              cursor: 'pointer' 
            }} 
            onClick={() => navigate('/')}
          >
            <img src="/logo-sm-acer.png" alt="Logo" style={{ width: '40px', height: '40px', borderRadius: '50%' }} />
            <Typography sx={{ cursor: 'pointer', color: 'white' }} variant="h6">Portail Cultes et Réseaux</Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              {(user?.role === 'superviseur' || user?.role === 'admin' || user?.role === 'collecteur_reseaux') && (
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
                  {(user?.role === 'superviseur' || user?.role === 'admin') && (
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
                  {(user?.role === 'collecteur_culte' || user?.role === 'admin') && (
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
              <Button
                variant=""
                color="white"
                onClick={handleLogout}
                startIcon={<Logout />}
                sx={{ 
                  borderRadius: '20px',
                  textTransform: 'none',
                  px: 2,
                }}
              >
                Déconnexion
              </Button>
            )}
          </Box>
        </Box>
  );
};

const Layout = ({ children }) => {
  const location = useLocation();
  const excludedPaths = ['/dashboard', '/login', '/register',];
  
  // Ne pas afficher le layout sur les pages exclues
  if (excludedPaths.includes(location.pathname)) {
    return children;
  }

  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column',
      minHeight: '100vh',
    }}>
      <Navbar />
      <Box sx={{ 
        flex: 1,
        mt: '65px', // Pour compenser la hauteur de la navbar fixe
        py: 4,
        px: { xs: 2, sm: 4, md: 6 },
      }}>
        {children}
      </Box>
      <Footer />
    </Box>
  );
};

export default Layout;
