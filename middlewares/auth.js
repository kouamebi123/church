const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.protect = async (req, res, next) => {
    try {
        // 1. Vérifier si le token existe
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'Veuillez vous connecter pour accéder à cette ressource' 
            });
        }

        // 2. Vérifier la validité du token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // 3. Vérifier si l'utilisateur existe toujours
        const user = await User.findById(decoded.id);
        if (!user) {
            return res.status(401).json({ 
                success: false, 
                message: 'L\'utilisateur associé à ce token n\'existe plus' 
            });
        }

        // 4. Ajouter l'utilisateur à la requête
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ 
            success: false, 
            message: 'Non autorisé à accéder à cette ressource' 
        });
    }
};

exports.authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: 'Vous n\'avez pas les droits pour effectuer cette action'
            });
        }
        next();
    };
};
