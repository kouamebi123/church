const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Générer le token JWT
const signToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE || '30d'
    });
};

// Envoyer le token dans la réponse
const sendTokenResponse = (user, statusCode, res) => {
    const token = signToken(user._id);

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            username: user.username,
            role: user.role,
            qualification: user.qualification
        }
    });
};

// @desc    Inscription d'un utilisateur
// @route   POST /api/auth/register
// @access  Public
exports.register = async (req, res) => {
    try {
        const {
            username,
            pseudo,
            password,
            email,
            telephone,
            genre,
            tranche_age,
            profession,
            ville_residence,
            origine,
            situation_matrimoniale,
            niveau_education,
            eglise_locale,
            departement
        } = req.body;

        // Créer l'utilisateur
        const user = await User.create({
            username,
            pseudo,
            password,
            email,
            telephone,
            genre,
            tranche_age,
            profession,
            ville_residence,
            origine,
            situation_matrimoniale,
            niveau_education,
            eglise_locale,
            departement,
            role: 'membre',
            qualification: 'En integration'
        });

        sendTokenResponse(user, 201, res);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Connexion d'un utilisateur
// @route   POST /api/auth/login
// @access  Public
exports.login = async (req, res) => {
    try {
        const { pseudo, password } = req.body;

        // Valider les champs
        if (!pseudo || !password) {
            return res.status(400).json({
                success: false,
                message: 'Veuillez fournir un pseudo et un mot de passe'
            });
        }

        // Vérifier si l'utilisateur existe
        const user = await User.findOne({ pseudo }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants invalides'
            });
        }

        // Vérifier si le mot de passe correspond
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Identifiants invalides'
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Obtenir l'utilisateur connecté
// @route   GET /api/auth/me
// @access  Private
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id)
            .populate('eglise_locale', 'nom')
            .populate('departement', 'nom');

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Mettre à jour les informations de l'utilisateur
// @route   PUT /api/auth/updatedetails
// @access  Private
exports.updateDetails = async (req, res) => {
    try {
        const fieldsToUpdate = {
            username: req.body.username,
            email: req.body.email,
            telephone: req.body.telephone,
            ville_residence: req.body.ville_residence,
            profession: req.body.profession,
            situation_matrimoniale: req.body.situation_matrimoniale,
            niveau_education: req.body.niveau_education
        };

        const user = await User.findByIdAndUpdate(
            req.user.id,
            fieldsToUpdate,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            data: user
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// @desc    Mettre à jour le mot de passe
// @route   PUT /api/auth/updatepassword
// @access  Private
exports.updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('+password');

        // Vérifier le mot de passe actuel
        const isMatch = await user.comparePassword(req.body.currentPassword);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Mot de passe actuel incorrect'
            });
        }

        user.password = req.body.newPassword;
        await user.save();

        sendTokenResponse(user, 200, res);
    } catch (error) {
        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};
