import pool from "./db";
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

export async function getDashboardStats(): Promise<CompanyStats[]> {
  const cutoff = Math.floor(Date.now() / 1000) - FRESH_SECONDS;

  const { rows } = await pool.query<{
    ticker: string;
    total: string;
    fresh: string;
  }>(
    `SELECT
       ticker,
       COUNT(*) as total,
       COUNT(CASE WHEN published_at >= $1 THEN 1 END) as fresh
     FROM articles
     GROUP BY ticker`,
    [cutoff]
  );

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
      articleCount: stats ? Number(stats.total) : 0,
      freshCount: stats ? Number(stats.fresh) : 0,
    };
  });
}
