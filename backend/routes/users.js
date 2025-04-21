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
    resetPassword
} = require('../controllers/userController');

router.use(protect);
router.use(authorize('admin'));

router.route('/')
    .get(getUsers)
    .post(createUser);

router.get('/available', getAvailableUsers);
router.get('/stats', getUserStats);

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser);

router.put('/:id/qualification', updateQualification);
router.post('/:id/reset-password', resetPassword); 

module.exports = router;
