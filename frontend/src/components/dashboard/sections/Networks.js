
import React, { useState, useEffect } from 'react';
import axios from 'axios';
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


const Networks = () => {

    const [expandedNetworkId, setExpandedNetworkId] = useState(null);
    const [expandedGrId, setExpandedGrId] = useState(null);
    const [networkDetails, setNetworkDetails] = useState({});
    const [networkGrs, setNetworkGrs] = useState({});
    const [groupDetails, setGroupDetails] = useState({});
    const [networkModal, setNetworkModal] = useState(false);
    const [networks, setNetworks] = useState([]);
    const [networksError, setNetworksError] = useState(null);
    const [loading, setLoading] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [networkToDelete, setNetworkToDelete] = useState(null);
    const [networkForm, setNetworkForm] = useState({
        nom: '',
        responsable1: '',
        responsable2: null
    });
    const [editingNetworkId, setEditingNetworkId] = useState(null);
    const [networkSearchTerm, setNetworkSearchTerm] = useState('');
    const [members, setMembers] = useState([]);
    const [membersError, setMembersError] = useState(null);




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

    const token = localStorage.getItem('token');
    const API_URL = process.env.REACT_APP_API_URL + '/api';

    const handleNetworkClick = async (networkId) => {
        setExpandedNetworkId(expandedNetworkId === networkId ? null : networkId);
        setExpandedGrId(null);
        if (!networkDetails[networkId]) {
            try {
                const res = await axios.get(`${API_URL}/networks/${networkId}`, { headers: { Authorization: `Bearer ${token}` } });
                setNetworkDetails(prev => ({ ...prev, [networkId]: res.data.data }));
            } catch (e) { /* gestion erreur possible */ }
        }
        if (!networkGrs[networkId]) {
            try {
                const res = await axios.get(`${API_URL}/networks/${networkId}/grs`, { headers: { Authorization: `Bearer ${token}` } });
                setNetworkGrs(prev => ({ ...prev, [networkId]: res.data.data }));
            } catch (e) { /* gestion erreur possible */ }
        }
    };

    const handleGrClick = async (grId) => {
        setExpandedGrId(expandedGrId === grId ? null : grId);
        if (!groupDetails[grId]) {
            try {
                const res = await axios.get(`${API_URL}/groups/${grId}`, { headers: { Authorization: `Bearer ${token}` } });
                setGroupDetails(prev => ({ ...prev, [grId]: res.data.data }));
            } catch (e) { /* gestion erreur possible */ }
        }
    };


    // Fonction pour charger les réseaux
    const loadNetworks = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/networks`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setNetworks(result.data);
                setNetworksError(null);
            } else {
                throw new Error(result.message || 'Erreur lors du chargement des réseaux');
            }
        } catch (err) {
            setNetworksError('Erreur lors du chargement des réseaux');
            setNetworks([]);
            console.error(err);
        }
    };

    useEffect(() => {
        loadNetworks();
        loadMembers();
    }, []);

    // Fonctions de gestion des formulaires
    const handleNetworkSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = editingNetworkId
                ? `${API_URL}/networks/${editingNetworkId}`
                : `${API_URL}/networks`;

            // Préparer les données à envoyer, en excluant le responsable2 si null
            const formData = {
                nom: networkForm.nom,
                responsable1: networkForm.responsable1,
                ...(networkForm.responsable2 && { responsable2: networkForm.responsable2 })
            };

            const response = await fetch(url, {
                method: editingNetworkId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            const result = await response.json();

            if (response.ok) {
                setNetworkModal(false);
                setNetworkForm({ nom: '', responsable1: '', responsable2: null });
                setEditingNetworkId(null);
                setSnackbar({ open: true, message: 'Réseau créé avec succès', severity: 'success' });
                await loadNetworks();
            } else {
                const error = await response.json();
                setSnackbar({ open: true, message: error.message || 'Erreur lors de la création du réseau', severity: 'error' });
                console.error('Erreur lors de l\'opération:', error);
            }
        } catch (err) {
            console.error('Erreur lors de l\'opération:', err);
            alert(err.message);
        }
    };

    const handleEditNetwork = (network) => {
        setNetworkForm({
            nom: network.nom,
            responsable1: network.responsable1,
            responsable2: network.responsable2 || null
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
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/networks/${networkToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                await loadNetworks();
                setSnackbar({ open: true, message: 'Réseau supprimé avec succès', severity: 'success' });
            } else {
                const error = await response.json();
                setSnackbar({ open: true, message: error.message || 'Erreur lors de la suppression', severity: 'error' });
            }
        } catch (err) {
            setSnackbar({ open: true, message: 'Erreur lors de la suppression', severity: 'error' });
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
            ) : networksError ? (
                <ErrorMessage error={networksError} />
            ) : (
                <TableContainer data-aos="fade-up" component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Nom</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', backgroundColor: '#f5f5f5' }}>Responsable(s)</TableCell>
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
                                                    {network.responsable1?.username}
                                                    {network.responsable2 ? ` & ${network.responsable2.username}` : ''}
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

                <DialogTitle>Nouveau réseau</DialogTitle>
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
                                    <FormControl sx={{ width: 400 }} margin="normal" required>
                                        <InputLabel>Responsable 1</InputLabel>
                                        <Select
                                            value={networkForm.responsable1 || ''}
                                            onChange={(e) => setNetworkForm({ ...networkForm, responsable1: e.target.value })}
                                        >
                                            {Array.isArray(members) && members.map((member) => (
                                                <MenuItem key={member._id} value={member._id}>{member.username}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                                    <FormControl sx={{ width: 400 }} margin="normal">
                                        <InputLabel>Responsable 2 (optionnel)</InputLabel>
                                        <Select
                                            value={networkForm.responsable2 || ''}
                                            onChange={(e) => setNetworkForm({ ...networkForm, responsable2: e.target.value || null })}
                                        >
                                            <MenuItem value="">Aucun</MenuItem>
                                            {Array.isArray(members) && members.map((member) => (
                                                <MenuItem key={member._id} value={member._id}>{member.username}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>
                                </Grid>
                            </Grid>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setNetworkModal(false)}>Annuler</Button>
                        <Button type="submit" variant="contained" color="primary">Créer</Button>
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

export default Networks;
