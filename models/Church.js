const mongoose = require('mongoose');

const churchSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        unique: true
    },
    adresse: {
        type: String
    },
    ville: {
        type: String
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    population: {
        type: Number
    },
    nombre_membres: {
        type: Number,
        default: 0
    },
    description: {
        type: String
    },
    responsable: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    image: {
        type: String,
        default: ''
    },
    type: {
        type: String,
        enum: ['eglise', 'mission'],
        required: true,
        default: 'eglise'
    }
}, {
    timestamps: true
});

const Church = mongoose.model('Church', churchSchema);

module.exports = Church;
