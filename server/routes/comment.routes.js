const express = require('express');
const { addComment, getComments, deleteComment } = require('../controllers/comment.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/trip/:tripId', getComments);
router.post('/', protect, addComment);
router.delete('/:id', protect, deleteComment);

module.exports = router;
