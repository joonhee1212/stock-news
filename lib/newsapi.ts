const BASE = "https://newsapi.org/v2";

// Common normalized shape used for DB insertion — both Finnhub and NewsAPI
// articles are mapped to this before being stored.
export interface StorableArticle {
  finnhub_id: number; // Finnhub's native ID, or a URL hash for NewsAPI articles
  headline: string;
  summary: string | null;
  url: string | null;
  image: string | null;
  source: string | null;
  published_at: number; // Unix timestamp
}

// Stable 32-bit integer from a URL string. Collision probability per article
// is ~1 in 4B; acceptable for a personal dashboard with O(100s) of articles.
// NewsAPI articles for a given ticker never mix with Finnhub IDs because of
// the (ticker, finnhub_id) unique constraint, so there's no cross-source risk.
function urlHash(url: string): number {
  let h = 0;
  for (let i = 0; i < url.length; i++) {
    h = (Math.imul(31, h) + url.charCodeAt(i)) | 0;
  }
  return h >>> 0; // unsigned, always positive
}

interface RawNewsApiArticle {
  source: { id: string | null; name: string };
  title: string;
  description: string | null;
  url: string;
  urlToImage: string | null;
  publishedAt: string; // ISO 8601
}

interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: RawNewsApiArticle[];
  code?: string;
  message?: string;
}

export async function fetchSpaceXNews(
  from: string, // YYYY-MM-DD
  to: string    // YYYY-MM-DD
): Promise<StorableArticle[]> {
  const token = process.env.NEWSAPI_KEY;
  if (!token) throw new Error("NEWSAPI_KEY is not set");

  const params = new URLSearchParams({
    q: "SpaceX",
    from,
    to,
    language: "en",
    sortBy: "publishedAt",
    pageSize: "100",
    apiKey: token,
  });

  const res = await fetch(`${BASE}/everything?${params}`);
  const data = (await res.json()) as NewsApiResponse;

  if (data.status !== "ok") {
    throw new Error(`NewsAPI error: ${data.code ?? res.status} — ${data.message ?? res.statusText}`);
  }

  return data.articles.map((a) => ({
    finnhub_id: urlHash(a.url),
    headline: a.title,
    summary: a.description,
    url: a.url,
    image: a.urlToImage,
    source: a.source.name,
    published_at: Math.floor(new Date(a.publishedAt).getTime() / 1000),
  }));
}
