const express = require('express');
const router = express.Router();

// Importer les routes
const authRoutes = require('./auth');
const userRoutes = require('./users');
const networkRoutes = require('./networks');
const groupRoutes = require('./groups');
const churchRoutes = require('./churches');
const departmentRoutes = require('./departments');
const serviceRoutes = require('./services');
const carouselRoutes = require('./carouselRoutes');
const statsRoutes = require('./stats');

// Monter les routes
router.use('/api/auth', authRoutes);
router.use('/api/users', userRoutes);
router.use('/api/networks', networkRoutes);
router.use('/api/groups', groupRoutes);
router.use('/api/churches', churchRoutes);
router.use('/api/departments', departmentRoutes);
router.use('/api/services', serviceRoutes);
router.use('/api/carousel', carouselRoutes);
router.use('/api/stats', statsRoutes);

module.exports = router;
