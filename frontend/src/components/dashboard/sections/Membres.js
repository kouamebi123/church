import { Box, Typography, Button, TextField, TableCell, TableContainer, Table, TableHead, TableRow, Paper, TableBody, DialogActions, DialogContent, DialogTitle, IconButton, Dialog, Tooltip, Grid, FormControl, InputLabel, MenuItem, Select, Snackbar, Alert } from '@mui/material';
import DeleteConfirmDialog from '../../DeleteConfirmDialog';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import DeleteIcon from '@mui/icons-material/Delete';
import LockResetIcon from '@mui/icons-material/LockReset';
import PersonIcon from '@mui/icons-material/Person';
import EditIcon from '@mui/icons-material/Edit';
import { useState, useEffect } from 'react';
import { ROLE_OPTIONS, QUALIFICATION_OPTIONS, GENRE_OPTIONS, TRANCHE_AGE_OPTIONS, SITUATION_MATRIMONIALE_OPTIONS, NIVEAU_EDUCATION_OPTIONS } from '../../../constants/enums';
import Loading from '../../Loading';
import ErrorMessage from '../../ErrorMessage';
import { useUsers } from '../../../hooks/useApi';
import { useNotification } from '../../../hooks/useNotification';
import { apiService } from '../../../services/apiService';
import { red } from '@mui/material/colors';

