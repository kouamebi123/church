const mongoose = require('mongoose');

const networkSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        unique: true
    },
    responsable1: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    responsable2: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    active: {
        type: Boolean,
        default: true
    },
    church: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Church'
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual pour les groupes associés
networkSchema.virtual('groups', {
    ref: 'Group',
    localField: '_id',
    foreignField: 'network'
});

// Virtual pour le nombre de groupes
networkSchema.virtual('groupCount').get(async function() {
    const Group = mongoose.model('Group');
    return await Group.countDocuments({ network: this._id });
});

// Virtual pour le nombre total de membres
networkSchema.virtual('memberCount').get(async function() {
    const Group = mongoose.model('Group');
    const groups = await Group.find({ network: this._id });
    const memberIds = new Set();
    
    groups.forEach(group => {
        group.members.forEach(memberId => memberIds.add(memberId.toString()));
    });
    
    return memberIds.size;
});

// Virtual pour les statistiques de qualification
networkSchema.virtual('qualificationStats').get(async function() {
    const Group = mongoose.model('Group');
    const User = mongoose.model('User');
    
    const groups = await Group.find({ network: this._id });
    const memberIds = groups.reduce((acc, group) => {
        group.members.forEach(memberId => acc.add(memberId.toString()));
        return acc;
    }, new Set());
    
    const members = await User.find({
        _id: { $in: Array.from(memberIds) }
    });
    
    const stats = {
        '12': members.filter(m => m.qualification === '12').length,
        '144': members.filter(m => m.qualification === '144').length,
        '1728': members.filter(m => m.qualification === '1728').length,
        totalGroups: groups.length,
        'Responsables de GR': (() => {
            const responsablesSet = new Set();
            groups.forEach(group => {
                if (group.responsable1) responsablesSet.add(String(group.responsable1));
                if (group.responsable2) responsablesSet.add(String(group.responsable2));
            });
            return responsablesSet.size;
        })(),
        'Leader': members.filter(m => m.qualification === 'Leader').length,
        'Régulier': members.filter(m => m.qualification === 'Régulier').length,
        'Irrégulier': members.filter(m => m.qualification === 'Irrégulier').length,
        'En intégration': members.filter(m => m.qualification === 'En intégration').length,
        'Membre simple': members.filter(m => !["12", "144", "1728", "Leader", "Responsable réseau"].includes(m.qualification)).length,
        totalMembers: members.length
    };
    
    return stats;
});

// Middleware pour mettre à jour la qualification des responsables
networkSchema.pre('save', async function(next) {
    if (this.isNew) {
        const User = mongoose.model('User');
        try {
            await User.updateOne(
                { _id: this.responsable1 },
                { qualification: 'Responsable réseau' }
            );
            
            if (this.responsable2) {
                await User.updateOne(
                    { _id: this.responsable2 },
                    { qualification: 'Responsable réseau' }
                );
            }
        } catch (error) {
            next(error);
        }
    }
    next();
});

const Network = mongoose.model('Network', networkSchema);

module.exports = Network;
