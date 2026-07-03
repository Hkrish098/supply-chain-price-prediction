"use client";

import React from "react";

const FOOTER_LINKS = [
  { label: "Live demo", href: "https://supply-chain-price-prediction.vercel.app" },
  { label: "API docs", href: "https://supply-chain-price-prediction.onrender.com/docs" },
  { label: "Health", href: "https://supply-chain-price-prediction.onrender.com/api/health" },
  { label: "GitHub", href: "https://github.com/Hkrish098/supply-chain-price-prediction" },
];

export const SiteFooter: React.FC = () => (
  <footer className="mt-16 w-full border-t border-white/50 pt-10 pb-8">
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
      <div className="text-center sm:text-left">
        <p className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-lg font-bold text-transparent">
          Supply Chain Control Center
        </p>
        <p className="mt-1 text-xs text-slate-400">
          ML price forecasting · MCP market context · Groq expert AI
        </p>
      </div>

      <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {FOOTER_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-slate-500 transition hover:text-indigo-600"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>

    <p className="mt-6 text-center text-[11px] text-slate-400">
      © {new Date().getFullYear()} Supply Chain Price Prediction · Built with Next.js &amp; FastAPI
    </p>
  </footer>
);

export default SiteFooter;
