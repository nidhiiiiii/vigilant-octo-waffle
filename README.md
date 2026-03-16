# DeFi Pulse

A real-time DeFi analytics tool with a **CLI** and **REST API** that lets you track protocol TVL, token prices, manage a watchlist, and set price alerts — all from your terminal or via HTTP.

Data is sourced from [DeFiLlama](https://defillama.com/) and [CoinGecko](https://www.coingecko.com/).

## Features

- Top DeFi protocols ranked by TVL with 1d/7d change
- Per-protocol 30-day TVL history
- Real-time token prices with 24h change and market cap
- Personal watchlist (persisted locally)
-  Price alerts with background cron scheduler
- Express REST API exposing all features over HTTP

## Quick Start

```bash
npm install

# CLI
node src/cli.js top 10
node src/cli.js price ethereum bitcoin aave
node src/cli.js watch ethereum
node src/cli.js watchlist
node src/cli.js protocol aave
node src/cli.js alert ethereum above 4000
node src/cli.js alerts
node src/cli.js global

# API server
npm start
# → http://localhost:3000
```

## CLI Commands

| Command | Description |
|---|---|
| `top [limit]` | Top protocols by TVL |
| `top --category Lending` | Filter by category |
| `protocol <slug>` | TVL history for a protocol |
| `global` | Total DeFi TVL |
| `price <ids...>` | Token prices |
| `search <query>` | Find a coin by name/ticker |
| `watch <id>` | Add coin to watchlist |
| `unwatch <id>` | Remove from watchlist |
| `watchlist` | View watchlist with live prices |
| `alert <id> above\|below <price>` | Set price alert |
| `alerts` | List active alerts |

## API Endpoints

```
GET  /api/protocols                    Top protocols by TVL
GET  /api/protocols/global-tvl         Total TVL
GET  /api/protocols/:slug              Protocol TVL history
GET  /api/prices?ids=ethereum,aave     Token prices
GET  /api/prices/search?q=uni          Search coins
GET  /api/prices/watchlist             View watchlist
POST /api/prices/watchlist/:id         Add to watchlist
DELETE /api/prices/watchlist/:id       Remove from watchlist
GET  /api/prices/alerts                List alerts
POST /api/prices/alerts                Create alert { coinId, condition, threshold }
DELETE /api/prices/alerts/:id          Delete alert
```

## Project Structure

```
defi-pulse/
├── src/
│   ├── cli.js              # CLI entry point (Commander.js)
│   ├── server.js           # Express API server
│   ├── config.js           # Env config
│   ├── watchlist.js        # Watchlist + alerts persistence
│   ├── alerts.js           # Cron-based alert scheduler
│   ├── services/
│   │   ├── defillama.js    # DeFiLlama API client
│   │   └── coingecko.js    # CoinGecko API client
│   └── routes/
│       ├── protocols.js    # /api/protocols routes
│       └── prices.js       # /api/prices routes
├── data/                   # Auto-created, stores watchlist + alerts
├── .env.example
├── package.json
└── README.md
```

## Environment Variables

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | API server port |
| `COINGECKO_API_KEY` | _(empty)_ | Optional Pro API key |
| `ALERT_INTERVAL` | `5` | Alert check interval (minutes) |

## License

MIT
