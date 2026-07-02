/**
 * Fetches recent news for every company in WATCHLIST and upserts into SQLite.
 *
 * Ticker-based companies  → Finnhub /company-news (date-ranged)
 * Private companies       → source-specific fetch (SpaceX → NewsAPI /everything)
 *
 * Run manually:  npm run refresh
 * Later: wire to a cron job for hourly background updates.
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local before anything that reads process.env
function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), ".env.local"), "utf-8");
    for (const line of raw.split("\n")) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const eq = trimmed.indexOf("=");
      if (eq === -1) continue;
      const key = trimmed.slice(0, eq).trim();
      const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
      process.env[key] ??= val;
    }
  } catch {
    console.error("Could not read .env.local");
    process.exit(1);
  }
}

loadEnvLocal();

import db from "../lib/db";
import { fetchCompanyNews, isoDate } from "../lib/finnhub";
import type { FinnhubArticle } from "../lib/finnhub";
import { fetchSpaceXNews } from "../lib/newsapi";
import type { StorableArticle } from "../lib/newsapi";
import { WATCHLIST } from "../lib/companies";

// Normalize a Finnhub article to the common StorableArticle shape
function fromFinnhub(a: FinnhubArticle): StorableArticle {
  return {
    finnhub_id: a.id,
    headline: a.headline,
    summary: a.summary ?? null,
    url: a.url ?? null,
    image: a.image ?? null,
    source: a.source ?? null,
    published_at: a.datetime,
  };
}

const upsert = db.prepare(`
  INSERT INTO articles (ticker, finnhub_id, headline, summary, url, image, source, published_at, fetched_at)
  VALUES (@ticker, @finnhub_id, @headline, @summary, @url, @image, @source, @published_at, @fetched_at)
  ON CONFLICT(ticker, finnhub_id) DO NOTHING
`);

const logFetch = db.prepare(`
  INSERT INTO fetch_log (ticker, fetched_at, article_count) VALUES (?, ?, ?)
`);

function insertArticles(dbTicker: string, articles: StorableArticle[]) {
  const now = Math.floor(Date.now() / 1000);
  db.transaction(() => {
    for (const a of articles) {
      upsert.run({ ticker: dbTicker, fetched_at: now, ...a });
    }
    logFetch.run(dbTicker, now, articles.length);
  })();
}

const to = new Date();
const from = new Date(to);
from.setDate(from.getDate() - 7);

async function refresh() {
  const tickerBased = WATCHLIST.filter((c) => c.ticker && !c.isPrivate);
  const privateCos  = WATCHLIST.filter((c) => c.isPrivate);

  console.log(
    `Refreshing ${tickerBased.length} ticker(s) + ${privateCos.length} name-based:`,
    [...tickerBased.map((c) => c.ticker!), ...privateCos.map((c) => c.name)].join(", ")
  );

  // --- Ticker-based (Finnhub) ---
  for (const company of tickerBased) {
    const ticker = company.ticker!;
    try {
      const raw = await fetchCompanyNews(ticker, isoDate(from), isoDate(to));
      insertArticles(ticker, raw.map(fromFinnhub));
      console.log(`  ${ticker}: ${raw.length} articles`);
    } catch (err) {
      console.error(`  ${ticker}: FAILED —`, (err as Error).message);
    }
  }

  // --- Private companies ---
  for (const company of privateCos) {
    const dbTicker = company.name.toUpperCase().replace(/\s+/g, "_");
    try {
      let articles: StorableArticle[];

      if (company.name === "SpaceX") {
        articles = await fetchSpaceXNews(isoDate(from), isoDate(to));
      } else {
        // Future private companies: add their fetch path here
        console.warn(`  ${company.name}: no fetch strategy defined, skipping`);
        continue;
      }

      insertArticles(dbTicker, articles);
      console.log(`  ${company.name} (${dbTicker}): ${articles.length} articles`);
    } catch (err) {
      console.error(`  ${company.name}: FAILED —`, (err as Error).message);
    }
  }

  console.log("Done.");
}

refresh();
