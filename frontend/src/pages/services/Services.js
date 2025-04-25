import React from 'react';
import { Box, Container, Typography } from '@mui/material';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../../components/Navbar';


const Services = () => {
  const location = useLocation();
  const isNewService = location.pathname === '/services/new';

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', pb: 6 }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ mt: 0 }}>
        <Typography variant="h4" sx={{ mb: 4, color: 'primary.main', fontWeight: 'bold' }}>
          {isNewService ? 'Enregistrement d\'un Culte' : 'Liste des Cultes'}
        </Typography>

        <Outlet />
      </Container>
    </Box>
  );
};

export default Services;
