const axios = require("axios");
const { COINGECKO_BASE, COINGECKO_API_KEY } = require("../config");

const client = axios.create({
  baseURL: COINGECKO_BASE,
  timeout: 10000,
  headers: COINGECKO_API_KEY ? { "x-cg-pro-api-key": COINGECKO_API_KEY } : {},
});

/**
 * Get current price + 24h change for one or more coin IDs.
 * @param {string[]} ids - CoinGecko coin IDs e.g. ["ethereum","aave"]
 */
async function getPrices(ids) {
  const { data } = await client.get("/simple/price", {
    params: {
      ids: ids.join(","),
      vs_currencies: "usd",
      include_24hr_change: true,
      include_market_cap: true,
    },
  });
  return Object.entries(data).map(([id, info]) => ({
    id,
    price_usd: info.usd,
    change_24h: info.usd_24h_change,
    market_cap: info.usd_market_cap,
  }));
}

/**
 * Search for a coin by name/ticker and return top matches.
 * @param {string} query
 */
async function searchCoins(query) {
  const { data } = await client.get("/search", { params: { query } });
  return data.coins.slice(0, 5).map(({ id, name, symbol, market_cap_rank }) => ({
    id,
    name,
    symbol,
    market_cap_rank,
  }));
}

module.exports = { getPrices, searchCoins };
