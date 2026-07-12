const express = require('express');
const { toggleFollow, getFollowers, getFollowing } = require('../controllers/follow.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/:userId/toggle', protect, toggleFollow);
router.get('/:userId/followers', getFollowers);
router.get('/:userId/following', getFollowing);

module.exports = router;
