# Personal Stock News Dashboard — Project Brief

## What this is
A personal, single-user website that tracks a fixed watchlist of companies and shows
recent news for each — instead of manually searching each company individually. Visually
similar in spirit to Yahoo Finance, but news-first rather than chart-first: click a
company logo, see its recent news, click a story to focus on it.

No login, no multi-user support, no category/keyword search — this is a personal
dashboard for one fixed list of companies, not a public product.

## Watchlist (v1, fixed list — not user-editable through the UI)
| Ticker | Company | Notes |
|---|---|---|
| TSLA | Tesla | |
| NVDA | NVIDIA | |
| AAPL | Apple | |
| AMD | AMD | |
| VRT | Vertiv | |
| RKLB | Rocket Lab | |
| IREN | IREN | |
| MU | Micron | |
| — | SpaceX | **Not publicly traded — no ticker.** Needs general news search by
company name instead of a ticker-based finance API call. Flag this company
differently in the data layer (e.g. `is_private: true`), since it can't use
the same Finnhub company-news endpoint as the others. |
| GOOGL | Google / Alphabet | |
| TSM | TSMC | Trades as a US ADR under TSM, not a Taiwan-listed symbol — use TSM. |
| PLTR | Palantir | |
| JPM | JPMorgan | |
| PANW | Palo Alto Networks | |
| CRWD | CrowdStrike | |
| MSFT | Microsoft | |
| AMZN | Amazon | |
| META | Meta | |

17 tradeable tickers + 1 special-case (SpaceX, name-based search, no ticker).

## Data sources
**Primary: Finnhub** (finnhub.io)
- Free tier: 60 calls/minute, but real-world testing shows an effective ~300 calls/day
  soft cap beneath that per-minute limit — the per-minute number alone is misleading,
  plan around the daily figure.
- Endpoints needed: `company-news` (per ticker), company profile (for logo + basic info)
- API key required — get one free at finnhub.io before starting development

**SpaceX (special case)**: no financial API will have this (private company). Use a
general news search (e.g. NewsAPI.org or Finnhub's general `/news` endpoint filtered
by company name) instead of the ticker-based company-news endpoint.

**Not using for v1**: a second corroboration source (e.g. NewsAPI/Marketaux) — planned
as a v2 feature once single-source pipeline works end to end. Do not build multi-source
dedup/corroboration logic before v1 is working.

**Logos**: pull from Finnhub's company profile endpoint first (already being called for
news context). Fall back to Clearbit Logo API (`logo.clearbit.com/{domain}`, no key
needed) if Finnhub doesn't have one. Fall back further to a styled ticker-symbol badge
if both fail. Three-tier fallback, not a single point of failure.

## Refresh / caching strategy (important — do not skip this)
Given the ~300 calls/day soft limit and 18 companies (17 tickers + SpaceX):
- 18 companies x 1 news call each = 18 calls per refresh cycle
- Refresh every 60-90 minutes (NOT more frequently) keeps daily usage around 270-430
  calls, safely within the observed limit
- The frontend must NEVER call Finnhub directly on page load/refresh. Architecture:
  ```
  Browser refresh -> your own backend/DB (instant, free, no rate limit risk)
                            ^
  Scheduled job (hourly) -> Finnhub -> saved to local database
  ```
- Use a simple scheduled job (cron, or a scheduler within the Next.js backend) that
  runs hourly, fetches news for all 18 companies, and writes to a local database
  (SQLite is enough for personal use — no need for a hosted DB for v1)
- The frontend/API routes only ever read from that local database

## Tech stack
- **Next.js** (React) for frontend + API routes — chosen for visual polish potential
  (person has UI/UX skills + 21st.dev MCP connected to Claude Code for component design)
- **SQLite** for local caching of fetched news/logos (simple, no external DB service
  needed for personal use)
- Backend fetch/scheduling logic lives in Next.js API routes or a small standalone
  Node script run on a schedule

## v1 scope (resist scope creep — this is deliberately narrow)
- [ ] Hardcoded company list (table above) in a config file, not a database table
  the user edits through UI
- [ ] Scheduled hourly fetch from Finnhub -> SQLite cache
- [ ] Dashboard: grid of company logos/symbols
- [ ] Click a company -> see its recent news list
- [ ] Click a story -> focused reading view
- [ ] SpaceX handled via the name-based search fallback, same UI treatment as the rest

## Explicitly NOT in v1 (future ideas, don't build yet)
- Login / multi-user / user-editable watchlist
- Category or keyword search ("search 'cars' -> see car companies")
- Multi-source news corroboration / cross-source "trending" ranking
- Live/real-time updates (hourly cache is enough for personal use)
- Stock price charts (this is a news tool, not a market-data visualization tool —
  intentionally different from Yahoo Finance in that respect)

## Code style / Git workflow
(Same conventions as the gpu-log-analyzer project — keep comments minimal and
focused on *why*, short plain commit messages, commit after each meaningful
milestone, .gitignore for node_modules/.env/.next/etc. Do not commit the Finnhub
API key — use a .env file and .gitignore it.)

## Open questions / decide during build
- Exact fuzzy-story-matching approach, if/when multi-source corroboration is added later
- Whether "focused story view" opens the original article in a new tab, or shows a
  summary in-app (careful with copyright/reproduction if summarizing — short excerpts
  only, always link to original source)
