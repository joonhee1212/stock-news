import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import pool from "@/lib/db";
import { WATCHLIST } from "@/lib/companies";
import { timeAgo } from "@/lib/utils";

interface Article {
  id: number;
  ticker: string;
  headline: string;
  summary: string | null;
  url: string | null;
  image: string | null;
  source: string | null;
  published_at: number;
}

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

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ ticker: string; id: string }>;
}) {
  const { ticker, id } = await params;
  const upperTicker = ticker.toUpperCase();

  const { rows } = await pool.query<Article>(
    `SELECT id, ticker, headline, summary, url, image, source, published_at
     FROM articles WHERE id = $1 AND ticker = $2`,
    [Number(id), upperTicker]
  );
  const article = rows[0] as Article | undefined;

  if (!article) notFound();

  const company = WATCHLIST.find(
    (c) =>
      c.ticker === upperTicker ||
      (c.isPrivate &&
        c.name.toUpperCase().replace(/\s+/g, "_") === upperTicker)
  );
  const companyName = company?.name ?? upperTicker;
  const imageSrc = COMPANY_IMAGES[upperTicker];

  return (
    <div className="min-h-screen" style={{ background: "#f4f5f9" }}>
      {/* Breadcrumb */}
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
        <Link href="/" className="transition-colors hover:text-indigo-500" style={{ color: "#94a3b8" }}>
          STOCK NEWS
        </Link>
        <span style={{ color: "rgba(0,0,0,0.15)" }}>/</span>
        <Link href={`/${upperTicker}`} className="transition-colors hover:text-indigo-500" style={{ color: "#94a3b8" }}>
          {upperTicker}
        </Link>
        <span style={{ color: "rgba(0,0,0,0.15)" }}>/</span>
        <span style={{ color: "#1a1f2e" }} className="font-semibold">ARTICLE</span>
      </header>

      <main className="max-w-2xl mx-auto px-6 py-12">
        {/* Company avatar + source/timestamp */}
        <div className="flex items-center gap-3 mb-5">
          {imageSrc && (
            <div
              className="w-8 h-8 rounded-lg overflow-hidden shrink-0 flex items-center justify-center"
              style={{
                background: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(0,0,0,0.06)",
              }}
            >
              <Image src={imageSrc} alt={companyName} width={28} height={28} className="object-contain" />
            </div>
          )}
          <span
            className="font-mono text-[10px] uppercase tracking-widest px-2 py-1 rounded"
            style={{
              background: "rgba(99,102,241,0.06)",
              color: "#6366f1",
              border: "1px solid rgba(99,102,241,0.12)",
            }}
          >
            {article.source ?? "Unknown"}
          </span>
          <span className="font-mono text-[10px]" style={{ color: "#6b7280" }}>
            {timeAgo(article.published_at)}
          </span>
        </div>

        {/* Headline */}
        <h1
          className="text-2xl font-semibold leading-snug mb-6"
          style={{ color: "#1a1f2e" }}
        >
          {article.headline}
        </h1>

        {/* Divider */}
        <div className="mb-6" style={{ height: "1px", background: "rgba(0,0,0,0.06)" }} />

        {/* Summary */}
        {article.summary ? (
          <p className="text-base leading-relaxed mb-8" style={{ color: "#374151" }}>
            {article.summary}
          </p>
        ) : (
          <p className="text-sm mb-8" style={{ color: "#6b7280" }}>
            No excerpt available.
          </p>
        )}

        {/* Read original CTA */}
        {article.url && (
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150"
            style={{
              color: "#6366f1",
              background: "rgba(99,102,241,0.06)",
              border: "1px solid rgba(99,102,241,0.18)",
            }}
          >
            Read original article
            <span className="text-base leading-none">↗</span>
          </a>
        )}

        {/* Back */}
        <div
          className="mt-14 pt-8"
          style={{ borderTop: "1px solid rgba(0,0,0,0.06)" }}
        >
          <Link
            href={`/${upperTicker}`}
            className="font-mono text-[11px] uppercase tracking-widest transition-colors hover:text-indigo-500"
            style={{ color: "#6b7280" }}
          >
            ← Back to {companyName}
          </Link>
        </div>
      </main>
    </div>
  );
}
