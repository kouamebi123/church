import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  MenuItem
} from '@mui/material';
import SuccessDialog from '../../components/layout/SuccessDialog';
import { format } from 'date-fns';

const validationSchema = Yup.object({
  culte: Yup.string().required('Le type de culte est requis'),
  orateur: Yup.string().required('L\'orateur est requis'),
  date: Yup.date().required('La date est requise'),
  total_adultes: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre d\'adultes est requis'),
  total_enfants: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre d\'enfants est requis'),
  total_chantres: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre de chantres est requis'),
  total_protocoles: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre de protocoles est requis'),
  total_multimedia: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre de multimedia est requis'),
  total_respo_ecodim: Yup.string().required('Le responsable ECODIM est requis'),
  total_animateurs_ecodim: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre d\'animateurs ECODIM est requis'),
  total_enfants_ecodim: Yup.number().min(0, 'Le nombre doit être positif').required('Le nombre d\'enfants ECODIM est requis'),
  collecteur_culte: Yup.string().required('Le collecteur est requis'),
  superviseur: Yup.string().required('Le superviseur est requis')
});

const API_URL = 'http://localhost:5000';

const ServiceForm = () => {
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [superviseurs, setSuperviseurs] = useState([]);
  const [collecteurs, setCollecteurs] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Récupérer les superviseurs
        const superviseursResponse = await axios.get(`${API_URL}/api/users`, {
          params: { role: 'superviseur' },
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setSuperviseurs(superviseursResponse.data.data);

        // Récupérer les collecteurs
        const collecteursResponse = await axios.get(`${API_URL}/api/users`, {
          params: { role: 'collecteur_culte' },
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setCollecteurs(collecteursResponse.data.data);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, [token]);

  const formik = useFormik({
    initialValues: {
      identifiant_culte: '',
      culte: '',
      orateur: '',
      date: new Date(),
      total_adultes: '',
      total_enfants: '',
      total_chantres: '',
      total_protocoles: '',
      total_multimedia: '',
      total_respo_ecodim: '',
      total_animateurs_ecodim: '',
      total_enfants_ecodim: '',
      collecteur_culte: '',
      superviseur: ''
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        // Convertir les valeurs numériques en nombres
        const formattedValues = {
          ...values,
          total_adultes: Number(values.total_adultes),
          total_enfants: Number(values.total_enfants),
          total_chantres: Number(values.total_chantres),
          total_protocoles: Number(values.total_protocoles),
          total_multimedia: Number(values.total_multimedia),
          total_respo_ecodim: Number(values.total_respo_ecodim),
          total_animateurs_ecodim: Number(values.total_animateurs_ecodim),
          total_enfants_ecodim: Number(values.total_enfants_ecodim)
        };

        await axios.post(`${API_URL}/api/services`, formattedValues, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        setSuccessDialogOpen(true); // Affiche le dialog de succès
        // navigate('/services'); // Laisse l'utilisateur fermer le dialog d'abord
      } catch (error) {
        console.error('Erreur lors de la création du service:', error);
        if (error.response && error.response.data) {
          alert(error.response.data.message || 'Erreur lors de la création du service');
        } else {
          alert('Erreur lors de la création du service');
        }
      }
    }
  });

  const typesCulte = [
    'Culte du dimanche',
    'Culte de prière',
    'Culte spécial',
    'Culte de jeûne',
    'Autre'
  ];

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <Paper elevation={3} sx={{ p: 4 }}>
      <form onSubmit={formik.handleSubmit}>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              select
              name="culte"
              label="Type de Culte"
              value={formik.values.culte}
              onChange={formik.handleChange}
              error={formik.touched.culte && Boolean(formik.errors.culte)}
              helperText={formik.touched.culte && formik.errors.culte}
            >
              {typesCulte.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              type="date"
              name="date"
              label="Date du Culte"
              value={format(formik.values.date, 'yyyy-MM-dd')}
              onChange={(e) => formik.setFieldValue('date', new Date(e.target.value))}
              error={formik.touched.date && Boolean(formik.errors.date)}
              helperText={formik.touched.date && formik.errors.date}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              name="orateur"
              label="Orateur"
              value={formik.values.orateur}
              onChange={formik.handleChange}
              error={formik.touched.orateur && Boolean(formik.errors.orateur)}
              helperText={formik.touched.orateur && formik.errors.orateur}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              name="total_adultes"
              label="Nombre d'Adultes"
              type="number"
              value={formik.values.total_adultes}
              onChange={formik.handleChange}
              error={formik.touched.total_adultes && Boolean(formik.errors.total_adultes)}
              helperText={formik.touched.total_adultes && formik.errors.total_adultes}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              name="total_enfants"
              label="Nombre d'Enfants"
              type="number"
              value={formik.values.total_enfants}
              onChange={formik.handleChange}
              error={formik.touched.total_enfants && Boolean(formik.errors.total_enfants)}
              helperText={formik.touched.total_enfants && formik.errors.total_enfants}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              name="total_chantres"
              label="Nombre de Chantres"
              type="number"
              value={formik.values.total_chantres}
              onChange={formik.handleChange}
              error={formik.touched.total_chantres && Boolean(formik.errors.total_chantres)}
              helperText={formik.touched.total_chantres && formik.errors.total_chantres}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              name="total_protocoles"
              label="Nombre de Protocoles"
              type="number"
              value={formik.values.total_protocoles}
              onChange={formik.handleChange}
              error={formik.touched.total_protocoles && Boolean(formik.errors.total_protocoles)}
              helperText={formik.touched.total_protocoles && formik.errors.total_protocoles}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              name="total_multimedia"
              label="Nombre Multimédia"
              type="number"
              value={formik.values.total_multimedia}
              onChange={formik.handleChange}
              error={formik.touched.total_multimedia && Boolean(formik.errors.total_multimedia)}
              helperText={formik.touched.total_multimedia && formik.errors.total_multimedia}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              name="total_respo_ecodim"
              label="Responsable ECODIM"
              value={formik.values.total_respo_ecodim}
              onChange={formik.handleChange}
              error={formik.touched.total_respo_ecodim && Boolean(formik.errors.total_respo_ecodim)}
              helperText={formik.touched.total_respo_ecodim && formik.errors.total_respo_ecodim}
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              name="total_animateurs_ecodim"
              label="Nombre d'Animateurs"
              type="number"
              value={formik.values.total_animateurs_ecodim}
              onChange={formik.handleChange}
              error={
                formik.touched.total_animateurs_ecodim &&
                Boolean(formik.errors.total_animateurs_ecodim)
              }
              helperText={
                formik.touched.total_animateurs_ecodim && formik.errors.total_animateurs_ecodim
              }
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              name="total_enfants_ecodim"
              label="Nombre d'Enfants ECODIM"
              type="number"
              value={formik.values.total_enfants_ecodim}
              onChange={formik.handleChange}
              error={
                formik.touched.total_enfants_ecodim &&
                Boolean(formik.errors.total_enfants_ecodim)
              }
              helperText={
                formik.touched.total_enfants_ecodim && formik.errors.total_enfants_ecodim
              }
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              select
              name="collecteur_culte"
              label="Collecteur"
              value={formik.values.collecteur_culte}
              onChange={formik.handleChange}
              error={formik.touched.collecteur_culte && Boolean(formik.errors.collecteur_culte)}
              helperText={formik.touched.collecteur_culte && formik.errors.collecteur_culte}
            >
              <MenuItem value="">Sélectionnez un collecteur</MenuItem>
              {collecteurs.map(collecteur => (
                <MenuItem key={collecteur._id} value={collecteur._id}>
                  {collecteur.pseudo}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              select
              name="superviseur"
              label="Superviseur"
              value={formik.values.superviseur}
              onChange={formik.handleChange}
              error={formik.touched.superviseur && Boolean(formik.errors.superviseur)}
              helperText={formik.touched.superviseur && formik.errors.superviseur}
            >
              <MenuItem value="">Sélectionnez un superviseur</MenuItem>
              {superviseurs.map(superviseur => (
                <MenuItem key={superviseur._id} value={superviseur._id}>
                  {superviseur.pseudo}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Box display="flex" justifyContent="flex-end" gap={2} sx={{ mt: 1, right: 0 }}>
              <Button
                variant="outlined"
                color="secondary"
                onClick={() => formik.resetForm()}
              >
                Réinitialiser
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Enregistrer
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
    {/* Dialog de succès après création */}
    <SuccessDialog
      open={successDialogOpen}
      onClose={() => { setSuccessDialogOpen(false); navigate('/services'); }}
      title="Succès"
      content="Le culte a été enregistré avec succès !"
    />
  </Paper>
  );
};

export default ServiceForm;
