const Church = require('../models/Church');
const User = require('../models/User');
const geoService = require('../services/geoService');

// @desc    Obtenir toutes les églises
// @route   GET /api/churches
// @access  Private
exports.getChurches = async (req, res) => {
    try {
        const churches = await Church.find().populate('responsable', 'username pseudo email');

        // Calculer le nombre de membres pour chaque église
        const churchesWithMemberCount = await Promise.all(
            churches.map(async (church) => {
                const memberCount = await User.countDocuments({ eglise_locale: church._id });
                return {
                    ...church.toObject(),
                    nombre_membres: memberCount
                };
            })
        );

        res.status(200).json({
            success: true,
            count: churchesWithMemberCount.length,
            data: churchesWithMemberCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Obtenir une église par ID
// @route   GET /api/churches/:id
// @access  Private
exports.getChurch = async (req, res) => {
    try {
        const church = await Church.findById(req.params.id).populate('responsable', 'username pseudo email');

        if (!church) {
            return res.status(404).json({
                success: false,
                message: 'Église non trouvée'
            });
        }

        // Obtenir le nombre de membres
        const memberCount = await User.countDocuments({ eglise_locale: church._id });

        res.status(200).json({
            success: true,
            data: {
                ...church.toObject(),
                memberCount
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Créer une église
// @route   POST /api/churches
// @access  Private/Admin
exports.createChurch = async (req, res) => {
    try {
        let churchData = {
            nom: req.body.nom,
            adresse: req.body.adresse,
            ville: req.body.ville,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            population: req.body.population,
            description: req.body.description,
            responsable: req.body.responsable || null,
            type: req.body.type || 'eglise' // obligatoire, par défaut 'eglise'
        };

        // Gestion de l'image
        if (req.file && req.file.path) {
            // On stocke le chemin relatif à partir de 'uploads'
            churchData.image = req.file.path.replace(/.*uploads[\\/]/, 'uploads/');
        } else {
            // Image par défaut selon le type
            if (churchData.type === 'mission') {
                churchData.image = 'uploads/churches/default_mission.jpg';
            } else {
                churchData.image = 'uploads/churches/default_eglise.jpg';
            }
        }

        // Si une adresse est fournie, enrichir automatiquement
        if (req.body.adresse && (!req.body.latitude || !req.body.longitude)) {
            try {
                console.log(`Récupération automatique des informations pour l'adresse: ${req.body.adresse}`);
                const addressInfo = await geoService.getAddressInfo(req.body.adresse);
                if (addressInfo) {
                    churchData.latitude = addressInfo.latitude;
                    churchData.longitude = addressInfo.longitude;
                    churchData.population = addressInfo.population;
                    churchData.ville = addressInfo.ville;
                }
                console.log(`Informations récupérées: lat=${addressInfo?.latitude}, lon=${addressInfo?.longitude}, ville=${addressInfo?.ville}, pop=${addressInfo?.population}`);
            } catch (geoError) {
                console.error('Erreur lors de la récupération des informations géographiques:', geoError.message);
                // Continuer sans les informations géographiques
            }
        }

        const church = await Church.create(churchData);

        res.status(201).json({
            success: true,
            data: church
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Mettre à jour une église
// @route   PUT /api/churches/:id
// @access  Private/Admin
exports.updateChurch = async (req, res) => {
    try {
        let updateFields = {
            nom: req.body.nom,
            adresse: req.body.adresse,
            ville: req.body.ville,
            latitude: req.body.latitude,
            longitude: req.body.longitude,
            population: req.body.population,
            description: req.body.description,
            responsable: req.body.responsable,
            type: req.body.type || 'eglise',
            image: req.body.image // toujours présent, sera écrasé si upload
        };

        // Gestion de l'image
        if (req.file && req.file.path) {
            updateFields.image = req.file.path.replace(/.*uploads[\\/]/, 'uploads/');
        } else if (typeof req.body.image === 'string' && req.body.image) {
            updateFields.image = req.body.image;
        } else {
            // Image par défaut selon le type
            if (updateFields.type === 'mission') {
                updateFields.image = 'uploads/churches/default_mission.jpg';
            } else {
                updateFields.image = 'uploads/churches/default_eglise.jpg';
            }
        }

        // Si une ville est fournie mais pas les coordonnées, récupérer automatiquement
        if (req.body.ville && (!req.body.latitude || !req.body.longitude)) {
            try {
                const cityInfo = await geoService.getCityInfo(req.body.ville);
                updateFields.latitude = cityInfo.latitude;
                updateFields.longitude = cityInfo.longitude;
                updateFields.population = cityInfo.population;
                updateFields.ville = cityInfo.ville;
            } catch (geoError) {
                // Continuer sans les informations géographiques
            }
        }

        const church = await Church.findByIdAndUpdate(
            req.params.id,
            updateFields,
            {
                new: true,
                runValidators: true
            }
        );

        if (!church) {
            return res.status(404).json({
                success: false,
                message: 'Église non trouvée'
            });
        }

        res.status(200).json({
            success: true,
            data: church
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Supprimer une église
// @route   DELETE /api/churches/:id
// @access  Private/Admin
exports.deleteChurch = async (req, res) => {
    try {
        const church = await Church.findById(req.params.id);

        if (!church) {
            return res.status(404).json({
                success: false,
                message: 'Église non trouvée'
            });
        }

        // Mettre à jour les utilisateurs qui appartiennent à cette église
        await User.updateMany(
            { eglise_locale: church._id },
            { eglise_locale: null }
        );

        await Church.deleteOne({ _id: church._id });

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Obtenir les statistiques des églises
// @route   GET /api/churches/stats
// @access  Private/Admin
exports.getChurchStats = async (req, res) => {
    try {
        const churches = await Church.find();
        
        const stats = await Promise.all(
            churches.map(async (church) => {
                const memberCount = await User.countDocuments({ eglise_locale: church._id });
                const qualificationStats = await User.aggregate([
                    {
                        $match: { eglise_locale: church._id }
                    },
                    {
                        $group: {
                            _id: '$qualification',
                            count: { $sum: 1 }
                        }
                    }
                ]);

                return {
                    id: church._id,
                    nom: church.nom,
                    memberCount,
                    qualificationStats
                };
            })
        );

        res.status(200).json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Récupérer les informations géographiques d'une ville
// @route   GET /api/churches/city-info/:cityName
// @access  Private
exports.getCityInfo = async (req, res) => {
    try {
        const { cityName } = req.params;
        
        if (!cityName) {
            return res.status(400).json({
                success: false,
                message: 'Nom de ville requis'
            });
        }

        const cityInfo = await geoService.getCityInfo(cityName);
        
        res.status(200).json({
            success: true,
            data: cityInfo
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
