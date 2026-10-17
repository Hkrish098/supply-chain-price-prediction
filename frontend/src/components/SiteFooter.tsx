"use client";

import React from "react";

const FOOTER_LINKS = [
  { label: "Live demo", href: "https://supply-chain-price-prediction.vercel.app" },
  { label: "API docs", href: "https://supply-chain-price-prediction.onrender.com/docs" },
  { label: "Health", href: "https://supply-chain-price-prediction.onrender.com/api/health" },
  { label: "GitHub", href: "https://github.com/Hkrish098/supply-chain-price-prediction" },
];

export const SiteFooter: React.FC = () => (
  <footer className="mt-8 w-full border-t border-stone-200 pt-6 pb-4">
    <div className="mx-auto flex max-w-4xl flex-col items-center gap-6 sm:flex-row sm:justify-between">
      <div className="text-center sm:text-left">
        <p className="text-brand-800 text-lg font-bold ">
          Procurement Intelligence Module
        </p>
        <p className="mt-1 text-xs text-stone-400">
          Price forecasts · Market context · Purchasing decisions
        </p>
      </div>

      <nav className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2">
        {FOOTER_LINKS.map((link) => (
          <a
            key={link.href}
            href={link.href}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-stone-500 transition hover:text-brand-600"
          >
            {link.label}
          </a>
        ))}
      </nav>
    </div>

    <p className="mt-6 text-center text-[11px] text-stone-400">
      © {new Date().getFullYear()} Procurement Intelligence Module
    </p>
  </footer>
);

export default SiteFooter;
