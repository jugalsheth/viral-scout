'use client';

interface ThinkingDisplayProps {
  steps: string[];
}

export default function ThinkingDisplay({ steps }: ThinkingDisplayProps) {
  if (steps.length === 0) return null;

  return (
    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
        Agent Reasoning:
      </h3>
      <ul className="space-y-1">
        {steps.map((step, index) => (
          <li key={index} className="text-sm text-blue-800 dark:text-blue-200 flex items-start">
            <span className="text-blue-500 mr-2">•</span>
            <span>{step}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

