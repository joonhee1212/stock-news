import pool from "@/lib/db";
import { getDashboardStats } from "@/lib/dashboard";
import { timeAgo } from "@/lib/utils";
import { DashboardGrid } from "./components/dashboard-grid";
import { NavMenu } from "./components/nav-menu";

export default async function Home() {
  const companies = await getDashboardStats();

  const { rows } = await pool.query<{ t: string | null }>(
    "SELECT MAX(fetched_at) as t FROM fetch_log"
  );
  const lastRefreshTime = rows[0]?.t ? timeAgo(Number(rows[0].t)) : null;

  return (
    <div className="min-h-screen">
      {/* ── Header ─────────────────────────────────────────────────────── */}
      <header
        className="sticky top-0 z-20 flex items-center justify-between px-6 py-4"
        style={{
          background: "rgba(244,245,249,0.82)",
          backdropFilter: "blur(18px)",
          WebkitBackdropFilter: "blur(18px)",
          borderBottom: "1px solid rgba(0,0,0,0.06)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex items-center gap-3">
          {/* Logo mark — now an interactive nav menu */}
          <NavMenu />

          <span className="font-semibold text-sm tracking-tight" style={{ color: "#1a1f2e" }}>
            Stock News
          </span>

          <span
            className="hidden sm:block w-px h-3.5 shrink-0"
            style={{ background: "rgba(0,0,0,0.08)" }}
          />
          <span
            className="hidden sm:block font-mono text-[10px] tracking-widest uppercase"
            style={{ color: "#94a3b8" }}
          >
            Market Intelligence
          </span>
        </div>

        {lastRefreshTime && (
          <div className="flex items-center gap-2">
            <span
              className="w-1.5 h-1.5 rounded-full shrink-0"
              style={{ background: "#10b981", boxShadow: "0 0 7px #10b981" }}
            />
            <span className="font-mono text-[11px]" style={{ color: "#94a3b8" }}>
              {lastRefreshTime}
            </span>
          </div>
        )}
      </header>

      {/* ── Main ────────────────────────────────────────────────────────── */}
      <main className="relative" style={{ zIndex: 1 }}>
        <DashboardGrid companies={companies} />
      </main>
    </div>
  );
}
