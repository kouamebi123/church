const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middlewares/auth');
const {
    getChurches,
    getChurch,
    createChurch,
    updateChurch,
    deleteChurch,
    getChurchStats,
    getCityInfo
} = require('../controllers/churchController');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Multer config pour les églises
const churchStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '../uploads/churches');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const churchUpload = multer({
  storage: churchStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Le fichier doit être une image'));
    }
  },
  limits: {
    fileSize: 20 * 1024 * 1024 // 20MB
  }
});

router.use(protect);

router.route('/')
    .get(getChurches)
    .post(authorize('admin'), churchUpload.single('image'), createChurch);

router.get('/stats', authorize('admin'), getChurchStats);

router.get('/city-info/:cityName', getCityInfo);

router.route('/:id')
    .get(getChurch)
    .put(authorize('admin'), churchUpload.single('image'), updateChurch)
    .patch(authorize('admin'), churchUpload.single('image'), updateChurch)
    .delete(authorize('admin'), deleteChurch);

module.exports = router;
