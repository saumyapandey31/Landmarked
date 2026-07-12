const { body } = require('express-validator');

const tripValidationRules = [
  body('title').trim().notEmpty().withMessage('Title is required').isLength({ max: 120 }),
  body('destination').optional({ checkFalsy: true }).trim().isLength({ max: 120 }),
  body('country').optional({ checkFalsy: true }).trim().isLength({ max: 80 }),
  body('latitude')
    .notEmpty().withMessage('Latitude is required')
    .bail()
    .isFloat({ min: -90, max: 90 }).withMessage('Latitude must be between -90 and 90'),
  body('longitude')
    .notEmpty().withMessage('Longitude is required')
    .bail()
    .isFloat({ min: -180, max: 180 }).withMessage('Longitude must be between -180 and 180'),
  body('startDate').notEmpty().withMessage('Start date is required').isISO8601().withMessage('Invalid start date'),
  body('endDate').optional({ checkFalsy: true }).isISO8601().withMessage('Invalid end date'),
  body('description').optional({ checkFalsy: true }).isLength({ max: 5000 }),
  body('travelStatus')
    .optional({ checkFalsy: true })
    .isIn(['VISITED', 'WANT_TO_VISIT', 'CURRENTLY_TRAVELLING', 'BUCKET_LIST']),
  body('privacy').optional({ checkFalsy: true }).isIn(['PUBLIC', 'FRIENDS_ONLY', 'PRIVATE']),
  body('budget').optional({ checkFalsy: true }).isFloat({ min: 0 }).withMessage('Budget must be positive'),
  body('rating').optional({ checkFalsy: true }).isInt({ min: 1, max: 5 }),
];

module.exports = { tripValidationRules };
