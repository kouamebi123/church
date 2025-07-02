const express = require('express');
const router = express.Router();
const { getGlobalStats, getNetworksEvolution, compareNetworksByYear } = require('../controllers/statsController');
const { protect, authorize } = require('../middlewares/auth');

// Appliquer protect à toutes les routes
router.use(protect);

// Routes
router.get('/', authorize('admin', 'superviseur'), getGlobalStats);
router.get('/networks/evolution', getNetworksEvolution);
router.get('/networks/evolution/compare', compareNetworksByYear);

module.exports = router;
