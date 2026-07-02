import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const { rows } = await pool.query(
    `SELECT id, ticker, headline, summary, url, image, source, published_at
     FROM articles
     WHERE ticker = $1
     ORDER BY published_at DESC
     LIMIT 50`,
    [ticker.toUpperCase()]
  );

  return NextResponse.json(rows);
}
