const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        unique: true
    }
}, {
    timestamps: true
});

const Department = mongoose.model('Department', departmentSchema);

module.exports = Department;
