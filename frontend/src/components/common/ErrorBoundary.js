import React from 'react';
import { Box, Typography, Button, Alert } from '@mui/material';
import { Error as ErrorIcon } from '@mui/icons-material';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error: error,
      errorInfo: errorInfo
    });
    
    // Log l'erreur pour le debugging
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '100vh',
            p: 3,
            textAlign: 'center'
          }}
        >
          <ErrorIcon sx={{ fontSize: 64, color: 'error.main', mb: 2 }} />
          <Typography variant="h4" gutterBottom color="error.main">
            Oups ! Quelque chose s'est mal passé
          </Typography>
          <Typography variant="body1" sx={{ mb: 3, maxWidth: 600 }}>
            Une erreur inattendue s'est produite. Veuillez réessayer ou contacter l'administrateur si le problème persiste.
          </Typography>
          
          <Alert severity="error" sx={{ mb: 3, maxWidth: 600 }}>
            <Typography variant="body2">
              {this.state.error?.message || 'Erreur inconnue'}
            </Typography>
          </Alert>

          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={this.handleRetry}
              sx={{ minWidth: 120 }}
            >
              Réessayer
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.location.reload()}
              sx={{ minWidth: 120 }}
            >
              Recharger
            </Button>
          </Box>

          {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
            <Box sx={{ mt: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1, maxWidth: 800, overflow: 'auto' }}>
              <Typography variant="h6" gutterBottom>
                Détails de l'erreur (Développement)
              </Typography>
              <pre style={{ fontSize: '12px', whiteSpace: 'pre-wrap' }}>
                {this.state.error && this.state.error.toString()}
                {this.state.errorInfo.componentStack}
              </pre>
            </Box>
          )}
        </Box>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary; 