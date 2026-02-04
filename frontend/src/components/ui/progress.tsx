import React from 'react';

type ProgressLevel = 'high' | 'medium' | 'low';

interface ProgressProps {
  value: number;
  label?: string;
  showPercentage?: boolean;
  level?: ProgressLevel;
  className?: string;
}

const levelStyles: Record<ProgressLevel, { bar: string; text: string }> = {
  high: {
    bar: 'bg-green-500 dark:bg-green-400',
    text: 'text-green-600 dark:text-green-400',
  },
  medium: {
    bar: 'bg-amber-500 dark:bg-amber-400',
    text: 'text-amber-600 dark:text-amber-400',
  },
  low: {
    bar: 'bg-red-500 dark:bg-red-400',
    text: 'text-red-600 dark:text-red-400',
  },
};

function getLevel(value: number): ProgressLevel {
  if (value >= 70) return 'high';
  if (value >= 40) return 'medium';
  return 'low';
}

function getLevelLabel(level: ProgressLevel): string {
  switch (level) {
    case 'high':
      return 'High Confidence';
    case 'medium':
      return 'Medium Confidence';
    case 'low':
      return 'Low Confidence';
  }
}

export function Progress({
  value,
  label,
  showPercentage = true,
  level,
  className = '',
}: ProgressProps) {
  const computedLevel = level ?? getLevel(value);
  const styles = levelStyles[computedLevel];
  const displayLabel = label ?? getLevelLabel(computedLevel);

  return (
    <div className={`w-full ${className}`}>
      {(displayLabel || showPercentage) && (
        <div className="flex items-center justify-between mb-1">
          {displayLabel && (
            <span className={`text-xs font-medium ${styles.text}`}>{displayLabel}</span>
          )}
          {showPercentage && (
            <span className={`text-xs font-medium ${styles.text}`}>{value}%</span>
          )}
        </div>
      )}
      <div className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded">
        <div
          className={`h-full rounded transition-all duration-300 ${styles.bar}`}
          style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
        />
      </div>
    </div>
  );
}
