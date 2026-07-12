const axios = require('axios');

async function getExchangeRate(base, target) {
  const apiKey = process.env.EXCHANGE_RATE_API_KEY;
  if (!apiKey) {
    throw Object.assign(new Error('EXCHANGE_RATE_API_KEY not configured'), { status: 500 });
  }
  const url = `https://v6.exchangerate-api.com/v6/${apiKey}/pair/${base}/${target}`;
  const { data } = await axios.get(url);
  return { base, target, rate: data.conversion_rate };
}

module.exports = { getExchangeRate };
