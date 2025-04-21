const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
    getServices,
    getService,
    createService,
    updateService,
    deleteService,
    getServiceStats,
    getServicesByPeriod
} = require('../controllers/serviceController');

router.use(protect);

router.route('/')
    .get(getServices)
    .post(authorize('admin', 'collecteur_culte'), createService);

router.get('/stats', authorize('admin'), getServiceStats);
router.get('/period', getServicesByPeriod);

router.route('/:id')
    .get(getService)
    .put(authorize('admin', 'collecteur_culte'), updateService)
    .delete(authorize('admin'), deleteService);

module.exports = router;
