import React, { useState, useEffect } from 'react';
import { Sparkles } from 'lucide-react';

interface AIStreamerProps {
  text: string;
  speed?: number;
}

export const AIStreamer: React.FC<AIStreamerProps> = ({ text, speed = 30 }) => {
  const [displayedText, setDisplayedText] = useState('');
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timeout);
    }
  }, [index, text, speed]);

  return (
    <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
      {displayedText}
      {index < text.length && (
        <span className="inline-block w-2 h-5 bg-primary animate-pulse ml-1 align-middle" />
      )}
    </div>
  );
};

export const AISkeleton = () => (
  <div className="space-y-4 animate-pulse">
    <div className="h-4 bg-card rounded w-3/4" />
    <div className="h-4 bg-card rounded w-1/2" />
    <div className="h-4 bg-card rounded w-5/6" />
    <div className="flex items-center gap-2 mt-4">
      <Sparkles size={16} className="text-primary opacity-50" />
      <span className="text-xs text-gray-500 font-medium">Gemma 3B is thinking…</span>
    </div>
  </div>
);

export const ComparisonView: React.FC<{ before: string; after: string }> = ({ before, after }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    <div className="bg-card/50 border border-border rounded-2xl p-6">
      <h5 className="text-xs font-bold uppercase text-gray-500 mb-4">Original</h5>
      <p className="text-sm text-gray-400 line-through decoration-rose-500/50">{before}</p>
    </div>
    <div className="bg-primary/5 border border-primary/20 rounded-2xl p-6 relative overflow-hidden">
      <div className="absolute top-0 right-0 p-2">
        <Sparkles size={14} className="text-primary" />
      </div>
      <h5 className="text-xs font-bold uppercase text-primary mb-4">AI Optimized</h5>
      <p className="text-sm text-white font-medium">{after}</p>
    </div>
  </div>
);
