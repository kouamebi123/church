import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL + '/api';

// Configuration axios avec intercepteurs
const authAxios = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  withCredentials: true, // Important pour CORS avec credentials
  headers: {
    'Content-Type': 'application/json',
  }
});

// Intercepteur pour ajouter automatiquement le token
authAxios.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Intercepteur pour gérer les erreurs d'authentification
authAxios.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expiré ou invalide
      sessionStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Service d'authentification
export const authService = {
  // Stockage sécurisé du token (sessionStorage au lieu de localStorage)
  setToken: (token) => {
    sessionStorage.setItem('token', token);
  },

  getToken: () => {
    return sessionStorage.getItem('token');
  },

  removeToken: () => {
    sessionStorage.removeItem('token');
  },

  // Méthodes d'authentification
  login: async (credentials) => {
    try {
      const response = await authAxios.post('/auth/login', credentials);
      if (response.data.token) {
        authService.setToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur de connexion' };
    }
  },

  register: async (userData) => {
    try {
      const response = await authAxios.post('/auth/register', userData);
      if (response.data.token) {
        authService.setToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur d\'inscription' };
    }
  },

  getMe: async () => {
    try {
      const response = await authAxios.get('/auth/me');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur de récupération du profil' };
    }
  },

  updateProfile: async (userData) => {
    try {
      const response = await authAxios.put('/auth/updatedetails', userData);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur de mise à jour du profil' };
    }
  },

  updatePassword: async (passwordData) => {
    try {
      const response = await authAxios.put('/auth/updatepassword', passwordData);
      if (response.data.token) {
        authService.setToken(response.data.token);
      }
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'Erreur de mise à jour du mot de passe' };
    }
  },

  logout: () => {
    authService.removeToken();
    // Redirection vers la page de connexion
    window.location.href = '/login';
  },

  // Vérifier si l'utilisateur est authentifié
  isAuthenticated: () => {
    return !!authService.getToken();
  }
};

export default authAxios; 