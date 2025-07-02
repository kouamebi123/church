import React, { useState, useEffect } from 'react';
import { Typography, Box, IconButton, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Snackbar, Alert, MenuItem, Select, InputLabel, FormControl, CircularProgress, Autocomplete } from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import DeleteConfirmDialog from '../../DeleteConfirmDialog';
import Loading from '../../Loading';
import ErrorMessage from '../../ErrorMessage';
import { useNotification } from '../../../hooks/useNotification';
import { apiService } from '../../../services/apiService';
import { debounce } from 'lodash';
import { cityPopulations, getCityByName } from '../../../constants/cities';
import axios from 'axios';

const Churches = () => {
    const [churches, setChurches] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [churchModal, setChurchModal] = useState(false);
    const [editingChurchId, setEditingChurchId] = useState(null);
    const [churchForm, setChurchForm] = useState({ 
        nom: '', 
        adresse: '', 
        ville: '',
        latitude: '',
        longitude: '',
        population: '',
        description: '',
        responsable: '',
        type: 'eglise',
        image: null
    });
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [churchToDelete, setChurchToDelete] = useState(null);
    const [users, setUsers] = useState([]);
    const [loadingCityInfo, setLoadingCityInfo] = useState(false);
    const [addressOptions, setAddressOptions] = useState([]);
    const [loadingAddress, setLoadingAddress] = useState(false);
    const [addressValue, setAddressValue] = useState(null);
    const [addressInputValue, setAddressInputValue] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    const {
        notification,
        showSuccess,
        showError,
        hideNotification
    } = useNotification();

    const loadChurches = async () => {
        setLoading(true);
        try {
            const response = await apiService.churches.getAll();
            setChurches(response.data?.data || response.data || []);
            setError(null);
        } catch (err) {
            setError('Erreur lors du chargement des églises');
            setChurches([]);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const response = await apiService.users.getAll();
            setUsers(response.data?.data || response.data || []);
        } catch (err) {
            setUsers([]);
        }
    };

    useEffect(() => {
        loadChurches();
        loadUsers();
    }, []);

    // Fonction pour récupérer automatiquement les informations de la ville
    const fetchCityInfo = async (cityName) => {
        if (!cityName || cityName.length < 2) return;
        
        try {
            setLoadingCityInfo(true);
            
            // D'abord, essayer de trouver la ville dans notre liste locale
            const localCity = getCityByName(cityName);
            
            if (localCity) {
                // Si la ville est trouvée localement, utiliser ces données
                setChurchForm(prev => ({
                    ...prev,
                    population: localCity.population.toString(),
                    ville: localCity.name
                }));
                
                // Ensuite, essayer de récupérer les coordonnées via l'API
                try {
                    const response = await apiService.churches.getCityInfo(localCity.name);
                    const cityInfo = response.data?.data;
                    
                    if (cityInfo && cityInfo.latitude && cityInfo.longitude) {
                        setChurchForm(prev => ({
                            ...prev,
                            latitude: cityInfo.latitude.toString(),
                            longitude: cityInfo.longitude.toString()
                        }));
                    }
                } catch (apiError) {
                    console.log('Impossible de récupérer les coordonnées via l\'API, utilisation des données locales uniquement');
                }
                
                showSuccess(`Informations récupérées pour ${localCity.name}`);
            } else {
                // Si la ville n'est pas dans notre liste locale, essayer l'API
                const response = await apiService.churches.getCityInfo(cityName);
                const cityInfo = response.data?.data;
                
                if (cityInfo) {
                    setChurchForm(prev => ({
                        ...prev,
                        latitude: cityInfo.latitude?.toString() || '',
                        longitude: cityInfo.longitude?.toString() || '',
                        population: cityInfo.population?.toString() || '',
                        ville: cityInfo.ville || cityName
                    }));
                    showSuccess(`Informations récupérées pour ${cityInfo.ville}`);
                }
            }
        } catch (error) {
            console.error('Erreur lors de la récupération des informations de ville:', error);
            // Ne pas afficher d'erreur car c'est optionnel
        } finally {
            setLoadingCityInfo(false);
        }
    };

    // Debounce pour éviter trop d'appels API
    const debouncedFetchCityInfo = React.useCallback(
        debounce(fetchCityInfo, 1000),
        []
    );

    // Fonction debounce
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Fonction pour rechercher des adresses via Nominatim
    const searchAddress = async (input) => {
        if (!input || input.length < 3) return [];
        setLoadingAddress(true);
        try {
            const url = 'https://nominatim.openstreetmap.org/search';
            const response = await axios.get(url, {
                params: {
                    q: input,
                    format: 'json',
                    addressdetails: 1,
                    limit: 5,
                    countrycodes: 'fr' // Limite à la France
                }
            });
            // Ajout d'un champ id unique pour chaque option
            const options = (response.data || []).map(opt => ({ ...opt, id: opt.place_id }));
            setAddressOptions(options);
        } catch (error) {
            setAddressOptions([]);
        } finally {
            setLoadingAddress(false);
        }
    };

    const handleChurchSubmit = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('nom', churchForm.nom);
            formData.append('adresse', churchForm.adresse);
            formData.append('ville', churchForm.ville);
            formData.append('latitude', churchForm.latitude ? parseFloat(churchForm.latitude) : '');
            formData.append('longitude', churchForm.longitude ? parseFloat(churchForm.longitude) : '');
            formData.append('population', churchForm.population ? parseInt(churchForm.population) : '');
            formData.append('description', churchForm.description);
            formData.append('responsable', churchForm.responsable || '');
            formData.append('type', churchForm.type);
            if (selectedImage) {
                formData.append('image', selectedImage);
                console.log('image', selectedImage);
                console.log('formData', formData);
            }
            if (editingChurchId) {
                await apiService.churches.update(editingChurchId, formData);
                showSuccess('Église modifiée avec succès');
            } else {
                await apiService.churches.create(formData);
                showSuccess('Église créée avec succès');
            }
            setChurchModal(false);
            setChurchForm({ nom: '', adresse: '', ville: '', latitude: '', longitude: '', population: '', description: '', responsable: '', type: 'eglise', image: null });
            setSelectedImage(null);
            setEditingChurchId(null);
            await loadChurches();
        } catch (err) {
            showError(err.message || 'Erreur lors de l\'opération');
            console.error('Erreur lors de l\'opération:', err);
        }
    };

    const handleEditChurch = (church) => {
        setChurchForm({
            nom: church.nom,
            adresse: church.adresse || '',
            ville: church.ville || '',
            latitude: church.latitude || '',
            longitude: church.longitude || '',
            population: church.population || '',
            description: church.description || '',
            responsable: church.responsable?._id || '',
            type: church.type || 'eglise',
            image: null
        });
        setSelectedImage(null);
        setEditingChurchId(church._id);
        setChurchModal(true);
    };

    const handleOpenDeleteDialog = (church) => {
        setChurchToDelete(church);
        setDeleteDialogOpen(true);
    };

    const handleCloseDeleteDialog = () => {
        setDeleteDialogOpen(false);
        setChurchToDelete(null);
    };

    const handleConfirmDeleteChurch = async () => {
        if (!churchToDelete) return;
        try {
            await apiService.churches.delete(churchToDelete._id);
            showSuccess('Église supprimée avec succès');
            await loadChurches();
        } catch (err) {
            showError(err.message || 'Erreur lors de la suppression');
        } finally {
            handleCloseDeleteDialog();
        }
    };

    // Remise à zéro du champ lors de la fermeture du modal
    useEffect(() => {
        if (!churchModal) {
            setAddressValue(null);
            setAddressInputValue('');
            setSelectedImage(null);
        }
    }, [churchModal]);

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>Gestion des églises</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => setChurchModal(true)}>Nouvelle église</Button>
            </Box>
            {loading ? (
                <Loading titre="Chargement des églises..." />
            ) : error ? (
                <ErrorMessage error={error} />
            ) : (
                <TableContainer data-aos="fade-up" component={Paper}>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell>Nom</TableCell>
                                <TableCell>Ville</TableCell>
                                <TableCell>Adresse</TableCell>
                                <TableCell>Membres</TableCell>
                                <TableCell>Responsable</TableCell>
                                <TableCell align="right">Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {Array.isArray(churches) ? (
                                churches
                                    .map((church) => (
                                        <TableRow key={church._id}>
                                            <TableCell>{church.nom}</TableCell>
                                            <TableCell>{church.ville || '-'}</TableCell>
                                            <TableCell>{church.adresse || '-'}</TableCell>
                                            <TableCell>{church.nombre_membres || 0}</TableCell>
                                            <TableCell>{church.responsable ? (church.responsable.username || church.responsable.pseudo || church.responsable.email) : '-'}</TableCell>
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
                                churches.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={2} align="center">
                                            Aucune église disponible
                                        </TableCell>
                                    </TableRow>
                                )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog
                open={churchModal}
                onClose={() => {
                    setChurchModal(false);
                    setEditingChurchId(null);
                    setChurchForm({ nom: '', adresse: '', ville: '', latitude: '', longitude: '', population: '', description: '', responsable: '', type: 'eglise', image: null });
                    setSelectedImage(null);
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
                <DialogTitle>{editingChurchId ? 'Modifier l\'église' : 'Nouvelle église'}</DialogTitle>
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
                            <Autocomplete
                                fullWidth
                                options={cityPopulations}
                                getOptionLabel={(option) => typeof option === 'string' ? option : option.name}
                                value={churchForm.ville}
                                onChange={(event, newValue) => {
                                    const cityName = typeof newValue === 'string' ? newValue : newValue?.name || '';
                                    setChurchForm({ ...churchForm, ville: cityName });
                                    if (cityName) {
                                        debouncedFetchCityInfo(cityName);
                                    }
                                }}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Ville"
                                        margin="normal"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loadingCityInfo && (
                                                        <CircularProgress size={20} />
                                                    )}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                        helperText={loadingCityInfo ? "Récupération des informations..." : "Sélectionnez une ville pour récupérer automatiquement les coordonnées et la population"}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <Box component="li" {...props}>
                                        <Box>
                                            <Typography variant="body1">{option.name}</Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Population: {option.population.toLocaleString()} habitants
                                            </Typography>
                                        </Box>
                                    </Box>
                                )}
                            />
                            <Autocomplete
                                fullWidth
                                options={addressOptions}
                                value={addressValue}
                                inputValue={addressInputValue}
                                getOptionLabel={(option) => {
                                    if (typeof option === 'string') return option;
                                    const a = option.address || {};
                                    const parts = [
                                        a.house_number,
                                        a.road,
                                        a.postcode,
                                        a.city || a.town || a.village || ''
                                    ].filter(Boolean);
                                    return parts.join(', ');
                                }}
                                isOptionEqualToValue={(option, value) => option.id === value.id}
                                filterOptions={(options) => options}
                                onInputChange={(event, newInputValue, reason) => {
                                    setAddressInputValue(newInputValue);
                                    setChurchForm({ ...churchForm, adresse: newInputValue });
                                    if (reason === 'input') {
                                        setAddressValue(null);
                                    }
                                    if (newInputValue && newInputValue.length > 2) {
                                        searchAddress(newInputValue);
                                    } else {
                                        setAddressOptions([]);
                                    }
                                }}
                                onChange={async (event, newValue) => {
                                    setAddressValue(newValue);
                                    if (!newValue) return;
                                    const address = typeof newValue === 'string' ? newValue : newValue.display_name;
                                    setAddressInputValue(address);
                                    setChurchForm(prev => ({ ...prev, adresse: address }));
                                    // Remplir automatiquement ville, lat, lon, population
                                    if (typeof newValue !== 'string') {
                                        const ville = newValue.address.city || newValue.address.town || newValue.address.village || newValue.address.municipality || newValue.address.county || '';
                                        const latitude = newValue.lat;
                                        const longitude = newValue.lon;
                                        setChurchForm(prev => ({
                                            ...prev,
                                            ville,
                                            latitude,
                                            longitude
                                        }));
                                        // Appel backend pour la population
                                        try {
                                            const response = await apiService.churches.getCityInfo(ville);
                                            const cityInfo = response.data?.data;
                                            if (cityInfo && cityInfo.population) {
                                                setChurchForm(prev => ({ ...prev, population: cityInfo.population.toString() }));
                                            }
                                        } catch (e) {}
                                    }
                                }}
                                loading={loadingAddress}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        label="Adresse complète"
                                        margin="normal"
                                        InputProps={{
                                            ...params.InputProps,
                                            endAdornment: (
                                                <>
                                                    {loadingAddress && <CircularProgress size={20} />}
                                                    {params.InputProps.endAdornment}
                                                </>
                                            ),
                                        }}
                                        helperText="Commencez à taper une adresse, puis sélectionnez dans la liste."
                                    />
                                )}
                                renderOption={(props, option) => {
                                    const a = option.address || {};
                                    const parts = [
                                        a.house_number,
                                        a.road,
                                        a.postcode,
                                        a.city || a.town || a.village || ''
                                    ].filter(Boolean);
                                    return (
                                        <Box component="li" {...props}>
                                            <Typography variant="body1">{parts.join(', ')}</Typography>
                                        </Box>
                                    );
                                }}
                            />
                            <Box sx={{ display: 'flex', gap: 2 }}>
                                <TextField
                                    fullWidth
                                    label="Population de la ville"
                                    type="number"
                                    value={churchForm.population}
                                    onChange={(e) => setChurchForm({ ...churchForm, population: e.target.value })}
                                    margin="normal"
                                />
                            </Box>
                            <TextField
                                fullWidth
                                label="Description"
                                multiline
                                rows={3}
                                value={churchForm.description}
                                onChange={(e) => setChurchForm({ ...churchForm, description: e.target.value })}
                                margin="normal"
                            />
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="responsable-label">Responsable</InputLabel>
                                <Select
                                    labelId="responsable-label"
                                    value={churchForm.responsable}
                                    label="Responsable"
                                    onChange={(e) => setChurchForm({ ...churchForm, responsable: e.target.value })}
                                >
                                    <MenuItem value=""><em>Aucun</em></MenuItem>
                                    {users.map((user) => (
                                        <MenuItem key={user._id} value={user._id}>
                                            {user.username || user.pseudo || user.email}
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            <FormControl fullWidth margin="normal">
                                <InputLabel id="type-label">Type</InputLabel>
                                <Select
                                    labelId="type-label"
                                    value={churchForm.type}
                                    label="Type"
                                    onChange={e => setChurchForm({ ...churchForm, type: e.target.value })}
                                    required
                                >
                                    <MenuItem value="eglise">Église</MenuItem>
                                    <MenuItem value="mission">Mission</MenuItem>
                                </Select>
                            </FormControl>
                            <Button
                                variant="outlined"
                                component="label"
                                fullWidth
                                sx={{ mt: 1, mb: 2 }}
                            >
                                {selectedImage ? selectedImage.name : "Choisir une image (optionnel)"}
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={e => {
                                        if (e.target.files && e.target.files[0]) {
                                            setSelectedImage(e.target.files[0]);
                                        }
                                    }}
                                />
                            </Button>
                        </Box>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => {
                            setChurchModal(false);
                            setEditingChurchId(null);
                            setChurchForm({ nom: '', adresse: '', ville: '', latitude: '', longitude: '', population: '', description: '', responsable: '', type: 'eglise', image: null });
                            setSelectedImage(null);
                        }}>Annuler</Button>
                        <Button type="submit" variant="contained" color="primary">
                            {editingChurchId ? 'Modifier' : 'Créer'}
                        </Button>
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

export default Churches;
