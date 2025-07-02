import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TableCell, TableContainer, Table, TableHead, TableRow, Paper, TableBody, Snackbar, Alert } from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Loading from '../../Loading';
import ErrorMessage from '../../ErrorMessage';
import DeleteConfirmDialog from '../../DeleteConfirmDialog';
import { useNotification } from '../../../hooks/useNotification';
import { apiService } from '../../../services/apiService';

const Carousel = () => {
    const [carouselModal, setCarouselModal] = useState(false);
    const [carouselImages, setCarouselImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);

    const {
        notification,
        showSuccess,
        showError,
        hideNotification
    } = useNotification();

    const loadCarouselImages = async () => {
        setLoading(true);
        try {
            const response = await apiService.carousel.getAll();
            setCarouselImages(response.data?.data || response.data || []);
            setError(null);
        } catch (err) {
            setError('Erreur lors du chargement des images du carousel');
            setCarouselImages([]);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadCarouselImages();
    }, []);

    const handleFileSelect = (event) => {
        const file = event.target.files[0];
        if (file) {
            setSelectedFile(file);
        }
    };

    const handleUpload = async (event) => {
        if (event) event.preventDefault();
        if (!selectedFile) return;

        try {
            const formData = new FormData();
            formData.append('image', selectedFile);
            console.log('image', selectedFile);

            await apiService.carousel.upload(formData);
            showSuccess('Image ajoutée au carousel avec succès');
            setCarouselModal(false);
            setSelectedFile(null);
            await loadCarouselImages();
        } catch (err) {
            showError(err.message || 'Erreur lors de l\'upload de l\'image');
        }
    };

    const handleDeleteImage = async () => {
        if (!imageToDelete) return;

        try {
            await apiService.carousel.delete(imageToDelete._id);
            showSuccess('Image supprimée avec succès');
            await loadCarouselImages();
        } catch (err) {
            showError(err.message || 'Erreur lors de la suppression');
        } finally {
            setDeleteDialogOpen(false);
            setImageToDelete(null);
        }
    };

    const handleOpenDeleteDialog = (image) => {
        setImageToDelete(image);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setImageToDelete(null);
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>Gestion du carousel</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCarouselModal(true)}>Nouvelle image</Button>
            </Box>
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
                                <TableCell>Image</TableCell>
                                <TableCell>Chemin</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(carouselImages) && carouselImages.map((image) => (
                                <TableRow key={image._id}>
                                    <TableCell>
                                        <img
                                            src={`${process.env.REACT_APP_API_URL}${image.chemin_image}`}
                                            alt="Carousel"
                                            style={{ height: '50px', width: 'auto' }}
                                        />
                                    </TableCell>
                                    <TableCell>{image.chemin_image}</TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            onClick={() => handleOpenDeleteDialog(image)}
                                            color="error"
                                            size="small"
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {Array.isArray(carouselImages) && carouselImages.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} align="center">
                                        Aucune image disponible
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}
            <Dialog
                open={carouselModal}
                onClose={() => setCarouselModal(false)}
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
                <DialogTitle>Nouvel élément du carousel</DialogTitle>
                <form onSubmit={handleUpload}>
                    <DialogContent sx={{ display: 'flex', justifyContent: 'center' }}>
                        <Box sx={{ width: '100%', maxWidth: '450px' }}>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{ mt: 2, mb: 1 }}
                            >
                                Sélectionner une image
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    required
                                    onChange={handleFileSelect}
                                />
                            </Button>
                            {selectedFile && (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 2 }}>
                                    <Typography variant="body2" sx={{ mb: 1 }} color="text.secondary">
                                        {selectedFile.name}
                                    </Typography>
                                    <Box sx={{ border: '1px solid #eee', borderRadius: 2, p: 1, bgcolor: '#fafafa' }}>
                                        <img
                                            src={URL.createObjectURL(selectedFile)}
                                            alt="Prévisualisation"
                                            style={{ maxHeight: 120, maxWidth: 200, objectFit: 'contain' }}
                                        />
                                    </Box>
                                </Box>
                            )}
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCarouselModal(false)}>Annuler</Button>
                        <Button type="submit" variant="contained" color="primary">Créer</Button>
                    </DialogActions>
                </form>
            </Dialog>
            {/* Dialog de confirmation suppression */}
            <DeleteConfirmDialog
                open={deleteDialogOpen}
                title="Supprimer l'image du carousel"
                content={imageToDelete ? `Êtes-vous sûr de vouloir supprimer l'image ${imageToDelete.chemin_image} ?` : "Êtes-vous sûr de vouloir supprimer cette image ?"}
                onClose={handleCloseDeleteDialog}
                onConfirm={handleDeleteImage}
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

export default Carousel;
