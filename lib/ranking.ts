// Simple recency-first ranking with a mild source boost.
// Full cross-source corroboration is a v2 feature.

// Preferred outlets get a time bonus so they rank above same-age noise
// without burying genuinely fresh articles from other sources.
const PREFERRED_SOURCES = new Set([
  "CNBC",
  "Reuters",
  "Bloomberg",
  "WSJ",
  "The Wall Street Journal",
  "Financial Times",
]);

// How many seconds to add to preferred-source published_at for scoring.
// 2 hours: a preferred-source article only floats above non-preferred content
// that is more than 2h newer — so a 10-min-old breaking news article still
// beats a 2h+ old CNBC article. Keeps true breaking news surfacing.
const BOOST_SECONDS = 2 * 60 * 60;

export interface Rankable {
  source: string | null;
  published_at: number;
}

export function rankArticles<T extends Rankable>(articles: T[], limit: number): T[] {
  return articles
    .map((a) => ({
      article: a,
      score: a.published_at + (PREFERRED_SOURCES.has(a.source ?? "") ? BOOST_SECONDS : 0),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((x) => x.article);
}
