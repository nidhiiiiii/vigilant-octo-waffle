const fs = require("fs");
const path = require("path");

const WATCHLIST_PATH = path.join(__dirname, "../data/watchlist.json");
const ALERTS_PATH = path.join(__dirname, "../data/alerts.json");

function ensureDataDir() {
  const dir = path.dirname(WATCHLIST_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function loadWatchlist() {
  ensureDataDir();
  if (!fs.existsSync(WATCHLIST_PATH)) return [];
  return JSON.parse(fs.readFileSync(WATCHLIST_PATH, "utf8"));
}

function saveWatchlist(list) {
  ensureDataDir();
  fs.writeFileSync(WATCHLIST_PATH, JSON.stringify(list, null, 2));
}

function addToWatchlist(coinId) {
  const list = loadWatchlist();
  if (list.includes(coinId)) return false;
  list.push(coinId);
  saveWatchlist(list);
  return true;
}

function removeFromWatchlist(coinId) {
  const list = loadWatchlist();
  const updated = list.filter((id) => id !== coinId);
  if (updated.length === list.length) return false;
  saveWatchlist(updated);
  return true;
}

function loadAlerts() {
  ensureDataDir();
  if (!fs.existsSync(ALERTS_PATH)) return [];
  return JSON.parse(fs.readFileSync(ALERTS_PATH, "utf8"));
}

function saveAlerts(alerts) {
  ensureDataDir();
  fs.writeFileSync(ALERTS_PATH, JSON.stringify(alerts, null, 2));
}

/**
 * Add a price alert.
 * @param {string} coinId
 * @param {"above"|"below"} condition
 * @param {number} threshold - USD price
 */
function addAlert(coinId, condition, threshold) {
  const alerts = loadAlerts();
  const alert = { id: Date.now(), coinId, condition, threshold, triggered: false };
  alerts.push(alert);
  saveAlerts(alerts);
  return alert;
}

function removeAlert(alertId) {
  const alerts = loadAlerts();
  const updated = alerts.filter((a) => a.id !== alertId);
  saveAlerts(updated);
  return updated.length < alerts.length;
}

module.exports = {
  loadWatchlist, addToWatchlist, removeFromWatchlist,
  loadAlerts, saveAlerts, addAlert, removeAlert,
};
