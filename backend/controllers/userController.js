const User = require('../models/User');
const Group = require('../models/Group');
const Network = require('../models/Network');

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        // Filtrage dynamique sur tous les paramètres de la requête
        const filter = { ...req.query };
        const users = await User.find(filter)
            .populate('eglise_locale', 'nom')
            .populate('departement', 'nom')
            .select('-password');

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

// @desc    Obtenir un utilisateur par ID
// @route   GET /api/users/:id
// @access  Private/Admin
exports.getUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id)
            .populate('eglise_locale', 'nom')
            .populate('departement', 'nom')
            .select('-password');

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Créer un utilisateur
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);

        res.status(201).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error(error);
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Mettre à jour un utilisateur
// @route   PUT /api/users/:id
// @access  Private/Admin
exports.updateUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Supprimer un utilisateur
// @route   DELETE /api/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        await user.remove();

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

// @desc    Mettre à jour la qualification d'un utilisateur
// @route   PUT /api/users/:id/qualification
// @access  Private/Admin
exports.updateQualification = async (req, res) => {
    try {
        const { qualification } = req.body;

        const user = await User.findByIdAndUpdate(
            req.params.id,
            { qualification },
            {
                new: true,
                runValidators: true
            }
        );

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Obtenir les utilisateurs disponibles (ni membres de groupe, ni responsables de réseau)
// @route   GET /api/users/available
// @access  Private/Admin
exports.getAvailableUsers = async (req, res) => {
    try {
        // Récupérer tous les membres de groupes
        const groups = await Group.find();
        const groupMemberIds = new Set();
        groups.forEach(group => {
            group.members.forEach(memberId => groupMemberIds.add(memberId.toString()));
        });

        // Récupérer tous les responsables de réseau
        const networks = await Network.find();
        const networkResponsableIds = new Set();
        networks.forEach(network => {
            networkResponsableIds.add(network.responsable1.toString());
            if (network.responsable2) networkResponsableIds.add(network.responsable2.toString());
        });

        // Filtrer les users qui ne sont ni membres de groupe ni responsables de réseau
        const unavailableIds = Array.from(new Set([...groupMemberIds, ...networkResponsableIds]));
        const availableUsers = await User.find({ _id: { $nin: unavailableIds } });

        res.status(200).json({
            success: true,
            count: availableUsers.length,
            data: availableUsers
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Obtenir les statistiques des utilisateurs
// @route   GET /api/users/stats
// @access  Private/Admin
exports.getUserStats = async (req, res) => {
    try {
        const stats = await User.aggregate([
            {
                $group: {
                    _id: '$qualification',
                    count: { $sum: 1 }
                }
            }
        ]);

        const total = await User.countDocuments();

        res.status(200).json({
            success: true,
            data: {
                total,
                qualifications: stats
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Réinitialiser le mot de passe d'un utilisateur
// @route   POST /api/users/:id/reset-password
// @access  Private/Admin
exports.resetPassword = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Utilisateur non trouvé"
            });
        }
        // Générer un mot de passe temporaire robuste (10 caractères alphanumériques)
        const newPassword = Array.from({length: 10}, () => Math.random().toString(36)[2]).join('');
        user.password = newPassword;
        await user.save();
        // (Optionnel : envoyer le mot de passe par e-mail)
        res.json({ success: true, newPassword });
    } catch (err) {
        console.error('Erreur resetPassword:', err);
        res.status(500).json({
            success: false,
            message: "Erreur lors de la réinitialisation du mot de passe"
        });
    }
};
