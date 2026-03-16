const express = require("express");
const { PORT } = require("./config");
const { startAlertScheduler } = require("./alerts");

const app = express();
app.use(express.json());

app.use("/api/protocols", require("./routes/protocols"));
app.use("/api/prices", require("./routes/prices"));

app.get("/", (req, res) => {
  res.json({
    name: "DeFi Pulse API",
    version: "1.0.0",
    endpoints: {
      "GET /api/protocols": "Top DeFi protocols by TVL",
      "GET /api/protocols/global-tvl": "Total DeFi TVL",
      "GET /api/protocols/:slug": "Protocol TVL history",
      "GET /api/prices?ids=ethereum,aave": "Token prices",
      "GET /api/prices/search?q=uniswap": "Search coins",
      "GET /api/prices/watchlist": "Your watchlist",
      "POST /api/prices/watchlist/:id": "Add to watchlist",
      "DELETE /api/prices/watchlist/:id": "Remove from watchlist",
      "GET /api/prices/alerts": "List alerts",
      "POST /api/prices/alerts": "Create price alert",
      "DELETE /api/prices/alerts/:id": "Delete alert",
    },
  });
});

app.use((req, res) => res.status(404).json({ success: false, error: "Route not found" }));

app.listen(PORT, () => {
  console.log(`DeFi Pulse API running on http://localhost:${PORT}`);
  startAlertScheduler();
});

module.exports = app;
