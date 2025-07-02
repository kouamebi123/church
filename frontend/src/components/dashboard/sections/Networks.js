import React, { useState, useEffect } from 'react';
import { Typography, Box, IconButton, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, FormControl, InputLabel, Select, MenuItem, Collapse, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Grid, Snackbar, Alert } from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import DeleteConfirmDialog from '../../DeleteConfirmDialog';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import Loading from './../../Loading';
import ErrorMessage from '../../ErrorMessage';
import { useNetworks } from '../../../hooks/useApi';
import { useNotification } from '../../../hooks/useNotification';
import { apiService } from '../../../services/apiService';

const Networks = () => {
    const {
        networks,
        loading,
        error,
        fetchNetworks,
        createNetwork,
        updateNetwork,
        deleteNetwork
    } = useNetworks();

    const {
        notification,
        showSuccess,
        showError,
        hideNotification
    } = useNotification();

    const [expandedNetworkId, setExpandedNetworkId] = useState(null);
    const [expandedGrId, setExpandedGrId] = useState(null);
    const [networkDetails, setNetworkDetails] = useState({});
    const [networkGrs, setNetworkGrs] = useState({});
    const [groupDetails, setGroupDetails] = useState({});
    const [networkModal, setNetworkModal] = useState(false);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [networkToDelete, setNetworkToDelete] = useState(null);
    const [networkForm, setNetworkForm] = useState({
        nom: '',
        responsable1: '',
        responsable2: null,
        church: ''
    });
    const [editingNetworkId, setEditingNetworkId] = useState(null);
    const [networkSearchTerm, setNetworkSearchTerm] = useState('');
    const [members, setMembers] = useState([]);
    const [membersError, setMembersError] = useState(null);
    const [churches, setChurches] = useState([]);

    // Fonction pour charger les membres
    const loadMembers = async () => {
        try {
            const response = await apiService.users.getAll();
            setMembers(response.data?.data || response.data || []);
        } catch (err) {
            setMembersError('Erreur lors du chargement des membres');
            console.error(err);
        }
    };

    const loadChurches = async () => {
        try {
            const response = await apiService.churches.getAll();
            setChurches(response.data?.data || response.data || []);
        } catch (err) {
            setChurches([]);
        }
    };

    const handleNetworkClick = async (networkId) => {
        setExpandedNetworkId(expandedNetworkId === networkId ? null : networkId);
        setExpandedGrId(null);
        if (!networkDetails[networkId]) {
            try {
                const res = await apiService.networks.getById(networkId);
                setNetworkDetails(prev => ({ ...prev, [networkId]: res.data?.data || res.data }));
            } catch (e) { /* gestion erreur possible */ }
        }
        if (!networkGrs[networkId]) {
            try {
                const res = await apiService.networks.getGroups(networkId);
                setNetworkGrs(prev => ({ ...prev, [networkId]: res.data?.data || res.data }));
            } catch (e) { /* gestion erreur possible */ }
        }
    };

    const handleGrClick = async (grId) => {
        setExpandedGrId(expandedGrId === grId ? null : grId);
        if (!groupDetails[grId]) {
            try {
                const res = await apiService.groups.getById(grId);
                setGroupDetails(prev => ({ ...prev, [grId]: res.data?.data || res.data }));
            } catch (e) { /* gestion erreur possible */ }
        }
    };

    useEffect(() => {
        fetchNetworks();
        loadMembers();
        loadChurches();
    }, [fetchNetworks]);

    // Fonctions de gestion des formulaires
    const handleNetworkSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = {
                nom: networkForm.nom,
                responsable1: networkForm.responsable1,
                ...(networkForm.responsable2 && { responsable2: networkForm.responsable2 }),
                church: networkForm.church || null
            };

            if (editingNetworkId) {
                await updateNetwork(editingNetworkId, formData);
                showSuccess('Réseau modifié avec succès');
            } else {
                await createNetwork(formData);
                showSuccess('Réseau créé avec succès');
            }

            setNetworkModal(false);
            setNetworkForm({ nom: '', responsable1: '', responsable2: null, church: '' });
            setEditingNetworkId(null);
        } catch (err) {
            showError(err.message || 'Erreur lors de l\'opération');
        }
    };

    const handleEditNetwork = (network) => {
        setNetworkForm({
            nom: network.nom,
            responsable1: network.responsable1?._id || network.responsable1 || '',
            responsable2: network.responsable2?._id || network.responsable2 || null,
            church: network.church?._id || network.church || ''
        });
        setEditingNetworkId(network._id);
        setNetworkModal(true);
    };

    // Ouvre le dialog de confirmation
    const handleOpenDeleteDialog = (network) => {
        setNetworkToDelete(network);
        setDeleteDialogOpen(true);
    };

    // Ferme le dialog
    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setNetworkToDelete(null);
    };

    // Confirme la suppression
    const handleConfirmDeleteNetwork = async () => {
        if (!networkToDelete) return;
        try {
            await deleteNetwork(networkToDelete._id);
            showSuccess('Réseau supprimé avec succès');
        } catch (err) {
            showError(err.message || 'Erreur lors de la suppression');
        } finally {
            handleCloseDeleteDialog();
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>Gestion des réseaux</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setNetworkModal(true)}>Nouveau réseau</Button>
            </Box>
            <TextField data-aos="fade-up"
                fullWidth
                variant="outlined"
                placeholder="Rechercher un réseau..."
                value={networkSearchTerm}
                onChange={(e) => setNetworkSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 3 }}
            />
            {loading ? (
                <Loading titre="Chargement des réseaux..." />
            ) : error ? (
                <ErrorMessage error={error} />
            ) : (
                <TableContainer data-aos="fade-up" component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Nom</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Responsable(s)</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Église</TableCell>
                                <TableCell align="right" sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(networks) ? (
                                networks
                                    .filter(network => network.nom.toLowerCase().includes(networkSearchTerm.toLowerCase()))
                                    .map((network) => (
                                        <React.Fragment key={network._id}>
                                            <TableRow hover onClick={() => handleNetworkClick(network._id)} style={{ cursor: 'pointer' }}>
                                                <TableCell>
                                                    <IconButton size="small">
                                                        {expandedNetworkId === network._id ? <ExpandLess /> : <ExpandMore />}
                                                    </IconButton>
                                                    {network.nom}
                                                </TableCell>
                                                <TableCell>
                                                    {network.responsable1 && members.find(m => m._id === network.responsable1)?.username}
                                                    {network.responsable2 && (
                                                        <>, {members.find(m => m._id === network.responsable2)?.username}</>
                                                    )}
                                                </TableCell>
                                                <TableCell>
                                                    {network.church ? (churches.find(c => c._id === (network.church._id || network.church))?.nom || '-') : '-'}
                                                </TableCell>
                                                <TableCell align="right">
                                                    <IconButton
                                                        onClick={e => { e.stopPropagation(); handleEditNetwork(network); }}
                                                        color="primary"
                                                        size="small"
                                                    >
                                                        <EditIcon />
                                                    </IconButton>
                                                    <IconButton
                                                        onClick={e => { e.stopPropagation(); handleOpenDeleteDialog(network); }}
                                                        color="error"
                                                        size="small"
                                                    >
                                                        <DeleteIcon />
                                                    </IconButton>
                                                    {/* Action: Détail réseau */}
                                                    <IconButton
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            window.open(`/networks/${network._id}`, '_blank');
                                                        }}
                                                        color="info"
                                                        size="small"
                                                        title="Voir détails"
                                                    >
                                                        <GroupIcon />
                                                    </IconButton>
                                                </TableCell>
                                            </TableRow>
                                            <TableRow>
                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                                                    <Collapse in={expandedNetworkId === network._id} timeout="auto" unmountOnExit>
                                                        <Box margin={1}>


                                                            <Table size="small">
                                                                <TableBody>
                                                                    {(networkGrs[network._id] || []).map(gr => (
                                                                        <React.Fragment key={gr._id}>
                                                                            <TableRow hover onClick={e => { e.stopPropagation(); handleGrClick(gr._id); }} style={{ cursor: 'pointer' }}>
                                                                                <TableCell>
                                                                                    <IconButton size="small">
                                                                                        {expandedGrId === gr._id ? <ExpandLess /> : <ExpandMore />}
                                                                                    </IconButton>
                                                                                    <GroupIcon fontSize="small" sx={{ mr: 1 }} />
                                                                                    {gr.responsable2
                                                                                        ? `GR ${gr.responsable1?.username} & ${gr.responsable2?.username}`
                                                                                        : `GR ${gr.responsable1?.username}`}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                            <TableRow>
                                                                                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={3}>
                                                                                    <Collapse in={expandedGrId === gr._id} timeout="auto" unmountOnExit>
                                                                                        <Box margin={1}>

                                                                                            <ol style={{ paddingLeft: '2rem' }}>
                                                                                                {(groupDetails[gr._id]?.members || []).map(member => (
                                                                                                    <li
                                                                                                        key={member._id}
                                                                                                        style={{
                                                                                                            background: '#f5f5f5',
                                                                                                            borderRadius: '8px',
                                                                                                            padding: '8px 12px',
                                                                                                            marginBottom: '8px',
                                                                                                            color: '#333',
                                                                                                            display: 'flex',
                                                                                                            alignItems: 'center',
                                                                                                            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                                                                                                            transition: 'background 0.2s',
                                                                                                            cursor: 'pointer'
                                                                                                        }}
                                                                                                        onMouseOver={e => e.currentTarget.style.background = '#e3e9f7'}
                                                                                                        onMouseOut={e => e.currentTarget.style.background = '#f5f5f5'}
                                                                                                    >
                                                                                                        <span style={{ marginRight: '10px', color: '#1976d2' }}>👤</span>
                                                                                                        <span style={{ fontWeight: 500 }}>{member.username}</span>
                                                                                                        <span style={{ marginLeft: '8px', fontStyle: 'italic', color: '#4b5563' }}>
                                                                                                            ({member.qualification})
                                                                                                        </span>
                                                                                                    </li>
                                                                                                ))}
                                                                                            </ol>
                                                                                        </Box>
                                                                                    </Collapse>
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        </React.Fragment>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </Box>
                                                    </Collapse>
                                                </TableCell>
                                            </TableRow>
                                        </React.Fragment>
                                    ))
                            ) : null}
                            {Array.isArray(networks) &&
                                networks.filter(network => network.nom.toLowerCase().includes(networkSearchTerm.toLowerCase())).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            {networks.length === 0 ? 'Aucun réseau disponible' : 'Aucun réseau ne correspond à votre recherche'}
                                        </TableCell>
                                    </TableRow>
                                )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={networkModal}
                onClose={() => setNetworkModal(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        width: '100%',
                        maxWidth: '450px',
                        margin: '20px'
                    }
                }}
            >

                <DialogTitle>{editingNetworkId ? 'Modifier le réseau' : 'Nouveau réseau'}</DialogTitle>
                <form onSubmit={handleNetworkSubmit}>
                    <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
                            <Grid container spacing={2} sx={{ display: 'flex', }}>
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <TextField
                                        sx={{ width: 400 }}
                                        label="Nom du réseau"
                                        value={networkForm.nom}
                                        onChange={(e) => setNetworkForm({ ...networkForm, nom: e.target.value })}
                                        margin="normal"
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 400 }} margin="normal">
                                        <InputLabel id="church-label">Église</InputLabel>
                                        <Select
                                            labelId="church-label"
                                            value={networkForm.church}
                                            label="Église"
                                            onChange={(e) => setNetworkForm({ ...networkForm, church: e.target.value })}
                                        >
                                            <MenuItem value=""><em>Aucune</em></MenuItem>
                                            {churches.map((church) => (
                                                <MenuItem key={church._id} value={church._id}>{church.nom}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 400 }} margin="normal">
                                        <InputLabel id="responsable1-label">Responsable 1</InputLabel>
                                        <Select
                                            labelId="responsable1-label"
                                            value={networkForm.responsable1}
                                            label="Responsable 1"
                                            onChange={(e) => setNetworkForm({ ...networkForm, responsable1: e.target.value })}
                                            required
                                        >
                                            <MenuItem value=""><em>Aucun</em></MenuItem>
                                            {members.map((member) => (
                                                <MenuItem key={member._id} value={member._id}>{member.username || member.pseudo || member.email}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 400 }} margin="normal">
                                        <InputLabel id="responsable2-label">Responsable 2</InputLabel>
                                        <Select
                                            labelId="responsable2-label"
                                            value={networkForm.responsable2 || ''}
                                            label="Responsable 2"
                                            onChange={(e) => setNetworkForm({ ...networkForm, responsable2: e.target.value })}
                                        >
                                            <MenuItem value=""><em>Aucun</em></MenuItem>
                                            {members.map((member) => (
                                                <MenuItem key={member._id} value={member._id}>{member.username || member.pseudo || member.email}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setNetworkModal(false)}>Annuler</Button>
                        <Button type="submit" variant="contained" color="primary">{editingNetworkId ? 'Modifier' : 'Créer'}</Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Dialog de confirmation suppression */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                title="Supprimer le réseau"
                content={networkToDelete ? `Êtes-vous sûr de vouloir supprimer le réseau ${networkToDelete.nom} ?` : "Êtes-vous sûr de vouloir supprimer ce réseau ?"}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDeleteNetwork}
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

export default Networks;
