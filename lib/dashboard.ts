import db from "./db";
import { WATCHLIST } from "./companies";

export interface CompanyStats {
  name: string;
  ticker: string | null;
  isPrivate?: true;
  dbTicker: string;
  articleCount: number;
  freshCount: number; // articles published in the last 4 hours
}

const FRESH_SECONDS = 4 * 60 * 60;

export function getDashboardStats(): CompanyStats[] {
  const cutoff = Math.floor(Date.now() / 1000) - FRESH_SECONDS;

  const rows = db
    .prepare(
      `SELECT
         ticker,
         COUNT(*) as total,
         COUNT(CASE WHEN published_at >= ? THEN 1 END) as fresh
       FROM articles
       GROUP BY ticker`
    )
    .all(cutoff) as { ticker: string; total: number; fresh: number }[];

  const map = new Map(rows.map((r) => [r.ticker, r]));

  return WATCHLIST.map((company) => {
    const dbTicker =
      company.ticker ?? company.name.toUpperCase().replace(/\s+/g, "_");
    const stats = map.get(dbTicker);
    return {
      name: company.name,
      ticker: company.ticker,
      isPrivate: company.isPrivate,
      dbTicker,
      articleCount: stats?.total ?? 0,
      freshCount: stats?.fresh ?? 0,
    };
  });
}
