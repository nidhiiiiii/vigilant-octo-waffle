require("dotenv").config();

module.exports = {
  PORT: process.env.PORT || 3000,
  COINGECKO_BASE: "https://api.coingecko.com/api/v3",
  DEFILLAMA_BASE: "https://api.llama.fi",
  COINGECKO_API_KEY: process.env.COINGECKO_API_KEY || null,
  ALERT_INTERVAL: parseInt(process.env.ALERT_INTERVAL || "5", 10),
};