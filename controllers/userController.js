const User = require('../models/User');
const Group = require('../models/Group');
const Network = require('../models/Network');
const Church = require('../models/Church');

// @desc    Obtenir tous les utilisateurs
// @route   GET /api/users
// @access  Private/Admin
exports.getUsers = async (req, res) => {
    try {
        // Filtrer les paramètres de requête autorisés pour éviter l'injection NoSQL
        const allowedFields = ['role', 'genre', 'qualification', 'eglise_locale', 'departement', 'ville_residence', 'origine'];
        const filter = {};
        
        Object.keys(req.query).forEach(key => {
            if (allowedFields.includes(key)) {
                filter[key] = req.query[key];
            }
        });

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
            message: 'Erreur lors de la récupération des utilisateurs'
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

// @desc    Obtenir les membres non isolés
// @route   GET /api/users/non-isoles
// @access  Private/Admin
exports.getIsoles = async (req, res) => {
    try {
        const usersInGroups = await Group.distinct('members');
        const specialQualifications = ['Responsable réseau', 'Gouvernance', 'Ecodim', 'Responsable ecodim'];
        const users = await User.find({
            _id: { $nin: usersInGroups },
            qualification: { $nin: specialQualifications }
        })
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

exports.getNonIsoles = async (req, res) => {
    try {
        const usersInGroups = await Group.distinct('members');
        const specialQualifications = ['Responsable réseau', 'Gouvernance', 'Ecodim', 'Responsable ecodim'];
        const users = await User.find({
            $or: [
                { _id: { $in: usersInGroups } },
                { qualification: { $in: specialQualifications } }
            ]
        })
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

// @desc    Créer un utilisateur
// @route   POST /api/users
// @access  Private/Admin
exports.createUser = async (req, res) => {
    try {
        const user = await User.create(req.body);
        // Incrémenter le nombre de membres de l'église si renseignée
        if (user.eglise_locale) {
            await Church.findByIdAndUpdate(user.eglise_locale, { $inc: { nombre_membres: 1 } });
        }
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
        const userBefore = await User.findById(req.params.id);
        const prevChurch = userBefore ? userBefore.eglise_locale : null;
        const newChurch = req.body.eglise_locale;
        const user = await User.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );
        // Si l'église a changé, mettre à jour les compteurs
        if (prevChurch && newChurch && prevChurch.toString() !== newChurch.toString()) {
            await Church.findByIdAndUpdate(prevChurch, { $inc: { nombre_membres: -1 } });
            await Church.findByIdAndUpdate(newChurch, { $inc: { nombre_membres: 1 } });
        } else if (!prevChurch && newChurch) {
            await Church.findByIdAndUpdate(newChurch, { $inc: { nombre_membres: 1 } });
        } else if (prevChurch && !newChurch) {
            await Church.findByIdAndUpdate(prevChurch, { $inc: { nombre_membres: -1 } });
        }
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
        // Décrémenter le nombre de membres de l'église si renseignée
        if (user.eglise_locale) {
            await Church.findByIdAndUpdate(user.eglise_locale, { $inc: { nombre_membres: -1 } });
        }
        await user.deleteOne();
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

// @desc    Obtenir les membres retirés des groupes (avec historique)
// @route   GET /api/users/retired
// @access  Private/Admin
exports.getRetiredUsers = async (req, res) => {
    try {
        // 1. Récupère tous les groupes avec historique et responsables peuplés
        const groups = await Group.find().populate('network', 'nom').populate('responsable1', 'username').populate('responsable2', 'username');
        // 2. Map pour stocker pour chaque user son dernier leftAt
        const retiredMap = new Map();
        groups.forEach(group => {
            if (Array.isArray(group.membersHistory)) {
                group.membersHistory.forEach(hist => {
                    if (hist.leftAt) {
                        // Si pas encore dans la map ou leftAt plus récent, on remplace
                        const prev = retiredMap.get(hist.user?.toString());
                        if (!prev || new Date(hist.leftAt) > new Date(prev.leftAt)) {
                            retiredMap.set(hist.user?.toString(), {
                                user: hist.user,
                                leftAt: hist.leftAt,
                                group: {
                                    _id: group._id,
                                    nom: group.responsable1 ? (
                                        group.responsable2
                                            ? `GR ${group.responsable1.username.split(' ')[0]} & ${group.responsable2.username.split(' ')[0]}`
                                            : `GR ${group.responsable1.username.split(' ')[0]}`
                                    ) : null
                                },
                                network: group.network
                            });
                        }
                    }
                });
            }
        });
        // 3. Exclure les utilisateurs qui sont encore membres d'au moins un groupe
        const allRetiredUserIds = Array.from(retiredMap.keys());
        // Cherche tous les users qui sont encore membres d'au moins un groupe
        const groupsWithMembers = await Group.find({ members: { $in: allRetiredUserIds } }).select('members');
        const stillInGroupUserIds = new Set();
        groupsWithMembers.forEach(gr => {
            gr.members.forEach(m => stillInGroupUserIds.add(m.toString()));
        });
        // Filtre les users qui ne sont plus dans aucun groupe
        const trulyRetiredUserIds = allRetiredUserIds.filter(uid => !stillInGroupUserIds.has(uid));
        const allAvailableUsers = await User.find({ _id: { $in: trulyRetiredUserIds } })
            .select('-password');
        // 4. Pour chaque user, on complète avec infos groupe/réseau
        const result = allAvailableUsers.map(u => {
            const hist = retiredMap.get(u._id.toString());
            return {
                user: u,
                leftAt: hist.leftAt,
                group: hist.group,
                network: hist.network
            };
        });
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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
