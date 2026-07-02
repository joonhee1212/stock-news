/**
 * Quick smoke-test: fetches the last 7 days of Finnhub company news for AAPL.
 * Run with: node test-finnhub.mjs
 * Requires .env.local to contain FINNHUB_API_KEY=<your key>
 */

import { readFileSync } from "fs";
import { resolve } from "path";

// Minimal .env.local parser — no external deps needed
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
    console.error("Could not read .env.local — make sure it exists.");
    process.exit(1);
  }
}

loadEnvLocal();

const API_KEY = process.env.FINNHUB_API_KEY;
if (!API_KEY) {
  console.error("FINNHUB_API_KEY is not set in .env.local");
  process.exit(1);
}

const ticker = "AAPL";
const toDate = new Date();
const fromDate = new Date(toDate);
fromDate.setDate(fromDate.getDate() - 7);

const fmt = (d) => d.toISOString().slice(0, 10); // YYYY-MM-DD
const url =
  `https://finnhub.io/api/v1/company-news` +
  `?symbol=${ticker}&from=${fmt(fromDate)}&to=${fmt(toDate)}&token=${API_KEY}`;

console.log(`Fetching news for ${ticker} from ${fmt(fromDate)} to ${fmt(toDate)}…`);

const res = await fetch(url);
if (!res.ok) {
  console.error(`HTTP ${res.status}: ${res.statusText}`);
  const body = await res.text();
  console.error(body);
  process.exit(1);
}

const articles = await res.json();
if (!Array.isArray(articles)) {
  console.error("Unexpected response shape:", articles);
  process.exit(1);
}

console.log(`\nSuccess! Got ${articles.length} article(s).\n`);

// Print first 3 as a sanity-check
articles.slice(0, 3).forEach((a, i) => {
  console.log(`[${i + 1}] ${a.headline}`);
  console.log(`    Source: ${a.source}  |  ${new Date(a.datetime * 1000).toLocaleString()}`);
  console.log(`    ${a.url}\n`);
});
