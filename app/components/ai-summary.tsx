"use client";

import { useEffect, useState } from "react";

export default function AiSummary({
  articleId,
  fallbackSummary,
}: {
  articleId: number;
  fallbackSummary: string | null;
}) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    fetch(`/api/summary?id=${articleId}`)
      .then((res) => (res.ok ? res.json() : Promise.reject()))
      .then((data) => {
        if (!cancelled) setSummary(data.ai_summary);
      })
      .catch(() => {
        if (!cancelled) setSummary(fallbackSummary);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [articleId, fallbackSummary]);

  if (loading) {
    return (
      <div className="mb-8 space-y-2">
        <div
          className="h-4 rounded"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            width: "100%",
          }}
        />
        <div
          className="h-4 rounded"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            width: "85%",
          }}
        />
        <div
          className="h-4 rounded"
          style={{
            background:
              "linear-gradient(90deg, rgba(0,0,0,0.04) 25%, rgba(0,0,0,0.08) 50%, rgba(0,0,0,0.04) 75%)",
            backgroundSize: "200% 100%",
            animation: "shimmer 1.5s infinite",
            width: "60%",
          }}
        />
        <style>{`@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
        <p
          className="font-mono text-[10px] uppercase tracking-widest mt-3"
          style={{ color: "#94a3b8" }}
        >
          Generating summary...
        </p>
      </div>
    );
  }

  if (!summary) {
    return (
      <p className="text-sm mb-8" style={{ color: "#6b7280" }}>
        No excerpt available.
      </p>
    );
  }

  return (
    <div className="mb-8">
      <p className="text-base leading-relaxed" style={{ color: "#374151" }}>
        {summary}
      </p>
      <p
        className="font-mono text-[9px] uppercase tracking-widest mt-2"
        style={{ color: "#94a3b8" }}
      >
        AI-generated summary
      </p>
    </div>
  );
}
