import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, IconButton, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, TableCell, TableContainer, Table, TableHead, TableRow, Paper, TableBody } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

import DeleteIcon from '@mui/icons-material/Delete';



const API_URL = process.env.REACT_APP_API_URL + '/api';


const API_URL_IMAGE = process.env.REACT_APP_API_URL;
const Carousel = () => {
    const [carouselModal, setCarouselModal] = useState(false);
    const [carouselImages, setCarouselImages] = useState([]);
    const [loadingCarousel, setLoadingCarousel] = useState(false);
    const [carouselError, setCarouselError] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);


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

    const handleDeleteCarousel = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${API_URL}/carousel/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    await loadCarouselImages();
                } else {
                    const error = await response.json();
                    console.error('Erreur lors de la suppression:', error);
                }
            } catch (err) {
                console.error('Erreur lors de la suppression:', err);
            }
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
                await loadCarouselImages();
            } else {
                alert(result.message || 'Erreur lors de l\'ajout de l\'image');
            }
        } catch (err) {
            console.error('Erreur lors de la création de l\'élément du carousel:', err);
            alert('Erreur lors de l\'ajout de l\'image');
        }
    };

    useEffect(() => {
        loadCarouselImages();
    }, []);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Gestion du carousel</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setCarouselModal(true)}>Nouvelle image</Button>
            </Box>
            {loadingCarousel ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            ) : carouselError ? (
                <Typography color="error">{carouselError}</Typography>
            ) : (
                <TableContainer component={Paper}>
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
                                            onClick={() => handleDeleteCarousel(image._id)}
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
                            <input
                                type="file"
                                onChange={(e) => setSelectedFile(e.target.files[0])}
                                accept="image/*"
                                required
                                style={{ width: '100%', marginTop: '16px', marginBottom: '8px' }}
                            />
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setCarouselModal(false)}>Annuler</Button>
                        <Button type="submit" variant="contained" color="primary">Créer</Button>
                    </DialogActions>
                </form>
            </Dialog>
        </Box>
    );
};

export default Carousel;
