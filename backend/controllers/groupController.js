const Group = require('../models/Group');
const User = require('../models/User');
const Network = require('../models/Network');

// @desc    Obtenir tous les groupes
// @route   GET /api/groups
// @access  Private
exports.getGroups = async (req, res) => {
    try {
        const groups = await Group.find()
            .populate('network', 'nom')
            .populate('responsable1', 'username')
            .populate('responsable2', 'username')
            .populate('members', 'username qualification');

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

// @desc    Obtenir un groupe par ID
// @route   GET /api/groups/:id
// @access  Private
exports.getGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id)
            .populate('network', 'nom')
            .populate('responsable1', 'username')
            .populate('responsable2', 'username')
            .populate('members', 'username qualification');

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Groupe non trouvé'
            });
        }

        res.status(200).json({
            success: true,
            data: group
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Créer un groupe
// @route   POST /api/groups
// @access  Private/Admin
exports.createGroup = async (req, res) => {
    try {
        console.log('BODY:', req.body);
        const { network, responsable1, responsable2, members } = req.body;

        // Vérifier si le réseau existe
        const reseau = await Network.findById(network);
        if (!reseau) {
            return res.status(404).json({
                success: false,
                message: 'Réseau non trouvé'
            });
        }

        // Préparer l'historique des responsables
        const now = new Date();
        const responsablesHistory = [responsable1, responsable2]
            .filter(Boolean)
            .map(userId => ({
                user: userId,
                joinedAt: now,
                leftAt: null
            }));

        // Créer le groupe
        const group = await Group.create({
            network,
            responsable1,
            responsable2,
            members: members || [responsable1, responsable2].filter(Boolean),
            membersHistory: responsablesHistory
        });

        // Mettre à jour les qualifications des responsables
        await User.updateOne(
            { _id: responsable1 },
            { qualification: 'Leader' }
        );

        if (responsable2) {
            await User.updateOne(
                { _id: responsable2 },
                { qualification: 'Leader' }
            );
        }

        const populatedGroup = await Group.findById(group._id)
            .populate('network', 'nom')
            .populate('responsable1', 'username')
            .populate('responsable2', 'username')
            .populate('members', 'username qualification');

        res.status(201).json({
            success: true,
            data: populatedGroup
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Mettre à jour un groupe
// @route   PUT /api/groups/:id
// @access  Private/Admin
exports.updateGroup = async (req, res) => {
    console.log('Payload reçu pour updateGroup:', req.body);
    try {
        // 1. Récupérer les anciens responsables
        const oldGroup = await Group.findById(req.params.id);
        const anciensResponsables = [];
        if (oldGroup) {
            if (oldGroup.responsable1) anciensResponsables.push(oldGroup.responsable1.toString());
            if (oldGroup.responsable2) anciensResponsables.push(oldGroup.responsable2.toString());
        }

        // 2. Appliquer la mise à jour
        let group = await Group.findByIdAndUpdate(
            req.params.id,
            req.body,
            {
                new: true,
                runValidators: true
            }
        );

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Groupe non trouvé'
            });
        }

        // Ajouter les nouveaux responsables aux membres s'ils n'y sont pas déjà
        let hasChanged = false;
        if (group.responsable1 && !group.members.includes(group.responsable1)) {
            group.members.push(group.responsable1);
            hasChanged = true;
        }
        if (group.responsable2 && group.responsable2 !== '' && !group.members.includes(group.responsable2)) {
            group.members.push(group.responsable2);
            hasChanged = true;
        }
        if (hasChanged) {
            await group.save();
        }

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
        // 5. Ceux qui sont dans nouveaux => passent Leader
        if (nouveauxResponsables.length > 0) {
            await User.updateMany(
                { _id: { $in: nouveauxResponsables } },
                { $set: { qualification: "Leader" } }
            );
        }

        group = await Group.findById(group._id)
            .populate('network', 'nom')
            .populate('responsable1', 'username')
            .populate('responsable2', 'username')
            .populate('members', 'username qualification');

        res.status(200).json({
            success: true,
            data: group
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Supprimer un groupe
// @route   DELETE /api/groups/:id
// @access  Private/Admin
exports.deleteGroup = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Groupe non trouvé'
            });
        }

        // Mettre à jour les qualifications des responsables avant suppression
        const responsables = [];
        if (group.responsable1) responsables.push(group.responsable1.toString());
        if (group.responsable2) responsables.push(group.responsable2.toString());
        if (responsables.length > 0) {
            await User.updateMany(
                { _id: { $in: responsables } },
                { $set: { qualification: "Leader" } }
            );
        }

        await Group.findByIdAndDelete(req.params.id);

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        console.error('Erreur suppression groupe:', error);
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Ajouter un membre au groupe
// @route   POST /api/groups/:id/members
// @access  Private
exports.addMember = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        const { userId } = req.body;

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Groupe non trouvé'
            });
        }

        // Vérifier si l'utilisateur existe
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Utilisateur non trouvé'
            });
        }

        // Vérifier si l'utilisateur est déjà membre
        if (group.members.includes(userId)) {
            return res.status(400).json({
                success: false,
                message: 'L\'utilisateur est déjà membre de ce groupe'
            });
        }

        // Ajoute le membre si pas déjà présent
        if (!group.members.includes(userId)) {
            group.members.push(userId);
            group.membersHistory.push({ user: userId, joinedAt: new Date('2025-04-01T00:00:00Z'), leftAt: null });
        }
        await group.save();

        const updatedGroup = await Group.findById(group._id)
            .populate('network', 'nom')
            .populate('responsable1', 'username')
            .populate('responsable2', 'username')
            .populate('members', 'username qualification');

        res.status(200).json({
            success: true,
            data: updatedGroup
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Retirer un membre du groupe
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private
exports.removeMember = async (req, res) => {
    try {
        const group = await Group.findById(req.params.id);
        const { userId } = req.params;

        if (!group) {
            return res.status(404).json({
                success: false,
                message: 'Groupe non trouvé'
            });
        }

        // Vérifier si l'utilisateur est un responsable
        if (group.responsable1.toString() === userId || 
            (group.responsable2 && group.responsable2.toString() === userId)) {
            return res.status(400).json({
                success: false,
                message: 'Impossible de retirer un responsable du groupe'
            });
        }

        group.members = group.members.filter(
            member => member.toString() !== userId
        );

        // Met à jour leftAt dans membersHistory pour ce membre
        const lastHistory = [...group.membersHistory].reverse().find(
            h => h.user.toString() === userId && !h.leftAt
        );
        if (lastHistory) {
            lastHistory.leftAt = new Date();
        }
        await group.save();

        const updatedGroup = await Group.findById(group._id)
            .populate('network', 'nom')
            .populate('responsable1', 'username')
            .populate('responsable2', 'username')
            .populate('members', 'username qualification');

        res.status(200).json({
            success: true,
            data: updatedGroup
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
