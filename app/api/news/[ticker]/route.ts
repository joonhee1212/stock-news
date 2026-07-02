import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/db";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ ticker: string }> }
) {
  const { ticker } = await params;
  const articles = db
    .prepare(
      `SELECT id, ticker, headline, summary, url, image, source, published_at
       FROM articles
       WHERE ticker = ?
       ORDER BY published_at DESC
       LIMIT 50`
    )
    .all(ticker.toUpperCase());

  return NextResponse.json(articles);
}
