const express = require('express');
const { toggleLike } = require('../controllers/like.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/toggle', protect, toggleLike);

module.exports = router;
