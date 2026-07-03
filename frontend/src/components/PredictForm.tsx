"use client";
import React, { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { predict, getExpertSuggestions } from '@/services/api';
import type { PredictRequest } from '@/types';
import McpShowcase from '@/components/McpShowcase';

const PredictionSkeleton = () => (
  <motion.div
    className="mt-10 rounded-2xl border border-indigo-200/50 bg-gradient-to-br from-indigo-50/80 to-violet-50/80 backdrop-blur-sm px-8 py-8 shadow-lg shadow-indigo-200/20"
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4 }}
  >
    <p className="text-xs uppercase tracking-widest font-semibold text-indigo-700">Prediction Result</p>
    <div className="mt-4 h-16 w-48 animate-pulse rounded-lg bg-gradient-to-r from-indigo-200 via-indigo-100 to-indigo-200 bg-[length:200%_100%]" style={{ animation: 'shimmer 2s infinite' }} />
    <div className="mt-3 h-12 w-full max-w-xs animate-pulse rounded-lg bg-gradient-to-r from-indigo-200 via-indigo-100 to-indigo-200 bg-[length:200%_100%]" style={{ animation: 'shimmer 2s infinite' }} />
  </motion.div>
);

// Skeleton component for suggestions cards
const SuggestionCardSkeleton = () => (
  <motion.div
    className="rounded-2xl border border-slate-200/50 bg-white/50 backdrop-blur-sm shadow-lg shadow-slate-200/10"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.3 }}
  >
    <div className="px-6 py-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="h-4 w-40 animate-pulse rounded-lg bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]" style={{ animation: 'shimmer 2s infinite' }} />
          <div className="flex flex-wrap gap-2">
            <div className="h-6 w-16 animate-pulse rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]" style={{ animation: 'shimmer 2s infinite' }} />
            <div className="h-6 w-20 animate-pulse rounded-full bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]" style={{ animation: 'shimmer 2s infinite' }} />
          </div>
        </div>
        <div className="h-6 w-6 animate-pulse rounded bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%]" style={{ animation: 'shimmer 2s infinite' }} />
      </div>
    </div>
  </motion.div>
);

const SuggestionsSkeleton = () => (
  <div className="space-y-4">
    {Array.from({ length: 3 }).map((_, i) => (
      <motion.div
        key={i}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.1 }}
      >
        <SuggestionCardSkeleton />
      </motion.div>
    ))}
  </div>
);

// Suggestion Card Component
interface SuggestionItem {
  raw: string;
  title: string;
  detail: string;
  sourceTags: string[];
}

