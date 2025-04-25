const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    culte: {
        type: String,
        required: true
    },
    orateur: {
        type: String,
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    total_adultes: {
        type: Number,
        default: 0
    },
    total_enfants: {
        type: Number,
        default: 0
    },
    total_chantres: {
        type: Number,
        default: 0
    },
    total_protocoles: {
        type: Number,
        default: 0
    },
    total_multimedia: {
        type: Number,
        default: 0
    },
    total_respo_ecodim: {
        type: Number,
        default: 0
    },
    total_animateurs_ecodim: {
        type: Number,
        default: 0
    },
    total_enfants_ecodim: {
        type: Number,
        default: 0
    },
    collecteur_culte: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    superviseur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual pour le total général (adultes + enfants)
serviceSchema.virtual('total_general').get(function() {
    return this.total_adultes + this.total_enfants;
});

// Virtual pour le total de l'école du dimanche
total_ecodim = function() {
    return this.total_respo_ecodim + this.total_animateurs_ecodim + this.total_enfants_ecodim;
};
serviceSchema.virtual('total_ecodim').get(function() {
    return this.total_respo_ecodim + this.total_animateurs_ecodim + this.total_enfants_ecodim;
});

// Virtual pour le total de toutes les présences (pour stats globales)
serviceSchema.virtual('total_all').get(function() {
    return (
        (this.total_adultes || 0) +
        (this.total_enfants || 0) +
        (this.total_chantres || 0) +
        (this.total_protocoles || 0) +
        (this.total_multimedia || 0) +
        (this.total_respo_ecodim || 0) +
        (this.total_animateurs_ecodim || 0) +
        (this.total_enfants_ecodim || 0)
    );
});

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;
