const { body } = require('express-validator');

const bucketListValidationRules = [
  body('destination').trim().notEmpty().withMessage('Destination is required').isLength({ max: 120 }),
  body('country').optional({ checkFalsy: true }).isLength({ max: 80 }),
  body('continent').optional({ checkFalsy: true }).isLength({ max: 40 }),
  body('notes').optional({ checkFalsy: true }).isLength({ max: 2000 }),
  body('priority').optional({ checkFalsy: true }).isIn(['LOW', 'MEDIUM', 'HIGH']),
  body('estimatedBudget').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Budget must be positive'),
  body('bestSeason').optional({ checkFalsy: true }).isLength({ max: 40 }),
  body('travelType').optional({ checkFalsy: true }).isLength({ max: 40 }),
];

module.exports = { bucketListValidationRules };
