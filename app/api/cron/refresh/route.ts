import { NextRequest, NextResponse } from "next/server";
import pool, { ensureSchema } from "@/lib/db";
import { fetchCompanyNews, isoDate } from "@/lib/finnhub";
import type { FinnhubArticle } from "@/lib/finnhub";
import { fetchSpaceXNews } from "@/lib/newsapi";
import type { StorableArticle } from "@/lib/newsapi";
import { WATCHLIST } from "@/lib/companies";

export const maxDuration = 60; // seconds — Vercel function timeout

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

export async function GET(req: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureSchema();

  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 7);

  const results: Record<string, number | string> = {};

  const tickerBased = WATCHLIST.filter((c) => c.ticker && !c.isPrivate);
  const privateCos = WATCHLIST.filter((c) => c.isPrivate);

  // --- Ticker-based (Finnhub) ---
  for (const company of tickerBased) {
    const ticker = company.ticker!;
    try {
      const raw = await fetchCompanyNews(ticker, isoDate(from), isoDate(to));
      await insertArticles(ticker, raw.map(fromFinnhub));
      results[ticker] = raw.length;
    } catch (err) {
      results[ticker] = `FAILED: ${(err as Error).message}`;
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
        results[dbTicker] = "no fetch strategy";
        continue;
      }

      await insertArticles(dbTicker, articles);
      results[dbTicker] = articles.length;
    } catch (err) {
      results[dbTicker] = `FAILED: ${(err as Error).message}`;
    }
  }

  return NextResponse.json({
    ok: true,
    refreshed: Object.keys(results).length,
    results,
  });
}
