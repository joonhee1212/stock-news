import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import db from "@/lib/db";
import { WATCHLIST } from "@/lib/companies";
import { rankArticles } from "@/lib/ranking";
import { timeAgo } from "@/lib/utils";

interface Article {
  id: number;
  ticker: string;
  headline: string;
  summary: string | null;
  url: string | null;
  source: string | null;
  published_at: number;
}

function resolveCompany(upperTicker: string) {
  return WATCHLIST.find(
    (c) =>
      c.ticker === upperTicker ||
      (c.isPrivate &&
        c.name.toUpperCase().replace(/\s+/g, "_") === upperTicker)
  );
}

// Map tickers to their generated image paths
const COMPANY_IMAGES: Record<string, string> = {
  TSLA: "/images/companies/tsla.png",
  SPACEX: "/images/companies/spacex.png",
  GOOGL: "/images/companies/googl.png",
  AMZN: "/images/companies/amzn.png",
  AAPL: "/images/companies/aapl.png",
  MSFT: "/images/companies/msft.png",
  META: "/images/companies/meta.png",
  NVDA: "/images/companies/nvda.png",
  AMD: "/images/companies/amd.png",
  MU: "/images/companies/mu.png",
  TSM: "/images/companies/tsm.png",
  PLTR: "/images/companies/pltr.png",
  PANW: "/images/companies/panw.png",
  CRWD: "/images/companies/crwd.png",
  RKLB: "/images/companies/rklb.png",
  VRT: "/images/companies/vrt.png",
  IREN: "/images/companies/iren.png",
  JPM: "/images/companies/jpm.png",
};

export default async function CompanyPage({
  params,
}: {
  params: Promise<{ ticker: string }>;
}) {
  const { ticker } = await params;
  const upperTicker = ticker.toUpperCase();

  const company = resolveCompany(upperTicker);
  if (!company) notFound();

  const candidates = db
    .prepare(
      `SELECT id, ticker, headline, summary, url, source, published_at
       FROM articles
       WHERE ticker = ?
       ORDER BY published_at DESC
       LIMIT 100`
    )
    .all(upperTicker) as Article[];

  const articles = rankArticles(candidates, 50);
  const imageSrc = COMPANY_IMAGES[upperTicker];

  return (
    <div className="min-h-screen" style={{ background: "#f4f5f9" }}>
      {/* Nav */}
      <header
        className="sticky top-0 z-10 px-6 py-3 flex items-center gap-2 font-mono text-[11px]"
        style={{
          background: "rgba(244,245,249,0.82)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <Link
          href="/"
          className="transition-colors hover:text-indigo-500"
          style={{ color: "#94a3b8" }}
        >
          STOCK NEWS
        </Link>
        <span style={{ color: "rgba(0,0,0,0.15)" }}>/</span>
        <span style={{ color: "#1a1f2e" }} className="font-semibold">{upperTicker}</span>
      </header>

      {/* Company header */}
      <div
        className="px-6 py-8"
        style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}
      >
        <div className="max-w-3xl mx-auto flex items-center gap-5">
          {/* Company image avatar */}
          {imageSrc ? (
            <div
              className="w-14 h-14 rounded-xl overflow-hidden shrink-0 flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(0,0,0,0.06)",
                boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
              }}
            >
              <Image
                src={imageSrc}
                alt={company.name}
                width={48}
                height={48}
                className="object-contain"
              />
            </div>
          ) : (
            <div
              className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0"
              style={{
                background: "rgba(99,102,241,0.06)",
                border: "1px solid rgba(99,102,241,0.12)",
              }}
            >
              <span
                className={`font-mono font-bold text-indigo-500 ${
                  upperTicker.length <= 3 ? "text-base" : "text-[11px]"
                }`}
              >
                {upperTicker}
              </span>
            </div>
          )}

          <div>
            <h1 className="text-xl font-semibold" style={{ color: "#1a1f2e" }}>
              {company.name}
            </h1>
            <p className="font-mono text-[11px] mt-0.5" style={{ color: "#6b7280" }}>
              {company.ticker ?? "PRIVATE COMPANY"} &nbsp;&middot;&nbsp;{" "}
              {articles.length} articles
            </p>
          </div>
        </div>
      </div>

      {/* Article list */}
      <main className="max-w-3xl mx-auto px-6 py-4">
        {articles.length === 0 ? (
          <p
            className="font-mono text-xs tracking-widest mt-8"
            style={{ color: "#94a3b8" }}
          >
            NO RECENT NEWS
          </p>
        ) : (
          <ul>
            {articles.map((article, i) => (
              <li
                key={article.id}
                style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
              >
                <Link
                  href={`/${upperTicker}/${article.id}`}
                  className="group flex items-start gap-4 py-4 transition-all duration-100"
                >
                  {/* Rank */}
                  <span
                    className="font-mono text-[11px] w-5 pt-px text-right shrink-0 tabular-nums"
                    style={{ color: "#6b7280" }}
                  >
                    {i + 1}
                  </span>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-medium leading-snug transition-colors group-hover:text-indigo-600"
                      style={{ color: "#334155" }}
                    >
                      {article.headline}
                    </p>
                    {article.summary && (
                      <p
                        className="text-xs mt-1 line-clamp-1 leading-relaxed"
                        style={{ color: "#64748b" }}
                      >
                        {article.summary}
                      </p>
                    )}
                    <p
                      className="font-mono text-[10px] mt-1.5 uppercase tracking-wide"
                      style={{ color: "#6b7280" }}
                    >
                      {article.source} &nbsp;&middot;&nbsp;{" "}
                      {timeAgo(article.published_at)}
                    </p>
                  </div>

                  {/* Arrow */}
                  <span
                    className="text-sm shrink-0 pt-0.5 transition-colors group-hover:text-indigo-500"
                    style={{ color: "#94a3b8" }}
                  >
                    →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
