const express = require('express');
const {
  getProfile, updateProfile, getStatistics, getSettings, updateSettings, deleteAccount,
} = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/me/settings', protect, getSettings);
router.put('/me/settings', protect, updateSettings);
router.delete('/me', protect, deleteAccount);
router.put('/me', protect, updateProfile);
router.get('/:id', getProfile);
router.get('/:id/statistics', getStatistics);

module.exports = router;
