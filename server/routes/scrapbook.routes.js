const express = require('express');
const {
  createEntry, getEntries, getEntryById, updateEntry, deleteEntry,
} = require('../controllers/scrapbook.controller');
const { protect, optionalAuth } = require('../middleware/auth');
const { scrapbookValidationRules } = require('../validators/scrapbook.validator');
const validate = require('../middleware/validate');

const router = express.Router();

router.get('/', optionalAuth, getEntries);
router.get('/:id', optionalAuth, getEntryById);
router.post('/', protect, scrapbookValidationRules, validate, createEntry);
router.put('/:id', protect, scrapbookValidationRules, validate, updateEntry);
router.delete('/:id', protect, deleteEntry);

module.exports = router;
