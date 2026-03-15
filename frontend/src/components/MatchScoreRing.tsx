import React, { useEffect, useState } from 'react';

interface MatchScoreRingProps {
  score: number;     // 0–100
  size?: number;
  strokeWidth?: number;
  label?: string;
  sublabel?: string;
  animate?: boolean;
}

const getColor = (score: number) => {
  if (score >= 80) return { stroke: '#22c55e', glow: 'rgba(34,197,94,0.35)', text: 'text-emerald-400' };
  if (score >= 60) return { stroke: '#f59e0b', glow: 'rgba(245,158,11,0.35)', text: 'text-amber-400' };
  if (score >= 40) return { stroke: '#f97316', glow: 'rgba(249,115,22,0.35)', text: 'text-orange-400' };
  return { stroke: '#ef4444', glow: 'rgba(239,68,68,0.35)', text: 'text-rose-400' };
};

const getVerdict = (score: number) => {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good fit';
  if (score >= 40) return 'Fair match';
  return 'Needs work';
};

const MatchScoreRing: React.FC<MatchScoreRingProps> = ({
  score,
  size = 140,
  strokeWidth = 10,
  label = 'Match Score',
  sublabel,
  animate = true,
}) => {
  const [displayed, setDisplayed] = useState(animate ? 0 : score);

  // Count-up animation
  useEffect(() => {
    if (!animate) { setDisplayed(score); return; }
    setDisplayed(0);
    let start: number | null = null;
    const duration = 1200;
    const step = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayed(Math.round(eased * score));
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [score, animate]);

  const center = size / 2;
  const radius = center - strokeWidth / 2 - 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (displayed / 100) * circumference;
  const colors = getColor(displayed);

  return (
    <div className="relative inline-flex flex-col items-center gap-3">
      {/* SVG ring */}
      <div className="relative" style={{ width: size, height: size }}>
        {/* Glow halo behind the ring */}
        <div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle, ${colors.glow} 0%, transparent 70%)`,
            transform: 'scale(1.15)',
          }}
        />
        <svg width={size} height={size} className="transform -rotate-90 drop-shadow-lg">
          {/* Track */}
          <circle
            cx={center} cy={center} r={radius}
            stroke="#27272a" strokeWidth={strokeWidth} fill="transparent"
          />
          {/* Glow filter */}
          <defs>
            <filter id={`glow-${label.replace(/\s/g, '')}`} x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Progress arc */}
          <circle
            cx={center} cy={center} r={radius}
            stroke={colors.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
            filter={`url(#glow-${label.replace(/\s/g, '')})`}
            style={{ transition: 'stroke-dashoffset 0.05s linear' }}
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-extrabold leading-none ${colors.text}`} style={{ fontSize: size * 0.22 }}>
            {displayed}%
          </span>
          <span className="text-gray-500 font-medium mt-1" style={{ fontSize: size * 0.09 }}>
            {getVerdict(displayed)}
          </span>
        </div>
      </div>
      {/* Label */}
      <div className="text-center">
        <p className="font-bold text-white text-sm">{label}</p>
        {sublabel && <p className="text-xs text-gray-500 mt-0.5">{sublabel}</p>}
      </div>
    </div>
  );
};

export default MatchScoreRing;
