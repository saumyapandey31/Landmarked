const express = require('express');
const {
  createMarker, getMarkers, updateMarker, deleteMarker,
} = require('../controllers/marker.controller');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.get('/', protect, getMarkers);
router.post('/', protect, createMarker);
router.put('/:id', protect, updateMarker);
router.delete('/:id', protect, deleteMarker);

module.exports = router;
