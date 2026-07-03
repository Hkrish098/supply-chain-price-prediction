"use client";

import Link from 'next/link';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { deleteHistory, getHistory } from '@/services/api';
import supabase from '@/lib/supabaseClient';
import api from '@/services/api';
import type { PredictionHistoryItem } from '@/types';

const PINNED_KEY = 'scpp_pinned_predictions';

type Props = {
  onClose?: () => void;
  className?: string;
};

function itemKey(item: PredictionHistoryItem): string {
  return item.id || item.timestamp || item.created_at || '';
}

function itemTimestamp(item: PredictionHistoryItem): string {
  return item.timestamp || item.created_at || '';
}

function loadPinned(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem(PINNED_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function savePinned(pinned: Set<string>) {
  localStorage.setItem(PINNED_KEY, JSON.stringify([...pinned]));
}

export const Sidebar: React.FC<Props> = ({ onClose, className }) => {
  const wrapperClass = className ?? 'hidden xl:flex xl:w-[260px] shrink-0';
  const [history, setHistory] = useState<PredictionHistoryItem[]>([]);
  const [pinned, setPinned] = useState<Set<string>>(() => loadPinned());
  const [openMenuKey, setOpenMenuKey] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const fetchHistory = async () => {
    try {
      const items = await getHistory();
      setHistory(items.reverse());
    } catch (error) {
      console.error('Unable to load prediction history', error);
    }
  };

  useEffect(() => {
    fetchHistory();
    const handler = () => fetchHistory();
    window.addEventListener('history-updated', handler);
    return () => window.removeEventListener('history-updated', handler);
  }, []);

  useEffect(() => {
    const setAuthHeader = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const token = data?.session?.access_token;
        setUserEmail(data?.session?.user?.email ?? null);
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        }
      } catch {
        // ignore
      }
    };
    setAuthHeader();
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserEmail(session?.user?.email ?? null);
      if (session?.access_token) {
        api.defaults.headers.common['Authorization'] = `Bearer ${session.access_token}`;
      } else {
        delete api.defaults.headers.common['Authorization'];
      }
    });
    const subscription = (data as { subscription?: { unsubscribe?: () => void } })?.subscription;
    return () => subscription?.unsubscribe?.();
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuKey(null);
      }
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const sortedHistory = [...history].sort((a, b) => {
    const aPinned = pinned.has(itemKey(a));
    const bPinned = pinned.has(itemKey(b));
    if (aPinned && !bPinned) return -1;
    if (!aPinned && bPinned) return 1;
    return itemTimestamp(b).localeCompare(itemTimestamp(a));
  });

  const togglePin = useCallback((key: string) => {
    setPinned((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      savePinned(next);
      return next;
    });
    setOpenMenuKey(null);
  }, []);

  const handleDelete = useCallback(async (item: PredictionHistoryItem) => {
    const key = itemKey(item);
    const deleteId = item.id || encodeURIComponent(itemTimestamp(item));
    try {
      await deleteHistory(deleteId);
      setPinned((prev) => {
        if (!prev.has(key)) return prev;
        const next = new Set(prev);
        next.delete(key);
        savePinned(next);
        return next;
      });
      setHistory((prev) => prev.filter((h) => itemKey(h) !== key));
    } catch (error) {
      console.error('Failed to delete prediction', error);
    }
    setOpenMenuKey(null);
  }, []);

  const handleNewPrediction = () => {
    window.dispatchEvent(new Event('open-prediction-module'));
    window.dispatchEvent(new Event('reset-prediction-form'));
    document.getElementById('predict')?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleReplayIntro = () => {
    window.dispatchEvent(new Event('go-to-landing'));
  };

  const handleHistoryClick = (item: PredictionHistoryItem) => {
    window.dispatchEvent(new Event('open-prediction-module'));
    window.dispatchEvent(
      new CustomEvent('load-prediction', {
        detail: {
          form: item.request,
          predicted_price: item.predicted_unit_price,
        },
      }),
    );
    document.getElementById('predict')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <aside className={wrapperClass}>
      <div className="flex h-full max-h-[calc(100vh-120px)] w-full flex-col rounded-2xl border border-white/60 bg-white/60 shadow-xl shadow-slate-200/30 backdrop-blur-md">
        <div className="flex items-center justify-between px-3 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-600 text-sm text-white">
              📦
            </div>
            <span className="text-sm font-semibold text-slate-800">SC Predictor</span>
          </div>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close sidebar"
              className="rounded-md px-2 py-1 text-slate-500 hover:bg-slate-200/60"
            >
              ✕
            </button>
          )}
        </div>

        <div className="space-y-1 px-3 pb-2">
          <button
            type="button"
            onClick={handleNewPrediction}
            className="flex w-full items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <span className="text-base leading-none">+</span>
            New prediction
          </button>
          <button
            type="button"
            onClick={handleReplayIntro}
            className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-200/50 hover:text-slate-700"
          >
            ↺ See intro again
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-1" ref={menuRef}>
          <p className="px-2 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Recent
          </p>
          {sortedHistory.length === 0 ? (
            <p className="px-2 py-3 text-xs leading-5 text-slate-500">
              No predictions yet. Start a new chat to forecast a price.
            </p>
          ) : (
            <ul className="space-y-0.5">
              {sortedHistory.slice(0, 12).map((item, index) => {
                const key = itemKey(item) || `${index}`;
                const isPinned = pinned.has(key);
                const ts = itemTimestamp(item);

                return (
                  <li key={key} className="relative">
                    <div
                      className={`group flex items-center rounded-lg transition hover:bg-slate-200/50 ${
                        isPinned ? 'bg-indigo-50/60' : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => handleHistoryClick(item)}
                        className="flex min-w-0 flex-1 flex-col px-3 py-2.5 text-left"
                      >
                        <span className="flex items-center gap-1 truncate text-sm text-slate-700 group-hover:text-slate-900">
                          {isPinned && (
                            <span className="shrink-0 text-[10px] text-indigo-500" title="Pinned">
                              📌
                            </span>
                          )}
                          ${item.predicted_unit_price.toFixed(2)} · {item.request.product_category}
                        </span>
                        <span className="mt-0.5 truncate text-[11px] text-slate-400">
                          {item.request.order_priority} priority ·{' '}
                          {ts ? new Date(ts).toLocaleDateString() : '—'}
                        </span>
                      </button>

                      <div className="relative shrink-0 pr-1">
                        <button
                          type="button"
                          aria-label="More options"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenMenuKey(openMenuKey === key ? null : key);
                          }}
                          className="rounded-md px-2 py-1 text-slate-400 opacity-0 transition hover:bg-slate-200/70 hover:text-slate-600 group-hover:opacity-100 data-[open=true]:opacity-100"
                          data-open={openMenuKey === key}
                        >
                          ⋯
                        </button>

                        {openMenuKey === key && (
                          <div className="absolute right-0 top-full z-20 mt-0.5 min-w-[120px] overflow-hidden rounded-lg border border-slate-200/80 bg-white py-1 shadow-lg shadow-slate-200/40">
                            <button
                              type="button"
                              onClick={() => togglePin(key)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-slate-700 hover:bg-slate-50"
                            >
                              {isPinned ? '📌 Unpin' : '📌 Pin'}
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(item)}
                              className="flex w-full items-center gap-2 px-3 py-2 text-left text-xs font-medium text-red-600 hover:bg-red-50"
                            >
                              🗑 Delete
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="border-t border-slate-200/80 p-3">
          {userEmail ? (
            <div className="flex items-center gap-2 rounded-lg px-2 py-2">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-bold text-indigo-700">
                {userEmail[0]?.toUpperCase()}
              </div>
              <span className="truncate text-xs text-slate-600">{userEmail}</span>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex w-full items-center justify-center rounded-xl bg-indigo-600 px-3 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Log in
            </Link>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
