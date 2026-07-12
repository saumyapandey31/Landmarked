const express = require('express');
const { createItem, getItems, updateItem, deleteItem } = require('../controllers/bucketlist.controller');
const { protect, optionalAuth } = require('../middleware/auth');
const { bucketListValidationRules } = require('../validators/bucketlist.validator');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', optionalAuth, getItems);
router.post('/', protect, bucketListValidationRules, validate, createItem);
router.put('/:id', protect, updateItem);
router.delete('/:id', protect, deleteItem);

module.exports = router;
