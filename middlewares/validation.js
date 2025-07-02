const { body, validationResult, query } = require('express-validator');

// Middleware pour gérer les erreurs de validation
const handleValidationErrors = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            errors: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
};

// Validation pour l'inscription
exports.validateRegister = [
    body('username').trim().isLength({ min: 2, max: 50 }).withMessage('Le nom d\'utilisateur doit contenir entre 2 et 50 caractères'),
    body('pseudo').trim().isLength({ min: 3, max: 30 }).withMessage('Le pseudo doit contenir entre 3 et 30 caractères'),
    body('password').isLength({ min: 6 }).withMessage('Le mot de passe doit contenir au moins 6 caractères'),
    body('email').isEmail().normalizeEmail().withMessage('Email invalide'),
    body('telephone').optional().isMobilePhone('fr-FR').withMessage('Numéro de téléphone invalide'),
    body('genre').isIn(['Homme', 'Femme', 'Enfant']).withMessage('Genre invalide'),
    body('tranche_age').notEmpty().withMessage('Tranche d\'âge requise'),
    body('profession').notEmpty().withMessage('Profession requise'),
    body('ville_residence').notEmpty().withMessage('Ville de résidence requise'),
    body('origine').notEmpty().withMessage('Origine requise'),
    body('situation_matrimoniale').notEmpty().withMessage('Situation matrimoniale requise'),
    body('niveau_education').notEmpty().withMessage('Niveau d\'éducation requis'),
    handleValidationErrors
];

// Validation pour la connexion
exports.validateLogin = [
    body('pseudo').trim().notEmpty().withMessage('Pseudo requis'),
    body('password').notEmpty().withMessage('Mot de passe requis'),
    handleValidationErrors
];

// Validation pour la mise à jour du profil
exports.validateUpdateProfile = [
    body('username').optional().trim().isLength({ min: 2, max: 50 }).withMessage('Le nom d\'utilisateur doit contenir entre 2 et 50 caractères'),
    body('email').optional().isEmail().normalizeEmail().withMessage('Email invalide'),
    body('telephone').optional().isMobilePhone('fr-FR').withMessage('Numéro de téléphone invalide'),
    handleValidationErrors
];

// Validation pour la mise à jour du mot de passe
exports.validateUpdatePassword = [
    body('currentPassword').notEmpty().withMessage('Mot de passe actuel requis'),
    body('newPassword').isLength({ min: 6 }).withMessage('Le nouveau mot de passe doit contenir au moins 6 caractères'),
    handleValidationErrors
];

// Validation pour les filtres de requête (protection NoSQL injection)
exports.validateQueryFilters = [
    query('role').optional().isIn(['admin', 'superviseur', 'collecteur_reseaux', 'collecteur_culte', 'membre', 'gouvernance']).withMessage('Rôle invalide'),
    query('genre').optional().isIn(['Homme', 'Femme', 'Enfant']).withMessage('Genre invalide'),
    query('qualification').optional().isIn([
        '12', '144', '1728', 'Leader',
        'Responsable réseau',
        'Régulier',
        'Irrégulier',
        'En intégration',
        'Gouvernance',
        'Ecodim','Responsable ecodim',
    ]).withMessage('Qualification invalide'),
    handleValidationErrors
];

// Fonction pour filtrer les paramètres de requête autorisés
exports.filterQueryParams = (allowedFields) => {
    return (req, res, next) => {
        const filteredQuery = {};
        Object.keys(req.query).forEach(key => {
            if (allowedFields.includes(key)) {
                filteredQuery[key] = req.query[key];
            }
        });
        req.filteredQuery = filteredQuery;
        next();
    };
}; 