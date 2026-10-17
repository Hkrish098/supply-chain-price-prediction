"use client";
import { motion } from 'framer-motion';
import PredictionWorkspace from '@/components/PredictionWorkspace';

export default function DashboardPage() {
  return (
    <motion.main
      className="w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="w-full max-w-[1600px]">
        <PredictionWorkspace />
      </div>
    </motion.main>
  );
}
