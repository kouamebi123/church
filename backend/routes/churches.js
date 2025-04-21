const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
    getChurches,
    getChurch,
    createChurch,
    updateChurch,
    deleteChurch,
    getChurchStats
} = require('../controllers/churchController');

router.use(protect);

router.route('/')
    .get(getChurches)
    .post(authorize('admin'), createChurch);

router.get('/stats', authorize('admin'), getChurchStats);

router.route('/:id')
    .get(getChurch)
    .put(authorize('admin'), updateChurch)
    .delete(authorize('admin'), deleteChurch);

module.exports = router;
