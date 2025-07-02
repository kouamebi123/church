import { Box, Typography, Button, TextField, TableCell, TableContainer, Table, TableHead, TableRow, Paper, TableBody, DialogActions, DialogContent, DialogTitle, IconButton, Dialog, Tooltip, Grid, FormControl, InputLabel, MenuItem, Select, Snackbar, Alert, CircularProgress } from '@mui/material';
import DeleteConfirmDialog from '../../DeleteConfirmDialog';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import { useState, useEffect } from 'react';
import ErrorMessage from '../../ErrorMessage';
import { useNotification } from '../../../hooks/useNotification';
import { apiService } from '../../../services/apiService';

const Departments = () => {
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [departmentToDelete, setDepartmentToDelete] = useState(null);
    const [departmentModal, setDepartmentModal] = useState(false);
    const [editingDepartmentId, setEditingDepartmentId] = useState(null);
    const [departmentForm, setDepartmentForm] = useState({
        nom: ''
    });
    const [departmentSearchTerm, setDepartmentSearchTerm] = useState('');

    const {
        notification,
        showSuccess,
        showError,
        hideNotification
    } = useNotification();

    const loadDepartments = async () => {
        setLoading(true);
        try {
            const response = await apiService.departments.getAll();
            setDepartments(response.data?.data || response.data || []);
            setError(null);
        } catch (err) {
            setError('Erreur lors du chargement des départements');
            setDepartments([]);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadDepartments();
    }, []);

    const handleEditDepartment = (department) => {
        setDepartmentForm({ nom: department.nom });
        setEditingDepartmentId(department._id);
        setDepartmentModal(true);
    };

    const handleOpenDeleteDialog = (department) => {
        setDepartmentToDelete(department);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setDepartmentToDelete(null);
    };

    const handleConfirmDeleteDepartment = async () => {
        if (!departmentToDelete) return;
        try {
            await apiService.departments.delete(departmentToDelete._id);
            showSuccess('Département supprimé avec succès');
            await loadDepartments();
        } catch (err) {
            showError(err.message || 'Erreur lors de la suppression');
        } finally {
            handleCloseDeleteDialog();
        }
    };

    const handleDepartmentSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingDepartmentId) {
                await apiService.departments.update(editingDepartmentId, departmentForm);
                showSuccess('Département modifié avec succès');
            } else {
                await apiService.departments.create(departmentForm);
                showSuccess('Département créé avec succès');
            }
            
            setDepartmentModal(false);
            setDepartmentForm({ nom: '' });
            setEditingDepartmentId(null);
            await loadDepartments();
        } catch (err) {
            showError(err.message || 'Erreur lors de l\'opération');
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
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            ) : error ? (
                <ErrorMessage error={error} />
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
                onClose={() => {
                    setDepartmentModal(false);
                    setEditingDepartmentId(null);
                    setDepartmentForm({ nom: '' });
                }}
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
                        <Button onClick={() => {
                            setDepartmentModal(false);
                            setEditingDepartmentId(null);
                            setDepartmentForm({ nom: '' });
                        }}>Annuler</Button>
                        <Button type="submit" variant="contained" color="primary">{editingDepartmentId ? 'Modifier' : 'Créer'}</Button>
                    </DialogActions>
                </form>
            </Dialog>
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                title="Supprimer le département"
                content={departmentToDelete ? `Êtes-vous sûr de vouloir supprimer le département ${departmentToDelete.nom} ?` : "Êtes-vous sûr de vouloir supprimer ce département ?"}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleConfirmDeleteDepartment}
            />
        </Box>
    );
};

export default Departments;
