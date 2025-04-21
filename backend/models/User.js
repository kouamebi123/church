const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
    },
    pseudo: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        enum: ['admin', 'superviseur', 'collecteur_reseaux', 'collecteur_culte', 'membre','gouvernance'],
        default: 'membre'
    },
    genre: {
        type: String,
        enum: ['Homme', 'Femme', 'Enfant'],
        required: true
    },
    tranche_age: {
        type: String,
        required: true
    },
    profession: {
        type: String,
        required: true
    },
    ville_residence: {
        type: String,
        required: true
    },
    origine: {
        type: String,
        required: true
    },
    situation_matrimoniale: {
        type: String,
        required: true
    },
    niveau_education: {
        type: String,
        required: true
    },
    eglise_locale: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Church'
    },
    departement: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Department'
    },
    qualification: {
        type: String,
        enum: [
            '12', '144', '1728', 'Leader',
            'Responsable réseau', 'Responsable reseau',
            'Régulier', 'régulier', 'Regulier', 'regulier',
            'Irrégulier', 'irregulier', 'Irrégulier', 'irregulier',
            'En intégration', 'en integration', 'En integration', 'en intégration',
            'Gouvernance', 'gouvernance',
            'Ecodim', 'ecodim','Responsable ecodim','responsable ecodim'
        ],
        default: 'En intégration'
    },
    email: {
        type: String,
        unique: true,
        sparse: true
    },
    telephone: {
        type: String
    },
    adresse: {
        type: String
    }
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

const User = mongoose.model('User', userSchema);

module.exports = User;
