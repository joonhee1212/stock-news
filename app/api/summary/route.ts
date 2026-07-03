import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function GET(req: NextRequest) {
  const articleId = req.nextUrl.searchParams.get("id");
  if (!articleId) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  // Check for cached summary first
  const { rows } = await pool.query<{
    id: number;
    headline: string;
    summary: string | null;
    ai_summary: string | null;
  }>(
    "SELECT id, headline, summary, ai_summary FROM articles WHERE id = $1",
    [Number(articleId)]
  );

  const article = rows[0];
  if (!article) {
    return NextResponse.json({ error: "Article not found" }, { status: 404 });
  }

  // Return cached AI summary if it exists
  if (article.ai_summary) {
    return NextResponse.json({ ai_summary: article.ai_summary, cached: true });
  }

  // Generate summary via OpenAI
  const input = [
    `Headline: ${article.headline}`,
    article.summary ? `Source excerpt: ${article.summary}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-nano",
      messages: [
        {
          role: "system",
          content:
            "You are a concise financial news editor. Given an article headline and optional source excerpt, write a genuinely informative 2–3 sentence summary (40–60 words) in a professional financial-news tone. Be specific: include key numbers, names, or implications. Paraphrase completely — never copy phrasing from the input. Output only the summary text, no labels or quotes.",
        },
        { role: "user", content: input },
      ],
      max_tokens: 120,
      temperature: 0.3,
    });

    const aiSummary = completion.choices[0]?.message?.content?.trim();
    if (!aiSummary) {
      return NextResponse.json({
        ai_summary: article.summary ?? article.headline,
        cached: false,
        fallback: true,
      });
    }

    // Cache in database
    await pool.query("UPDATE articles SET ai_summary = $1 WHERE id = $2", [
      aiSummary,
      article.id,
    ]);

    return NextResponse.json({ ai_summary: aiSummary, cached: false });
  } catch {
    // Fall back to source summary or headline
    return NextResponse.json({
      ai_summary: article.summary ?? article.headline,
      cached: false,
      fallback: true,
    });
  }
}
