const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
    network: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Network',
        required: true
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
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    membersHistory: [{
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        joinedAt: { type: Date, required: true },
        leftAt: { type: Date, default: null }
    }],
    active: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual pour le nombre de membres
groupSchema.virtual('memberCount').get(function() {
    return this.members.length;
});

// Middleware pour mettre à jour la qualification des responsables
groupSchema.pre('save', async function(next) {
    if (this.isNew) {
        const User = mongoose.model('User');
        try {
            await User.updateOne(
                { _id: this.responsable1 },
                { qualification: 'responsable' }
            );
            
            if (this.responsable2) {
                await User.updateOne(
                    { _id: this.responsable2 },
                    { qualification: 'responsable' }
                );
            }
        } catch (error) {
            next(error);
        }
    }
    next();
});

const Group = mongoose.model('Group', groupSchema);

module.exports = Group;
