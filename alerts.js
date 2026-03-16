const cron = require("node-cron");
const chalk = require("chalk");
const { getPrices } = require("./services/coingecko");
const { loadWatchlist, loadAlerts, saveAlerts } = require("./watchlist");
const { ALERT_INTERVAL } = require("./config");

async function checkAlerts() {
  const watchlist = loadWatchlist();
  const alerts = loadAlerts();
  const pendingAlerts = alerts.filter((a) => !a.triggered);

  if (!watchlist.length && !pendingAlerts.length) return;

  const allCoins = [...new Set([...watchlist, ...pendingAlerts.map((a) => a.coinId)])];
  if (!allCoins.length) return;

  try {
    const prices = await getPrices(allCoins);
    const priceMap = Object.fromEntries(prices.map((p) => [p.id, p.price_usd]));
    let updated = false;

    for (const alert of alerts) {
      if (alert.triggered) continue;
      const price = priceMap[alert.coinId];
      if (price === undefined) continue;

      const hit =
        (alert.condition === "above" && price >= alert.threshold) ||
        (alert.condition === "below" && price <= alert.threshold);

      if (hit) {
        alert.triggered = true;
        updated = true;
        console.log(
          chalk.yellow(`
🔔 ALERT: ${alert.coinId} is ${alert.condition} $${alert.threshold} (current: $${price.toFixed(4)})`)
        );
      }
    }

    if (updated) saveAlerts(alerts);
  } catch (err) {
    console.error(chalk.red("Alert check failed:"), err.message);
  }
}

function startAlertScheduler() {
  const interval = Math.max(1, ALERT_INTERVAL);
  console.log(chalk.gray(`Alert scheduler running every ${interval} min`));
  cron.schedule(`*/${interval} * * * *`, checkAlerts);
}

module.exports = { startAlertScheduler, checkAlerts };