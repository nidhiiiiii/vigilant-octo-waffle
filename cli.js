#!/usr/bin/env node
const { program } = require("commander");
const chalk = require("chalk");
const ora = require("ora");
const Table = require("cli-table3");
const { getTopProtocols, getProtocolTVLHistory, getGlobalTVL } = require("./services/defillama");
const { getPrices, searchCoins } = require("./services/coingecko");
const { addToWatchlist, removeFromWatchlist, loadWatchlist, addAlert, loadAlerts } = require("./watchlist");

const fmt = (n) => (n == null ? "N/A" : `$${Number(n).toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
const pct = (n) => {
  if (n == null) return chalk.gray("N/A");
  const s = `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
  return n >= 0 ? chalk.green(s) : chalk.red(s);
};

program.name("defi-pulse").description("Track DeFi TVL and token prices from your terminal").version("1.0.0");

program
  .command("top [limit]")
  .description("Show top DeFi protocols by TVL")
  .option("-c, --category <cat>", "Filter by category (e.g. Lending, DEX)")
  .action(async (limit = 20, opts) => {
    const spinner = ora("Fetching protocols...").start();
    try {
      let data = await getTopProtocols(parseInt(limit, 10));
      if (opts.category) data = data.filter((p) => p.category?.toLowerCase() === opts.category.toLowerCase());
      spinner.stop();

      const table = new Table({
        head: [chalk.cyan("Protocol"), chalk.cyan("TVL"), chalk.cyan("Chain"), chalk.cyan("Category"), chalk.cyan("24h"), chalk.cyan("7d")],
        style: { head: [], border: [] },
      });
      data.forEach(({ name, tvl, chain, category, change_1d, change_7d }) => {
        table.push([name, fmt(tvl), chain || "Multi", category || "-", pct(change_1d), pct(change_7d)]);
      });
      console.log(table.toString());
    } catch (err) {
      spinner.fail(chalk.red(err.message));
    }
  });

program
  .command("protocol <slug>")
  .description("Show TVL history for a protocol (e.g. aave, uniswap)")
  .action(async (slug) => {
    const spinner = ora(`Fetching ${slug}...`).start();
    try {
      const { name, current_tvl, history } = await getProtocolTVLHistory(slug);
      spinner.stop();
      console.log(chalk.bold(`
${name}`) + `  Current TVL: ${chalk.green(fmt(current_tvl))}
`);

      const table = new Table({ head: [chalk.cyan("Date"), chalk.cyan("TVL")] });
      history.forEach(({ date, tvl }) => table.push([date, fmt(tvl)]));
      console.log(table.toString());
    } catch (err) {
      spinner.fail(chalk.red(err.message));
    }
  });

program
  .command("global")
  .description("Show total DeFi TVL across all chains")
  .action(async () => {
    const spinner = ora("Fetching global TVL...").start();
    try {
      const { date, tvl } = await getGlobalTVL();
      spinner.stop();
      console.log(chalk.bold(`
Total DeFi TVL`) + ` (as of ${date}): ${chalk.green(fmt(tvl))}`);
    } catch (err) {
      spinner.fail(chalk.red(err.message));
    }
  });

program
  .command("price <ids...>")
  .description("Get current price for coins (e.g. ethereum bitcoin aave)")
  .action(async (ids) => {
    const spinner = ora("Fetching prices...").start();
    try {
      const data = await getPrices(ids);
      spinner.stop();
      const table = new Table({
        head: [chalk.cyan("Coin"), chalk.cyan("Price"), chalk.cyan("24h Change"), chalk.cyan("Market Cap")],
      });
      data.forEach(({ id, price_usd, change_24h, market_cap }) => {
        table.push([id, fmt(price_usd), pct(change_24h), fmt(market_cap)]);
      });
      console.log(table.toString());
    } catch (err) {
      spinner.fail(chalk.red(err.message));
    }
  });

program
  .command("search <query>")
  .description("Search for a coin by name or ticker")
  .action(async (query) => {
    const spinner = ora(`Searching "${query}"...`).start();
    try {
      const results = await searchCoins(query);
      spinner.stop();
      const table = new Table({ head: [chalk.cyan("ID"), chalk.cyan("Name"), chalk.cyan("Symbol"), chalk.cyan("Rank")] });
      results.forEach(({ id, name, symbol, market_cap_rank }) => table.push([id, name, symbol.toUpperCase(), market_cap_rank || "-"]));
      console.log(table.toString());
    } catch (err) {
      spinner.fail(chalk.red(err.message));
    }
  });

program
  .command("watch <id>")
  .description("Add a coin to your watchlist")
  .action((id) => {
    const added = addToWatchlist(id);
    console.log(added ? chalk.green(`✓ Added ${id} to watchlist`) : chalk.yellow(`${id} is already in your watchlist`));
  });

program
  .command("unwatch <id>")
  .description("Remove a coin from your watchlist")
  .action((id) => {
    const removed = removeFromWatchlist(id);
    console.log(removed ? chalk.green(`✓ Removed ${id}`) : chalk.red(`${id} not found in watchlist`));
  });

program
  .command("watchlist")
  .description("Show and fetch prices for your watchlist")
  .action(async () => {
    const list = loadWatchlist();
    if (!list.length) return console.log(chalk.yellow("Your watchlist is empty. Use: defi-pulse watch <coin-id>"));
    const spinner = ora("Fetching watchlist prices...").start();
    try {
      const data = await getPrices(list);
      spinner.stop();
      const table = new Table({
        head: [chalk.cyan("Coin"), chalk.cyan("Price"), chalk.cyan("24h Change"), chalk.cyan("Market Cap")],
      });
      data.forEach(({ id, price_usd, change_24h, market_cap }) => {
        table.push([id, fmt(price_usd), pct(change_24h), fmt(market_cap)]);
      });
      console.log(table.toString());
    } catch (err) {
      spinner.fail(chalk.red(err.message));
    }
  });

program
  .command("alert <coinId> <above|below> <threshold>")
  .description("Set a price alert (e.g. defi-pulse alert ethereum above 4000)")
  .action((coinId, condition, threshold) => {
    if (!["above", "below"].includes(condition))
      return console.log(chalk.red("Condition must be 'above' or 'below'"));
    const alert = addAlert(coinId, condition, parseFloat(threshold));
    console.log(chalk.green(`✓ Alert set [ID: ${alert.id}] — notify when ${coinId} is ${condition} $${threshold}`));
  });

program
  .command("alerts")
  .description("List all active price alerts")
  .action(() => {
    const alerts = loadAlerts().filter((a) => !a.triggered);
    if (!alerts.length) return console.log(chalk.yellow("No active alerts."));
    const table = new Table({ head: [chalk.cyan("ID"), chalk.cyan("Coin"), chalk.cyan("Condition"), chalk.cyan("Threshold")] });
    alerts.forEach(({ id, coinId, condition, threshold }) => table.push([id, coinId, condition, fmt(threshold)]));
    console.log(table.toString());
  });

program.parse(process.argv);
