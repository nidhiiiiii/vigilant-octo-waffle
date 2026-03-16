const { Router } = require("express");
const { getTopProtocols, getProtocolTVLHistory, getGlobalTVL } = require("../services/defillama");

const router = Router();

router.get("/", async (req, res) => {
  try {
    const limit = parseInt(req.query.limit || "20", 10);
    const data = await getTopProtocols(limit);
    res.json({ success: true, count: data.length, data });
  } catch (err) {
    res.status(502).json({ success: false, error: err.message });
  }
});

router.get("/global-tvl", async (req, res) => {
  try {
    const data = await getGlobalTVL();
    res.json({ success: true, data });
  } catch (err) {
    res.status(502).json({ success: false, error: err.message });
  }
});

router.get("/:slug", async (req, res) => {
  try {
    const data = await getProtocolTVLHistory(req.params.slug);
    res.json({ success: true, data });
  } catch (err) {
    res.status(404).json({ success: false, error: `Protocol not found: ${req.params.slug}` });
  }
});

module.exports = router;
