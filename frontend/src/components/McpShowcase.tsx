"use client";

import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type McpInfo = {
  id: string;
  name: string;
  icon: string;
  tagline: string;
  gradient: string;
  details: {
    overview: string;
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
      overview:
        "Open-Meteo is a free weather service that provides forecasts for any location worldwide without needing an API key. Model Context Protocol (MCP) is a standard that lets AI applications connect to external tools and data sources. Together, they bring live weather conditions into supply chain planning.",
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
      overview:
        "NewsAPI collects headlines from thousands of news publishers around the world. MCP gives AI systems a structured way to search and read those headlines on demand. This keeps predictions aware of breaking supply chain and market news.",
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
      overview:
        "yfinance is a Python library that pulls live stock and commodity prices from Yahoo Finance. MCP wraps this data so AI tools can query market prices in a consistent format. Crude oil and commodity trends help estimate freight and material costs.",
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
      overview:
        "Groq runs large language models (LLMs) on specialized chips for extremely fast inference. Llama 3.3 is Meta's open-source AI model trained to understand and generate human-like text. This powers the expert suggestions panel after you generate a prediction.",
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
      overview:
        "Machine learning learns patterns from historical data to predict future unit prices. Random Forest is a reliable algorithm that handles both numbers and categories like shipping mode or product type. Our model was trained on 8,300+ retail supply chain records.",
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

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
};

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

        <div className="mt-4 space-y-4">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">What it is</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">{mcp.details.overview}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">How we use it</p>
            <p className="mt-1.5 text-sm leading-6 text-slate-600">{mcp.details.description}</p>
          </div>
        </div>

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

export const McpShowcase: React.FC<{ variant?: "standalone" | "embedded" }> = ({
  variant = "standalone",
}) => {
  const [selected, setSelected] = useState<McpInfo | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const [paused, setPaused] = useState(false);

  const goTo = (index: number, dir?: number) => {
    const nextIndex = (index + MCP_ITEMS.length) % MCP_ITEMS.length;
    if (nextIndex === activeIndex) return;
    if (dir !== undefined) {
      setDirection(dir);
    } else {
      const forward = (nextIndex - activeIndex + MCP_ITEMS.length) % MCP_ITEMS.length;
      setDirection(forward <= MCP_ITEMS.length / 2 ? 1 : -1);
    }
    setActiveIndex(nextIndex);
  };

  useEffect(() => {
    if (paused || selected) return;
    const timer = window.setInterval(() => {
      setDirection(1);
      setActiveIndex((i) => (i + 1) % MCP_ITEMS.length);
    }, 3000);
    return () => window.clearInterval(timer);
  }, [paused, selected]);

  const current = MCP_ITEMS[activeIndex];
  const isEmbedded = variant === "embedded";

  const slideContent = (
    <>
      <div className={`relative overflow-hidden ${isEmbedded ? "min-h-[140px]" : "min-h-[88px]"}`}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.button
            key={current.id}
            type="button"
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
            onClick={() => setSelected(current)}
            className={`group flex w-full text-left transition hover:opacity-95 ${
              isEmbedded
                ? "flex-col items-start gap-4 rounded-2xl border border-white/60 bg-white/95 p-6 shadow-lg"
                : "items-center gap-5"
            }`}
          >
            <div className="flex w-full items-start gap-4">
              <div
                className={`flex shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${current.gradient} shadow-lg transition-transform duration-300 group-hover:scale-105 ${
                  isEmbedded ? "h-14 w-14 text-2xl" : "h-16 w-16 text-3xl"
                }`}
              >
                {current.icon}
              </div>
              <div className="min-w-0 flex-1">
                <h3
                  className={`font-bold text-slate-900 ${isEmbedded ? "text-lg" : "text-xl sm:text-2xl"}`}
                >
                  {current.name}
                </h3>
                <p className="mt-1 text-sm font-medium text-indigo-600">{current.tagline}</p>
              </div>
              <span className="hidden shrink-0 text-sm font-semibold text-indigo-500 sm:inline">
                Learn more →
              </span>
            </div>
            <p className={`text-sm leading-6 text-slate-500 ${isEmbedded ? "line-clamp-3" : "line-clamp-2"}`}>
              {current.details.overview}
            </p>
          </motion.button>
        </AnimatePresence>
      </div>

      <div className={`relative flex justify-center ${isEmbedded ? "mt-4" : "mt-5"}`}>
        <div className="flex items-center gap-2">
          {MCP_ITEMS.map((mcp, i) => (
            <button
              key={mcp.id}
              type="button"
              aria-label={`Show ${mcp.name}`}
              onClick={() => goTo(i)}
              className={`h-2 rounded-full transition-all duration-300 ${
                i === activeIndex
                  ? `w-6 ${isEmbedded ? "bg-white" : "bg-indigo-500"}`
                  : `w-2 ${isEmbedded ? "bg-white/40 hover:bg-white/60" : "bg-slate-300 hover:bg-slate-400"}`
              }`}
            />
          ))}
        </div>
      </div>

      <p className={`mt-3 text-xs ${isEmbedded ? "text-indigo-100/80" : "text-slate-400"}`}>
        Click the card to learn what each integration is and how it powers this app
      </p>
    </>
  );

  if (isEmbedded) {
    return (
      <div
        className="flex shrink-0 flex-col"
        aria-label="MCP integrations showcase"
        aria-live="polite"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-100">
          Powered by MCP integrations
        </p>
        <div className="mt-4 flex-1">{slideContent}</div>
        <AnimatePresence>
          {selected && <McpDetailModal mcp={selected} onClose={() => setSelected(null)} />}
        </AnimatePresence>
      </div>
    );
  }

  return (
    <section
      className="w-full"
      aria-label="MCP integrations showcase"
      aria-live="polite"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white/60 bg-white/70 p-8 shadow-2xl shadow-indigo-200/30 backdrop-blur-md">
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-indigo-100/40 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-24 h-32 w-32 rounded-full bg-violet-100/30 blur-2xl" />

        <div className="relative">
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-500">
            Powered by MCP integrations
          </p>
          <div className="mt-4">{slideContent}</div>
        </div>
      </div>

      <AnimatePresence>
        {selected && <McpDetailModal mcp={selected} onClose={() => setSelected(null)} />}
      </AnimatePresence>
    </section>
  );
};

export default McpShowcase;
