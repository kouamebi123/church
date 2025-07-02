import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link as RouterLink } from 'react-router-dom';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Link,
  Paper,
  Avatar,
  Grid,
  MenuItem,
  FormControl,
  InputLabel,
  Select
} from '@mui/material';
import { PersonAddOutlined } from '@mui/icons-material';
import { register } from '../../features/auth/authSlice';
import { toast } from 'react-toastify';
import { GENRE_OPTIONS, TRANCHE_AGE_OPTIONS, SITUATION_MATRIMONIALE_OPTIONS, NIVEAU_EDUCATION_OPTIONS, QUALIFICATION_OPTIONS } from '../../constants/enums';
import { COUNTRIES } from '../../constants/countries';


const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading } = useSelector((state) => state.auth);

  const formik = useFormik({
    initialValues: {
      username: '',
      pseudo: '',
      email: '',
      password: '',
      confirmPassword: '',
      genre: '',
      tranche_age: '',
      profession: '',
      ville_residence: '',
      origine: '',
      situation_matrimoniale: '',
      niveau_education: '',
      qualification: 'En intégration' // Exactement comme dans le modèle
    },
    validationSchema: Yup.object({
      username: Yup.string()
        .required('Nom d\'utilisateur requis')
        .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'),
      pseudo: Yup.string()
        .required('Pseudo requis')
        .min(3, 'Le pseudo doit contenir au moins 3 caractères'),
      email: Yup.string()
        .email('Email invalide')
        .required('Email requis'),
      password: Yup.string()
        .required('Mot de passe requis')
        .min(6, 'Le mot de passe doit contenir au moins 6 caractères'),
      confirmPassword: Yup.string()
        .oneOf([Yup.ref('password'), null], 'Les mots de passe doivent correspondre')
        .required('Confirmation du mot de passe requise'),
      genre: Yup.string()
        .required('Genre requis'),
      tranche_age: Yup.string()
        .required('Tranche d\'âge requise'),
      profession: Yup.string()
        .required('Profession requise'),
      ville_residence: Yup.string()
        .required('Ville de résidence requise'),
      origine: Yup.string()
        .required('Origine requise'),
      situation_matrimoniale: Yup.string()
        .required('Situation matrimoniale requise'),
      niveau_education: Yup.string()
        .required('Niveau d\'éducation requis'),
      qualification: Yup.string()
        .required('Qualification requise')
        .oneOf(['12', '144', '1728', 'Leader', 'Responsable réseau', 'Régulier', 'Irrégulier', 'En intégration'], 'Qualification invalide')
    }),
    onSubmit: async (values) => {
      try {
        const { confirmPassword, ...registerData } = values;
        await dispatch(register(registerData)).unwrap();
        toast.success('Inscription réussie !');
        navigate('/');
      } catch (error) {
        toast.error(error.message || 'Erreur lors de l\'inscription');
      }
    }
  });

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          marginBottom: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <Paper
          elevation={6}
          sx={{
            padding: { xs: 2, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            background: 'linear-gradient(to bottom right, #ffffff, #f5f5f5)',
            borderRadius: 2,
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              height: '4px',
              background: (theme) => theme.palette.primary.main
            }
          }}
        >
          <Avatar 
            sx={{ 
              width: 56, 
              height: 56, 
              mb: 2,
              bgcolor: 'primary.main',
              boxShadow: 2
            }}
          >
            <PersonAddOutlined sx={{ fontSize: 32 }} />
          </Avatar>
          <Typography 
            component="h1" 
            variant="h4" 
            sx={{ 
              mb: 3, 
              fontWeight: 'bold',
              color: 'primary.main',
              textAlign: 'center'
            }}
          >
            Inscription
          </Typography>
          <Box
            component="form"
            onSubmit={formik.handleSubmit}
            sx={{ 
              width: '100%',
              '& .MuiTextField-root, & .MuiFormControl-root': {
                mb: 2
              },
              '& .MuiInputLabel-root': {
                fontSize: '0.95rem'
              },
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
                '&:hover fieldset': {
                  borderColor: 'primary.main'
                }
              },
              '& .MuiInputBase-input': {
                fontSize: '0.95rem'
              }
            }}
          >
            <Typography
              variant="h6"
              sx={{
                mb: 2,
                color: 'text.secondary',
                borderBottom: '2px solid',
                borderColor: 'primary.main',
                pb: 1
              }}
            >
              Informations de connexion
            </Typography>
            <Grid container spacing={2} sx={{ mb: 4 }}>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="username"
                  name="username"
                  label="Nom d'utilisateur"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  error={formik.touched.username && Boolean(formik.errors.username)}
                  helperText={formik.touched.username && formik.errors.username}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="pseudo"
                  name="pseudo"
                  label="Pseudo"
                  value={formik.values.pseudo}
                  onChange={formik.handleChange}
                  error={formik.touched.pseudo && Boolean(formik.errors.pseudo)}
                  helperText={formik.touched.pseudo && formik.errors.pseudo}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={formik.values.email}
                  onChange={formik.handleChange}
                  error={formik.touched.email && Boolean(formik.errors.email)}
                  helperText={formik.touched.email && formik.errors.email}
                />
              </Grid>

              <Typography
                variant="h6"
                sx={{
                  width: '100%',
                  mt: 2,
                  mb: 2,
                  color: 'text.secondary',
                  borderBottom: '2px solid',
                  borderColor: 'primary.main',
                  pb: 1
                }}
              >
                Informations personnelles
              </Typography>
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.genre && Boolean(formik.errors.genre)}
                  sx={{
                    '& .MuiSelect-select': {
                      padding: '13px 14px',
                    },
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                >
                  <InputLabel>Genre</InputLabel>
                  <Select
                    name="genre"
                    value={formik.values.genre}
                    onChange={formik.handleChange}
                    label="Genre"
                  >
                    {GENRE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.tranche_age && Boolean(formik.errors.tranche_age)}
                  sx={{
                    '& .MuiSelect-select': {
                      padding: '13px 14px',
                    },
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                >
                  <InputLabel>Tranche d'âge</InputLabel>
                  <Select
                    name="tranche_age"
                    value={formik.values.tranche_age}
                    onChange={formik.handleChange}
                    label="Tranche d'âge"
                  >
                    {TRANCHE_AGE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="profession"
                  name="profession"
                  label="Profession"
                  value={formik.values.profession}
                  onChange={formik.handleChange}
                  error={formik.touched.profession && Boolean(formik.errors.profession)}
                  helperText={formik.touched.profession && formik.errors.profession}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="ville_residence"
                  name="ville_residence"
                  label="Ville de résidence"
                  value={formik.values.ville_residence}
                  onChange={formik.handleChange}
                  error={formik.touched.ville_residence && Boolean(formik.errors.ville_residence)}
                  helperText={formik.touched.ville_residence && formik.errors.ville_residence}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.origine && Boolean(formik.errors.origine)}
                  sx={{
                    '& .MuiSelect-select': {
                      padding: '13px 14px',
                    },
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                >
                  <InputLabel>Pays d'origine</InputLabel>
                  <Select
                    name="origine"
                    value={formik.values.origine}
                    onChange={formik.handleChange}
                    label="Pays d'origine"
                  >
                    {COUNTRIES.map((country) => (
                      <MenuItem key={country.value} value={country.value}>
                        {country.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.situation_matrimoniale && Boolean(formik.errors.situation_matrimoniale)}
                  sx={{
                    '& .MuiSelect-select': {
                      padding: '13px 14px',
                    },
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                >
                  <InputLabel>Situation matrimoniale</InputLabel>
                  <Select
                    name="situation_matrimoniale"
                    value={formik.values.situation_matrimoniale}
                    onChange={formik.handleChange}
                    label="Situation matrimoniale"
                  >
                    {SITUATION_MATRIMONIALE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.niveau_education && Boolean(formik.errors.niveau_education)}
                  sx={{
                    '& .MuiSelect-select': {
                      padding: '13px 14px',
                    },
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                >
                  <InputLabel>Niveau d'éducation</InputLabel>
                  <Select
                    name="niveau_education"
                    value={formik.values.niveau_education}
                    onChange={formik.handleChange}
                    label="Niveau d'éducation"
                  >
                    {NIVEAU_EDUCATION_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl 
                  fullWidth 
                  error={formik.touched.qualification && Boolean(formik.errors.qualification)}
                  sx={{
                    '& .MuiSelect-select': {
                      padding: '13px 14px',
                    },
                    '& .MuiOutlinedInput-root': {
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                >
                  <InputLabel>Qualification</InputLabel>
                  <Select
                    name="qualification"
                    value={formik.values.qualification}
                    onChange={formik.handleChange}
                    label="Qualification"
                  >
                    {QUALIFICATION_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="password"
                  name="password"
                  label="Mot de passe"
                  type="password"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  error={formik.touched.password && Boolean(formik.errors.password)}
                  helperText={formik.touched.password && formik.errors.password}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  id="confirmPassword"
                  name="confirmPassword"
                  label="Confirmer le mot de passe"
                  type="password"
                  value={formik.values.confirmPassword}
                  onChange={formik.handleChange}
                  error={formik.touched.confirmPassword && Boolean(formik.errors.confirmPassword)}
                  helperText={formik.touched.confirmPassword && formik.errors.confirmPassword}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={isLoading}
            >
              {isLoading ? 'Inscription...' : 'S\'inscrire'}
            </Button>
            <Box sx={{ textAlign: 'center' }}>
              <Link component={RouterLink} to="/login" variant="body2">
                {'Vous avez déjà un compte ? Connectez-vous'}
              </Link>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default Register;
