const { validationResult } = require('express-validator');

// Runs after an express-validator chain; turns accumulated errors into a
// single 422 response the frontend can map straight onto form fields.
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
}

module.exports = validate;