interface SuggestionCardProps {
  item: SuggestionItem;
  index: number;
  isExpanded: boolean;
  onToggle: () => void;
  getTagColorClasses: (tag: string) => string;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  item,
  index,
  isExpanded,
  onToggle,
  getTagColorClasses,
}) => (
  <motion.div
    className="rounded-2xl border border-slate-200/50 bg-white/70 backdrop-blur-sm shadow-lg shadow-slate-200/10 overflow-hidden transition hover:shadow-lg hover:shadow-slate-300/20"
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.08 }}
    whileHover={{ y: -2 }}
  >
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isExpanded}
      className="w-full px-4 py-3.5 text-left"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <p className="text-sm font-bold leading-snug text-slate-900">{item.title}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {item.sourceTags.map((tag) => (
              <motion.span
                key={tag}
                className={`rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${getTagColorClasses(tag)}`}
                whileHover={{ scale: 1.08 }}
                transition={{ type: 'spring', stiffness: 400, damping: 10 }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
        </div>
        <motion.span
          className="text-lg text-indigo-500 font-bold"
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ⌄
        </motion.span>
      </div>
    </button>

    <AnimatePresence>
      {isExpanded && item.detail && (
        <motion.div
          className="border-t border-slate-200/50 bg-gradient-to-br from-slate-50/50 to-indigo-50/30 px-4 py-3.5"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          <p className="text-sm leading-6 text-slate-700">{item.detail}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

const categories = ['Office Supplies', 'Technology', 'Furniture'] as const;
const shipModes = ['Regular Air', 'Delivery Truck', 'Express Air'] as const;
const orderPriorities = ['Low', 'Medium', 'High', 'Critical'] as const;
const months = [
  { value: 1, label: 'Jan' },
  { value: 2, label: 'Feb' },
  { value: 3, label: 'Mar' },
  { value: 4, label: 'Apr' },
  { value: 5, label: 'May' },
  { value: 6, label: 'Jun' },
  { value: 7, label: 'Jul' },
  { value: 8, label: 'Aug' },
  { value: 9, label: 'Sep' },
  { value: 10, label: 'Oct' },
  { value: 11, label: 'Nov' },
  { value: 12, label: 'Dec' },
] as const;

type PredictFormState = {
  order_quantity: string;
  discount: string;
  shipping_cost: string;
  product_base_margin: string;
  product_category: (typeof categories)[number];
  month: number;
  ship_mode: (typeof shipModes)[number];
  order_priority: (typeof orderPriorities)[number];
};

export const PredictForm: React.FC<{
  onBack?: () => void;
  onGettingStarted?: () => void;
}> = ({ onBack, onGettingStarted }) => {
  const [form, setForm] = useState<PredictFormState>({
    order_quantity: '',
    discount: '',
    shipping_cost: '',
    product_base_margin: '',
    product_category: 'Office Supplies',
    month: 1,
    ship_mode: 'Regular Air',
    order_priority: 'Medium',
  });
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expertOpen, setExpertOpen] = useState(false);
  const [expertLoading, setExpertLoading] = useState(false);
  const [expertResult, setExpertResult] = useState<{ message: string; suggestions: string[]; summary?: string } | null>(null);
  const [expertError, setExpertError] = useState<string | null>(null);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const resetForm = () => {
    setForm({
      order_quantity: '',
      discount: '',
      shipping_cost: '',
      product_base_margin: '',
      product_category: 'Office Supplies',
      month: 1,
      ship_mode: 'Regular Air',
      order_priority: 'Medium',
    });
    setPrediction(null);
    setError(null);
    setExpertOpen(false);
    setExpertError(null);
    setExpertResult(null);
  };

  const handleChange = <K extends keyof PredictFormState>(key: K, value: PredictFormState[K]) => {
    setForm((s) => ({ ...s, [key]: value }));
  };

  useEffect(() => {
    const resetHandler = () => resetForm();
    window.addEventListener('reset-prediction-form', resetHandler);
    return () => window.removeEventListener('reset-prediction-form', resetHandler);
  }, []);

  const buildPayload = (): PredictRequest => ({
    order_quantity: Number(form.order_quantity),
    discount: Number(form.discount),
    shipping_cost: Number(form.shipping_cost),
    product_base_margin: Number(form.product_base_margin),
    product_category: form.product_category,
    month: form.month,
    ship_mode: form.ship_mode,
    order_priority: form.order_priority,
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPrediction(null);
    setExpertError(null);
    setExpertResult(null);
    setExpertOpen(false);

    const payload = buildPayload();

    if (
      Number.isNaN(payload.order_quantity) ||
      Number.isNaN(payload.discount) ||
      Number.isNaN(payload.shipping_cost) ||
      Number.isNaN(payload.product_base_margin) ||
      payload.order_quantity < 1
    ) {
      setError('Please enter valid numeric values for quantity, discount, shipping cost, and margin.');
      setLoading(false);
      return;
    }

    try {
      const res = await predict(payload);
      setPrediction(res.predicted_unit_price);
      window.dispatchEvent(new Event('history-updated'));
    } catch (err: any) {
      console.error('predict failed', err);
      setError(err?.message || 'Prediction failed');
    } finally {
      setLoading(false);
    }
  };

  const loadExpertSuggestions = async () => {
    if (prediction === null) {
      setExpertError('Generate a prediction first to get expert suggestions.');
      return;
    }

    setExpertLoading(true);
    setExpertError(null);
    setExpandedIndex(null);

    try {
      const payload = {
        ...buildPayload(),
        predicted_price: prediction,
      };
      const res = await getExpertSuggestions(payload);
      setExpertResult(res);
      setExpertOpen(true);
    } catch (err: any) {
      console.error('expert suggestions failed', err);
      setExpertError(err?.message || 'Unable to load expert suggestions.');
    } finally {
      setExpertLoading(false);
    }
  };

  const getTagColorClasses = (tag: string): string => {
    const normalizedTag = tag.toLowerCase().trim();
    if (normalizedTag === 'news') return 'border-red-300/50 bg-red-100/60 text-red-700 font-semibold';
    if (normalizedTag === 'weather') return 'border-blue-300/50 bg-blue-100/60 text-blue-700 font-semibold';
    if (normalizedTag === 'finance') return 'border-green-300/50 bg-green-100/60 text-green-700 font-semibold';
    if (normalizedTag === 'internal') return 'border-slate-300/50 bg-slate-100/60 text-slate-700 font-semibold';
    return 'border-slate-300/50 bg-slate-100/60 text-slate-700 font-semibold';
  };

  useEffect(() => {
    const handleLoadPrediction = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.form && detail?.predicted_price) {
        setForm({
          order_quantity: String(detail.form.order_quantity),
          discount: String(detail.form.discount),
          shipping_cost: String(detail.form.shipping_cost),
          product_base_margin: String(detail.form.product_base_margin),
          product_category: detail.form.product_category,
          month: detail.form.month,
          ship_mode: detail.form.ship_mode,
          order_priority: detail.form.order_priority,
        });
        setPrediction(detail.predicted_price);
        setExpertOpen(false);
        setExpertResult(null);
      }
    };
    window.addEventListener('load-prediction', handleLoadPrediction);
    return () => window.removeEventListener('load-prediction', handleLoadPrediction);
  }, []);

  const suggestionItems = useMemo(() => {
    if (!expertResult) return [];

    return expertResult.suggestions.slice(0, 5).map((raw) => {
      const tagMatch = raw.match(/\[([^\]]+)\]$/);
      const sourceTags = tagMatch ? tagMatch[1].split(',').map((tag) => tag.trim()) : [];
      let text = raw.replace(/\[([^\]]+)\]$/, '').trim();
      text = text.replace(/^Suggestion\s*\d+\s*:\s*/i, '').trim();

      let title = '';
      let detail = text;
      const boldTitleMatch = text.match(/^\*\*(.+?)\*\*\s*[:\-–—]?\s*/);
      if (boldTitleMatch) {
        title = boldTitleMatch[1].trim();
        detail = text.slice(boldTitleMatch[0].length).trim();
      } else {
        const sentenceEnd = text.search(/\.|\n/);
        if (sentenceEnd > 0 && sentenceEnd < 120) {
          title = text.slice(0, sentenceEnd + 1).trim();
          detail = text.slice(sentenceEnd + 1).trim();
        } else {
          title = text;
          detail = '';
        }
      }

      if (!detail) {
        detail = title;
      }

      return {
        raw,
        title,
        detail,
        sourceTags,
      };
    });
  }, [expertResult]);

  return (
    <div id="predict" className="mx-auto w-full space-y-8">
      {/* Hero: consolidated prediction + integrations */}
      <motion.div
        className="relative w-full overflow-hidden rounded-2xl border border-white/20 bg-gradient-to-r from-indigo-600 via-violet-600 to-indigo-700 p-8 shadow-2xl shadow-indigo-600/30"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="pointer-events-none absolute -right-12 -top-12 h-48 w-48 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-8 left-24 h-32 w-32 rounded-full bg-violet-400/20 blur-2xl" />

        <div className="relative">
          {onBack && (
            <div className="mb-6 flex justify-end">
              <button
                type="button"
                onClick={onBack}
                className="shrink-0 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                ← Back to home
              </button>
            </div>
          )}

          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-indigo-200">Active module</p>
          <h1 className="mt-2 text-2xl font-bold text-white sm:text-3xl">
            AI Integration &amp; Prediction Module
          </h1>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-indigo-100/90">
            Forecast unit prices from order parameters and get AI-powered expert suggestions with live market context.
          </p>

          <div className="mt-8 grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-stretch">
            {/* Left: Quick Predict form */}
            <div className="rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm sm:p-8">
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-indigo-100">Quick Predict</p>
              <h2 className="mt-1.5 text-lg font-bold text-white">Enter order details</h2>

              <form onSubmit={submit} className="mt-6">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="flex flex-col">
                    <label className="mb-2 block text-xs font-semibold text-indigo-100">Order Quantity</label>
                    <input
                      type="number"
                      min={1}
                      value={form.order_quantity}
                      placeholder="e.g. 12"
                      onChange={(e) => handleChange('order_quantity', e.target.value)}
                      className="w-full rounded-xl border border-white/30 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-2 block text-xs font-semibold text-indigo-100">Discount Rate</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.discount}
                      placeholder="e.g. 0.05"
                      onChange={(e) => handleChange('discount', e.target.value)}
                      className="w-full rounded-xl border border-white/30 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-2 block text-xs font-semibold text-indigo-100">Shipping Cost</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.shipping_cost}
                      placeholder="e.g. 35"
                      onChange={(e) => handleChange('shipping_cost', e.target.value)}
                      className="w-full rounded-xl border border-white/30 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-2 block text-xs font-semibold text-indigo-100">Product Margin</label>
                    <input
                      type="number"
                      step="0.01"
                      value={form.product_base_margin}
                      placeholder="e.g. 0.50"
                      onChange={(e) => handleChange('product_base_margin', e.target.value)}
                      className="w-full rounded-xl border border-white/30 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-2 block text-xs font-semibold text-indigo-100">Category</label>
                    <select
                      value={form.product_category}
                      onChange={(e) => handleChange('product_category', e.target.value as PredictFormState['product_category'])}
                      className="w-full rounded-xl border border-white/30 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      {categories.map((category) => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-2 block text-xs font-semibold text-indigo-100">Month</label>
                    <select
                      value={form.month}
                      onChange={(e) => handleChange('month', Number(e.target.value))}
                      className="w-full rounded-xl border border-white/30 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      {months.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-2 block text-xs font-semibold text-indigo-100">Shipping Mode</label>
                    <select
                      value={form.ship_mode}
                      onChange={(e) => handleChange('ship_mode', e.target.value as PredictFormState['ship_mode'])}
                      className="w-full rounded-xl border border-white/30 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      {shipModes.map((mode) => (
                        <option key={mode} value={mode}>
                          {mode}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex flex-col">
                    <label className="mb-2 block text-xs font-semibold text-indigo-100">Order Priority</label>
                    <select
                      value={form.order_priority}
                      onChange={(e) => handleChange('order_priority', e.target.value as PredictFormState['order_priority'])}
                      className="w-full rounded-xl border border-white/30 bg-white px-4 py-2.5 text-sm text-slate-900 transition focus:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-200"
                    >
                      {orderPriorities.map((priority) => (
                        <option key={priority} value={priority}>
                          {priority}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 border-t border-white/20 pt-6 sm:flex-row sm:items-center">
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-indigo-700 shadow-lg transition hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <motion.span
                          className="mr-2 inline-block"
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1 }}
                        >
                          ⚡
                        </motion.span>
                        Predicting…
                      </>
                    ) : (
                      '⚡ Generate Prediction'
                    )}
                  </button>

                  {prediction !== null && (
                    <button
                      type="button"
                      onClick={loadExpertSuggestions}
                      disabled={expertLoading}
                      className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {expertLoading ? '🤖 Expert Advice…' : '🤖 Get Expert Suggestions'}
                    </button>
                  )}
                </div>

                <AnimatePresence>
                  {error && (
                    <motion.div
                      className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                    >
                      {error}
                    </motion.div>
                  )}
                </AnimatePresence>
              </form>

              <AnimatePresence>
                {loading && (
                  <div className="mt-6">
                    <PredictionSkeleton />
                  </div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {!loading && prediction !== null && (
                  <motion.div
                    className="mt-6"
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 12 }}
                  >
                    <div className="rounded-2xl border border-white/30 bg-white/95 p-6 shadow-lg">
                      <p className="text-xs font-bold uppercase tracking-widest text-indigo-700">Predicted Unit Price</p>
                      <p className="mt-3 text-5xl font-bold text-slate-900">${prediction.toFixed(2)}</p>
                      <p className="mt-3 text-sm leading-6 text-slate-600">
                        Based on your inputs. Expert suggestions appear on the right.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Right: MCP carousel + Expert Suggestions */}
            <div className="flex min-h-0 flex-col gap-5 lg:h-full">
              <McpShowcase variant="embedded" />

              <div className="flex min-h-0 flex-1 flex-col rounded-2xl border border-white/20 bg-white/10 p-5 backdrop-blur-sm sm:p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-sm text-white shadow-sm">
                    🤖
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-indigo-100">
                      Insights Zone
                    </p>
                    <h3 className="text-base font-bold text-white">Expert Suggestions</h3>
                  </div>
                </div>

                <div className="mt-4 min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                  {expertLoading && <SuggestionsSkeleton />}

                  <AnimatePresence>
                    {expertError && (
                      <motion.div
                        className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                      >
                        {expertError}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!expertOpen && prediction === null && !expertLoading && (
                    <div className="rounded-xl border border-white/30 bg-white/90 p-4 text-sm text-slate-600">
                      Generate a prediction first to see expert suggestions.
                    </div>
                  )}

                  {!expertOpen && prediction !== null && !expertLoading && !expertResult && (
                    <div className="rounded-xl border border-white/30 bg-white/90 p-4 text-sm text-slate-700">
                      Click &quot;Get Expert Suggestions&quot; in the form to load AI-driven insights here.
                    </div>
                  )}

                  {!expertLoading && expertResult && (
                    <AnimatePresence mode="wait">
                      {expertResult.message && (
                        <motion.div
                          key="expert-message"
                          className="rounded-xl border border-white/40 bg-white/95 px-4 py-4 text-sm leading-6 text-slate-700 shadow-sm"
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                        >
                          {expertResult.message}
                        </motion.div>
                      )}

                      <motion.div
                        key="suggestions-list"
                        className="space-y-2"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {suggestionItems.map((item, index) => (
                          <SuggestionCard
                            key={`suggestion-${index}-${item.title}`}
                            item={item}
                            index={index}
                            isExpanded={expandedIndex === index}
                            onToggle={() =>
                              setExpandedIndex(expandedIndex === index ? null : index)
                            }
                            getTagColorClasses={getTagColorClasses}
                          />
                        ))}
                      </motion.div>

                      {expertResult.summary && (
                        <motion.div
                          key="expert-summary"
                          className="rounded-xl border border-white/40 bg-white/95 px-4 py-4 text-sm text-slate-700 shadow-sm"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                        >
                          <p className="font-bold text-slate-900">Quick Summary</p>
                          <p className="mt-2">{expertResult.summary}</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Getting Started */}
      <motion.section
        className="w-full rounded-2xl border border-white/60 bg-white/70 p-8 shadow-xl shadow-indigo-100/30 backdrop-blur-md"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.15 }}
      >
        <h3 className="text-xl font-bold text-slate-900">Getting Started</h3>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-600">
          This guide will help you get the most out of the Supply Chain Price Predictor. Complete the
          quick intro on the home page, enter your order details above, and generate a forecast with
          AI-powered expert suggestions backed by live weather, news, and market data.
        </p>
        <button
          type="button"
          onClick={onGettingStarted}
          className="mt-6 inline-flex items-center justify-center rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-500/30 transition hover:shadow-indigo-500/50"
        >
          Getting Started
        </button>
        <p className="mt-4 text-xs text-slate-400">
          Returns you to the home intro so you can replay the walkthrough anytime.
        </p>
      </motion.section>
    </div>
  );
};

export default PredictForm;
