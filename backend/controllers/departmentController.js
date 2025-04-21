const Department = require('../models/Department');
const User = require('../models/User');

// @desc    Obtenir tous les départements
// @route   GET /api/departments
// @access  Private
exports.getDepartments = async (req, res) => {
    try {
        const departments = await Department.find();

        res.status(200).json({
            success: true,
            count: departments.length,
            data: departments
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Obtenir un département par ID
// @route   GET /api/departments/:id
// @access  Private
exports.getDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Département non trouvé'
            });
        }

        // Obtenir le nombre de membres
        const memberCount = await User.countDocuments({ departement: department._id });

        res.status(200).json({
            success: true,
            data: {
                ...department.toObject(),
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

// @desc    Créer un département
// @route   POST /api/departments
// @access  Private/Admin
exports.createDepartment = async (req, res) => {
    try {
        const department = await Department.create(req.body);

        res.status(201).json({
            success: true,
            data: department
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Mettre à jour un département
// @route   PUT /api/departments/:id
// @access  Private/Admin
exports.updateDepartment = async (req, res) => {
    try {
        const department = await Department.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Département non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: department
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Supprimer un département
// @route   DELETE /api/departments/:id
// @access  Private/Admin
exports.deleteDepartment = async (req, res) => {
    try {
        const department = await Department.findById(req.params.id);

        if (!department) {
            return res.status(404).json({
                success: false,
                message: 'Département non trouvé'
            });
        }

        // Mettre à jour les utilisateurs qui appartiennent à ce département
        await User.updateMany(
            { departement: department._id },
            { departement: null }
        );

        await department.remove();

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

// @desc    Obtenir les membres d'un département
// @route   GET /api/departments/:id/members
// @access  Private
exports.getDepartmentMembers = async (req, res) => {
    try {
        const users = await User.find({ departement: req.params.id })
            .select('-password')
            .populate('eglise_locale', 'nom');

        res.status(200).json({
            success: true,
            count: users.length,
            data: users
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Obtenir les statistiques des départements
// @route   GET /api/departments/stats
// @access  Private/Admin
exports.getDepartmentStats = async (req, res) => {
    try {
        const departments = await Department.find();
        
        const stats = await Promise.all(
            departments.map(async (department) => {
                const memberCount = await User.countDocuments({ departement: department._id });
                const qualificationStats = await User.aggregate([
                    {
                        $match: { departement: department._id }
                    },
                    {
                        $group: {
                            _id: '$qualification',
                            count: { $sum: 1 }
                        }
                    }
                ]);

                return {
                    id: department._id,
                    nom: department.nom,
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
