import React from 'react';
import { Container, Typography, Paper } from '@mui/material';

const Churches = () => {
  return (
    <Container maxWidth="lg">
      <Paper elevation={3} sx={{ p: 4, mt: 4 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des Églises
        </Typography>
        <Typography variant="body1">
          Cette fonctionnalité sera bientôt disponible.
        </Typography>
      </Paper>
    </Container>
  );
};

export default Churches;
