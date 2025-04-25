import { Box, Typography, Button, TextField, TableCell, TableContainer, Table, TableHead, TableRow, Paper, TableBody, DialogActions, DialogContent, DialogTitle, IconButton, Dialog, Tooltip, Grid, FormControl, InputLabel, MenuItem, Select, Snackbar, Alert, CircularProgress } from '@mui/material';
import DeleteConfirmDialog from '../../DeleteConfirmDialog';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useState, useEffect } from 'react';
import ErrorMessage from '../../ErrorMessage';

const API_URL = process.env.REACT_APP_API_URL + '/api';

const Departments = () => {

    const [departments, setDepartments] = useState([]);
    const [departmentsError, setDepartmentsError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
    const [loadingDepartments, setLoadingDepartments] = useState(false);
    const [departmentModal, setDepartmentModal] = useState(false);
    const [editingDepartmentId, setEditingDepartmentId] = useState(null);
    const [departmentForm, setDepartmentForm] = useState({
        nom: ''
    });
    const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');


    const handleEditDepartment = (department) => {
        setDepartmentForm({ nom: department.nom });
        setEditingDepartmentId(department._id);
        setDepartmentModal(true);
    };

    // Ouvre le dialog de confirmation
    const handleOpenDeleteDialog = (department) => {
        setDepartmentToDelete(department);
        setDeleteDialogOpen(true);
    };

    // Ferme le dialog
    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDepartmentToDelete(null);
    };

    // Confirme la suppression
    const handleConfirmDeleteDepartment = async () => {
        if (!departmentToDelete) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/departments/${departmentToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                await loadDepartments();
                setSnackbar({ open: true, message: 'Département supprimé avec succès', severity: 'success' });
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



    useEffect(() => {
        loadDepartments();
    }, []);

    const handleDepartmentSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const url = editingDepartmentId
                ? `${API_URL}/departments/${editingDepartmentId}`
                : `${API_URL}/departments`;

            const response = await fetch(url, {
                method: editingDepartmentId ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(departmentForm)
            });

            if (response.ok) {
                setDepartmentModal(false);
                setDepartmentForm({ nom: '' });
                setEditingDepartmentId(null);
                setSnackbar({ open: true, message: 'Département créé avec succès', severity: 'success' });
                await loadDepartments();
            } else {
                const error = await response.json();
                setSnackbar({ open: true, message: error.message || 'Erreur lors de la création du département', severity: 'error' });
                console.error('Erreur lors de l\'opération:', error);
            }
        } catch (err) {
            console.error('Erreur lors de l\'opération:', err);
        }
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>Gestion des départements</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDepartmentModal(true)}>Nouveau département</Button>
            </Box>
            <TextField
                fullWidth
                variant="outlined"
                placeholder="Rechercher un département..."
                value={departmentSearchTerm}
                onChange={(e) => setDepartmentSearchTerm(e.target.value)}
                InputProps={{
                    startAdornment: <SearchIcon sx={{ mr: 1, color: 'text.secondary' }} />
                }}
                sx={{ mb: 3 }}
            />
            {loadingDepartments ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            ) : departmentsError ? (
                <ErrorMessage error={departmentsError} />
            ) : (
                <TableContainer data-aos="fade-up" component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nom</TableCell>
                                <TableCell>Membres</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(departments) ? (
                                departments
                                    .filter(department => {
                                        if (!department || !department.nom) return false;
                                        const searchTerm = (departmentSearchTerm || '').toLowerCase();
                                        const nomDepartement = String(department.nom).toLowerCase();
                                        return nomDepartement.includes(searchTerm);
                                    })
                                    .map((department) => (
                                        <TableRow key={department._id}>
                                            <TableCell>{department.nom}</TableCell>
                                            <TableCell>{department.members?.length || 0} membres</TableCell>
                                            <TableCell align="right">
                                                <IconButton
                                                    onClick={() => handleEditDepartment(department)}
                                                    color="primary"
                                                    size="small"
                                                >
                                                    <EditIcon />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => handleOpenDeleteDialog(department)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            ) : null}
                            {Array.isArray(departments) &&
                                departments.filter(department => department.nom.toLowerCase().includes(departmentSearchTerm.toLowerCase())).length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} align="center">
                                            {departments.length === 0 ? 'Aucun département disponible' : 'Aucun département ne correspond à votre recherche'}
                                        </TableCell>
                                    </TableRow>
                                )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            <Dialog
                open={departmentModal}
                onClose={() => setDepartmentModal(false)}
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
                <DialogTitle>{editingDepartmentId ? 'Modifier le département' : 'Nouveau département'}</DialogTitle>
                <form onSubmit={handleDepartmentSubmit}>
                    <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ width: '100%', maxWidth: '450px' }}>
                            <TextField
                                fullWidth
                                label="Nom du département"
                                value={departmentForm.nom}
                                onChange={(e) => setDepartmentForm({ ...departmentForm, nom: e.target.value })}
                                margin="normal"
                                required
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setDepartmentModal(false)}>Annuler</Button>
                        <Button type="submit" variant="contained" color="primary">{editingDepartmentId ? 'Modifier' : 'Créer'}</Button>
                    </DialogActions>
                </form>
            </Dialog>
            {/* Dialog de confirmation suppression */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                title="Supprimer le département"
                content={departmentToDelete ? `Êtes-vous sûr de vouloir supprimer le département ${departmentToDelete.nom} ?` : "Êtes-vous sûr de vouloir supprimer ce département ?"}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDeleteDepartment}
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

export default Departments;
