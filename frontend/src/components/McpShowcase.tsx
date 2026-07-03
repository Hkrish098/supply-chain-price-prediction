"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type McpInfo = {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  gradient: string;
  details: {
    description: string;
    provider: string;
    usedIn: string;
    features: string[];
    apiKey: string;
  };
};

export const MCP_ITEMS: McpInfo[] = [
  {
    id: "weather",
    name: "Weather MCP",
    icon: "🌤️",
    tagline: "Open-Meteo forecasts",
    gradient: "from-sky-400 to-blue-600",
    details: {
      description:
        "Fetches real-time weather and 7-day forecasts via Open-Meteo geocoding and forecast APIs. Calculates a supply-chain impact factor from temperature, precipitation, and wind to inform pricing and logistics recommendations.",
      provider: "Open-Meteo (free, no API key)",
      usedIn: "Expert suggestions · /api/weather · demand impact scoring",
      features: [
        "Location geocoding",
        "Current conditions & 7-day forecast",
        "Weather impact factor for logistics delays",
      ],
      apiKey: "Not required",
    },
  },
  {
    id: "news",
    name: "News MCP",
    icon: "📰",
    tagline: "Supply chain headlines",
    gradient: "from-amber-400 to-orange-500",
    details: {
      description:
        "Pulls recent headlines about supply chain, logistics, and product categories from NewsAPI. Headlines are injected into the Groq LLM prompt so expert suggestions reflect current market events.",
      provider: "NewsAPI",
      usedIn: "Expert suggestions · market context prompt",
      features: [
        "Category-aware headline search",
        "Top 2–3 recent articles per request",
        "Graceful fallback when API key is absent",
      ],
      apiKey: "Optional — NEWSAPI_KEY",
    },
  },
  {
    id: "finance",
    name: "Finance MCP",
    icon: "📈",
    tagline: "Commodity & market data",
    gradient: "from-emerald-400 to-teal-600",
    details: {
      description:
        "Tracks live commodity prices via yfinance — notably WTI crude oil (CL=F) as a freight-cost proxy. Market moves are passed to the AI layer to contextualize shipping and margin recommendations.",
      provider: "yfinance (Yahoo Finance)",
      usedIn: "Expert suggestions · market context prompt",
      features: [
        "Latest close price for any ticker",
        "Crude oil (CL=F) freight indicator",
        "No API key required",
      ],
      apiKey: "Not required",
    },
  },
  {
    id: "groq",
    name: "Groq LLM",
    icon: "✨",
    tagline: "Expert AI suggestions",
    gradient: "from-violet-500 to-indigo-600",
    details: {
      description:
        "Combines ML predictions with MCP-gathered weather, news, and finance context to generate actionable expert recommendations via llama-3.3-70b-versatile. Each suggestion tags its data sources.",
      provider: "Groq API",
      usedIn: "Expert suggestions · /api/expert-suggestions",
      features: [
        "Context-aware strategic recommendations",
        "Source tags (Weather, Finance, News)",
        "Fallback mode when API key is missing",
      ],
      apiKey: "GROQ_API_KEY",
    },
  },
  {
    id: "ml",
    name: "ML Pipeline",
    icon: "🧠",
    tagline: "Price forecasting",
    gradient: "from-fuchsia-500 to-purple-600",
    details: {
      description:
        "Scikit-learn pipeline with tuned Random Forest regression (R² 0.85, RMSE $26.19) trained on 8,300+ retail records. Serves real-time unit price predictions through FastAPI.",
      provider: "scikit-learn · XGBoost · joblib",
      usedIn: "Price prediction · /api/predict",
      features: [
        "Categorical + numerical feature preprocessing",
        "Hyperparameter-tuned Random Forest",
        "162 MB model deployed via Git LFS",
      ],
      apiKey: "Not required",
    },
  },
];

const McpCard = ({
  mcp,
  onClick,
}: {
  mcp: McpInfo;
  onClick: () => void;
}) => (
  <button
    type="button"
    onClick={onClick}
    className="group mcp-marquee-card flex w-[148px] shrink-0 flex-col items-center gap-2 rounded-2xl border border-white/70 bg-white/80 p-4 shadow-md shadow-indigo-100/50 backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-indigo-200 hover:shadow-lg hover:shadow-indigo-200/60"
  >
    <div
      className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${mcp.gradient} text-2xl shadow-lg transition-transform duration-300 group-hover:scale-110`}
    >
      {mcp.icon}
    </div>
    <span className="text-center text-xs font-bold text-slate-800">{mcp.name}</span>
    <span className="text-center text-[10px] leading-tight text-slate-400">{mcp.tagline}</span>
  </button>
);

const McpDetailModal = ({
  mcp,
  onClose,
}: {
  mcp: McpInfo;
  onClose: () => void;
}) => (
  <motion.div
    className="fixed inset-0 z-50 flex items-center justify-center p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClose}
  >
    <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" />
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-labelledby={`mcp-${mcp.id}-title`}
      className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-2xl shadow-indigo-300/30 backdrop-blur-xl"
      initial={{ opacity: 0, scale: 0.92, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.92, y: 20 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] as const }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className={`h-1.5 bg-gradient-to-r ${mcp.gradient}`} />
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${mcp.gradient} text-2xl shadow-lg`}
          >
            {mcp.icon}
          </div>
          <div className="min-w-0 flex-1">
            <h3 id={`mcp-${mcp.id}-title`} className="text-lg font-bold text-slate-900">
              {mcp.name}
            </h3>
            <p className="mt-0.5 text-sm text-slate-500">{mcp.tagline}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <p className="mt-4 text-sm leading-6 text-slate-600">{mcp.details.description}</p>

        <dl className="mt-5 space-y-3 rounded-xl border border-slate-100 bg-slate-50/80 p-4 text-sm">
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Provider</dt>
            <dd className="mt-0.5 font-medium text-slate-700">{mcp.details.provider}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Used in</dt>
            <dd className="mt-0.5 font-medium text-slate-700">{mcp.details.usedIn}</dd>
          </div>
          <div>
            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">API key</dt>
            <dd className="mt-0.5 font-medium text-slate-700">{mcp.details.apiKey}</dd>
          </div>
        </dl>

        <ul className="mt-4 space-y-2">
          {mcp.details.features.map((f) => (
            <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
              <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-500" />
              {f}
            </li>
          ))}
        </ul>
      </div>
    </motion.div>
  </motion.div>
);

export const McpShowcase: React.FC = () => {
  const [selected, setSelected] = useState<McpInfo | null>(null);
  const loop = [...MCP_ITEMS, ...MCP_ITEMS];

  return (
    <section className="w-full" aria-label="MCP integrations showcase">
      <p className="mb-4 text-center text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400">
        Powered by MCP integrations
      </p>

      <div className="mcp-marquee-mask relative overflow-hidden py-2">
        <div className="mcp-marquee-track flex w-max gap-4">
          {loop.map((mcp, i) => (
            <McpCard key={`${mcp.id}-${i}`} mcp={mcp} onClick={() => setSelected(mcp)} />
          ))}
        </div>
      </div>

      <p className="mt-3 text-center text-xs text-slate-400">
        Click any card to see how it&apos;s used in this project
      </p>

      <AnimatePresence>
        {selected && <McpDetailModal mcp={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
};

export default McpShowcase;
