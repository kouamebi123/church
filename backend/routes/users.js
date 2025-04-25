const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
    updateQualification,
    getUserStats,
    getAvailableUsers,
    getRetiredUsers,
    resetPassword,
    getNonIsoles,
    getIsoles
} = require('../controllers/userController');

router.use(protect);
router.use(authorize('admin'));

router.get('/non-isoles', getNonIsoles);
router.get('/isoles', getIsoles);

router.route('/')
    .get(getUsers)
    .post(createUser);

router.get('/available', getAvailableUsers);
router.get('/retired', getRetiredUsers);
router.get('/stats', getUserStats);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

router.put('/:id/qualification', updateQualification);
router.post('/:id/reset-password', resetPassword); 

module.exports = router;
