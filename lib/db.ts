import { Pool } from "pg";

// Singleton pool — survives Next.js hot-reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var _pool: Pool | undefined;
}

if (!global._pool) {
  global._pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
  });
}

const pool = global._pool;

export default pool;

/**
 * One-time schema bootstrap. Called on first request (via middleware or
 * page render) and is idempotent.
 */
export async function ensureSchema() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS articles (
      id           SERIAL PRIMARY KEY,
      ticker       TEXT    NOT NULL,
      finnhub_id   BIGINT  NOT NULL,
      headline     TEXT    NOT NULL,
      summary      TEXT,
      url          TEXT,
      image        TEXT,
      source       TEXT,
      published_at BIGINT  NOT NULL,
      fetched_at   BIGINT  NOT NULL
    );

    CREATE UNIQUE INDEX IF NOT EXISTS uq_articles_ticker_finnhub
      ON articles(ticker, finnhub_id);

    CREATE INDEX IF NOT EXISTS idx_articles_ticker_published
      ON articles(ticker, published_at DESC);

    CREATE TABLE IF NOT EXISTS fetch_log (
      id            SERIAL PRIMARY KEY,
      ticker        TEXT    NOT NULL,
      fetched_at    BIGINT  NOT NULL,
      article_count INTEGER NOT NULL
    );
  `);
}
