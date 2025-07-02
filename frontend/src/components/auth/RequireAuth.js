import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { authService } from '../../services/authService';

const RequireAuth = ({ children }) => {
  const location = useLocation();
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  // Vérifier l'authentification via le service et le state Redux
  const isUserAuthenticated = isAuthenticated && authService.isAuthenticated() && user;

  if (!isUserAuthenticated) {
    // Rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default RequireAuth;
