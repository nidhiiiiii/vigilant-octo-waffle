const { Router } = require("express");
const { getPrices, searchCoins } = require("../services/coingecko");
const { loadWatchlist, addToWatchlist, removeFromWatchlist, addAlert, loadAlerts, removeAlert } = require("../watchlist");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const ids = req.query.ids ? req.query.ids.split(",") : loadWatchlist();
    if (!ids.length) return res.json({ success: true, data: [], message: "Watchlist is empty" });
    const data = await getPrices(ids);
    res.json({ success: true, data });
  } catch (err) {
    res.status(502).json({ success: false, error: err.message });
  }
});

router.get("/search", async (req, res) => {
  try {
    if (!req.query.q) return res.status(400).json({ success: false, error: "Missing ?q= param" });
    const data = await searchCoins(req.query.q);
    res.json({ success: true, data });
  } catch (err) {
    res.status(502).json({ success: false, error: err.message });
  }
});

router.get("/watchlist", (req, res) => {
  res.json({ success: true, data: loadWatchlist() });
});

router.post("/watchlist/:id", (req, res) => {
  const added = addToWatchlist(req.params.id);
  res.json({ success: true, added, message: added ? `Added ${req.params.id}` : "Already in watchlist" });
});

router.delete("/watchlist/:id", (req, res) => {
  const removed = removeFromWatchlist(req.params.id);
  res.json({ success: true, removed });
});

router.get("/alerts", (req, res) => {
  res.json({ success: true, data: loadAlerts() });
});

router.post("/alerts", (req, res) => {
  const { coinId, condition, threshold } = req.body;
  if (!coinId || !condition || threshold === undefined)
    return res.status(400).json({ success: false, error: "coinId, condition, threshold required" });
  const alert = addAlert(coinId, condition, parseFloat(threshold));
  res.json({ success: true, data: alert });
});

router.delete("/alerts/:id", (req, res) => {
  const removed = removeAlert(parseInt(req.params.id, 10));
  res.json({ success: true, removed });
});

module.exports = router;
