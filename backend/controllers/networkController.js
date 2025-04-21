const Network = require('../models/Network');
const Group = require('../models/Group');
const User = require('../models/User');

// @desc    Obtenir tous les réseaux
// @route   GET /api/networks
// @access  Private
exports.getNetworks = async (req, res) => {
    try {
        const networks = await Network.find()
            .populate('responsable1', 'username')
            .populate('responsable2', 'username')
            .populate({
                path: 'groups',
                populate: {
                    path: 'members',
                    select: 'username qualification'
                }
            });

        res.status(200).json({
            success: true,
            count: networks.length,
            data: networks
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Obtenir un réseau par ID
// @route   GET /api/networks/:id
// @access  Private
exports.getNetwork = async (req, res) => {
    try {
        const network = await Network.findById(req.params.id)
            .populate('responsable1', 'username')
            .populate('responsable2', 'username')
            .populate({
                path: 'groups',
                populate: {
                    path: 'members',
                    select: 'username qualification'
                }
            });

        if (!network) {
            return res.status(404).json({
                success: false,
                message: 'Réseau non trouvé'
            });
        }

        // Obtenir les statistiques
        const stats = await network.qualificationStats;

        res.status(200).json({
            success: true,
            data: { ...network.toObject(), stats }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Créer un réseau
// @route   POST /api/networks
// @access  Private/Admin
exports.createNetwork = async (req, res) => {
    try {
        const network = await Network.create(req.body);

        // Mettre à jour la qualification des responsables
        const responsables = [];
        if (network.responsable1) responsables.push(network.responsable1);
        if (network.responsable2) responsables.push(network.responsable2);
        if (responsables.length > 0) {
            await User.updateMany(
                { _id: { $in: responsables } },
                { $set: { qualification: "Responsable réseau" } }
            );
        }

        res.status(201).json({
            success: true,
            data: network
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Mettre à jour un réseau
// @route   PUT /api/networks/:id
// @access  Private/Admin
exports.updateNetwork = async (req, res) => {
    try {
        // 1. Récupérer les anciens responsables
        const oldNetwork = await Network.findById(req.params.id);
        const anciensResponsables = [];
        if (oldNetwork) {
            if (oldNetwork.responsable1) anciensResponsables.push(oldNetwork.responsable1.toString());
            if (oldNetwork.responsable2) anciensResponsables.push(oldNetwork.responsable2.toString());
        }

        // 2. Appliquer la mise à jour
        const network = await Network.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        // 3. Déterminer les nouveaux responsables
        const nouveauxResponsables = [];
        if (req.body.responsable1) nouveauxResponsables.push(req.body.responsable1.toString());
        if (req.body.responsable2) nouveauxResponsables.push(req.body.responsable2.toString());

        // 4. Ceux qui sont dans anciens mais plus dans nouveaux => repassent Leader
        const responsablesDevenusLeaders = anciensResponsables.filter(id => !nouveauxResponsables.includes(id));
        if (responsablesDevenusLeaders.length > 0) {
            await User.updateMany(
                { _id: { $in: responsablesDevenusLeaders } },
                { $set: { qualification: "Leader" } }
            );
        }
        // 5. Ceux qui sont dans nouveaux => passent Responsable réseau
        if (nouveauxResponsables.length > 0) {
            await User.updateMany(
                { _id: { $in: nouveauxResponsables } },
                { $set: { qualification: "Responsable réseau" } }
            );
        }

        if (!network) {
            return res.status(404).json({
                success: false,
                message: 'Réseau non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: network
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Supprimer un réseau
// @route   DELETE /api/networks/:id
// @access  Private/Admin
exports.deleteNetwork = async (req, res) => {
    try {
        const network = await Network.findById(req.params.id);

        if (!network) {
            return res.status(404).json({
                success: false,
                message: 'Réseau non trouvé'
            });
        }

        // Supprimer tous les groupes associés
        await Group.deleteMany({ network: network._id });

        // Mettre à jour les qualifications des responsables avant suppression
        const responsables = [];
        if (network.responsable1) responsables.push(network.responsable1.toString());
        if (network.responsable2) responsables.push(network.responsable2.toString());
        if (responsables.length > 0) {
            await User.updateMany(
                { _id: { $in: responsables } },
                { $set: { qualification: "Leader" } }
            );
        }

        await network.remove();

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

// @desc    Obtenir tous les membres d'un réseau
// @route   GET /api/networks/:id/members
// @access  Private
exports.getNetworkMembers = async (req, res) => {
    try {
        const groups = await Group.find({ network: req.params.id });
        // Récupère tous les membres uniques de tous les groupes du réseau
        const memberIds = new Set();
        groups.forEach(group => {
            group.members.forEach(memberId => memberIds.add(memberId.toString()));
        });
        const members = await User.find({ _id: { $in: Array.from(memberIds) } });
        res.status(200).json({
            success: true,
            count: members.length,
            data: members
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Obtenir les groupes d'un réseau
// @route   GET /api/networks/:id/grs
// @access  Private
exports.getNetworkGroups = async (req, res) => {
    try {
        const groups = await Group.find({ network: req.params.id }).populate('responsable1 responsable2 members');
        res.status(200).json({
            success: true,
            count: groups.length,
            data: groups
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Obtenir les statistiques d'un réseau spécifique
// @route   GET /api/networks/:id/stats
// @access  Private
exports.getNetworkStatsById = async (req, res) => {
    try {
        const network = await Network.findById(req.params.id);
        if (!network) {
            return res.status(404).json({
                success: false,
                message: 'Réseau non trouvé'
            });
        }
        const stats = await network.qualificationStats;
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

// @desc    Obtenir les statistiques des réseaux
// @route   GET /api/networks/stats
// @access  Private/Admin
exports.getNetworkStats = async (req, res) => {
    try {
        const networks = await Network.find()
            .populate('responsable1', 'username pseudo qualification')
            .populate('responsable2', 'username pseudo qualification');

        const stats = await Promise.all(
            networks.map(async (network) => {
                // Récupère tous les groupes du réseau
                const groups = await Group.find({ network: network._id }).select('members');
                
                // Récupère tous les membres (sans doublons)
                const memberIds = new Set();
                groups.forEach(g => {
                    g.members.forEach(m => memberIds.add(m.toString()));
                });
                // Ajoute les responsables
                if (network.responsable1) memberIds.add(network.responsable1._id.toString());
                if (network.responsable2) memberIds.add(network.responsable2._id.toString());

                // Récupère les qualifications de tous les membres uniques
                const qualifications = await User.find({ _id: { $in: Array.from(memberIds) } })
                    .select('qualification')
                    .lean();

                return {
                    id: network._id,
                    nom: network.nom,
                    groupes: groups.map(g => g._id),
                    groupCount: groups.length,
                    memberCount: memberIds.size,
                    responsables: [
                        network.responsable1 ? {
                            id: network.responsable1._id,
                            username: network.responsable1.username,
                            pseudo: network.responsable1.pseudo,
                            qualification: network.responsable1.qualification
                        } : null,
                        network.responsable2 ? {
                            id: network.responsable2._id,
                            username: network.responsable2.username,
                            pseudo: network.responsable2.pseudo,
                            qualification: network.responsable2.qualification
                        } : null
                    ].filter(Boolean),
                    qualifications: qualifications.map(q => q.qualification)
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
