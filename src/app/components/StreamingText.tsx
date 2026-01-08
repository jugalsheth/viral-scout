'use client';

import { motion } from 'framer-motion';

interface StreamingTextProps {
  text: string;
  className?: string;
  isStreaming?: boolean;
}

export default function StreamingText({ text, className = '', isStreaming = false }: StreamingTextProps) {
  return (
    <div className={className}>
      {text}
      {isStreaming && (
        <motion.span
          className="inline-block ml-1 w-2 h-5 bg-gradient-to-b from-purple-500 to-blue-500 rounded"
          animate={{
            opacity: [1, 0.3, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      )}
    </div>
  );
}

