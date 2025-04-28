// Endpoint pour la répartition des membres par qualification/catégorie pour chaque réseau
const Network = require('../models/Network');
const Group = require('../models/Group');
const User = require('../models/User');

// @desc    Obtenir la répartition des membres par catégorie/qualification pour chaque réseau
// @route   GET /api/networks/qualification-stats
// @access  Private/Admin
exports.getNetworksQualificationStats = async (req, res) => {
    try {
        const networks = await Network.find();
        const result = await Promise.all(networks.map(async (network) => {
            // Récupère tous les groupes du réseau
            const groups = await Group.find({ network: network._id }).select('members');
            // Récupère tous les membres (sans doublons)
            const memberIds = new Set();
            groups.forEach(g => {
                g.members.forEach(m => memberIds.add(m.toString()));
            });
            // Ajoute les responsables
            if (network.responsable1) memberIds.add(network.responsable1.toString());
            if (network.responsable2) memberIds.add(network.responsable2.toString());
            // Récupère les qualifications de tous les membres uniques
            const members = await User.find({ _id: { $in: Array.from(memberIds) } }).select('qualification');
            // Compte par qualification/catégorie
            const categories = {};
            members.forEach(m => {
                const qual = m.qualification || 'Inconnu';
                categories[qual] = (categories[qual] || 0) + 1;
            });
            return {
                name: network.nom,
                ...categories
            };
        }));
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
