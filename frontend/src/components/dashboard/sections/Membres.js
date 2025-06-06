
import { Box, Typography, Button, TextField, TableCell, TableContainer, Table, TableHead, TableRow, Paper, TableBody, DialogActions, DialogContent, DialogTitle, IconButton, Dialog, Tooltip, Grid, FormControl, InputLabel, MenuItem, Select, Snackbar, Alert } from '@mui/material';
import DeleteConfirmDialog from '../../DeleteConfirmDialog';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import PersonIcon from '@mui/icons-material/Person';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { ROLE_OPTIONS } from '../../../constants/enums';
import Loading from '../../Loading';
import ErrorMessage from '../../ErrorMessage';

const API_URL = process.env.REACT_APP_API_URL + '/api';

const Membres = () => {
    // --- Ajout de l'état pour les groupes ---
    const [groups, setGroups] = useState([]);
    const [groupsError, setGroupsError] = useState(null);
    const [members, setMembers] = useState([]);
    const [membersError, setMembersError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [memberModal, setMemberModal] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [churches, setChurches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [departmentsError, setDepartmentsError] = useState(null);
    const [churchesError, setChurchesError] = useState(null);


    // Dialogs pour actions membres
    const [roleDialog, setRoleDialog] = useState({ open: false, member: null, role: '' });
    const [resetDialog, setResetDialog] = useState({ open: false, member: null, newPassword: '' });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, member: null });
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [isolatedMembers, setIsolatedMembers] = useState([]);



    const [memberForm, setMemberForm] = useState({
        username: '',
        pseudo: '',
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
        sert_departement: 'Non',
        departement: '',
        qualification: 'En integration',
        email: '',
        telephone: '',
        adresse: ''
    });

    const loadChurches = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/churches`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (response.ok) {
                console.log('Churches:', result);
                setChurches(result.data);
                setChurchesError(null); // Réinitialiser l'erreur si le chargement réussit
            } else {
                throw new Error(result.message || 'Erreur lors du chargement des églises');
            }
        } catch (err) {
            console.error('Erreur lors du chargement des églises:', err);
            setChurches([]); // Réinitialiser les églises en cas d'erreur
            setChurchesError('Erreur lors du chargement des églises');
        } finally {
            setLoading(false); // S'assurer que le loading est toujours désactivé
        }
    };

    // Fonction pour charger les départements
    const loadDepartments = async () => {
        setLoadingDepartments(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/departments`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setDepartments(result.data);
                setDepartmentsError(null); // Réinitialiser l'erreur si le chargement réussit
            } else {
                throw new Error(result.message || 'Erreur lors du chargement des départements');
            }
        } catch (err) {
            setDepartmentsError('Erreur lors du chargement des départements');
            setDepartments([]); // Réinitialiser les départements en cas d'erreur
            console.error(err);
        } finally {
            setLoadingDepartments(false); // S'assurer que le loading est désactivé
        }
    };




    const handleGrantRights = (member) => {
        setRoleDialog({ open: true, member, role: member.role || '' });
    };
    const handleRoleChange = (e) => {
        setRoleDialog(prev => ({ ...prev, role: e.target.value }));
    };
    const handleRoleSubmit = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_URL}/users/${roleDialog.member._id}`, { role: roleDialog.role }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSnackbar({ open: true, message: 'Rôle mis à jour', severity: 'success' });
            setRoleDialog({ open: false, member: null, role: '' });
            await loadMembers();
        } catch (err) {
            setSnackbar({ open: true, message: "Erreur lors de l'attribution du rôle", severity: 'error' });
        }
    };

    const handleResetPassword = async (member) => {
        setResetDialog({ open: true, member, newPassword: '...' });
        try {
            const token = localStorage.getItem('token');
            // Appel API pour reset le mot de passe
            const res = await axios.post(`${API_URL}/users/${member._id}/reset-password`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setResetDialog({ open: true, member, newPassword: res.data?.newPassword || 'N/A' });
            setSnackbar({ open: true, message: 'Mot de passe réinitialisé', severity: 'success' });
        } catch (err) {
            setSnackbar({ open: true, message: 'Erreur lors de la réinitialisation', severity: 'error' });
            setResetDialog({ open: false, member: null, newPassword: '' });
        }
    };
    const handleCloseResetDialog = () => setResetDialog({ open: false, member: null, newPassword: '' });

    const handleDeleteMember = (member) => {
        setDeleteDialog({ open: true, member });
    };
    const handleConfirmDelete = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`${API_URL}/users/${deleteDialog.member._id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSnackbar({ open: true, message: 'Membre supprimé', severity: 'success' });
            setDeleteDialog({ open: false, member: null });
            await loadMembers();
        } catch (err) {
            setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
        }
    };
    const handleCloseDeleteDialog = () => setDeleteDialog({ open: false, member: null });

    const handleMemberSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(memberForm)
            });
            if (response.ok) {
                setMemberModal(false);
                loadMembers();
            }
        } catch (err) {
            console.error('Erreur lors de la création du membre:', err);
        }
    };


    // Fonction pour charger les membres
    const loadMembers = async () => {
        //setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/users`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setMembers(result.data);
            } else {
                throw new Error(result.message || 'Erreur lors du chargement des membres');
            }
        } catch (err) {
            setMembersError('Erreur lors du chargement des membres');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadMembers();
        loadChurches();
        loadGroups();
        loadIsolatedMembers();
    }, []);

    const loadIsolatedMembers = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/users/isoles`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setIsolatedMembers(result.data);
            } else {
                throw new Error(result.message || 'Erreur lors du chargement des membres non isolés');
            }
        } catch (err) {
            console.error('Erreur lors du chargement des membres non isolés:', err);
        }
    };

    // Fonction pour charger les groupes
    const loadGroups = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/groups`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (response.ok) {
                setGroups(result.data);
                setGroupsError(null);
            } else {
                throw new Error(result.message || 'Erreur lors du chargement des groupes');
            }
        } catch (err) {
            setGroupsError('Erreur lors du chargement des groupes');
            setGroups([]);
            console.error(err);
        }
    };

    // --- Ajout de l'état pour la recherche ---
    const [searchTerm, setSearchTerm] = useState("");

    // --- Ajout du filtre avancé ---
    const FILTER_OPTIONS = [
        { label: 'Tous', value: '' },
        { label: 'Responsable réseau', value: 'Responsable réseau' },
        { label: 'Responsables de GR', value: 'Responsables de GR' },//l'ensemble des personnes qui sont soit responsable1 ou responsable2 d'un groups (model groups.js)
        { label: 'Leader', value: 'Leader' },
        { label: 'Leaders (tous)', value: 'Leaders (tous)' },//l'ensemble des Leader, 12, 144, 1728, Responsable réseau.
        { label: 'Régulier', value: 'Régulier' },
        { label: 'En intégration', value: 'En intégration' },
        { label: 'Irrégulier', value: 'Irrégulier' },
        { label: 'Ecodim', value: 'Ecodim' },
        { label: 'Responsable Ecodim', value: 'Responsable ecodim' },
        { label: '12', value: '12' },
        { label: '144', value: '144' },
        { label: '1728', value: '1728' },
        { label: 'Personnes isolées', value: 'Personnes isolées' },
    ];
    const [filter, setFilter] = useState('');

    // Fonction de filtrage avancé
    const filterMembers = (members) => {
        if (!filter) return members;
        // Cas spéciaux pour "Leaders (tous)" et "Responsables Ecodim"
        if (filter === 'Leaders (tous)') {
            return members.filter(m => m.qualification === 'Leader' || m.qualification === 'Responsable réseau' || m.qualification === '12' || m.qualification === '144' || m.qualification === '1728' || m.qualification === 'Responsable ecodim');
        }
        if (filter === 'Responsable ecodim') {
            return members.filter(m => (m.qualification || '').toLowerCase().includes('ecodim') && (m.qualification || '').toLowerCase().includes('responsable'));
        }
        if (filter === 'Personnes isolées') {
            return isolatedMembers;
        }
        // Cas spécial pour "Responsables de GR"
        if (filter === 'Responsables de GR') {
            // On extrait tous les responsables des groupes (responsable1 et responsable2)
            const responsablesIds = new Set();
            groups.forEach(gr => {
                if (gr.responsable1 && gr.responsable1._id) responsablesIds.add(gr.responsable1._id);
                if (gr.responsable2 && gr.responsable2._id) responsablesIds.add(gr.responsable2._id);
            });
            return members.filter(m => responsablesIds.has(m._id));
        }
        // Filtre standard sur qualification
        return members.filter(m => (m.qualification || '').toLowerCase() === filter.toLowerCase());
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>Gestion des membres</Typography>
                <FormControl sx={{ minWidth: 250, mx: 3 }}>
                    <InputLabel>Filtrer par catégorie</InputLabel>
                    <Select
                        value={filter}
                        label="Filtrer par catégorie"
                        onChange={e => setFilter(e.target.value)}
                    >
                        {FILTER_OPTIONS.map(opt => (
                            <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setMemberModal(true)}>Nouveau membre</Button>
            </Box>
            <TextField data-aos="fade-up"
                fullWidth
                variant="outlined"
                placeholder="Rechercher un membre..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 3 }}
            />
            {loading ? (
                <Loading titre="Chargement des membres..." />
            ) : membersError ? (
                <ErrorMessage error={membersError} />
            ) : (
                <>
                    {/* Affichage de l'effectif filtré */}
                    <Typography data-aos="fade-up" sx={{ mb: 1, fontWeight: 'bold' }}>
                        Effectif trouvé : {
                            Array.isArray(members)
                                ? filterMembers(members).filter(member =>
                                    member.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).length
                                : 0
                        }
                    </Typography>
                    <TableContainer data-aos="fade-up" component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Nom</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Email</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Téléphone</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Qualification</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Rôle</TableCell>
                                    <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                            {Array.isArray(members) && filterMembers(members)
                                .filter(member =>
                                    member.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
                                )
                                .map(member => (
                                    <TableRow key={member._id}>
                                        <TableCell>{member.username}</TableCell>
                                        <TableCell>{member.email}</TableCell>
                                        <TableCell>{member.telephone || '-'}</TableCell>
                                        <TableCell>{member.qualification || '-'}</TableCell>
                                        <TableCell>{member.role || '-'}</TableCell>
                                        <TableCell align="right">
                                            <Tooltip title="Attribuer des droits">
                                                <IconButton size="small" color="primary" onClick={() => handleGrantRights(member)}>
                                                    <PersonIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Réinitialiser le mot de passe">
                                                <IconButton size="small" color="secondary" onClick={() => handleResetPassword(member)}>
                                                    <LockResetIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Supprimer">
                                                <IconButton size="small" color="error" onClick={() => handleDeleteMember(member)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                        </Table>
                    </TableContainer>
                </>
            )}
            {/* Dialog attribution de rôle */}
            <Dialog open={roleDialog.open} onClose={() => setRoleDialog({ open: false, member: null, role: '' })}>
                <DialogTitle>Attribuer un rôle</DialogTitle>
                <DialogContent>
                    <FormControl fullWidth sx={{ mt: 2, minWidth: 300 }}>
                        <InputLabel id="role-select-label">Rôle</InputLabel>
                        <Select
                            labelId="role-select-label"
                            value={roleDialog.role}
                            label="Rôle"
                            onChange={handleRoleChange}
                        >
                            {ROLE_OPTIONS.map(role => (
                                <MenuItem key={role.value} value={role.value}>
                                    {role.label}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRoleDialog({ open: false, member: null, role: '' })}>Annuler</Button>
                    <Button onClick={handleRoleSubmit} variant="contained">Valider</Button>
                </DialogActions>
            </Dialog>

            {/* Dialog reset mot de passe */}
            <Dialog open={resetDialog.open} onClose={handleCloseResetDialog}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <LockResetIcon color="primary" sx={{ mr: 1 }} />
                    Mot de passe réinitialisé
                </DialogTitle>
                <DialogContent sx={{ minWidth: 340 }}>
                    <Typography sx={{ mb: 1 }}>
                        Nouveau mot de passe pour <b style={{ color: '#1976d2' }}>{resetDialog.member?.username}</b> :
                    </Typography>
                    <Box
                        sx={{
                            mt: 2,
                            p: 2,
                            bgcolor: 'background.paper',
                            borderRadius: 2,
                            boxShadow: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: 2,
                            border: '1px solid #e0e0e0',
                        }}
                    >
                        <Typography
                            variant="h6"
                            sx={{ wordBreak: 'break-all', letterSpacing: 1, fontWeight: 700, color: 'primary.main', flex: 1 }}
                        >
                            {resetDialog.newPassword}
                        </Typography>
                        <Tooltip title="Copier le mot de passe">
                            <IconButton
                                color="primary"
                                onClick={() => {
                                    navigator.clipboard.writeText(resetDialog.newPassword);
                                }}
                                sx={{ ml: 1 }}
                            >
                                <LockResetIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        Ce mot de passe temporaire doit être communiqué de façon sécurisée au membre.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseResetDialog} variant="contained" color="primary" sx={{ fontWeight: 600 }}>
                        Fermer
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog
                open={memberModal}
                onClose={() => setMemberModal(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: {
                        width: '100%',
                        maxWidth: '800px',
                        margin: '20px'
                    }
                }}
            >
                <DialogTitle>Nouveau membre</DialogTitle>
                <form onSubmit={handleMemberSubmit}>
                    <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 2,
                            alignItems: 'center',
                            width: '100%',
                            maxWidth: '750px'
                        }}>
                            <Grid
                                container
                                spacing={2}
                                sx={{
                                    margin: 0,
                                    alignItems: 'center'
                                }}>
                                {/* Informations personnelles */}

                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <TextField
                                        sx={{ width: 350 }}
                                        label="Nom d'utilisateur"
                                        value={memberForm.username}
                                        onChange={(e) => setMemberForm({ ...memberForm, username: e.target.value })}
                                        margin="normal"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <TextField
                                        sx={{ width: 350 }}
                                        label="Pseudo"
                                        value={memberForm.pseudo}
                                        onChange={(e) => setMemberForm({ ...memberForm, pseudo: e.target.value })}
                                        margin="normal"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <TextField
                                        sx={{ width: 350 }}
                                        type="password"
                                        label="Mot de passe"
                                        value={memberForm.password}
                                        onChange={(e) => setMemberForm({ ...memberForm, password: e.target.value })}
                                        margin="normal"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 350 }} margin="normal" required>
                                        <InputLabel>Genre</InputLabel>
                                        <Select
                                            sx={{ minWidth: 350 }}
                                            value={memberForm.genre}
                                            onChange={(e) => setMemberForm({ ...memberForm, genre: e.target.value })}
                                        >
                                            <MenuItem value="Homme">Homme</MenuItem>
                                            <MenuItem value="Femme">Femme</MenuItem>
                                            <MenuItem value="Enfant">Enfant</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Informations démographiques */}

                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 350 }} margin="normal" required>
                                        <InputLabel>Tranche d'âge</InputLabel>
                                        <Select
                                            sx={{ minWidth: 350 }}
                                            value={memberForm.tranche_age}
                                            onChange={(e) => setMemberForm({ ...memberForm, tranche_age: e.target.value })}
                                        >
                                            <MenuItem value="0 - 2 ans">0 - 2 ans</MenuItem>
                                            <MenuItem value="2 - 6 ans">2 - 6 ans</MenuItem>
                                            <MenuItem value="7 - 12 ans">7 - 12 ans</MenuItem>
                                            <MenuItem value="13 - 18 ans">13 - 18 ans</MenuItem>
                                            <MenuItem value="19 - 25 ans">19 - 25 ans</MenuItem>
                                            <MenuItem value="26 - 35 ans">26 - 35 ans</MenuItem>
                                            <MenuItem value="36 - 55 ans">36 - 55 ans</MenuItem>
                                            <MenuItem value="56 - 85 ans">56 - 85 ans</MenuItem>
                                            <MenuItem value="85 ans et plus">85 ans et plus</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <TextField
                                        sx={{ width: 350 }}
                                        label="Profession"
                                        value={memberForm.profession}
                                        onChange={(e) => setMemberForm({ ...memberForm, profession: e.target.value })}
                                        margin="normal"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <TextField
                                        sx={{ width: 350 }}
                                        label="Ville de résidence"
                                        value={memberForm.ville_residence}
                                        onChange={(e) => setMemberForm({ ...memberForm, ville_residence: e.target.value })}
                                        margin="normal"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <TextField
                                        sx={{ width: 350 }}
                                        label="Origine"
                                        value={memberForm.origine}
                                        onChange={(e) => setMemberForm({ ...memberForm, origine: e.target.value })}
                                        margin="normal"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 350 }} margin="normal" required>
                                        <InputLabel>Situation matrimoniale</InputLabel>
                                        <Select
                                            sx={{ minWidth: 350 }}
                                            value={memberForm.situation_matrimoniale}
                                            onChange={(e) => setMemberForm({ ...memberForm, situation_matrimoniale: e.target.value })}
                                        >
                                            <MenuItem value="Marié(e)">Marié(e)</MenuItem>
                                            <MenuItem value="Célibataire">Célibataire</MenuItem>
                                            <MenuItem value="Veuf(ve)">Veuf(ve)</MenuItem>
                                            <MenuItem value="Divorcé(e)">Divorcé(e)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                {/* Formation */}

                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 350 }} margin="normal" required>
                                        <InputLabel>Niveau d'éducation</InputLabel>
                                        <Select
                                            sx={{ minWidth: 350 }}
                                            value={memberForm.niveau_education}
                                            onChange={(e) => setMemberForm({ ...memberForm, niveau_education: e.target.value })}
                                        >
                                            <MenuItem value="Aucun diplôme ou certificat d'études primaires">Aucun diplôme ou certificat d'études primaires</MenuItem>
                                            <MenuItem value="Brevet des collèges">Brevet des collèges</MenuItem>
                                            <MenuItem value="CAP, BEP ou équivalent">CAP, BEP ou équivalent</MenuItem>
                                            <MenuItem value="Baccalauréat, brevet professionnel ou équivalent">Baccalauréat, brevet professionnel ou équivalent</MenuItem>
                                            <MenuItem value="Diplôme du supérieur court (niveau bac + 2)">Diplôme du supérieur court (niveau bac + 2)</MenuItem>
                                            <MenuItem value="Diplôme du supérieur long (bac + 2 ⇔ bac + 5)">Diplôme du supérieur long (bac + 2 ⇔ bac + 5)</MenuItem>
                                            <MenuItem value="Diplôme du supérieur long (supérieur à bac + 5)">Diplôme du supérieur long (supérieur à bac + 5)</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Église et Département */}

                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 350 }} margin="normal" required>
                                        <InputLabel>Église locale</InputLabel>
                                        <Select
                                            sx={{ minWidth: 350 }}
                                            value={memberForm.eglise_locale}
                                            onChange={(e) => setMemberForm({ ...memberForm, eglise_locale: e.target.value })}
                                        >
                                            {churches.map((church) => (
                                                <MenuItem key={church._id} value={church._id}>{church.nom}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 350 }} margin="normal" required>
                                        <InputLabel>Sert dans un département</InputLabel>
                                        <Select
                                            sx={{ minWidth: 350 }}
                                            value={memberForm.sert_departement}
                                            onChange={(e) => setMemberForm({ ...memberForm, sert_departement: e.target.value, departement: e.target.value === 'Non' ? '' : memberForm.departement })}
                                        >
                                            <MenuItem value="Oui">Oui</MenuItem>
                                            <MenuItem value="Non">Non</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 350 }} margin="normal" required>
                                        <InputLabel>Département</InputLabel>
                                        <Select
                                            sx={{ minWidth: 350 }}
                                            value={memberForm.departement}
                                            onChange={(e) => setMemberForm({ ...memberForm, departement: e.target.value })}
                                            disabled={memberForm.sert_departement !== 'Oui'}
                                        >
                                            {Array.isArray(departments) && departments.map((dept) => (
                                                <MenuItem key={dept._id} value={dept._id}>{dept.name}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 350 }} margin="normal" required>
                                        <InputLabel>Qualification</InputLabel>
                                        <Select
                                            sx={{ minWidth: 350 }}
                                            value={memberForm.qualification}
                                            onChange={(e) => setMemberForm({ ...memberForm, qualification: e.target.value })}
                                        >
                                            <MenuItem value="12">12</MenuItem>
                                            <MenuItem value="144">144</MenuItem>
                                            <MenuItem value="1728">1728</MenuItem>
                                            <MenuItem value="Leader">Leader</MenuItem>
                                            <MenuItem value="Responsable reseau">Responsable réseau</MenuItem>
                                            <MenuItem value="Regulier">Régulier</MenuItem>
                                            <MenuItem value="Irregulier">Irrégulier</MenuItem>
                                            <MenuItem value="En integration">En intégration</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>

                                {/* Contact */}

                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <TextField
                                        sx={{ width: 350 }}
                                        type="email"
                                        label="Email"
                                        value={memberForm.email}
                                        onChange={(e) => setMemberForm({ ...memberForm, email: e.target.value })}
                                        margin="normal"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <TextField
                                        sx={{ width: 350 }}
                                        label="Téléphone"
                                        value={memberForm.telephone}
                                        onChange={(e) => setMemberForm({ ...memberForm, telephone: e.target.value })}
                                        margin="normal"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <TextField
                                        sx={{ width: 350 }}
                                        label="Adresse"
                                        value={memberForm.adresse}
                                        onChange={(e) => setMemberForm({ ...memberForm, adresse: e.target.value })}
                                        margin="normal"
                                        required
                                        multiline
                                        rows={3}
                                    />
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setMemberModal(false)}>Annuler</Button>
                        <Button type="submit" variant="contained" color="primary">Créer</Button>
                    </DialogActions>
                </form>
            </Dialog>
            {/* Dialog de confirmation suppression */}
            <DeleteConfirmDialog
                open={deleteDialog.open}
                title="Supprimer le membre"
                content={memberToDelete ? `Êtes-vous sûr de vouloir supprimer le membre ${memberToDelete.username} ?` : "Êtes-vous sûr de vouloir supprimer ce membre ?"}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDelete}
            />

            {/* Snackbar feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
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

export default Membres;
