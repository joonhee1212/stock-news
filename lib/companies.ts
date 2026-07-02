export interface Company {
  name: string;
  ticker: string | null;
  isPrivate?: true;
  // For private companies with no ticker: the name string to search for
  // in a general news feed instead of the company-news endpoint.
  searchName?: string;
}

export const WATCHLIST: Company[] = [
  { ticker: "TSLA",  name: "Tesla" },
  { ticker: "NVDA",  name: "NVIDIA" },
  { ticker: "AAPL",  name: "Apple" },
  { ticker: "AMD",   name: "AMD" },
  { ticker: "VRT",   name: "Vertiv" },
  { ticker: "RKLB",  name: "Rocket Lab" },
  { ticker: "IREN",  name: "IREN" },
  { ticker: "MU",    name: "Micron" },
  { ticker: null,    name: "SpaceX", isPrivate: true, searchName: "SpaceX" },
  { ticker: "GOOGL", name: "Google / Alphabet" },
  { ticker: "TSM",   name: "TSMC" },
  { ticker: "PLTR",  name: "Palantir" },
  { ticker: "JPM",   name: "JPMorgan" },
  { ticker: "PANW",  name: "Palo Alto Networks" },
  { ticker: "CRWD",  name: "CrowdStrike" },
  { ticker: "MSFT",  name: "Microsoft" },
  { ticker: "AMZN",  name: "Amazon" },
  { ticker: "META",  name: "Meta" },
];
