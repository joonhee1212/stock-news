"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const SECTIONS = [
  { label: "Big Tech", id: "section-big-tech", accent: "#6366f1" },
  { label: "Semiconductors", id: "section-semiconductors", accent: "#0891b2" },
  { label: "AI & Cyber", id: "section-ai-cyber", accent: "#7c3aed" },
  { label: "Space & Deep Tech", id: "section-space-deep-tech", accent: "#ea580c" },
  { label: "Infrastructure & Finance", id: "section-infrastructure-finance", accent: "#059669" },
];

export function NavMenu() {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  function scrollToSection(id: string) {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setOpen(false);
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger button — the purple logo mark */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0 cursor-pointer transition-transform duration-150"
        style={{
          background:
            "linear-gradient(135deg, rgba(99,102,241,0.92) 0%, rgba(139,92,246,0.92) 100%)",
          boxShadow: open
            ? "0 2px 14px rgba(99,102,241,0.45)"
            : "0 2px 14px rgba(99,102,241,0.28)",
          transform: open ? "scale(1.08)" : "scale(1)",
        }}
        aria-label="Navigate to section"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
          <motion.g
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <path
              d="M2 4h10M2 7h7M2 10h5"
              stroke="white"
              strokeWidth="1.6"
              strokeLinecap="round"
            />
          </motion.g>
        </svg>
      </button>

      {/* Dropdown */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.18, ease: "easeOut" }}
            className="absolute top-full left-0 mt-2 py-1.5 rounded-xl overflow-hidden"
            style={{
              background: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              border: "1px solid rgba(0,0,0,0.08)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.1), 0 0 0 1px rgba(99,102,241,0.08)",
              minWidth: 220,
              zIndex: 50,
            }}
          >
            <div className="px-3 py-1.5">
              <span className="font-mono text-[9px] uppercase tracking-widest" style={{ color: "#94a3b8" }}>
                Jump to section
              </span>
            </div>
            {SECTIONS.map((section) => (
              <button
                key={section.id}
                onClick={() => scrollToSection(section.id)}
                className="w-full text-left px-3 py-2 flex items-center gap-2.5 transition-colors duration-100 cursor-pointer"
                style={{ color: "#334155" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "rgba(99,102,241,0.06)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                }}
              >
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ background: section.accent }}
                />
                <span className="text-[13px] font-medium">{section.label}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
