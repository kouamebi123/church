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
        console.log('Payload reçu backend:', req.body);
        // Créer le service avec les données reçues
        const service = await Service.create({
            ...req.body
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
        const service = await Service.findByIdAndDelete(req.params.id);

        if (!service) {
            return res.status(404).json({
                success: false,
                message: 'Service non trouvé'
            });
        }

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

        
        // Correction : ignorer l'heure, ne comparer que la date (jour/mois/année)
        // start = YYYY-MM-DD, end = YYYY-MM-DD, on veut inclure tout le dernier jour
        const startDate = new Date(start);
        startDate.setHours(0,0,0,0);
        const endDate = new Date(end);
        endDate.setHours(23,59,59,999);
        const query = {
            date: {
                $gte: startDate,
                $lte: endDate
            }
        };

        // DEBUG : afficher tous les services existants (sans filtre)
        // Récupérer tous les services (tous les champs)
        const allServices = await Service.find({});
        //console.log('ALL SERVICES IN DB:', allServices);

        // Filtrage JS robuste : on ne compare que l'année, le mois, le jour (ignore l'heure/fuseau)
        const startStr = startDate.toISOString().slice(0,10);
        const endStr = endDate.toISOString().slice(0,10);
        const filtered = allServices.filter(s => {
            const d = s.date.toISOString().slice(0,10);
            return d >= startStr && d <= endStr;
        });

        console.log('services (après filtre JS jour):', startStr, endStr);

        res.status(200).json({
            success: true,
            count: filtered.length,
            data: filtered
        });

    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};
