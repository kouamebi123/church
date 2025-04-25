import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { format } from 'date-fns';
import fr from 'date-fns/locale/fr';
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  IconButton,
  Button,
  Box,
  TextField,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControl,
  InputLabel,
  Select,
  Snackbar,
  Alert,
  MenuItem as MuiMenuItem
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Add as AddIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { TYPES_CULTE } from '../../constants/enums';
import ErrorMessage from '../../components/ErrorMessage';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import Loading from '../../components/Loading';

const API_URL = process.env.REACT_APP_API_URL+ '/api';

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

const ServicesList = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [token] = useState(localStorage.getItem('token'));
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editService, setEditService] = useState(null);
  const [collecteurs, setCollecteurs] = useState([]);
  const [superviseurs, setSuperviseurs] = useState([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serviceToDelete, setServiceToDelete] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [filter, setFilter] = useState({
    type: '',
    date: '',
    collecteur: '',
    superviseur: ''
  });

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setServiceToDelete(null);
  };

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/services`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setServices(response.data.data);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, [token]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const [collecteursResponse, superviseursResponse] = await Promise.all([
          axios.get(`${API_URL}/users`, {
            params: { role: 'collecteur_culte' },
            headers: { 'Authorization': `Bearer ${token}` }
          }),
          axios.get(`${API_URL}/users`, {
            params: { role: 'superviseur' },
            headers: { 'Authorization': `Bearer ${token}` }
          })
        ]);

        setCollecteurs(collecteursResponse.data.data);
        setSuperviseurs(superviseursResponse.data.data);
      } catch (err) {
        console.error('Erreur lors de la récupération des utilisateurs:', err);
      }
    };

    fetchUsers();
  }, [token]);

  const handleEditService = (service) => {
    setEditService(service);
    setEditModalOpen(true);
    
    // Pré-remplir le formulaire avec les données du service
    formik.setValues({
      culte: service.culte,
      orateur: service.orateur,
      date: service.date,
      total_adultes: service.total_adultes,
      total_enfants: service.total_enfants,
      total_chantres: service.total_chantres,
      total_protocoles: service.total_protocoles,
      total_multimedia: service.total_multimedia,
      total_respo_ecodim: service.total_respo_ecodim,
      total_animateurs_ecodim: service.total_animateurs_ecodim,
      total_enfants_ecodim: service.total_enfants_ecodim,
      collecteur_culte: service.collecteur_culte?._id,
      superviseur: service.superviseur?._id
    });
  };

  const handleEditClose = () => {
    setEditModalOpen(false);
    setEditService(null);
    // Réinitialiser le formulaire
    formik.resetForm();
  };

  const handleEditSubmit = async (values) => {
    try {
      await axios.put(`${API_URL}/services/${editService._id}`, values, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Mettre à jour le service dans la liste
      setServices(services.map(s => 
        s._id === editService._id ? { ...s, ...values } : s
      ));

      handleEditClose();
      setSnackbar({ open: true, message: 'Service modifié avec succès', severity: 'success' });
      fetchServices();
    } catch (error) {
      console.error('Erreur lors de la mise à jour du service:', error);
      setSnackbar({ open: true, message: 'Erreur lors de la mise à jour du service', severity: 'error' });
    }
  };

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
      superviseur: ''
    },
    validationSchema,
    onSubmit: handleEditSubmit
  });

  const handleFilterChange = (event) => {
    setFilter({
      ...filter,
      [event.target.name]: event.target.value
    });
  };

  const filteredServices = services
    .filter(service => {
      if (filter.type && filter.type !== 'Tous' && service.culte !== filter.type) return false;
      if (filter.date) {
        const filterDate = new Date(filter.date);
        const serviceDate = new Date(service.date);
        if (filterDate.getFullYear() !== serviceDate.getFullYear() ||
            filterDate.getMonth() !== serviceDate.getMonth() ||
            filterDate.getDate() !== serviceDate.getDate()) {
          return false;
        }
      }
      if (filter.collecteur && !service.collecteur_culte?.username.toLowerCase().includes(filter.collecteur.toLowerCase())) return false;
      if (filter.superviseur && !service.superviseur?.username.toLowerCase().includes(filter.superviseur.toLowerCase())) return false;
      return true;
    });
    

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleOpenDeleteDialog = (service) => {
    setServiceToDelete(service);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteService = async () => {
    if (!serviceToDelete) return;
    try {
      await axios.delete(`${API_URL}/services/${serviceToDelete._id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      setServices(services.filter(service => service._id !== serviceToDelete._id));
      setSnackbar({ open: true, message: 'Service supprimé avec succès', severity: 'success' });
    } catch (error) {
      console.error('Erreur lors de la suppression du service:', error);
      setSnackbar({ open: true, message: 'Erreur lors de la suppression du service', severity: 'error' });
    } finally {
      handleCloseDeleteDialog();
    }
  };

  

  if (loading) return <Loading titre="Chargement des données des services" />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Paper data-aos="fade-up" elevation={3} sx={{ p: 4 }}>
        
        {/* Filtres */}
        <Box mb={4}>
          <Typography variant="h6" gutterBottom>
            Filtres
          </Typography>
          <Box display="flex" gap={2} flexWrap="wrap">
            <TextField
              select
              name="type"
              label="Type de Culte"
              value={filter.type}
              onChange={handleFilterChange}
              sx={{ minWidth: 200, backgroundColor: '#fdfdfd' }}
            >
              {TYPES_CULTE.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              type="date"
              name="date"
              label="Date"
              value={filter.date}
              onChange={handleFilterChange}
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 200, backgroundColor: '#fdfdfd' }}
            />
            <TextField
              name="collecteur"
              label="Collecteur"
              value={filter.collecteur}
              onChange={handleFilterChange}
              sx={{ minWidth: 200, backgroundColor: '#fdfdfd' }}
            />
            <TextField
              name="superviseur"
              label="Superviseur"
              value={filter.superviseur}
              onChange={handleFilterChange}
              sx={{ minWidth: 200, backgroundColor: '#fdfdfd' }}
            />
          </Box>
        </Box>

        {/* Tableau */}
        <TableContainer component={Paper} sx={{ backgroundColor: 'primary.light', maxHeight: '80vh', overflow: 'auto' }}>
          <Table sx={{ backgroundColor: '#fff' }}>
            <TableHead sx={{ backgroundColor: '#dcdcdc' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 'bold' }}  >Type de Culte</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Orateur</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Date</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Adultes</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Enfants</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Chantres</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Protocoles</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Multimedia</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Resp. ECODIM</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Anim. ECODIM</TableCell>
                <TableCell align="right" sx={{ fontWeight: 'bold' }}>Enf. ECODIM</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Collecteur</TableCell>
                <TableCell sx={{ fontWeight: 'bold' }}>Superviseur</TableCell>
                <TableCell align="center" sx={{ fontWeight: 'bold', minWidth: 120 }}>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody sx={{ backgroundColor: 'white' }}>
              {filteredServices
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((service) => (
                  <TableRow
                    key={service._id}
                    hover
                    sx={{
                      transition: 'background-color 0.2s',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.03)'
                        }
                    }}
                  >
                    <TableCell>{service.culte}</TableCell>
                    <TableCell>{service.orateur}</TableCell>
                    <TableCell>
                      {format(new Date(service.date), 'dd MMMM yyyy', {
                        locale: fr
                      })}
                    </TableCell>
                    <TableCell align="right">{service.total_adultes}</TableCell>
                    <TableCell align="right">{service.total_enfants}</TableCell>
                    <TableCell align="right">{service.total_chantres}</TableCell>
                    <TableCell align="right">{service.total_protocoles}</TableCell>
                    <TableCell align="right">{service.total_multimedia}</TableCell>
                    <TableCell align="right">{service.total_respo_ecodim}</TableCell>
                    <TableCell align="right">{service.total_animateurs_ecodim}</TableCell>
                    <TableCell align="right">{service.total_enfants_ecodim}</TableCell>
                    <TableCell>{service.collecteur_culte ? service.collecteur_culte.username : ''}</TableCell>
                    <TableCell>{service.superviseur ? service.superviseur.username : ''}</TableCell>
                    <TableCell align="center">
                      <IconButton
                        color="primary"
                        onClick={() => handleEditService(service)}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        color="error"
                        onClick={() => handleOpenDeleteDialog(service)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              {filteredServices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={14} align="center">
                    Aucun culte trouvé
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Modal de modification */}
        <Dialog open={editModalOpen} onClose={handleEditClose} maxWidth="md" fullWidth>
          <DialogTitle>Modifier le Service</DialogTitle>
          <form onSubmit={formik.handleSubmit}>
            <DialogContent>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  fullWidth
                  name="culte"
                  label="Type de Culte"
                  value={formik.values.culte}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.culte && Boolean(formik.errors.culte)}
                  helperText={formik.touched.culte && formik.errors.culte}
                />
                <TextField
                  fullWidth
                  name="orateur"
                  label="Orateur"
                  value={formik.values.orateur}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.orateur && Boolean(formik.errors.orateur)}
                  helperText={formik.touched.orateur && formik.errors.orateur}
                />
                <TextField
                  fullWidth
                  type="date"
                  name="date"
                  value={formik.values.date}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.date && Boolean(formik.errors.date)}
                  helperText={formik.touched.date && formik.errors.date}
                  InputLabelProps={{ shrink: true }}
                />
                <TextField
                  fullWidth
                  name="total_adultes"
                  label="Nombre d'Adultes"
                  type="number"
                  value={formik.values.total_adultes}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.total_adultes && Boolean(formik.errors.total_adultes)}
                  helperText={formik.touched.total_adultes && formik.errors.total_adultes}
                />
                <TextField
                  fullWidth
                  name="total_enfants"
                  label="Nombre d'Enfants"
                  type="number"
                  value={formik.values.total_enfants}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.total_enfants && Boolean(formik.errors.total_enfants)}
                  helperText={formik.touched.total_enfants && formik.errors.total_enfants}
                />
                <TextField
                  fullWidth
                  name="total_chantres"
                  label="Nombre de Chantres"
                  type="number"
                  value={formik.values.total_chantres}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.total_chantres && Boolean(formik.errors.total_chantres)}
                  helperText={formik.touched.total_chantres && formik.errors.total_chantres}
                />
                <TextField
                  fullWidth
                  name="total_protocoles"
                  label="Nombre de Protocoles"
                  type="number"
                  value={formik.values.total_protocoles}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.total_protocoles && Boolean(formik.errors.total_protocoles)}
                  helperText={formik.touched.total_protocoles && formik.errors.total_protocoles}
                />
                <TextField
                  fullWidth
                  name="total_multimedia"
                  label="Nombre Multimédia"
                  type="number"
                  value={formik.values.total_multimedia}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.total_multimedia && Boolean(formik.errors.total_multimedia)}
                  helperText={formik.touched.total_multimedia && formik.errors.total_multimedia}
                />
                <TextField
                  fullWidth
                  name="total_respo_ecodim"
                  label="Responsable ECODIM"
                  value={formik.values.total_respo_ecodim}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.total_respo_ecodim && Boolean(formik.errors.total_respo_ecodim)}
                  helperText={formik.touched.total_respo_ecodim && formik.errors.total_respo_ecodim}
                />
                <TextField
                  fullWidth
                  name="total_animateurs_ecodim"
                  label="Nombre d'Animateurs"
                  type="number"
                  value={formik.values.total_animateurs_ecodim}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.total_animateurs_ecodim && Boolean(formik.errors.total_animateurs_ecodim)}
                  helperText={formik.touched.total_animateurs_ecodim && formik.errors.total_animateurs_ecodim}
                />
                <TextField
                  fullWidth
                  name="total_enfants_ecodim"
                  label="Nombre d'Enfants ECODIM"
                  type="number"
                  value={formik.values.total_enfants_ecodim}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={formik.touched.total_enfants_ecodim && Boolean(formik.errors.total_enfants_ecodim)}
                  helperText={formik.touched.total_enfants_ecodim && formik.errors.total_enfants_ecodim}
                />
                <FormControl fullWidth>
                  <InputLabel>Collecteur</InputLabel>
                  <Select
                    name="collecteur_culte"
                    value={formik.values.collecteur_culte}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.collecteur_culte && Boolean(formik.errors.collecteur_culte)}
                  >
                    <MuiMenuItem value="">Sélectionnez un collecteur</MuiMenuItem>
                    {collecteurs.map(collecteur => (
                      <MuiMenuItem key={collecteur._id} value={collecteur._id}>
                        {collecteur.username}
                      </MuiMenuItem>
                    ))}
                  </Select>
                  {formik.touched.collecteur_culte && formik.errors.collecteur_culte && (
                    <div style={{ color: 'red', fontSize: '0.75rem' }}>
                      {formik.errors.collecteur_culte}
                    </div>
                  )}
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel>Superviseur</InputLabel>
                  <Select
                    name="superviseur"
                    value={formik.values.superviseur}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={formik.touched.superviseur && Boolean(formik.errors.superviseur)}
                  >
                    <MuiMenuItem value="">Sélectionnez un superviseur</MuiMenuItem>
                    {superviseurs.map(superviseur => (
                      <MuiMenuItem key={superviseur._id} value={superviseur._id}>
                        {superviseur.username}
                      </MuiMenuItem>
                    ))}
                  </Select>
                  {formik.touched.superviseur && formik.errors.superviseur && (
                    <div style={{ color: 'red', fontSize: '0.75rem' }}>
                      {formik.errors.superviseur}
                    </div>
                  )}
                </FormControl>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleEditClose} color="primary">
                Annuler
              </Button>
              <Button type="submit" variant="contained" color="primary">
                Sauvegarder
              </Button>
            </DialogActions>
          </form>
        </Dialog>

        {/* Dialog de confirmation suppression service */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Supprimer le service"
        content={serviceToDelete ? `Êtes-vous sûr de vouloir supprimer le service du ${format(new Date(serviceToDelete.date), 'dd/MM/yyyy', { locale: fr })} ?` : "Êtes-vous sûr de vouloir supprimer ce service ?"}
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDeleteService}
      />

         {/* Snackbar feedback actions membres */}
              <Snackbar
                open={snackbar.open}
                autoHideDuration={2000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
              >
                <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity} sx={{ width: '100%' }}>
                  {snackbar.message}
                </Alert>
              </Snackbar>

        <TablePagination
          component="div"
          count={filteredServices.length}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Lignes par page"
        />
    </Paper>
  );
};

export default ServicesList;
