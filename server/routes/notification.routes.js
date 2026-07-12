const express = require('express');
const { getNotifications, markRead } = require('../controllers/notification.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getNotifications);
router.put('/:id/read', protect, markRead);

module.exports = router;
