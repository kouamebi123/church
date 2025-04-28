const express = require('express');
const router = express.Router();
const { getGlobalStats, getNetworksEvolution, compareNetworksByYear } = require('../controllers/statsController');
const { protect, authorize } = require('../middlewares/auth');

router.use(protect);
router.get('/', authorize('admin', 'superviseur'), getGlobalStats);
router.get('/networks/evolution', getNetworksEvolution);
router.get('/networks/evolution/compare', protect, compareNetworksByYear);

module.exports = router;
