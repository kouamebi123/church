const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
    getNetworks,
    getNetwork,
    createNetwork,
    updateNetwork,
    deleteNetwork,
    getNetworkStats,
    getNetworkStatsById,
    getNetworkGroups,
    getNetworkMembers
} = require('../controllers/networkController');

router.use(protect);

router.route('/')
    .get(getNetworks)
    .post(authorize('admin'), createNetwork);

router.get('/stats', authorize('admin'), getNetworkStats);

router.get('/:id/stats', getNetworkStatsById);
router.get('/:id/grs', getNetworkGroups);
router.get('/:id/members', getNetworkMembers);

router.route('/:id')
    .get(getNetwork)
    .put(authorize('admin'), updateNetwork)
    .delete(authorize('admin'), deleteNetwork);

module.exports = router;
