const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
    getGroups,
    getGroup,
    createGroup,
    updateGroup,
    deleteGroup,
    addMember,
    removeMember
} = require('../controllers/groupController');

router.use(protect);

// Middleware de log pour déboguer
router.use('/:id/members', (req, res, next) => {
    console.log('Route /:id/members atteinte avec:', {
        method: req.method,
        params: req.params,
        body: req.body,
        url: req.url
    });
    next();
});

router.route('/')
    .get(getGroups)
    .post(authorize('admin', 'superviseur'), createGroup);

router.route('/:id')
    .get(getGroup)
    .put(authorize('admin', 'superviseur'), updateGroup)
    .delete(authorize('admin'), deleteGroup);

router.route('/:id/members')
    .post(authorize('admin', 'superviseur', 'collecteur_reseaux'), addMember);

router.route('/:id/members/:userId')
    .delete(authorize('admin', 'superviseur', 'collecteur_reseaux'), removeMember);

module.exports = router;
