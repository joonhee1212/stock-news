import Database from "better-sqlite3";
import fs from "fs";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "news.db");
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

// Singleton — survives Next.js hot-reloads in dev
declare global {
  // eslint-disable-next-line no-var
  var _db: Database.Database | undefined;
}

if (!global._db) {
  global._db = new Database(DB_PATH);
  global._db.pragma("journal_mode = WAL");
  global._db.exec(`
    CREATE TABLE IF NOT EXISTS articles (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker      TEXT    NOT NULL,
      finnhub_id  INTEGER NOT NULL,
      headline    TEXT    NOT NULL,
      summary     TEXT,
      url         TEXT,
      image       TEXT,
      source      TEXT,
      published_at INTEGER NOT NULL,
      fetched_at   INTEGER NOT NULL
    );

    -- Same article can appear in multiple tickers' feeds (general tech headlines)
    CREATE UNIQUE INDEX IF NOT EXISTS uq_articles_ticker_finnhub
      ON articles(ticker, finnhub_id);

    CREATE INDEX IF NOT EXISTS idx_articles_ticker_published
      ON articles(ticker, published_at DESC);

    CREATE TABLE IF NOT EXISTS fetch_log (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      ticker        TEXT    NOT NULL,
      fetched_at    INTEGER NOT NULL,
      article_count INTEGER NOT NULL
    );
  `);
}

export default global._db;
