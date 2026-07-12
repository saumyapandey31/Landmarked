const { body } = require('express-validator');

const scrapbookValidationRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
  body('caption').optional({ checkFalsy: true }).isLength({ max: 2000 }),
  body('location').optional({ checkFalsy: true }).isLength({ max: 160 }),
  body('country').optional({ checkFalsy: true }).isLength({ max: 80 }),
  body('city').optional({ checkFalsy: true }).isLength({ max: 80 }),
  body('travelDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid travel date'),
  body('images').optional().isArray().withMessage('images must be an array of URLs'),
];

module.exports = { scrapbookValidationRules };
