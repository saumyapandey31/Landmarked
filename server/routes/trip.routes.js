const express = require('express');
const {
  createTrip, getTrips, getTripById, updateTrip, deleteTrip, addMedia,
} = require('../controllers/trip.controller');
const { protect, optionalAuth } = require('../middleware/auth');
const { tripValidationRules } = require('../validators/trip.validator');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', optionalAuth, getTrips);
router.get('/:id', optionalAuth, getTripById);
router.post('/', protect, tripValidationRules, validate, createTrip);
router.put('/:id', protect, updateTrip);
router.delete('/:id', protect, deleteTrip);
router.post('/:id/media', protect, addMedia);

module.exports = router;
