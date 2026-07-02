const BASE = "https://finnhub.io/api/v1";

export interface FinnhubArticle {
  id: number;
  headline: string;
  summary: string;
  url: string;
  image: string;
  source: string;
  datetime: number; // Unix timestamp
  related: string;
  category: string;
}

// Standard path: company news by ticker with date range
export async function fetchCompanyNews(
  ticker: string,
  from: string, // YYYY-MM-DD
  to: string    // YYYY-MM-DD
): Promise<FinnhubArticle[]> {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) throw new Error("FINNHUB_API_KEY is not set");
  const url = `${BASE}/company-news?symbol=${ticker}&from=${from}&to=${to}&token=${token}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub ${res.status} ${res.statusText}`);
  return res.json() as Promise<FinnhubArticle[]>;
}

// SpaceX path: fetch general news feed and filter by name mention.
// Finnhub's /news endpoint has no company-name filter, so we pull the full
// general feed and search headline + summary ourselves.
export async function fetchGeneralNewsByName(
  searchName: string,
  fromTimestamp: number // Unix — only return articles newer than this
): Promise<FinnhubArticle[]> {
  const token = process.env.FINNHUB_API_KEY;
  if (!token) throw new Error("FINNHUB_API_KEY is not set");
  const url = `${BASE}/news?category=general&token=${token}`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Finnhub ${res.status} ${res.statusText}`);
  const all = (await res.json()) as FinnhubArticle[];
  const needle = searchName.toLowerCase();
  return all.filter(
    (a) =>
      a.datetime >= fromTimestamp &&
      (a.headline.toLowerCase().includes(needle) ||
        a.summary?.toLowerCase().includes(needle))
  );
}

export function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
