const axios = require("axios");
const { DEFILLAMA_BASE } = require("../config");

const client = axios.create({ baseURL: DEFILLAMA_BASE, timeout: 10000 });

/**
 * Fetch TVL for all protocols, sorted descending by TVL.
 * @param {number} limit - max results to return
 */
async function getTopProtocols(limit = 20) {
  const { data } = await client.get("/protocols");
  return data
    .sort((a, b) => b.tvl - a.tvl)
    .slice(0, limit)
    .map(({ name, tvl, chain, category, change_1d, change_7d }) => ({
      name,
      tvl,
      chain,
      category,
      change_1d: change_1d ?? null,
      change_7d: change_7d ?? null,
    }));
}

/**
 * Fetch historical TVL for a specific protocol slug.
 * @param {string} protocol - protocol slug e.g. "aave"
 */
async function getProtocolTVLHistory(protocol) {
  const { data } = await client.get(`/protocol/${protocol}`);
  const history = data.tvl ?? [];
  return {
    name: data.name,
    symbol: data.symbol,
    chain: data.chain,
    current_tvl: data.tvl?.at(-1)?.totalLiquidityUSD ?? null,
    history: history.slice(-30).map(({ date, totalLiquidityUSD }) => ({
      date: new Date(date * 1000).toISOString().split("T")[0],
      tvl: totalLiquidityUSD,
    })),
  };
}

/**
 * Get total DeFi TVL across all chains.
 */
async function getGlobalTVL() {
  const { data } = await client.get("/v2/historicalChainTvl");
  const latest = data.at(-1);
  return {
    date: new Date(latest.date * 1000).toISOString().split("T")[0],
    tvl: latest.tvl,
  };
}

module.exports = { getTopProtocols, getProtocolTVLHistory, getGlobalTVL };
