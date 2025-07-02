const express = require('express');
const router = express.Router();
const { protect } = require('../middlewares/auth');
const {
    validateRegister, 
    validateLogin, 
    validateUpdateProfile, 
    validateUpdatePassword 
} = require('../middlewares/validation');
const {
    register,
    login,
    getMe,
    updateDetails,
    updatePassword
} = require('../controllers/authController');

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', protect, getMe);
router.put('/updatedetails', protect, validateUpdateProfile, updateDetails);
router.put('/updatepassword', protect, validateUpdatePassword, updatePassword);

module.exports = router;
