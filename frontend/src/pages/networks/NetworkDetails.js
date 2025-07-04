import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  IconButton,
  FormControlLabel,
  Switch,
  Tooltip,
  Snackbar,
  Alert
} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Refresh as RefreshIcon,
  ExpandMore as ExpandMoreIcon,
  Group as GroupIcon,
  NetworkCheck as NetworkCheckIcon
} from '@mui/icons-material';
import Navbar from '../../components/Navbar';
import Loading from '../../components/Loading';
import ErrorMessage from '../../components/ErrorMessage';
import DeleteConfirmDialog from '../../components/DeleteConfirmDialog';
import { GENRE_OPTIONS, TRANCHE_AGE_OPTIONS, SITUATION_MATRIMONIALE_OPTIONS, NIVEAU_EDUCATION_OPTIONS, QUALIFICATION_OPTIONS } from '../../constants/enums';
import { COUNTRIES } from '../../constants/countries';
import { apiService } from '../../services/apiService';
import { useAuth } from '../../hooks/useAuth';

const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s ease-in-out',
  '&:hover': {
    transform: 'translateY(-4px)'
  }
}));

const StatCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: 'center',
  height: '100%',
  minWidth: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: theme.spacing(1)
}));

function NetworkDetails() {
  const { user, isAuthenticated } = useAuth();
  const { id: networkId } = useParams();
  
  // Hooks pour charger dynamiquement les églises et départements
  const [churches, setChurches] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Utiliser le service API centralisé
    Promise.all([
      apiService.churches.getAll(),
      apiService.departments.getAll()
    ])
      .then(([churchesRes, departmentsRes]) => {
        // Gérer la structure de réponse de l'API
        const churchesData = churchesRes.data?.data || churchesRes.data || [];
        const departmentsData = departmentsRes.data?.data || departmentsRes.data || [];
        setChurches(Array.isArray(churchesData) ? churchesData : []);
        setDepartments(Array.isArray(departmentsData) ? departmentsData : []);
      })
      .catch(() => {
        setChurches([]);
        setDepartments([]);
      });
  }, []);

  // ...
  const [selectedResponsable1, setSelectedResponsable1] = useState('');
  const [selectedResponsable2, setSelectedResponsable2] = useState('');

  // États pour les modales
  const [addGrModal, setAddGrModal] = useState(false);
  const [editGrModal, setEditGrModal] = useState(false);
  const [addMemberModal, setAddMemberModal] = useState(false);
  const [newMemberMode, setNewMemberMode] = useState(false);
  const [selectedGr, setSelectedGr] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
  const [memberForm, setMemberForm] = useState({
    username: '',
    pseudo: '',
    email: '',
    password: '',
    role: 'membre',
    genre: '',
    tranche_age: '',
    profession: '',
    ville_residence: '',
    origine: '',
    situation_matrimoniale: '',
    niveau_education: '',
    eglise_locale: '',
    departement: '',
    qualification: '',
    telephone: '',
    adresse: ''
  });

  const [editMemberModal, setEditMemberModal] = useState(false);
  const [editMemberForm, setEditMemberForm] = useState({
    username: '',
    pseudo: '',
    genre: '',
    tranche_age: '',
    profession: '',
    ville_residence: '',
    origine: '',
    situation_matrimoniale: '',
    niveau_education: '',
    departement: '',
    qualification: '',
    email: '',
    telephone: '',
    adresse: ''
  });
  const [sertDepartement, setSertDepartement] = useState(false);


  // État pour les données réseau
  const [networkData, setNetworkData] = useState({
    reseau: {},
    stats: [],
    grs: [],
    members: {},
    available_users: []
  });
  const [loading, setLoading] = useState(true);

  // Déclaration de fetchData accessible à tous les handlers
  const fetchData = async () => {
    try {
      // Utiliser le service API centralisé
      const [reseauRes, statsRes, grsRes, membersRes, availableUsersRes] = await Promise.all([
        apiService.networks.getById(networkId),
        apiService.networks.getStats(networkId),
        apiService.networks.getGroups(networkId),
        apiService.networks.getMembers(networkId),
        apiService.users.getAvailable()
      ]);

      // Gérer la structure de réponse de l'API
      const reseauData = reseauRes.data?.data || reseauRes.data || {};
      const statsData = statsRes.data?.data || statsRes.data || {};
      const grsData = grsRes.data?.data || grsRes.data || [];
      const membersData = membersRes.data?.data || membersRes.data || [];
      const availableUsersData = availableUsersRes.data?.data || availableUsersRes.data || [];

      setNetworkData({
        reseau: reseauData,
        stats: statsData,
        grs: Array.isArray(grsData) ? grsData : [],
        members: Array.isArray(membersData) ? membersData : [],
        available_users: Array.isArray(availableUsersData) ? availableUsersData : []
      });
    } catch (err) {
      setError("Erreur lors du chargement des données réseau");
      console.error('Erreur fetchData:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [networkId]);

  // Gestionnaires d'événements
  const handleEditGr = async (data) => {
    try {
      await apiService.groups.update(data._id, data);
      setEditGrModal(false);
      setSelectedGr(null);
      setSnackbar({ open: true, message: 'GR modifié avec succès', severity: 'success' });
      // Refresh données réseau
      await fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: "Erreur lors de la modification du GR", severity: 'error' });
    }
  };

  // Gestion du dialogue de suppression de GR
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [grToDelete, setGrToDelete] = useState(null);

  const handleDeleteGr = (grId) => {
    setGrToDelete(grId);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteGr = async () => {
    try {
      await apiService.groups.delete(grToDelete);
      await fetchData();
      setSnackbar({ open: true, message: 'GR supprimé avec succès', severity: 'success' });
    } catch (error) {
      setSnackbar({ open: true, message: "Erreur lors de la suppression du GR", severity: 'error' });
    } finally {
      setDeleteDialogOpen(false);
      setGrToDelete(null);
    }
  };

  const handleCloseDeleteDialog = () => {
    setDeleteDialogOpen(false);
    setGrToDelete(null);
  };

  const handleAddGr = async (data) => {
    try {
      const payload = {
        ...data,
        network: networkId,
        responsable1: selectedResponsable1
      };
      if (selectedResponsable2) {
        payload.responsable2 = selectedResponsable2;
      }
      await apiService.groups.create(payload);
      setAddGrModal(false);
      setSnackbar({ open: true, message: 'GR ajouté avec succès', severity: 'success' });
      // Refresh données réseau
      await fetchData();
      setSelectedResponsable1(null);
      setSelectedResponsable2(null);
    } catch (error) {
      setSnackbar({ open: true, message: "Erreur lors de l'ajout du GR", severity: 'error' });
    }
  };

  const handleAddMember = async (data) => {
    try {
        console.log('handleAddMember appelé avec selectedGr:', selectedGr);
        console.log('selectedGr.id:', selectedGr?.id);
        console.log('selectedGr._id:', selectedGr?._id);
        
      if (newMemberMode) {
        // 1. Créer le nouvel utilisateur
        const newMemberData = {
          ...memberForm,
          password: memberForm.password || 'password123',
        };
        // Remplacer toutes les chaînes vides par null
        Object.keys(newMemberData).forEach(key => {
          if (newMemberData[key] === "") {
            newMemberData[key] = null;
          }
        });
        console.log(newMemberData);
        const userRes = await apiService.users.create(newMemberData);
        const newUserId = userRes.data?.data?._id || userRes.data._id;
            console.log('Nouvel utilisateur créé avec ID:', newUserId);
        // 2. Ajouter ce nouvel utilisateur au groupe
            await apiService.groups.addMember(selectedGr.id, newUserId);
      } else {
        // Ajouter un membre existant au groupe
            console.log('Ajout du membre existant:', selectedMember);
            await apiService.groups.addMember(selectedGr.id, selectedMember);
      }
      setAddMemberModal(false);
      setNewMemberMode(false);
      setSelectedMember(null);
      setMemberForm({
        username: '',
        pseudo: '',
        email: '',
        password: '',
        role: 'membre',
        genre: '',
        tranche_age: '',
        profession: '',
        ville_residence: '',
        origine: '',
        situation_matrimoniale: '',
        niveau_education: '',
        eglise_locale: '',
        departement: '',
        qualification: '',
        telephone: '',
        adresse: '',
      });
      setSnackbar({ open: true, message: 'Membre ajouté avec succès', severity: 'success' });
      await fetchData();
    } catch (error) {
        console.error('Erreur dans handleAddMember:', error);
      setSnackbar({ open: true, message: "Erreur lors de l'ajout du membre", severity: 'error' });
    }
  };

  const handleUpdateMember = async (data) => {
    try {
      // DEBUG: log de l'objet reçu
      console.log('handleUpdateMember data:', data);
      console.log('selectedMember:', selectedMember);
      // Gestion robuste de l'identifiant utilisateur
      const userId = selectedMember;
      if (!userId) {
        setSnackbar({ open: true, message: "Impossible de trouver l'identifiant utilisateur à mettre à jour.", severity: 'error' });
        return;
      }
      // On ne garde que les champs non vides (sauf l'id)
      const filteredData = Object.keys(data).reduce((obj, key) => {
        if ((key === 'user_id' || key === '_id' || key === 'id') || (data[key] !== '' && data[key] !== undefined && data[key] !== null)) {
          obj[key] = data[key];
        }
        return obj;
      }, {});
      await apiService.users.update(userId, filteredData);
      setEditMemberModal(false);
      setEditMemberForm({
        username: '',
        pseudo: '',
        email: '',
        password: '',
        genre: '',
        tranche_age: '',
        profession: '',
        ville_residence: '',
        origine: '',
        situation_matrimoniale: '',
        niveau_education: '',
        eglise_locale: '',
        departement: '',
        qualification: '',
        telephone: '',
        adresse: '',
      });
      setSnackbar({ open: true, message: 'Membre modifié avec succès', severity: 'success' });
      // Refresh données réseau
      await fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: "Erreur lors de la mise à jour du membre", severity: 'error' });
    }
  };



  const [deleteMemberDialogOpen, setDeleteMemberDialogOpen] = useState(false);
  const [memberToDelete, setMemberToDelete] = useState({ grId: null, userId: null });

  const handleRemoveMember = (grId, userId) => {
    setMemberToDelete({ grId, userId });
    setDeleteMemberDialogOpen(true);
  };

  const handleConfirmDeleteMember = async () => {
    const { grId, userId } = memberToDelete;
    try {
      await apiService.groups.removeMember(grId, userId);
      setSnackbar({ open: true, message: 'Membre supprimé avec succès', severity: 'success' });
      await fetchData();
    } catch (error) {
      setSnackbar({ open: true, message: "Erreur lors de la suppression du membre", severity: 'error' });
    } finally {
      setDeleteMemberDialogOpen(false);
      setMemberToDelete({ grId: null, userId: null });
    }
  };

  const handleCloseDeleteMemberDialog = () => {
    setDeleteMemberDialogOpen(false);
    setMemberToDelete({ grId: null, userId: null });
  };

  if (loading) return <Loading titre="Chargement des données du réseau" />;
  if (error) return <ErrorMessage error={error} />;

  // Vérification de l'authentification
  if (!isAuthenticated) {
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="error">
          Vous devez être connecté pour accéder à cette page.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      <Navbar />

      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="space-between" mb={2}>
          <Typography variant="h4" sx={{ mb: 4, color: 'primary.main', fontWeight: 'bold' }}>
            Détails du Réseau - {networkData.reseau.nom}
          </Typography>
          <Box display="flex" alignItems="center">
            <Tooltip title="Rafraîchir les données">
              <IconButton color="primary" onClick={fetchData} sx={{ border: '1px solid #ddd', bgcolor: '#fff', '&:hover': { bgcolor: '#f5f5f5' } }}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        {/* Section Responsables */}
        <Paper data-aos="fade-up" sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>
            Responsable{networkData.reseau.responsable2?.username ? 's' : ''} du Réseau
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <PersonIcon />
                <Box>
                  <Typography variant="subtitle2">Responsable 1:</Typography>
                  <Typography>{networkData.reseau.responsable1?.username}</Typography>
                </Box>
              </Box>
            </Grid>
            {networkData.reseau.responsable2?.username && (
              <Grid item xs={12} md={6}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <PersonIcon />
                  <Box>
                    <Typography variant="subtitle2">Responsable 2:</Typography>
                    <Typography>{networkData.reseau.responsable2?.username}</Typography>
                  </Box>
                </Box>
              </Grid>
            )}
          </Grid>
        </Paper>

        {/* Section Statistiques */}
        <Paper data-aos="fade-up" sx={{ p: 3, mb: 4 }}>
          <Typography variant="h5" gutterBottom>Statistiques du Réseau</Typography>
          <Grid container spacing={2}>
            {Object.entries(networkData.stats || {})
              .filter(([key]) => key !== "totalGroups" && key !== "totalMembers")
              .map(([qualification, total], index) => (
                <Grid item xs={6} sm={4} md={2} key={index}>
                  <StatCard>
                    <Typography variant="body2">{qualification}</Typography>
                    <Typography variant="h4" color="primary">{total}</Typography>
                  </StatCard>
                </Grid>
              ))}
            <Grid item xs={6} sm={4} md={2}>
              <StatCard>
                <Typography variant="h4" color="primary">{networkData.grs.length}</Typography>
                <Typography variant="body2">Groupes de Réveil</Typography>
              </StatCard>
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard>
                <Typography variant="h4" color="primary">{(() => {
                  const membresSet = new Set();
                  networkData.grs?.forEach(gr => {
                    gr.members?.forEach(m => m?._id && membresSet.add(m._id));
                  });
                  if (networkData.reseau?.responsable1?._id) membresSet.add(networkData.reseau.responsable1._id);
                  if (networkData.reseau?.responsable2?._id) membresSet.add(networkData.reseau.responsable2._id);
                  return membresSet.size;
                })()}</Typography>
                <Typography variant="body2">Effectif total</Typography>
              </StatCard>
            </Grid>
          </Grid>
        </Paper>

        {/* Section GR */}
        <Box data-aos="fade-up" sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">Groupes de Réveil</Typography>
            {(user?.role === 'admin' || user?.role === 'super-admin' || user?.role === 'superviseur') && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setAddGrModal(true)}
              >
                Ajouter un GR
              </Button>
            )}
          </Box>

          <Grid container sx={{ mx: 'auto' }} alignItems="stretch">
            {(Array.isArray(networkData.grs) ? networkData.grs : []).map((gr) => (
              <Grid data-aos="fade-up"sx={{
                width: '100%',
                padding: '10px 10px 10px 10px',
                '@media (min-width:500px) and (max-width:849px)': { width: '50%' },
                '@media (min-width:850px) and (max-width:1199px)': { width: '33.33%' },
                '@media (min-width:1200px) and (max-width:1599px)': { width: '25%' },
                '@media (min-width:1600px)': { width: '20%' },
                
                
              }} key={gr.id}>
                <StyledCard>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                      <Typography variant="h6">
                        GR {gr.responsable1?.username?.split(' ')[0]}
                        {gr.responsable2?.username && ` & ${gr.responsable2?.username?.split(' ')[0]}`}
                      </Typography>
                      {(user?.role === 'admin' || user?.role === 'super-admin' || user?.role === 'superviseur') && (
                        <Box>
                          <IconButton
                            color="primary"
                            onClick={() => {
                              setSelectedGr(gr);
                              setEditGrModal(true);
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          <IconButton
                            color="error"
                            onClick={() => handleDeleteGr(gr.id)}
                          >
                            <DeleteIcon />
                          </IconButton>
                        </Box>
                      )}
                    </Box>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2">Responsable 1:</Typography>
                      <Typography>{gr.responsable1?.username}</Typography>
                      {gr.responsable2?.username && (
                        <>
                          <Typography variant="subtitle2" sx={{ mt: 1 }}>Responsable 2:</Typography>
                          <Typography>{gr.responsable2?.username}</Typography>
                        </>
                      )}
                      <Typography sx={{ mt: 1 }}>
                        <strong>Nombre de membres:</strong> {gr.members?.length}
                      </Typography>
                    </Box>
                    {gr.members?.map((member) => (
                      <Box
                        key={member._id}
                        sx={{
                          p: 1,
                          mb: 1,
                          borderRadius: 1,
                          bgcolor: 'background.default',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <Typography>
                          {member.username} ({member.qualification})
                        </Typography>
                        {(user?.role === 'admin' || user?.role === 'superviseur' || user?.role === 'super-admin') && (
                          <Box>
                            <IconButton
                              size="small"
                              onClick={() => {
                                setSelectedMember(member._id);
                                setEditMemberForm({
                                  username: member.username,
                                  pseudo: member.pseudo || '',
                                  genre: member.genre || '',
                                  tranche_age: member.tranche_age || '',
                                  profession: member.profession || '',
                                  ville_residence: member.ville_residence || '',
                                  origine: member.origine || '',
                                  situation_matrimoniale: member.situation_matrimoniale || '',
                                  niveau_education: member.niveau_education || '',
                                  departement: member.departement || '',
                                  qualification: member.qualification || '',
                                  email: member.email || '',
                                  telephone: member.telephone || '',
                                  adresse: member.adresse || '',
                                  eglise_locale: member.eglise_locale || '',
                                });
                                setEditMemberModal(true);
                              }}
                            >
                              <EditIcon fontSize="small" />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={() => handleRemoveMember(gr.id, member._id)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        )}
                      </Box>
                    ))}
                  </CardContent>
                  <CardActions sx={{ mt: 'auto', p: 2 }}>
                    {(user?.role === 'admin' || user?.role === 'superviseur' || user?.role === 'super-admin') && (
                      <Button
                        fullWidth
                        variant="contained"
                        onClick={() => {
                          setSelectedGr(gr);
                          setAddMemberModal(true);
                        }}
                      >
                        Ajouter un membre
                      </Button>
                    )}
                  </CardActions>
                </StyledCard>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Modales */}
        <Dialog open={addGrModal} onClose={() => setAddGrModal(false)}>
          <DialogTitle>Ajouter un Groupe de Réveil</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ pt: 2 }}>
              <TextField
                select
                fullWidth
                label="Responsable 1"
                sx={{ mb: 2 }}
                required
                value={selectedResponsable1 || ''}
                onChange={e => setSelectedResponsable1(e.target.value)}
              >
                {networkData.available_users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.username}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Responsable 2 (optionnel)"
                value={selectedResponsable2 || ''}
                onChange={e => setSelectedResponsable2(e.target.value)}
              >
                <MenuItem value="">Aucun</MenuItem>
                {networkData.available_users
                  .filter((user) => user._id !== selectedResponsable1)
                  .map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.username}
                    </MenuItem>
                  ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setAddGrModal(false)}>Annuler</Button>
            <Button variant="contained" onClick={() => handleAddGr({})}>Ajouter</Button>
          </DialogActions>
        </Dialog>

        <Dialog
          open={addMemberModal}
          onClose={() => {
            setAddMemberModal(false);
            setNewMemberMode(false);
            setSertDepartement(false);
            setMemberForm({
              username: '',
              email: '',
              phone: '',
              address: '',
              qualification: ''
            });
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Ajouter un membre</DialogTitle>
          <DialogContent>
            <Box sx={{ pt: 2, mb: 2 }}>
              <Button
                variant={!newMemberMode ? "contained" : "outlined"}
                onClick={() => setNewMemberMode(false)}
                sx={{ mr: 1 }}
              >
                Choisir un membre existant
              </Button>
              <Button
                variant={newMemberMode ? "contained" : "outlined"}
                onClick={() => setNewMemberMode(true)}
              >
                Créer un nouveau membre
              </Button>
            </Box>

            <Box component="form" sx={{ pt: 2 }}>
              {!newMemberMode ? (
                <TextField
                  select
                  fullWidth
                  label="Sélectionner un membre"
                  value={selectedMember || ''}
                  onChange={(e) => setSelectedMember(e.target.value)}
                  required
                >
                  {networkData.available_users.filter(user => !['Gouvernance', 'Responsable réseau', 'Ecodim', 'Responsable Ecodim'].includes(user.qualification)).map((user) => (
                    <MenuItem key={user._id} value={user._id}>
                      {user.username} ({user.qualification})
                    </MenuItem>
                  ))}
                </TextField>
              ) : (
                <>
                  <TextField
                    fullWidth
                    label="Nom d'utilisateur"
                    value={memberForm.username}
                    onChange={(e) => setMemberForm({ ...memberForm, username: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Pseudo"
                    value={memberForm.pseudo}
                    onChange={(e) => setMemberForm({ ...memberForm, pseudo: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    value={memberForm.email}
                    onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Téléphone"
                    value={memberForm.telephone}
                    onChange={(e) => setMemberForm({ ...memberForm, telephone: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Adresse"
                    value={memberForm.adresse}
                    onChange={(e) => setMemberForm({ ...memberForm, adresse: e.target.value })}
                    sx={{ mb: 2 }}
                  />

                  <TextField
                    select
                    fullWidth
                    label="Genre"
                    value={memberForm.genre}
                    onChange={(e) => setMemberForm({ ...memberForm, genre: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                  >
                    {GENRE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    label="Tranche d'âge"
                    value={memberForm.tranche_age}
                    onChange={(e) => setMemberForm({ ...memberForm, tranche_age: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                  >
                    {TRANCHE_AGE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    fullWidth
                    label="Profession"
                    value={memberForm.profession}
                    onChange={(e) => setMemberForm({ ...memberForm, profession: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                  />
                  <TextField
                    fullWidth
                    label="Ville de résidence"
                    value={memberForm.ville_residence}
                    onChange={(e) => setMemberForm({ ...memberForm, ville_residence: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                  />
                  <TextField
                    select
                    fullWidth
                    label="Pays d'origine"
                    value={memberForm.origine}
                    onChange={(e) => setMemberForm({ ...memberForm, origine: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                  >
                    {COUNTRIES.map((country) => (
                      <MenuItem key={country.value} value={country.value}>{country.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    label="Situation matrimoniale"
                    value={memberForm.situation_matrimoniale}
                    onChange={(e) => setMemberForm({ ...memberForm, situation_matrimoniale: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                  >
                    {SITUATION_MATRIMONIALE_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    label="Niveau d'éducation"
                    value={memberForm.niveau_education}
                    onChange={(e) => setMemberForm({ ...memberForm, niveau_education: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                  >
                    {NIVEAU_EDUCATION_OPTIONS.map((option) => (
                      <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    label="Église locale"
                    value={memberForm.eglise_locale}
                    onChange={(e) => setMemberForm({ ...memberForm, eglise_locale: e.target.value })}
                    sx={{ mb: 2 }}
                    required
                  >
                    {churches.map((church) => (
                      <MenuItem key={church._id} value={church._id}>{church.nom}</MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    fullWidth
                    label="Qualification"
                    value={memberForm.qualification}
                    onChange={(e) => setMemberForm({ ...memberForm, qualification: e.target.value })}
                    required
                  >
                    {QUALIFICATION_OPTIONS.filter(qual => !['Gouvernance', 'Responsable réseau', 'Ecodim', 'Responsable Ecodim'].includes(qual.value)).map((qual) => (
                      <MenuItem key={qual.value} value={qual.value}>{qual.label}</MenuItem>
                    ))}
                  </TextField>
                  <FormControlLabel
                    control={
                      <Switch
                        checked={sertDepartement}
                        onChange={(e) => setSertDepartement(e.target.checked)}
                      />
                    }
                    label="Sert dans un département"
                    sx={{ mb: 2 }}
                  />
                  {sertDepartement && (
                    <TextField
                      select
                      fullWidth
                      label="Département"
                      value={editMemberForm.departement}
                      onChange={(e) => setEditMemberForm({ ...editMemberForm, departement: e.target.value })}
                      sx={{ mb: 2 }}
                    >
                      {departments.map((dept) => (
                        <MenuItem key={dept._id} value={dept._id}>{dept.nom}</MenuItem>
                      ))}
                    </TextField>
                  )}

                </>
              )}
            </Box>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setAddMemberModal(false);
                setNewMemberMode(false);
                setMemberForm({
                  username: '',
                  pseudo: '',
                  email: '',
                  password: '',
                  role: 'membre',
                  genre: '',
                  tranche_age: '',
                  profession: '',
                  ville_residence: '',
                  origine: '',
                  situation_matrimoniale: '',
                  niveau_education: '',
                  eglise_locale: '',
                  departement: '',
                  qualification: '',
                  telephone: '',
                  adresse: '',
                });
              }}
            >
              Annuler
            </Button>
            <Button
              variant="contained"
              onClick={() => handleAddMember(newMemberMode ? memberForm : { userId: selectedMember })}
              disabled={newMemberMode ? !memberForm.username || !memberForm.email || !memberForm.qualification : !selectedMember}
            >
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={editGrModal} onClose={() => setEditGrModal(false)}
          onEnter={async () => {
            if (selectedGr) {
              try {
                const res = await apiService.groups.getById(selectedGr.id);
                const group = res.data?.data || res.data || {};
                setSelectedResponsable1(
                  group.responsable1
                    ? (typeof group.responsable1 === 'object' ? group.responsable1._id : group.responsable1)
                    : ''
                );
                setSelectedResponsable2(
                  group.responsable2
                    ? (typeof group.responsable2 === 'object' ? group.responsable2._id : group.responsable2)
                    : ''
                );
              } catch (e) {
                setSelectedResponsable1('');
                setSelectedResponsable2('');
              }
            }
          }}
        >
          <DialogTitle>Modifier le GR</DialogTitle>
          <DialogContent>
            <Box component="form" sx={{ pt: 2 }}>
              <TextField
                select
                fullWidth
                label="Responsable 1"
                value={selectedResponsable1}
                onChange={e => setSelectedResponsable1(e.target.value)}
                sx={{ mb: 2, minWidth: 250 }}
                required
              >
                {networkData.available_users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.username} ({user.qualification})
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Responsable 2"
                value={selectedResponsable2}
                onChange={e => setSelectedResponsable2(e.target.value)}
                sx={{ mb: 2, minWidth: 250 }}
              >
                <MenuItem value="">Aucun</MenuItem>
                {networkData.available_users.map((user) => (
                  <MenuItem key={user._id} value={user._id}>
                    {user.username} ({user.qualification})
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => { setEditGrModal(false); setSelectedResponsable1(''); setSelectedResponsable2(''); }}>Annuler</Button>
            <Button
              variant="contained"
              onClick={() => handleEditGr({
                id: selectedGr.id,
                network: selectedGr.network?._id || selectedGr.network,
                responsable1: selectedResponsable1,
                ...(selectedResponsable2 ? { responsable2: selectedResponsable2 } : {}) // N'inclure que si non vide
              })}
              color="primary"
            >
              Modifier
            </Button>
          </DialogActions>
        </Dialog>

        {/* Modale d'édition d'un membre */}
        <Dialog
          open={editMemberModal}
          onClose={() => setEditMemberModal(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Modifier le membre</DialogTitle>
          <DialogContent>
            <Box component="form" noValidate sx={{ mt: 1 }}>
              <TextField
                fullWidth
                label="Nom d'utilisateur"
                value={editMemberForm.username}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, username: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Pseudo"
                value={editMemberForm.pseudo}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, pseudo: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={editMemberForm.email}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, email: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Téléphone"
                value={editMemberForm.telephone}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, telephone: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Adresse"
                value={editMemberForm.adresse}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, adresse: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                select
                fullWidth
                label="Genre"
                value={editMemberForm.genre}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, genre: e.target.value })}
                sx={{ mb: 2 }}
                required
              >
                {GENRE_OPTIONS.map((genre) => (
                  <MenuItem key={genre.value} value={genre.value}>{genre.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Tranche d'âge"
                value={editMemberForm.tranche_age}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, tranche_age: e.target.value })}
                sx={{ mb: 2 }}
                required
              >
                {TRANCHE_AGE_OPTIONS.map((tranche) => (
                  <MenuItem key={tranche.value} value={tranche.value}>{tranche.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                fullWidth
                label="Profession"
                value={editMemberForm.profession}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, profession: e.target.value })}
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="Ville de résidence"
                value={editMemberForm.ville_residence}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, ville_residence: e.target.value })}
                sx={{ mb: 2 }}
                required
              />
              <TextField
                select
                fullWidth
                label="Pays d'origine"
                value={editMemberForm.origine}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, origine: e.target.value })}
                sx={{ mb: 2 }}
                required
              >
                {COUNTRIES.map((country) => (
                  <MenuItem key={country.value} value={country.value}>{country.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Situation matrimoniale"
                value={editMemberForm.situation_matrimoniale}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, situation_matrimoniale: e.target.value })}
                sx={{ mb: 2 }}
                required
              >
                {SITUATION_MATRIMONIALE_OPTIONS.map((situation) => (
                  <MenuItem key={situation.value} value={situation.value}>{situation.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Niveau d'éducation"
                value={editMemberForm.niveau_education}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, niveau_education: e.target.value })}
                sx={{ mb: 2 }}
                required
              >
                {NIVEAU_EDUCATION_OPTIONS.map((niveau) => (
                  <MenuItem key={niveau.value} value={niveau.value}>{niveau.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Église locale"
                value={editMemberForm.eglise_locale}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, eglise_locale: e.target.value })}
                sx={{ mb: 2 }}
                required
              >
                {churches.map((church) => (
                  <MenuItem key={church._id} value={church._id}>{church.nom}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Qualification"
                value={editMemberForm.qualification}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, qualification: e.target.value })}
                sx={{ mb: 2 }}
                required
              >
                {QUALIFICATION_OPTIONS.filter(qual => !['Gouvernance', 'Responsable réseau', 'Ecodim', 'Responsable Ecodim'].includes(qual.value)).map((qual) => (
                  <MenuItem key={qual.value} value={qual.value}>{qual.label}</MenuItem>
                ))}
              </TextField>
              <TextField
                select
                fullWidth
                label="Département"
                value={editMemberForm.departement}
                onChange={(e) => setEditMemberForm({ ...editMemberForm, departement: e.target.value })}
                sx={{ mb: 2 }}
              >
                {departments.map((dept) => (
                  <MenuItem key={dept._id} value={dept._id}>{dept.nom}</MenuItem>
                ))}
              </TextField>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setEditMemberModal(false)}>Annuler</Button>
            <Button onClick={() => handleUpdateMember(editMemberForm)} variant="contained">
              Mettre à jour
            </Button>
          </DialogActions>
        </Dialog>

      </Container>

      {/* Dialog de confirmation suppression GR */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        title="Supprimer le GR"
        content="Êtes-vous sûr de vouloir supprimer ce GR ?"
        onClose={handleCloseDeleteDialog}
        onConfirm={handleConfirmDeleteGr}
      />
      <DeleteConfirmDialog
        open={deleteMemberDialogOpen}
        title="Supprimer le membre"
        content="Êtes-vous sûr de vouloir supprimer ce membre ?"
        onClose={handleCloseDeleteMemberDialog}
        onConfirm={handleConfirmDeleteMember}
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


    </Box>
  );
};

// ... autres JSX du composant ...


export default NetworkDetails;
