const express = require('express');
const { getWeather } = require('../services/weather');

const router = express.Router();

router.get('/', async (req, res, next) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) return res.status(400).json({ message: 'lat and lon are required' });
    const weather = await getWeather(lat, lon);
    res.json({ weather });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
