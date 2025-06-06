import React from 'react';
import { motion } from 'framer-motion';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate} from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Avatar
} from '@mui/material';
import { login } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';

import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Person from '@mui/icons-material/Person';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import HttpsSharpIcon from '@mui/icons-material/HttpsSharp';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      pseudo: '',
      password: ''
    },
    validationSchema: Yup.object({
      pseudo: Yup.string().required('Pseudo requis'),
      password: Yup.string().required('Mot de passe requis')
    }),
    onSubmit: async (values) => {
      try {
        await dispatch(login(values)).unwrap();
        toast.success('Connexion réussie !');
        navigate('/home');
      } catch (error) {
        toast.error(error.message || 'Erreur de connexion');
      }
    }
  });

  const [showPassword, setShowPassword] = React.useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <Box
      sx={{
        height: '100vh',
        bgcolor: 'background.default',
        background: 'linear-gradient(120deg, #f2f6fc 0%, #e3eafc 50%, #f7f7fa 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        width: '100vw',
        overflow: 'auto',
        position: 'relative',
        // Animation de gradient
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          background: 'linear-gradient(120deg,rgb(254, 254, 255) 0%,rgb(163, 181, 223) 50%,rgb(249, 249, 252) 100%)',
          backgroundSize: '400% 400%',
          animation: 'gradientBG 11s ease-in-out infinite',
          opacity: 1
        },
        // Pour placer le contenu au-dessus de l'animation
        zIndex: 1
      }}
    >
      <style>
        {`
          @keyframes gradientBG {
            0% { background-position: 0% 50%; }
            50% { background-position: 100% 50%; }
            100% { background-position: 0% 50%; }
          }
        `}
      </style>
      <Container component="main" maxWidth="xs" sx={{
        zIndex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        p: 0,
        margin: 'auto',
      }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <Paper
            elevation={6}
            sx={{
              py: 5,
              px: { xs: 2, sm: 4 },
              borderRadius: 4,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.18)',
              position: 'relative',
              background: 'rgb(255, 255, 255)',
              minWidth: { xs: 'auto', sm: 430 },
              margin: '30px',
            }}
          >
          
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 64, height: 64, boxShadow: 2 }}>
            <HttpsSharpIcon sx={{ fontSize: 36 }} />
          </Avatar>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1, mt: 1, letterSpacing: 1 }}>
            Connexion
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 2, textAlign: 'center' }}>
              Bienvenue sur ACER HUB !<br/>Accédez à votre espace membre
            </Typography>
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ mt: 1, width: '100%' }}
          >
            <TextField
              margin="normal"
              fullWidth
              id="pseudo"
              name="pseudo"
              label="Pseudo"
              value={formik.values.pseudo}
              onChange={formik.handleChange}
              error={formik.touched.pseudo && Boolean(formik.errors.pseudo)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Person />
                  </InputAdornment>
                )
              }}
              helperText={formik.touched.pseudo && formik.errors.pseudo}
              autoFocus
              sx={{
                background: '#f8fafd',
                borderRadius: 2,
                input: { fontWeight: 500 },
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': { borderColor: 'primary.main', boxShadow: '0 0 0 2px #1976d21a' }
                }
              }}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Mot de passe"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <HttpsSharpIcon />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
              helperText={formik.touched.password && formik.errors.password}
              sx={{
                background: '#f8fafd',
                borderRadius: 2,
                input: { fontWeight: 500 },
                mb: 2,
                '& .MuiOutlinedInput-root': {
                  '&.Mui-focused fieldset': { borderColor: 'primary.main', boxShadow: '0 0 0 2px #1976d21a' }
                }
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2, py: 1.5, fontWeight: 'bold', fontSize: 18, letterSpacing: 1, boxShadow: '0 4px 16px 0 rgba(25, 118, 210, 0.10)' }}
              disabled={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
            {/**<Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/register" variant="body2">
                {"Vous n'avez pas de compte ? Inscrivez-vous"}
              </Link>
            </Box>*/}
          </Box>
        </Paper>
        </motion.div>
        <Box sx={{ mt: 6, textAlign: 'center', opacity: 0.7 }}>
          <Typography variant="caption" sx={{ color: 'primary.main', letterSpacing: 1 }}>
            © {new Date().getFullYear()} - ACER Rennes - Tous droits réservés
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
