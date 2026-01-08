'use client';

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
        <span className="animate-pulse ml-1">▊</span>
      )}
    </div>
  );
}

