import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Provider, useDispatch } from 'react-redux';
import { getMe } from './features/auth/authSlice';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css'

import store from './app/store';
import theme from './theme';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import NoFound from './pages/NoFound';
import RequireAuth from './components/auth/RequireAuth';
import RedirectIfAuth from './components/auth/RedirectIfAuth';
import Layout from './components/layout/Layout';
import Loading from './components/Loading';
import AOS from 'aos';
import 'aos/dist/aos.css';

// Lazy loading des pages
const Home = React.lazy(() => import('./pages/Home'));
const Profile = React.lazy(() => import('./pages/Profile'));

// Réseaux
const Networks = React.lazy(() => import('./pages/networks/Networks'));
const NetworkDetails = React.lazy(() => import('./pages/networks/NetworkDetails'));

// Cultes
const Services = React.lazy(() => import('./pages/services/Services'));
const ServiceForm = React.lazy(() => import('./pages/services/ServiceForm'));
const ServicesList = React.lazy(() => import('./pages/services/ServicesList'));

// Autres pages
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Groups = React.lazy(() => import('./pages/groups/Groups'));
const Churches = React.lazy(() => import('./pages/churches/Churches'));

function AppContent() {
  const dispatch = useDispatch();

  React.useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(getMe());
    }
  }, [dispatch]);

  React.useEffect(() => {
    AOS.init({
      duration: 1000, // Durée de l'animation en ms
    });
  }, []);

  return (
    <Routes>
      <Route path="/login" element={
        <RedirectIfAuth>
          <Login />
        </RedirectIfAuth>
      } />
      <Route path="/register" element={
        <RedirectIfAuth>
          <Register />
        </RedirectIfAuth>
      } />
      <Route path="/" element={<Navigate to="/home" replace />} />
      <Route path="/home" element={
        <RequireAuth>
          <Home />
        </RequireAuth>
      } />
      <Route path="/profile" element={
        <RequireAuth>
          <Profile />
        </RequireAuth>
      } />
      <Route path="/networks" element={
        <RequireAuth>
          <Networks />
        </RequireAuth>
      } />
      <Route path="/networks/:id" element={
        <RequireAuth>
          <NetworkDetails />
        </RequireAuth>
      } />
      <Route path="/services" element={
        <RequireAuth>
          <Services />
        </RequireAuth>
      }>
        <Route index element={<ServicesList />} />
        <Route path="new" element={<ServiceForm />} />
        <Route path="list" element={<ServicesList />} />
      </Route>
      <Route path="/groups" element={
        <RequireAuth>
          <Groups />
        </RequireAuth>
      } />
      <Route path="/churches" element={
        <RequireAuth>
          <Churches />
        </RequireAuth>
      } />
      <Route path="/dashboard" element={
        <RequireAuth>
          <Dashboard />
        </RequireAuth>
      } />
      <Route path="*" element={<NoFound />} />
    </Routes>
  );
}

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Layout>
            <React.Suspense fallback={<Loading titre="Chargement" />}>
              <AppContent />
            </React.Suspense>
            <ToastContainer position="top-right" autoClose={5000} />
          </Layout>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
