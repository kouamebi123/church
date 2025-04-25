import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TableCell, TableContainer, Table, TableHead, TableRow, Paper, TableBody, Snackbar, Alert } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import DeleteIcon from '@mui/icons-material/Delete';
import DeleteConfirmDialog from '../../DeleteConfirmDialog';
import ErrorMessage from '../../ErrorMessage';


const API_URL = process.env.REACT_APP_API_URL + '/api';


const API_URL_IMAGE = process.env.REACT_APP_API_URL;
const Carousel = () => {
    const [carouselModal, setCarouselModal] = useState(false);
    const [carouselImages, setCarouselImages] = useState([]);
    const [loadingCarousel, setLoadingCarousel] = useState(false);
    const [carouselError, setCarouselError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [imageToDelete, setImageToDelete] = useState(null);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });


    // Fonction pour charger les images du carousel
    const loadCarouselImages = async () => {
        setLoadingCarousel(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/carousel`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const result = await response.json();
            if (response.ok && result.success) {
                setCarouselImages(result.data);
                setCarouselError(null);
            } else {
                throw new Error(result.message || 'Erreur lors du chargement des images');
            }
        } catch (err) {
            setCarouselError('Erreur lors du chargement des images du carousel');
            setCarouselImages([]);
            console.error(err);
        } finally {
            setLoadingCarousel(false);
        }
    };

    // Ouvre le dialog de confirmation et stocke l'image à supprimer
    const handleOpenDeleteDialog = (img) => {
        setImageToDelete(img);
        setDeleteDialogOpen(true);
    };

    // Ferme le dialog et réinitialise
    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setImageToDelete(null);
    };

    // Confirme la suppression
    const handleConfirmDeleteImage = async () => {
        if (!imageToDelete) return;
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/carousel/${imageToDelete._id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                await loadCarouselImages();
                setSnackbar({ open: true, message: 'Image supprimée avec succès', severity: 'success' });
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


    const handleCarouselSubmit = async (e) => {
        e.preventDefault();
        if (!selectedFile) {
            alert('Veuillez sélectionner une image');
            return;
        }
        try {
            const token = localStorage.getItem('token');
            const formData = new FormData();
            formData.append('image', selectedFile);

            const response = await fetch(`${API_URL}/carousel`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });

            const result = await response.json();
            if (response.ok && result.success) {
                setCarouselModal(false);
                setSelectedFile(null);
                setSnackbar({ open: true, message: 'Image ajoutée avec succès', severity: 'success' });
                await loadCarouselImages();
            } else {
                setSnackbar({ open: true, message: result.message || 'Erreur lors de l\'ajout de l\'image', severity: 'error' });
            }
        } catch (err) {
            console.error('Erreur lors de la création de l\'élément du carousel:', err);
            setSnackbar({ open: true, message: 'Erreur lors de l\'ajout de l\'image', severity: 'error' });
        }
    };

    useEffect(() => {
        loadCarouselImages();
    }, []);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>Gestion du carousel</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCarouselModal(true)}>Nouvelle image</Button>
            </Box>
            {loadingCarousel ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            ) : carouselError ? (
                <ErrorMessage error={carouselError} />
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
                                            src={`${API_URL_IMAGE}${image.chemin_image}`}
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
                <form onSubmit={handleCarouselSubmit}>
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
                                    onChange={(e) => setSelectedFile(e.target.files[0])}
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
                onConfirm={handleConfirmDeleteImage}
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

export default Carousel;
