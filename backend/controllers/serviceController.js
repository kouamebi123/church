const Service = require('../models/Service');

// @desc    Obtenir tous les services
// @route   GET /api/services
// @access  Private
exports.getServices = async (req, res) => {
    try {
        const services = await Service.find()
            .populate('collecteur_culte', '_id username')
            .populate('superviseur', '_id username')
            .sort('-date');

        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Obtenir un service par ID
// @route   GET /api/services/:id
// @access  Private
exports.getService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('collecteur_culte', '_id username')
            .populate('superviseur', '_id username');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Créer un service
// @route   POST /api/services
// @access  Private/Collecteur
exports.createService = async (req, res) => {
    try {
        // Générer l'identifiant unique du culte
        const date = new Date(req.body.date);
        const timestamp = Date.now();
        const identifiant = `CULTE-${date.getFullYear()}${(date.getMonth() + 1).toString().padStart(2, '0')}${date.getDate().toString().padStart(2, '0')}-${timestamp}`;
        
        const service = await Service.create({
            ...req.body,
            identifiant_culte: identifiant
        });

        const populatedService = await Service.findById(service._id)
            .populate('collecteur_culte', '_id username')
            .populate('superviseur', '_id username');

        res.status(201).json({
            success: true,
            data: populatedService
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Mettre à jour un service
// @route   PUT /api/services/:id
// @access  Private/Collecteur
exports.updateService = async (req, res) => {
    try {
        const service = await Service.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        )
        .populate('collecteur_culte', '_id username')
        .populate('superviseur', '_id username');

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: service
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Supprimer un service
// @route   DELETE /api/services/:id
// @access  Private/Admin
exports.deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service non trouvé'
            });
        }

        await service.remove();

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

// @desc    Obtenir les statistiques des services
// @route   GET /api/services/stats
// @access  Private/Admin
exports.getServiceStats = async (req, res) => {
    try {
        const stats = await Service.aggregate([
            {
                $group: {
                    _id: {
                        year: { $year: '$date' },
                        month: { $month: '$date' }
                    },
                    avgAdultes: { $avg: '$total_adultes' },
                    avgEnfants: { $avg: '$total_enfants' },
                    avgTotal: { 
                        $avg: { 
                            $add: ['$total_adultes', '$total_enfants'] 
                        } 
                    },
                    maxTotal: { 
                        $max: { 
                            $add: ['$total_adultes', '$total_enfants'] 
                        } 
                    },
                    minTotal: { 
                        $min: { 
                            $add: ['$total_adultes', '$total_enfants'] 
                        } 
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: {
                    '_id.year': -1,
                    '_id.month': -1
                }
            }
        ]);

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

// @desc    Obtenir les services par période
// @route   GET /api/services/period
// @access  Private
exports.getServicesByPeriod = async (req, res) => {
    try {
        const { start, end } = req.query;
        
        const query = {
            date: {
                $gte: new Date(start),
                $lte: new Date(end)
            }
        };

        const services = await Service.find(query)
            .populate('collecteur_culte', '_id username')
            .populate('superviseur', '_id username')
            .sort('date');

        res.status(200).json({
            success: true,
            count: services.length,
            data: services
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
