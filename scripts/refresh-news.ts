/**
 * Fetches recent news for every company in WATCHLIST and upserts into Postgres.
 *
 * Ticker-based companies  → Finnhub /company-news (date-ranged)
 * Private companies       → source-specific fetch (SpaceX → NewsAPI /everything)
 *
 * Run manually:  npm run refresh
 * Later: wire to a cron job for hourly background updates.
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Load .env.local BEFORE any module that reads process.env
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

// Dynamic imports so process.env.DATABASE_URL is set before pool creation
async function main() {
  const { default: pool, ensureSchema } = await import("../lib/db");
  const { fetchCompanyNews, isoDate } = await import("../lib/finnhub");
  const { fetchSpaceXNews } = await import("../lib/newsapi");
  const { WATCHLIST } = await import("../lib/companies");

  type FinnhubArticle = Awaited<ReturnType<typeof fetchCompanyNews>>[number];
  type StorableArticle = Awaited<ReturnType<typeof fetchSpaceXNews>>[number];

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

  async function insertArticles(dbTicker: string, articles: StorableArticle[]) {
    const now = Math.floor(Date.now() / 1000);
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      for (const a of articles) {
        await client.query(
          `INSERT INTO articles (ticker, finnhub_id, headline, summary, url, image, source, published_at, fetched_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
           ON CONFLICT (ticker, finnhub_id) DO NOTHING`,
          [dbTicker, a.finnhub_id, a.headline, a.summary, a.url, a.image, a.source, a.published_at, now]
        );
      }
      await client.query(
        "INSERT INTO fetch_log (ticker, fetched_at, article_count) VALUES ($1, $2, $3)",
        [dbTicker, now, articles.length]
      );
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  await ensureSchema();

  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 7);

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
      await insertArticles(ticker, raw.map(fromFinnhub));
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
        console.warn(`  ${company.name}: no fetch strategy defined, skipping`);
        continue;
      }

      await insertArticles(dbTicker, articles);
      console.log(`  ${company.name} (${dbTicker}): ${articles.length} articles`);
    } catch (err) {
      console.error(`  ${company.name}: FAILED —`, (err as Error).message);
    }
  }

  console.log("Done.");
  await pool.end();
}

main();
