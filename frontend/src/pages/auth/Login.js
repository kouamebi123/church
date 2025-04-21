import React from 'react';
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
import { LockOutlined } from '@mui/icons-material';
import { login } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';

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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', background: 'linear-gradient(120deg, #f2f6fc 0%, #e3eafc 50%, #f7f7fa 100%)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
      <Container component="main" maxWidth="xs" sx={{ zIndex: 1 }}>
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
            background: 'rgba(255,255,255,0.97)',
            minWidth: { xs: 'auto', sm: 340 }
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'primary.main', width: 64, height: 64, boxShadow: 2 }}>
            <LockOutlined sx={{ fontSize: 36 }} />
          </Avatar>
          <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1, mt: 1, letterSpacing: 1 }}>
            Connexion
          </Typography>
          <Typography variant="subtitle1" sx={{ color: 'text.secondary', mb: 2 }}>
            Accédez à votre espace membre
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
              id="password"
              name="password"
              label="Mot de passe"
              type="password"
              value={formik.values.password}
              onChange={formik.handleChange}
              error={formik.touched.password && Boolean(formik.errors.password)}
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
        <Box sx={{ mt: 6, textAlign: 'center', opacity: 0.7 }}>
          <Typography variant="caption" sx={{ color: 'primary.main', letterSpacing: 1 }}>
            © {new Date().getFullYear()} Eglise - Plateforme membres
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
