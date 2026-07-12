const express = require('express');
const {
  register, login, googleLogin, me, forgotPassword, resetPassword,
  logoutAllDevices, getSessions, changePassword,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/google', googleLogin);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/me', protect, me);
router.put('/change-password', protect, changePassword);
router.post('/logout-all-devices', protect, logoutAllDevices);
router.get('/sessions', protect, getSessions);

module.exports = router;
