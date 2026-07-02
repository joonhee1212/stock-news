"use client";

import { motion, useInView, useAnimation } from "framer-motion";
import { useRef, useState } from "react";
import Link from "next/link";
import type { CompanyStats } from "@/lib/dashboard";

// ─── Sector groups ────────────────────────────────────────────────────────────

const GROUPS = [
  {
    label: "Big Tech",
    sectionId: "section-big-tech",
    dbTickers: ["AAPL", "GOOGL", "MSFT", "AMZN", "META"],
    accent: "#6366f1",
    rgb: "99,102,241",
    motif: "mesh" as const,
    icon: "network" as const,
  },
  {
    label: "Semiconductors",
    sectionId: "section-semiconductors",
    dbTickers: ["NVDA", "AMD", "MU", "TSM"],
    accent: "#0891b2",
    rgb: "8,145,178",
    motif: "circuit" as const,
    icon: "chip" as const,
  },
  {
    label: "AI & Cyber",
    sectionId: "section-ai-cyber",
    dbTickers: ["PLTR", "PANW", "CRWD"],
    accent: "#7c3aed",
    rgb: "124,58,237",
    motif: "mesh" as const,
    icon: "shield" as const,
  },
  {
    label: "Space & Deep Tech",
    sectionId: "section-space-deep-tech",
    dbTickers: ["TSLA", "RKLB", "SPACEX"],
    accent: "#ea580c",
    rgb: "234,88,12",
    motif: "starfield" as const,
    icon: "rocket" as const,
  },
  {
    label: "Infrastructure & Finance",
    sectionId: "section-infrastructure-finance",
    dbTickers: ["VRT", "IREN", "JPM"],
    accent: "#059669",
    rgb: "5,150,105",
    motif: "mesh" as const,
    icon: "chart" as const,
  },
] as const;

// ─── Card size ────────────────────────────────────────────────────────────────

type CardSize = "featured" | "active" | "quiet" | "empty";

function resolveSize(c: CompanyStats, rank: number, sectionSize: number): CardSize {
  const layoutFeatured = sectionSize !== 5;
  if (rank === 0 && c.freshCount > 0 && layoutFeatured) return "featured";
  if (c.freshCount > 0) return "active";
  if (c.articleCount > 0) return "quiet";
  return "empty";
}

// ═══════════════════════════════════════════════════════════════════════════════
//  SECTION ICONS — small symbolic SVGs per sector
// ═══════════════════════════════════════════════════════════════════════════════

type SectionIconType = "network" | "chip" | "shield" | "rocket" | "chart";

