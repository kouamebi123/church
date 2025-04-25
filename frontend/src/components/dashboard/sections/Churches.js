import { Box, Typography, Button, TextField, TableCell, TableContainer, Table, TableHead, TableRow, Paper, TableBody, DialogActions, DialogContent, DialogTitle, IconButton, Dialog, Tooltip, Grid, FormControl, InputLabel, MenuItem, Select, Snackbar, Alert } from '@mui/material';
import DeleteConfirmDialog from '../../DeleteConfirmDialog';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useState, useEffect } from 'react';
import Loading from '../../Loading';
import ErrorMessage from '../../ErrorMessage';

const Churches = () => {

    const [churchModal, setChurchModal] = useState(false);
    const [churchSearchTerm, setChurchSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [churches, setChurches] = useState([]);
    const [churchesError, setChurchesError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [churchToDelete, setChurchToDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const API_URL = process.env.REACT_APP_API_URL + '/api';


    const [churchForm, setChurchForm] = useState({
        nom: ''
    });

    const [editingChurchId, setEditingChurchId] = useState(null);
    // Fonction pour charger les églises
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

    const handleChurchSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = editingChurchId
                ? `${API_URL}/churches/${editingChurchId}`
                : `${API_URL}/churches`;

            const response = await fetch(url, {
                method: editingChurchId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(churchForm)
            });
            const result = await response.json();
            console.log('Church operation response:', result);

            if (response.ok) {
                setChurchModal(false);
                setChurchForm({ nom: '' });
                setEditingChurchId(null);
                setSnackbar({ open: true, message: 'Église créée avec succès', severity: 'success' });
                // Recharger immédiatement les églises
                await loadChurches();
            } else {
                throw new Error(result.message || 'Erreur lors de la création de l\'église');
            }
        } catch (err) {
            console.error('Erreur lors de la création de l\'église:', err);
        }
    };

    // Ouvre le dialog de confirmation
    const handleOpenDeleteDialog = (church) => {
        setChurchToDelete(church);
        setDeleteDialogOpen(true);
    };

    // Ferme le dialog
    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setChurchToDelete(null);
    };

    // Confirme la suppression
    const handleConfirmDeleteChurch = async () => {
        if (!churchToDelete) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/churches/${churchToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                await loadChurches();
                setSnackbar({ open: true, message: 'Église supprimée avec succès', severity: 'success' });
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

    const handleEditChurch = (church) => {
        setChurchForm({ nom: church.nom });
        setEditingChurchId(church._id);
        setChurchModal(true);
    };



    useEffect(() => {
        loadChurches();
    }, []);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>Gestion des églises</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setChurchModal(true)}>Nouvelle église</Button>
            </Box>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Rechercher une église..."
                value={churchSearchTerm}
                onChange={(e) => setChurchSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 3 }}
            />
            {loading ? (
                <Loading titre="Chargement des églises..." />
            ) : churchesError ? (
                <ErrorMessage error={churchesError} />
            ) : (
                <TableContainer data-aos="fade-up" component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nom</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(churches) ? (
                                churches
                                    .filter(church => church.nom.toLowerCase().includes(churchSearchTerm.toLowerCase()))
                                    .map((church) => (

                                        <TableRow key={church._id}>
                                            <TableCell>{church.nom}</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    onClick={() => handleEditChurch(church)}
                                                    color="primary"
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => handleOpenDeleteDialog(church)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))) : null}
                            {Array.isArray(churches) &&
                                churches.filter(church => church.nom.toLowerCase().includes(churchSearchTerm.toLowerCase())).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center">
                                            {churches.length === 0 ? 'Aucune église disponible' : 'Aucune église ne correspond à votre recherche'}
                                        </TableCell>
                                    </TableRow>
                                )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={churchModal}
                onClose={() => setChurchModal(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{
                    sx: {
                        width: '100%',
                        maxWidth: '500px',
                        margin: '20px'
                    }
                }}
            >
                <DialogTitle>Nouvelle église</DialogTitle>
                <form onSubmit={handleChurchSubmit}>
                    <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ width: '100%', maxWidth: '450px' }}>
                            <TextField
                                fullWidth
                                label="Nom de l'église"
                                value={churchForm.nom}
                                onChange={(e) => setChurchForm({ ...churchForm, nom: e.target.value })}
                                required
                                margin="normal"
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setChurchModal(false)}>Annuler</Button>
                        <Button type="submit" variant="contained" color="primary">Créer</Button>
                    </DialogActions>
                </form>
            </Dialog>
            {/* Dialog de confirmation suppression */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                title="Supprimer l'église"
                content={churchToDelete ? `Êtes-vous sûr de vouloir supprimer l'église ${churchToDelete.nom} ?` : "Êtes-vous sûr de vouloir supprimer cette église ?"}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDeleteChurch}
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

export default Churches;
