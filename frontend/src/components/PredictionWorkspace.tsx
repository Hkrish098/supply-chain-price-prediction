"use client";

import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import OnboardingChat from '@/components/OnboardingChat';
import PredictForm from '@/components/PredictForm';
import SiteFooter from '@/components/SiteFooter';

type View = 'landing' | 'prediction';

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] as const } },
};

const ModuleCard = ({
  title,
  description,
  icon,
  badge,
  enabled,
  blockedMessage,
  onOpen,
}: {
  title: string;
  description: string;
  icon: string;
  badge?: string;
  enabled: boolean;
  blockedMessage: string;
  onOpen: () => void;
}) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const dialogId = useId();

  return (
    <>
      <motion.button
        type="button"
        variants={fadeUp}
        aria-haspopup={!enabled ? 'dialog' : undefined}
        onClick={() => {
          if (enabled) onOpen();
          else dialogRef.current?.showModal();
        }}
        className={`group relative flex w-full flex-col rounded-2xl border p-6 text-left transition-all duration-300 ${
          enabled
            ? 'border-stone-200 bg-white shadow-sm hover:border-brand-300/60 hover:bg-white'
            : 'cursor-pointer border-stone-200/60 bg-white hover:border-brand-300 focus-visible:border-brand-300'
        }`}
        whileHover={enabled ? { y: -5, scale: 1.01 } : undefined}
        whileTap={enabled   ? { scale: 0.98 }         : undefined}
      >
        {badge && (
          <span className="absolute right-4 top-4 rounded-full border border-stone-200/60 bg-white px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-400">
            {badge}
          </span>
        )}
        <div
          className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl text-white shadow-sm transition-transform duration-300 ${
            enabled
              ? 'bg-brand-700 group-hover:scale-110'
              : 'bg-stone-300'
          }`}
        >
          {icon}
        </div>

        <h3 className="mt-4 text-base font-bold tracking-tight text-stone-900">{title}</h3>
        <p className="mt-1.5 text-sm leading-6 text-stone-500">{description}</p>

        {enabled && (
          <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-brand-600 group-hover:text-brand-700">
            Open forecast <span aria-hidden="true">→</span>
          </span>
        )}
      </motion.button>
      <dialog
        ref={dialogRef}
        aria-labelledby={`${dialogId}-title`}
        aria-describedby={`${dialogId}-message`}
        className="fixed inset-0 m-auto w-[calc(100%_-_2rem)] max-w-sm rounded-2xl border border-stone-200 bg-white p-6 text-stone-900 shadow-xl backdrop:bg-stone-900/30"
        onClick={(event) => {
          if (event.target === event.currentTarget) dialogRef.current?.close();
        }}
      >
        <h2 id={`${dialogId}-title`} className="text-lg font-bold">Before you continue</h2>
        <p id={`${dialogId}-message`} className="mt-3 text-sm leading-6 text-stone-600">{blockedMessage}</p>
        <button
          type="button"
          autoFocus
          onClick={() => dialogRef.current?.close()}
          className="mt-5 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-800"
        >
          Got it
        </button>
      </dialog>
    </>
  );
};

export const PredictionWorkspace: React.FC = () => {
  const [view, setView] = useState<View>('landing');
  const [introComplete, setIntroComplete] = useState(false);
  const [introKey, setIntroKey] = useState(0);

  const openPredictionModule = useCallback(() => {
    setView('prediction');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const goToLanding = useCallback(() => {
    setView('landing');
    setIntroComplete(false);
    setIntroKey((k) => k + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  useEffect(() => {
    // Open the workspace at its heading, including when reloading a scrolled page.
    const previousRestoration = window.history.scrollRestoration;
    window.history.scrollRestoration = 'manual';
    window.scrollTo({ top: 0, behavior: 'instant' });
    return () => { window.history.scrollRestoration = previousRestoration; };
  }, []);

  useEffect(() => {
    const onOpen  = () => { if (introComplete) openPredictionModule(); else goToLanding(); };
    const onReplay = () => goToLanding();

    window.addEventListener('open-prediction-module', onOpen);
    window.addEventListener('replay-intro', onReplay);
    window.addEventListener('go-to-landing', onReplay);
    return () => {
      window.removeEventListener('open-prediction-module', onOpen);
      window.removeEventListener('replay-intro', onReplay);
      window.removeEventListener('go-to-landing', onReplay);
    };
  }, [goToLanding, introComplete, openPredictionModule]);

  return (
    <div id="dashboard" className="w-full">
      <AnimatePresence mode="wait">

        {view === 'landing' ? (
          <motion.div
            key="landing"
            variants={stagger}
            initial="hidden"
            animate="show"
            exit={{ opacity: 0, y: -16, transition: { duration: 0.25 } }}
            className="mx-auto max-w-5xl space-y-7"
          >
            {/* Hero heading */}
            <motion.div variants={fadeUp} className="border-b border-stone-200 pb-6">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-brand-200/60 bg-brand-50/80 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-600">
                <span className="h-1.5 w-1.5 rounded-full bg-brand-500" />
                Purchasing workspace
              </span>
              <h1 className="mt-4 text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl lg:text-[2.5rem]">
                Procurement{' '}
                <span className="text-brand-800">
                  Intelligence Module
                </span>
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-stone-500">
                Plan purchases with clearer pricing. Get a unit price estimate, check market conditions, and review recommendations for your next order.
              </p>
            </motion.div>

            {/* Intro conversation */}
            <motion.section variants={fadeUp}>
              <p className="mb-2.5 text-[11px] font-bold uppercase tracking-[0.15em] text-stone-400">Step 1 · Quick intro</p>
              <div className="rounded-2xl border border-stone-200 bg-white shadow-sm">
                <OnboardingChat key={introKey} onComplete={() => setIntroComplete(true)} />
              </div>
            </motion.section>

            {/* Module cards */}
            <motion.section variants={stagger}>
              <motion.p variants={fadeUp} className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-stone-400">
                Step 2 · Choose a module
              </motion.p>
              <div className="grid gap-4 sm:grid-cols-2">
                <ModuleCard
                  icon="⚡"
                  title="Price Prediction"
                  description="Enter order details to get a unit price forecast and AI-powered expert suggestions based on live data."
                  enabled={introComplete}
                  blockedMessage="Just answer the question above to continue."
                  onOpen={openPredictionModule}
                />
                <ModuleCard
                  icon="📊"
                  title="Market Insights"
                  description="Historical trends, category benchmarks, and weather-informed analytics — coming in the next release."
                  badge="Soon"
                  enabled={false}
                  blockedMessage={introComplete ? 'Market Insights is coming soon.' : 'Just answer the question above to continue.'}
                  onOpen={() => undefined}
                />
              </div>
            </motion.section>

            <SiteFooter />
          </motion.div>

        ) : (
          <motion.div
            key="prediction"
            className="mx-auto w-full"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16, transition: { duration: 0.25 } }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] as const }}
          >
            <PredictForm onBack={goToLanding} onGettingStarted={goToLanding} />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
};

export default PredictionWorkspace;
