"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

type Props = {
  onOpenSidebar?: () => void;
};

export const Navbar: React.FC<Props> = ({ onOpenSidebar }) => {
  return (
    <motion.div
      className="sticky top-0 z-50 w-full border-b border-stone-200 bg-[#faf9f6] py-4 px-4 shadow-sm"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4">
        {/* Left: Logo & Branding */}
        <div className="flex items-center gap-4">
          {/* Hamburger for mobile */}
          <motion.button
            onClick={onOpenSidebar}
            className="-ml-2 mr-1 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-stone-100 text-stone-700 transition hover:bg-stone-200 xl:hidden"
            aria-label="Open sidebar"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" aria-hidden>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </motion.button>

          {/* Logo */}
          <motion.div
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
          >
            <div className="relative h-10 w-10 rounded-xl bg-brand-700 flex items-center justify-center text-white font-bold shadow-sm">
              PI
            </div>
            <div>
              <p className="text-xs uppercase tracking-wider font-semibold text-brand-600">Procurement</p>
              <div className="text-sm font-bold text-stone-900">
                Intelligence Module
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right: Navigation & CTA */}
        <div className="flex items-center gap-4">
          <nav className="hidden items-center gap-6 xl:flex">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('go-to-landing'))}
              className="text-sm font-medium text-stone-600 transition hover:text-brand-600"
            >
              Overview
            </button>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new Event('open-prediction-module'))}
              className="text-sm font-medium text-stone-600 transition hover:text-brand-600"
            >
              Price forecast
            </button>
          </nav>

          <Link href="/login">
            <motion.span
              className="ml-2 inline-block cursor-pointer rounded-lg bg-brand-700 hover:bg-brand-800 px-5 py-2 text-sm font-semibold text-white shadow-sm transition"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.span>
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default Navbar;
