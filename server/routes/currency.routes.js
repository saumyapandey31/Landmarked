const express = require('express');
const { getExchangeRate } = require('../services/currency');

const router = express.Router();

router.get('/rate', async (req, res, next) => {
  try {
    const { base, target } = req.query;
    if (!base || !target) return res.status(400).json({ message: 'base and target are required' });
    const rate = await getExchangeRate(base, target);
    res.json(rate);
  } catch (err) {
    next(err);
  }
});

module.exports = router;
