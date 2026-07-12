const express = require('express');
const { toggleBookmark, getMyBookmarks } = require('../controllers/bookmark.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/toggle', protect, toggleBookmark);
router.get('/mine', protect, getMyBookmarks);

module.exports = router;
