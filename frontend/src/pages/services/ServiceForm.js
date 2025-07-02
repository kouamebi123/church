import React, { useState, useEffect } from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import {
  Paper,
  Typography,
  Grid,
  TextField,
  Button,
  Box,
  MenuItem,
  Snackbar,
  Alert
} from '@mui/material';
import SuccessDialog from '../../components/layout/SuccessDialog';
import { format } from 'date-fns';
import ErrorMessage from '../../components/ErrorMessage';
import { TYPES_CULTE_OPTIONS } from '../../constants/enums';
import { apiService } from '../../services/apiService';
import { useNotification } from '../../hooks/useNotification';

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
  superviseur: Yup.string().required('Le superviseur est requis'),
  invitationYoutube: Yup.number().min(0, 'Le nombre doit être positif'),
  invitationTiktok: Yup.number().min(0, 'Le nombre doit être positif'),
  invitationInstagram: Yup.number().min(0, 'Le nombre doit être positif'),
  invitationPhysique: Yup.number().min(0, 'Le nombre doit être positif')
});

const ServiceForm = () => {
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [superviseurs, setSuperviseurs] = useState([]);
  const [collecteurs, setCollecteurs] = useState([]);

  const {
    notification,
    showSuccess,
    showError,
    hideNotification
  } = useNotification();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Récupérer les superviseurs
        const superviseursResponse = await apiService.users.getAll({ role: 'superviseur' });
        setSuperviseurs(superviseursResponse.data?.data || superviseursResponse.data || []);

        // Récupérer les collecteurs
        const collecteursResponse = await apiService.users.getAll({ role: 'collecteur_culte' });
        setCollecteurs(collecteursResponse.data?.data || collecteursResponse.data || []);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const formik = useFormik({
    initialValues: {
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
      superviseur: '',
      invitationYoutube: 0,
      invitationTiktok: 0,
      invitationInstagram: 0,
      invitationPhysique: 0
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
          total_enfants_ecodim: Number(values.total_enfants_ecodim),
          invitationYoutube: Number(values.invitationYoutube),
          invitationTiktok: Number(values.invitationTiktok),
          invitationInstagram: Number(values.invitationInstagram),
          invitationPhysique: Number(values.invitationPhysique)
        };

        console.log(formattedValues);

        await apiService.services.create(formattedValues);
        setSuccessDialogOpen(true);
      } catch (error) {
        console.error('Erreur lors de la création du service:', error);
        showError(error.message || 'Erreur lors de la création du service');
      }
    }
  });

  if (loading) return <div>Chargement...</div>;
  if (error) return <ErrorMessage error={error} />;

  return (
    <Paper data-aos="fade-up" elevation={3} sx={{ p: 4 }}>
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
              {TYPES_CULTE_OPTIONS.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
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

          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              name="invitationYoutube"
              label="Invitations Youtube"
              type="number"
              value={formik.values.invitationYoutube}
              onChange={formik.handleChange}
              error={formik.touched.invitationYoutube && Boolean(formik.errors.invitationYoutube)}
              helperText={formik.touched.invitationYoutube && formik.errors.invitationYoutube}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              name="invitationTiktok"
              label="Invitations Tiktok"
              type="number"
              value={formik.values.invitationTiktok}
              onChange={formik.handleChange}
              error={formik.touched.invitationTiktok && Boolean(formik.errors.invitationTiktok)}
              helperText={formik.touched.invitationTiktok && formik.errors.invitationTiktok}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              name="invitationInstagram"
              label="Invitations Instagram"
              type="number"
              value={formik.values.invitationInstagram}
              onChange={formik.handleChange}
              error={formik.touched.invitationInstagram && Boolean(formik.errors.invitationInstagram)}
              helperText={formik.touched.invitationInstagram && formik.errors.invitationInstagram}
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField sx={{ minWidth: 250, backgroundColor: '#fdfdfd' }}
              fullWidth
              name="invitationPhysique"
              label="Invitations Physiques"
              type="number"
              value={formik.values.invitationPhysique}
              onChange={formik.handleChange}
              error={formik.touched.invitationPhysique && Boolean(formik.errors.invitationPhysique)}
              helperText={formik.touched.invitationPhysique && formik.errors.invitationPhysique}
            />
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
        onClose={() => { setSuccessDialogOpen(false); 
          formik.resetForm();
        }}
        title="Succès"
        content="Le culte a été enregistré avec succès !"
      />

    </Paper>
  );
};

export default ServiceForm;
