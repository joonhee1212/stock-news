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
  if (articles.length === 0) return;
  const now = Math.floor(Date.now() / 1000);

  // Build a single bulk INSERT with unnest arrays
  const finnhubIds: number[] = [];
  const headlines: string[] = [];
  const summaries: (string | null)[] = [];
  const urls: (string | null)[] = [];
  const images: (string | null)[] = [];
  const sources: (string | null)[] = [];
  const publishedAts: number[] = [];

  for (const a of articles) {
    finnhubIds.push(a.finnhub_id);
    headlines.push(a.headline);
    summaries.push(a.summary);
    urls.push(a.url);
    images.push(a.image);
    sources.push(a.source);
    publishedAts.push(a.published_at);
  }

  await pool.query(
    `INSERT INTO articles (ticker, finnhub_id, headline, summary, url, image, source, published_at, fetched_at)
     SELECT $1, unnest($2::bigint[]), unnest($3::text[]), unnest($4::text[]),
            unnest($5::text[]), unnest($6::text[]), unnest($7::text[]),
            unnest($8::bigint[]), $9
     ON CONFLICT (ticker, finnhub_id) DO NOTHING`,
    [dbTicker, finnhubIds, headlines, summaries, urls, images, sources, publishedAts, now]
  );

  await pool.query(
    "INSERT INTO fetch_log (ticker, fetched_at, article_count) VALUES ($1, $2, $3)",
    [dbTicker, now, articles.length]
  );
}

export async function GET(req: NextRequest) {
  // Verify the request is from Vercel Cron
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    return NextResponse.json({ error: "CRON_SECRET not configured" }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await ensureSchema();

  const to = new Date();
  const from = new Date(to);
  from.setDate(from.getDate() - 2); // 2-day window keeps requests fast

  const results: Record<string, number | string> = {};

  const tickerBased = WATCHLIST.filter((c) => c.ticker && !c.isPrivate);
  const privateCos = WATCHLIST.filter((c) => c.isPrivate);

  // Phase 1: Fetch all API data in parallel (batches of 5 for Finnhub rate limit)
  const fetched: { dbTicker: string; articles: StorableArticle[] }[] = [];

  for (let i = 0; i < tickerBased.length; i += 5) {
    const batch = tickerBased.slice(i, i + 5);
    const batchResults = await Promise.allSettled(
      batch.map(async (company) => {
        const ticker = company.ticker!;
        const raw = await fetchCompanyNews(ticker, isoDate(from), isoDate(to));
        return { dbTicker: ticker, articles: raw.map(fromFinnhub) };
      })
    );
    for (let j = 0; j < batchResults.length; j++) {
      const r = batchResults[j];
      const ticker = batch[j].ticker!;
      if (r.status === "fulfilled") {
        fetched.push(r.value);
      } else {
        results[ticker] = `FAILED: ${r.reason?.message ?? "unknown"}`;
      }
    }
  }

  // Private companies (fetched in parallel too)
  const privateResults = await Promise.allSettled(
    privateCos.map(async (company) => {
      const dbTicker = company.name.toUpperCase().replace(/\s+/g, "_");
      if (company.name === "SpaceX") {
        const articles = await fetchSpaceXNews(isoDate(from), isoDate(to));
        return { dbTicker, articles };
      }
      results[dbTicker] = "no fetch strategy";
      return null;
    })
  );
  for (let i = 0; i < privateResults.length; i++) {
    const r = privateResults[i];
    const dbTicker = privateCos[i].name.toUpperCase().replace(/\s+/g, "_");
    if (r.status === "fulfilled" && r.value) {
      fetched.push(r.value);
    } else if (r.status === "rejected") {
      results[dbTicker] = `FAILED: ${r.reason?.message ?? "unknown"}`;
    }
  }

  // Phase 2: Write all fetched data to DB in parallel
  await Promise.all(
    fetched.map(async ({ dbTicker, articles }) => {
      try {
        await insertArticles(dbTicker, articles);
        results[dbTicker] = articles.length;
      } catch (err) {
        results[dbTicker] = `FAILED: ${(err as Error).message}`;
      }
    })
  );

  return NextResponse.json({
    ok: true,
    refreshed: Object.keys(results).length,
    results,
  });
}