function SectionIcon({ icon, color }: { icon: SectionIconType; color: string }) {
  const size = 20;
  const common = { width: size, height: size, viewBox: "0 0 20 20", fill: "none" as const, className: "shrink-0" };

  switch (icon) {
    case "network":
      return (
        <svg {...common} aria-hidden>
          <circle cx="10" cy="4" r="2" fill={color} opacity={0.7} />
          <circle cx="4" cy="14" r="2" fill={color} opacity={0.5} />
          <circle cx="16" cy="14" r="2" fill={color} opacity={0.5} />
          <circle cx="10" cy="10" r="1.5" fill={color} opacity={0.3} />
          <line x1="10" y1="6" x2="10" y2="8.5" stroke={color} strokeWidth="1" opacity={0.4} />
          <line x1="8.5" y1="10.5" x2="5.5" y2="12.5" stroke={color} strokeWidth="1" opacity={0.4} />
          <line x1="11.5" y1="10.5" x2="14.5" y2="12.5" stroke={color} strokeWidth="1" opacity={0.4} />
        </svg>
      );
    case "chip":
      return (
        <svg {...common} aria-hidden>
          <rect x="5" y="5" width="10" height="10" rx="2" stroke={color} strokeWidth="1.2" opacity={0.6} />
          <rect x="7.5" y="7.5" width="5" height="5" rx="1" fill={color} opacity={0.2} />
          {/* Pins */}
          {[7, 10, 13].map(p => (
            <g key={p}>
              <line x1={p} y1="2" x2={p} y2="5" stroke={color} strokeWidth="1" opacity={0.4} />
              <line x1={p} y1="15" x2={p} y2="18" stroke={color} strokeWidth="1" opacity={0.4} />
            </g>
          ))}
          {[7, 10, 13].map(p => (
            <g key={`h${p}`}>
              <line x1="2" y1={p} x2="5" y2={p} stroke={color} strokeWidth="1" opacity={0.4} />
              <line x1="15" y1={p} x2="18" y2={p} stroke={color} strokeWidth="1" opacity={0.4} />
            </g>
          ))}
        </svg>
      );
    case "shield":
      return (
        <svg {...common} aria-hidden>
          <path d="M10 2 L16 5.5 L16 10 C16 14 10 18 10 18 C10 18 4 14 4 10 L4 5.5 Z"
            stroke={color} strokeWidth="1.2" fill={color} fillOpacity={0.08} opacity={0.7} />
          <path d="M8 10 L9.5 11.5 L12.5 8" stroke={color} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" opacity={0.5} />
        </svg>
      );
    case "rocket":
      return (
        <svg {...common} aria-hidden>
          <path d="M10 2 C10 2 13 5 13 10 L11 13 L9 13 L7 10 C7 5 10 2 10 2 Z"
            stroke={color} strokeWidth="1.1" fill={color} fillOpacity={0.1} opacity={0.7} />
          <path d="M7.5 10 L5 12" stroke={color} strokeWidth="1" opacity={0.4} strokeLinecap="round" />
          <path d="M12.5 10 L15 12" stroke={color} strokeWidth="1" opacity={0.4} strokeLinecap="round" />
          <circle cx="10" cy="7.5" r="1.2" fill={color} opacity={0.35} />
          {/* Exhaust */}
          <path d="M9 13 L8.5 16 L10 15 L11.5 16 L11 13" fill={color} opacity={0.3} />
        </svg>
      );
    case "chart":
      return (
        <svg {...common} aria-hidden>
          <rect x="3" y="11" width="3" height="6" rx="0.5" fill={color} opacity={0.3} />
          <rect x="8.5" y="7" width="3" height="10" rx="0.5" fill={color} opacity={0.45} />
          <rect x="14" y="3" width="3" height="14" rx="0.5" fill={color} opacity={0.6} />
          <line x1="2" y1="18" x2="18" y2="18" stroke={color} strokeWidth="1" opacity={0.25} />
        </svg>
      );
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LAYER 1 — PAGE-LEVEL: hero banner + animated background accents
// ═══════════════════════════════════════════════════════════════════════════════

function HeroBanner({ totalCompanies, totalFresh }: { totalCompanies: number; totalFresh: number }) {
  return (
    <div className="relative w-full overflow-hidden" style={{ height: 200 }}>
      <motion.div className="absolute" style={{
        width: 900, height: 500, top: -200, left: "5%",
        background: "radial-gradient(circle, rgba(99,102,241,0.12) 0%, transparent 65%)",
        filter: "blur(60px)",
      }}
        animate={{ x: [0, 60, -30, 0], y: [0, 25, -15, 0], scale: [1, 1.08, 0.95, 1] }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className="absolute" style={{
        width: 700, height: 400, top: -100, right: "-5%",
        background: "radial-gradient(circle, rgba(139,92,246,0.1) 0%, transparent 60%)",
        filter: "blur(70px)",
      }}
        animate={{ x: [0, -40, 30, 0], y: [0, 20, -25, 0], scale: [1, 0.93, 1.06, 1] }}
        transition={{ duration: 26, repeat: Infinity, ease: "easeInOut", delay: 3 }}
      />

      <div className="relative z-10 flex flex-col justify-end h-full max-w-7xl mx-auto px-6 pb-6">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-2" style={{ color: "#1a1f2e" }}>
          Watchlist
        </h1>
        <div className="flex items-center gap-4">
          <p className="font-mono text-sm" style={{ color: "#94a3b8" }}>
            {totalCompanies} companies across {GROUPS.length} sectors
          </p>
          {totalFresh > 0 && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-full"
              style={{ background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.15)" }}>
              <motion.span className="w-2 h-2 rounded-full shrink-0" style={{ background: "#6366f1" }}
                animate={{ opacity: [1, 0.3, 1], scale: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              <span className="font-mono text-xs font-medium" style={{ color: "#6366f1" }}>
                {totalFresh} live updates
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AmbientGradients() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }} aria-hidden>
      <motion.div className="absolute rounded-full" style={{
        width: 1000, height: 700,
        background: "radial-gradient(circle, rgba(99,102,241,0.07) 0%, transparent 65%)",
        filter: "blur(80px)", top: "5%", left: "-8%",
      }}
        animate={{ x: [0, 80, -40, 0], y: [0, 50, -30, 0], scale: [1, 1.1, 0.94, 1] }}
        transition={{ duration: 32, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div className="absolute rounded-full" style={{
        width: 800, height: 600,
        background: "radial-gradient(circle, rgba(139,92,246,0.06) 0%, transparent 60%)",
        filter: "blur(90px)", top: "40%", right: "-5%",
      }}
        animate={{ x: [0, -60, 35, 0], y: [0, -70, 40, 0], scale: [1, 0.88, 1.08, 1] }}
        transition={{ duration: 38, repeat: Infinity, ease: "easeInOut", delay: 6 }}
      />
      <motion.div className="absolute rounded-full" style={{
        width: 700, height: 500,
        background: "radial-gradient(circle, rgba(34,211,238,0.05) 0%, transparent 60%)",
        filter: "blur(70px)", bottom: "5%", left: "15%",
      }}
        animate={{ x: [0, 45, -30, 0], y: [0, -35, 20, 0], scale: [1, 1.06, 0.92, 1] }}
        transition={{ duration: 28, repeat: Infinity, ease: "easeInOut", delay: 12 }}
      />
      <motion.div className="absolute rounded-full" style={{
        width: 600, height: 450,
        background: "radial-gradient(circle, rgba(251,146,60,0.04) 0%, transparent 60%)",
        filter: "blur(60px)", top: "20%", right: "10%",
      }}
        animate={{ x: [0, -30, 50, 0], y: [0, 40, -20, 0] }}
        transition={{ duration: 35, repeat: Infinity, ease: "easeInOut", delay: 18 }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
//  LAYER 2 — SECTION-LEVEL: subtle themed backgrounds
// ═══════════════════════════════════════════════════════════════════════════════

function CircuitGridBg({ rgb }: { rgb: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <svg className="absolute inset-0 w-full h-full" style={{ opacity: 0.03 }}>
        <defs>
          <pattern id="circuit-grid" width="80" height="80" patternUnits="userSpaceOnUse">
            <path d="M 80 0 L 0 0 0 80" fill="none" stroke={`rgba(${rgb},1)`} strokeWidth="0.4" />
            <circle cx="0" cy="0" r="1.5" fill={`rgba(${rgb},0.6)`} />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#circuit-grid)" />
      </svg>
    </div>
  );
}

function MeshBg({ rgb }: { rgb: string }) {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden" aria-hidden>
      <motion.div className="absolute rounded-full" style={{
        width: "60%", height: "120%", right: "-15%", top: "-20%",
        background: `radial-gradient(circle, rgba(${rgb},0.04) 0%, transparent 65%)`,
        filter: "blur(40px)",
      }}
        animate={{ x: [0, -30, 20, 0], y: [0, 15, -10, 0], scale: [1, 1.05, 0.97, 1] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}

function SectionBackground({ motif, rgb }: { motif: "starfield" | "circuit" | "mesh"; rgb: string }) {
  switch (motif) {
    case "starfield": return <MeshBg rgb={rgb} />;
    case "circuit": return <CircuitGridBg rgb={rgb} />;
    case "mesh": return <MeshBg rgb={rgb} />;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
//  COMPANY VISUALS — AI-generated images, editorial grid sizing
// ═══════════════════════════════════════════════════════════════════════════════

type HoverMotion = "speed-right" | "launch-up" | "float" | "spin" | "tilt" | "none";

const VISUAL_CONFIG: Record<string, {
  src: string;
  ratio: string;
  hoverMotion: HoverMotion;
}> = {
  TSLA: { src: "/images/companies/tsla.png", ratio: "4 / 3", hoverMotion: "speed-right" },
  SPACEX: { src: "/images/companies/spacex.png", ratio: "3 / 4", hoverMotion: "launch-up" },
  GOOGL: { src: "/images/companies/googl.png", ratio: "1 / 1", hoverMotion: "spin" },
  AMZN: { src: "/images/companies/amzn.png", ratio: "1 / 1", hoverMotion: "float" },
  AAPL: { src: "/images/companies/aapl.png", ratio: "1 / 1", hoverMotion: "tilt" },
  MSFT: { src: "/images/companies/msft.png", ratio: "1 / 1", hoverMotion: "float" },
  META: { src: "/images/companies/meta.png", ratio: "1 / 1", hoverMotion: "spin" },
  // Semiconductors
  NVDA: { src: "/images/companies/nvda.png", ratio: "1 / 1", hoverMotion: "float" },
  AMD: { src: "/images/companies/amd.png", ratio: "1 / 1", hoverMotion: "tilt" },
  MU: { src: "/images/companies/mu.png", ratio: "1 / 1", hoverMotion: "float" },
  TSM: { src: "/images/companies/tsm.png", ratio: "1 / 1", hoverMotion: "spin" },
  // AI & Cyber
  PLTR: { src: "/images/companies/pltr.png", ratio: "1 / 1", hoverMotion: "spin" },
  PANW: { src: "/images/companies/panw.png", ratio: "1 / 1", hoverMotion: "tilt" },
  CRWD: { src: "/images/companies/crwd.png", ratio: "1 / 1", hoverMotion: "speed-right" },
  // Space
  RKLB: { src: "/images/companies/rklb.png", ratio: "1 / 1", hoverMotion: "launch-up" },
  // Infrastructure & Finance
  VRT: { src: "/images/companies/vrt.png", ratio: "1 / 1", hoverMotion: "float" },
  IREN: { src: "/images/companies/iren.png", ratio: "1 / 1", hoverMotion: "spin" },
  JPM: { src: "/images/companies/jpm.png", ratio: "1 / 1", hoverMotion: "float" },
};

const VISUAL_TICKERS = new Set(Object.keys(VISUAL_CONFIG));

function CompanyVisual({ company, accent }: {
  company: CompanyStats; accent: string;
}) {
  const displayTicker = company.ticker ?? company.name.toUpperCase().replace(/\s+/g, "_");
  const config = VISUAL_CONFIG[displayTicker];
  if (!config) return null;

  const hasNews = company.articleCount > 0;
  const imgControls = useAnimation();
  const [isHovered, setIsHovered] = useState(false);

  const handleHoverStart = async () => {
    setIsHovered(true);
    if (config.hoverMotion === "speed-right") {
      await imgControls.start({
        x: 30, scale: 1.06,
        transition: { type: "spring", stiffness: 200, damping: 12, mass: 0.8 },
      });
      imgControls.start({
        x: 0, scale: 1,
        transition: { type: "spring", stiffness: 120, damping: 14, mass: 1.2 },
      });
    } else if (config.hoverMotion === "launch-up") {
      await imgControls.start({
        y: -25, scale: 1.05,
        transition: { type: "spring", stiffness: 180, damping: 10, mass: 0.7 },
      });
      imgControls.start({
        y: 0, scale: 1,
        transition: { type: "spring", stiffness: 100, damping: 12, mass: 1 },
      });
    } else if (config.hoverMotion === "float") {
      imgControls.start({
        y: -14, scale: 1.06,
        transition: { type: "spring", stiffness: 160, damping: 12, mass: 0.9 },
      });
    } else if (config.hoverMotion === "spin") {
      imgControls.start({
        rotate: 8, scale: 1.07,
        transition: { type: "spring", stiffness: 140, damping: 10, mass: 0.8 },
      });
    } else if (config.hoverMotion === "tilt") {
      imgControls.start({
        rotate: -5, scale: 1.08, y: -8,
        transition: { type: "spring", stiffness: 180, damping: 14, mass: 0.7 },
      });
    }
  };

  const handleHoverEnd = () => {
    setIsHovered(false);
    imgControls.start({
      x: 0, y: 0, scale: 1, rotate: 0,
      transition: { type: "spring", stiffness: 150, damping: 18 },
    });
  };

  const visual = (
    <motion.div
      className="relative overflow-hidden"
      style={{ aspectRatio: config.ratio }}
      onHoverStart={handleHoverStart}
      onHoverEnd={handleHoverEnd}
    >
      {/* The AI-generated image — light bg blends naturally with page */}
      <motion.img
        src={config.src}
        alt={company.name}
        className="absolute inset-0 w-full h-full object-contain"
        draggable={false}
        animate={imgControls}
      />

      {/* Hover motion trail for Tesla */}
      {config.hoverMotion === "speed-right" && isHovered && (
        <motion.div className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: 0.12 }}
          style={{
            background: "linear-gradient(to right, transparent 30%, rgba(234,88,12,0.25) 80%, transparent 100%)",
            filter: "blur(16px)",
          }}
        />
      )}

      {/* Hover exhaust for SpaceX */}
      {config.hoverMotion === "launch-up" && isHovered && (
        <motion.div className="absolute inset-0 pointer-events-none"
          initial={{ opacity: 0 }} animate={{ opacity: 0.15 }}
          style={{
            background: "radial-gradient(ellipse 35% 25% at 50% 90%, rgba(234,88,12,0.35) 0%, transparent 70%)",
            filter: "blur(10px)",
          }}
        />
      )}

      {/* Compact floating info tag — bottom-left */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg"
        style={{
          background: "rgba(255,255,255,0.85)",
          backdropFilter: "blur(10px)",
          boxShadow: "0 1px 6px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.04)",
        }}>
        <span className="text-[13px] font-semibold tracking-tight" style={{ color: "#1a1f2e" }}>
          {company.name}
        </span>
        <span className="font-mono text-[10px] font-medium" style={{ color: accent }}>
          {displayTicker}
        </span>
        {hasNews && (
          <span className="font-mono text-[10px]" style={{ color: "#94a3b8" }}>
            {company.articleCount}
          </span>
        )}
        {company.freshCount > 0 && (
          <div className="flex items-center gap-1">
            <motion.span className="w-1.5 h-1.5 rounded-full" style={{ background: accent }}
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <span className="font-mono text-[9px] font-bold" style={{ color: accent }}>
              {company.freshCount}
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );

  if (!hasNews) return <div className="h-full">{visual}</div>;

  return (
    <Link href={`/${company.dbTicker}`} className="block h-full" style={{ textDecoration: "none" }}>
      {visual}
    </Link>
  );
}

// ─── Ticker badge ─────────────────────────────────────────────────────────────

function TickerBadge({ display, size, accent, rgb }: { display: string; size: CardSize; accent: string; rgb: string }) {
  const isFeatured = size === "featured";
  const dim = isFeatured ? 52 : 38;
  const fontSize = display.length <= 2 ? (isFeatured ? "text-base" : "text-sm") : display.length <= 4 ? (isFeatured ? "text-sm" : "text-xs") : "text-[9px]";
  return (
    <div className="flex items-center justify-center rounded-xl shrink-0 mb-4"
      style={{ width: dim, height: dim, background: `rgba(${rgb},${isFeatured ? "0.1" : "0.06"})`,
        border: `1px solid rgba(${rgb},${isFeatured ? "0.18" : "0.1"})` }}>
      <span className={`font-mono font-bold ${fontSize} leading-none`} style={{ color: accent }}>
        {display}
      </span>
    </div>
  );
}

// ─── Company card (for non-visual companies) ─────────────────────────────────

function CompanyCard({ company, size, accent, rgb, highlight = false }: {
  company: CompanyStats; size: CardSize; accent: string; rgb: string; highlight?: boolean;
}) {
  const isFeatured = size === "featured";
  const isActive = size === "active";
  const hasNews = company.articleCount > 0;
  const isFresh = company.freshCount > 0;
  const isEmphasized = isFeatured || highlight;
  const displayTicker = company.ticker ?? company.name.toUpperCase().replace(/\s+/g, "_");

  const baseShadow = isFeatured
    ? `0 8px 32px rgba(0,0,0,0.06), 0 0 0 1px rgba(${rgb},0.15)`
    : highlight ? `0 4px 20px rgba(0,0,0,0.05), 0 0 0 1px rgba(${rgb},0.12)`
    : isActive ? "0 2px 12px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.06)" : "0 1px 4px rgba(0,0,0,0.03), 0 0 0 1px rgba(0,0,0,0.04)";

  const hoverShadow = isFeatured
    ? `0 20px 48px rgba(0,0,0,0.1), 0 0 0 1px rgba(${rgb},0.28), 0 0 32px rgba(${rgb},0.06)`
    : highlight ? `0 14px 36px rgba(0,0,0,0.08), 0 0 0 1px rgba(${rgb},0.22), 0 0 20px rgba(${rgb},0.05)`
    : `0 10px 28px rgba(0,0,0,0.07), 0 0 0 1px rgba(${rgb},0.15)`;

  return (
    <div className="h-full">
      {hasNews ? (
        <Link href={`/${company.dbTicker}`} className="block h-full" style={{ textDecoration: "none" }}>
          <CardInner />
        </Link>
      ) : <CardInner />}
    </div>
  );

  function CardInner() {
    return (
      <motion.div
        className="relative flex flex-col h-full rounded-2xl overflow-hidden"
        style={{
          padding: isFeatured ? "22px 24px" : "14px 16px",
          minHeight: isFeatured ? 188 : 130,
          background: isFeatured
            ? `linear-gradient(140deg, rgba(${rgb},0.08) 0%, rgba(${rgb},0.03) 50%, rgba(255,255,255,0.8) 100%)`
            : highlight ? `linear-gradient(140deg, rgba(${rgb},0.06) 0%, rgba(255,255,255,0.7) 100%)`
            : isActive ? "rgba(255,255,255,0.7)" : hasNews ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.35)",
          border: `1px solid ${isFeatured ? `rgba(${rgb},0.2)` : highlight ? `rgba(${rgb},0.14)` : isActive ? "rgba(0,0,0,0.07)" : hasNews ? "rgba(0,0,0,0.05)" : "rgba(0,0,0,0.03)"}`,
          boxShadow: baseShadow,
          backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)",
        }}
        whileHover={hasNews ? {
          y: -5, scale: isFeatured ? 1.011 : 1.02, boxShadow: hoverShadow,
          transition: { type: "spring", stiffness: 370, damping: 22 },
        } : {}}
      >
        {isFresh && (
          <div className="absolute top-3 right-3">
            {isEmphasized ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: `rgba(${rgb},0.08)`, border: `1px solid rgba(${rgb},0.18)` }}>
                <motion.span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: accent }}
                  animate={{ opacity: [1, 0.3, 1], scale: [1, 0.75, 1] }} transition={{ duration: 2.2, repeat: Infinity }} />
                <span className="font-mono text-[10px] font-bold tracking-wide" style={{ color: accent }}>{company.freshCount} live</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full"
                style={{ background: "rgba(5,150,105,0.08)", border: "1px solid rgba(5,150,105,0.15)" }}>
                <motion.span className="w-1 h-1 rounded-full shrink-0" style={{ background: "#059669" }}
                  animate={{ opacity: [1, 0.35, 1] }} transition={{ duration: 2.2, repeat: Infinity }} />
                <span className="font-mono text-[9px] font-semibold" style={{ color: "#059669" }}>{company.freshCount}</span>
              </div>
            )}
          </div>
        )}

        <TickerBadge display={displayTicker} size={size} accent={accent} rgb={rgb} />
        <p className={`font-semibold leading-tight mb-auto ${isFeatured ? "text-[15px]" : "text-[13px]"}`}
          style={{ color: hasNews ? (isEmphasized ? "#1a1f2e" : "#334155") : "#cbd5e1" }}>
          {company.name}
        </p>
        <div className="flex items-center justify-between mt-3 pt-2.5"
          style={{ borderTop: `1px solid ${isEmphasized ? `rgba(${rgb},0.1)` : "rgba(0,0,0,0.05)"}` }}>
          <span className="font-mono text-[10px]" style={{ color: "#94a3b8" }}>{company.ticker ?? "PRIVATE"}</span>
          {hasNews ? (
            <span className="font-mono text-[10px] font-medium" style={{ color: isEmphasized ? accent : "#64748b" }}>{company.articleCount}</span>
          ) : (
            <span className="font-mono text-[9px]" style={{ color: "#e2e8f0" }}>—</span>
          )}
        </div>
      </motion.div>
    );
  }
}

// ─── Section ──────────────────────────────────────────────────────────────────

const sectionContainer = { hidden: {}, show: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } } };
const cardSlide = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.52, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

function WatchlistSection({ group, companies }: { group: (typeof GROUPS)[number]; companies: CompanyStats[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  const sorted = [...companies].sort((a, b) =>
    b.freshCount !== a.freshCount ? b.freshCount - a.freshCount : b.articleCount - a.articleCount);

  const n = sorted.length;
  const sizes = sorted.map((c, i) => resolveSize(c, i, n));
  const totalFresh = companies.reduce((s, c) => s + c.freshCount, 0);

  // Use 3 columns for all sections — fits 2-3 items per row comfortably
  const gridCols = 3;

  return (
    <div ref={ref} id={group.sectionId} className="relative" style={{ padding: "28px 0", scrollMarginTop: 72 }}>
      <SectionBackground motif={group.motif} rgb={group.rgb} />

      {/* Section header with icon */}
      <motion.div className="relative flex items-center gap-3 mb-5"
        initial={{ opacity: 0, x: -12 }} animate={inView ? { opacity: 1, x: 0 } : {}}
        transition={{ duration: 0.45, ease: "easeOut" }}>
        <SectionIcon icon={group.icon} color={group.accent} />
        <h2 className="text-lg font-bold tracking-tight" style={{ color: "#1e293b" }}>{group.label}</h2>
        {totalFresh > 0 && (
          <span className="font-mono text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ color: group.accent, background: `rgba(${group.rgb},0.06)`, border: `1px solid rgba(${group.rgb},0.12)` }}>
            {totalFresh} fresh
          </span>
        )}
        <div className="flex-1 h-px" style={{ background: "rgba(0,0,0,0.06)" }} />
      </motion.div>

      {/* Card grid — 3 columns, visual companies sit alongside regular cards */}
      <motion.div className="relative grid gap-4"
        style={{ gridTemplateColumns: `repeat(${gridCols}, 1fr)`, gridAutoFlow: "dense" }}
        variants={sectionContainer} initial="hidden" animate={inView ? "show" : "hidden"}>
        {sorted.map((company, i) => {
          const isVisual = VISUAL_TICKERS.has(company.dbTicker);
          const isFeatured = sizes[i] === "featured";

          if (isVisual) {
            return (
              <motion.div key={company.dbTicker} variants={cardSlide}
                style={{ gridColumn: "span 1" }}>
                <CompanyVisual company={company} accent={group.accent} />
              </motion.div>
            );
          }

          return (
            <motion.div key={company.dbTicker} variants={cardSlide}
              style={{ gridColumn: isFeatured ? "span 1" : "span 1" }}>
              <CompanyCard company={company} size={sizes[i]} accent={group.accent} rgb={group.rgb}
                highlight={n === 5 && i === 0 && company.freshCount > 0} />
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export function DashboardGrid({ companies }: { companies: CompanyStats[] }) {
  const byTicker = new Map(companies.map((c) => [c.dbTicker, c]));
  const totalFresh = companies.reduce((s, c) => s + c.freshCount, 0);

  return (
    <>
      <AmbientGradients />

      <div className="relative" style={{ zIndex: 1 }}>
        <HeroBanner totalCompanies={companies.length} totalFresh={totalFresh} />

        <div className="max-w-7xl mx-auto px-6 pb-24">
          {GROUPS.map((group) => {
            const groupCompanies = group.dbTickers.map((t) => byTicker.get(t)).filter((c): c is CompanyStats => c !== undefined);
            if (groupCompanies.length === 0) return null;
            return <WatchlistSection key={group.label} group={group} companies={groupCompanies} />;
          })}
        </div>
      </div>
    </>
  );
}