const Membres = () => {
    // --- Ajout de l'état pour les groupes ---
    const [groups, setGroups] = useState([]);
    const [groupsError, setGroupsError] = useState(null);
    const [churches, setChurches] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [departmentsError, setDepartmentsError] = useState(null);
    const [churchesError, setChurchesError] = useState(null);

    const {
        users: members,
        loading,
        error,
        fetchUsers: loadMembers,
        createUser,
        updateUser,
        deleteUser
    } = useUsers();

    const {
        notification,
        showSuccess,
        showError,
        hideNotification
    } = useNotification();

    // Dialogs pour actions membres
    const [roleDialog, setRoleDialog] = useState({ open: false, member: null, role: '' });
    const [resetDialog, setResetDialog] = useState({ open: false, member: null, newPassword: '' });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, member: null });
    const [memberToDelete, setMemberToDelete] = useState(null);
    const [isolatedMembers, setIsolatedMembers] = useState([]);
    const [memberModal, setMemberModal] = useState(false);
    const [editMode, setEditMode] = useState(false);
    const [memberToEdit, setMemberToEdit] = useState(null);

    const [memberForm, setMemberForm] = useState({
        username: '',
        pseudo: '',
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
        qualification: 'En intégration',
        email: '',
        telephone: '',
        adresse: ''
    });

    const loadChurches = async () => {
        try {
            const response = await apiService.churches.getAll();
            setChurches(response.data?.data || response.data || []);
            setChurchesError(null);
        } catch (err) {
            console.error('Erreur lors du chargement des églises:', err);
            setChurches([]);
            setChurchesError('Erreur lors du chargement des églises');
        }
    };

    // Fonction pour charger les départements
    const loadDepartments = async () => {
        setLoadingDepartments(true);
        try {
            const response = await apiService.departments.getAll();
            setDepartments(response.data?.data || response.data || []);
            setDepartmentsError(null);
        } catch (err) {
            setDepartmentsError('Erreur lors du chargement des départements');
            setDepartments([]);
            console.error(err);
        } finally {
            setLoadingDepartments(false);
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
            await updateUser(roleDialog.member._id, { role: roleDialog.role });
            showSuccess('Rôle mis à jour');
            setRoleDialog({ open: false, member: null, role: '' });
            await loadMembers();
        } catch (err) {
            showError("Erreur lors de l'attribution du rôle");
        }
    };

    const handleResetPassword = async (member) => {
        setResetDialog({ open: true, member, newPassword: '...' });
        try {
            const res = await apiService.users.resetPassword(member._id);
            setResetDialog({ open: true, member, newPassword: res.data?.newPassword || 'N/A' });
            showSuccess('Mot de passe réinitialisé');
        } catch (err) {
            showError('Erreur lors de la réinitialisation');
            setResetDialog({ open: false, member: null, newPassword: '' });
        }
    };

    const handleCloseResetDialog = () => setResetDialog({ open: false, member: null, newPassword: '' });

    const handleDeleteMember = (member) => {
        setDeleteDialog({ open: true, member });
    };

    const handleConfirmDelete = async () => {
        try {
            await deleteUser(deleteDialog.member._id);
            showSuccess('Membre supprimé');
            setDeleteDialog({ open: false, member: null });
            await loadMembers();
        } catch (err) {
            showError('Erreur lors de la suppression');
        }
    };

    const handleCloseDeleteDialog = () => setDeleteDialog({ open: false, member: null });

    const handleEditMember = (member) => {
        setEditMode(true);
        setMemberToEdit(member);
        setMemberForm({
            ...member,
            eglise_locale: member.eglise_locale?._id || member.eglise_locale || '',
            departement: member.departement?._id || member.departement || '',
        });
        setMemberModal(true);
    };

    const handleMemberSubmit = async (e) => {
        e.preventDefault();
        const dataToSend = {
            ...memberForm,
            departement: memberForm.departement === '' ? null : memberForm.departement
        };
        try {
            if (editMode && memberToEdit) {
                await updateUser(memberToEdit._id, dataToSend);
                showSuccess('Membre mis à jour avec succès');
            } else {
                await createUser(dataToSend);
                showSuccess('Membre créé avec succès');
            }
            setMemberModal(false);
            setEditMode(false);
            setMemberToEdit(null);
            setMemberForm({
                username: '',
                pseudo: '',
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
                qualification: 'En intégration',
                email: '',
                telephone: '',
                adresse: ''
            });
            await loadMembers();
        } catch (err) {
            showError('Erreur lors de la sauvegarde du membre');
            console.error('Erreur lors de la sauvegarde du membre:', err);
        }
    };

    useEffect(() => {
        loadMembers();
        loadChurches();
        loadGroups();
        loadIsolatedMembers();
        loadDepartments();
    }, []);

    const loadIsolatedMembers = async () => {
        try {
            const response = await apiService.users.getIsoles();
            setIsolatedMembers(response.data?.data || response.data || []);
        } catch (err) {
            console.error('Erreur lors du chargement des membres non isolés:', err);
        }
    };

    // Fonction pour charger les groupes
    const loadGroups = async () => {
        try {
            const response = await apiService.groups.getAll();
            setGroups(response.data?.data || response.data || []);
            setGroupsError(null);
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
            ) : error ? (
                <ErrorMessage error={error} />
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
                                            <Tooltip title="Modifier">
                                                <IconButton size="small" color="info" onClick={() => handleEditMember(member)}>
                                                    <EditIcon />
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
                onClose={() => {
                    setMemberModal(false);
                    setEditMode(false);
                    setMemberToEdit(null);
                    setMemberForm({
                        username: '',
                        pseudo: '',
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
                        qualification: 'En intégration',
                        email: '',
                        telephone: '',
                        adresse: ''
                    });
                }}
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
                <DialogTitle>{editMode ? 'Modifier le membre' : 'Nouveau membre'}</DialogTitle>
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
                                    <FormControl sx={{ width: 350 }} margin="normal" required>
                                        <InputLabel>Genre</InputLabel>
                                        <Select
                                            sx={{ minWidth: 350 }}
                                            value={memberForm.genre}
                                            onChange={(e) => setMemberForm({ ...memberForm, genre: e.target.value })}
                                        >
                                            {GENRE_OPTIONS.map((genre) => (
                                                <MenuItem key={genre.value} value={genre.value}>{genre.label}</MenuItem>
                                            ))}
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
                                            {TRANCHE_AGE_OPTIONS.map((tranche) => (
                                                <MenuItem key={tranche.value} value={tranche.value}>{tranche.label}</MenuItem>
                                            ))}
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
                                            {SITUATION_MATRIMONIALE_OPTIONS.map((situation) => (
                                                <MenuItem key={situation.value} value={situation.value}>{situation.label}</MenuItem>
                                            ))}
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
                                            {NIVEAU_EDUCATION_OPTIONS.map((niveau) => (
                                                <MenuItem key={niveau.value} value={niveau.value}>{niveau.label}</MenuItem>
                                            ))}
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
                                {/* Sert dans un département : seulement en création */}
                                {!editMode && (
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
                                )}
                                {/* Département : toujours affiché en modification, ou si sert_departement === 'Oui' en création */}
                                {(editMode || memberForm.sert_departement === 'Oui') && (
                                    <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                        <FormControl sx={{ width: 350 }} margin="normal">
                                            <InputLabel>Département</InputLabel>
                                            <Select
                                                sx={{ minWidth: 350 }}
                                                value={memberForm.departement}
                                                onChange={(e) => setMemberForm({ ...memberForm, departement: e.target.value })}
                                            >
                                                <MenuItem value="">Ne sert plus</MenuItem>
                                                {departmentsError && (
                                                    <Alert severity="error">{departmentsError}</Alert>
                                                )}
                                                {departments.length === 0 && !departmentsError && (
                                                    <Alert severity="info">Aucun département trouvé</Alert>
                                                )}
                                                {Array.isArray(departments) && departments.map((dept) => (
                                                    <MenuItem key={dept._id} value={dept._id}>{dept.nom}</MenuItem>
                                                ))}
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                )}
                                <Grid item xs={12} sm={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 350 }} margin="normal" required>
                                        <InputLabel>Qualification</InputLabel>
                                        <Select
                                            sx={{ minWidth: 350 }}
                                            value={memberForm.qualification}
                                            onChange={(e) => setMemberForm({ ...memberForm, qualification: e.target.value })}
                                        >
                                            {QUALIFICATION_OPTIONS.map((qual) => (
                                                <MenuItem key={qual.value} value={qual.value}>{qual.label}</MenuItem>
                                            ))}
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
                        <Button type="submit" variant="contained" color="primary">{editMode ? 'Mettre à jour' : 'Créer'}</Button>
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
                open={notification.open}
                autoHideDuration={4000}
                onClose={hideNotification}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={hideNotification} severity={notification.severity} sx={{ width: '100%' }}>
                    {notification.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Membres;
