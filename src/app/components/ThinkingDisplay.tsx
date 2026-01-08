'use client';

import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

interface ThinkingDisplayProps {
  steps: string[];
}

export default function ThinkingDisplay({ steps }: ThinkingDisplayProps) {
  const [visibleSteps, setVisibleSteps] = useState<string[]>([]);

  useEffect(() => {
    setVisibleSteps([]);
    steps.forEach((step, index) => {
      setTimeout(() => {
        setVisibleSteps((prev) => [...prev, step]);
      }, index * 200);
    });
  }, [steps]);

  if (steps.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 rounded-lg p-4 mb-4"
    >
      <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
        <span className="text-lg">🧠</span>
        <span>Agent Reasoning:</span>
      </h3>
      <ul className="space-y-2">
        {visibleSteps.map((step, index) => (
          <motion.li
            key={index}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="text-sm text-blue-800 dark:text-blue-200 flex items-start"
          >
            <motion.span
              className="text-blue-500 mr-2 text-lg"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              •
            </motion.span>
            <span>{step}</span>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );
}

