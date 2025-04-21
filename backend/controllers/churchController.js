const Church = require('../models/Church');
const User = require('../models/User');

// @desc    Obtenir toutes les églises
// @route   GET /api/churches
// @access  Private
exports.getChurches = async (req, res) => {
    try {
        const churches = await Church.find();

        res.status(200).json({
            success: true,
            count: churches.length,
            data: churches
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
        const church = await Church.findById(req.params.id);

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
        const church = await Church.create(req.body);

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
        const church = await Church.findByIdAndUpdate(
            req.params.id,
            req.body,
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
