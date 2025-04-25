import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { SentimentDissatisfied } from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

const NoFound = () => {
  const navigate = useNavigate();
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', mt: 3}}>
      <Box sx={{ p: 5, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SentimentDissatisfied sx={{ fontSize: 72, color: 'error.main', mb: 2 }} />
        <Typography variant="h2" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1, letterSpacing: 2 }}>
          404
        </Typography>
        <Typography variant="h5" sx={{ color: 'error.main', mb: 1 }}>
          Oups, page introuvable !
        </Typography>
        <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center' }}>
          La page que vous cherchez n'existe pas ou a été déplacée.<br />
          Retournez à l'accueil pour continuer la navigation.
        </Typography>
        <Button variant="contained" color="primary" size="large" onClick={() => navigate('/')} sx={{ fontWeight: 'bold', px: 4, py: 1.2 }}>
          Retour à l'accueil
        </Button>
      </Box>
    </Box>
  );
};

export default NoFound;
