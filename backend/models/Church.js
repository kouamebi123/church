const mongoose = require('mongoose');

const churchSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

const Church = mongoose.model('Church', churchSchema);

module.exports = Church;
