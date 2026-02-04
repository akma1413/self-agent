import React from 'react';

interface MetricCardProps {
  number: string;
  label: string;
  value: string | number;
  trend?: {
    value: string;
    direction: 'up' | 'down' | 'neutral';
  };
  className?: string;
}

const trendStyles = {
  up: 'text-green-600 dark:text-green-400',
  down: 'text-red-600 dark:text-red-400',
  neutral: 'text-slate-500 dark:text-slate-400',
};

const trendIcons = {
  up: '↑',
  down: '↓',
  neutral: '→',
};

export function MetricCard({ number, label, value, trend, className = '' }: MetricCardProps) {
  return (
    <div
      className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-6 ${className}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 tracking-wider">
          {number}
        </span>
        <span className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
          {label}
        </span>
      </div>
      <div className="flex items-baseline gap-3">
        <span className="text-4xl font-semibold text-slate-900 dark:text-slate-50 font-serif">
          {value}
        </span>
        {trend && (
          <span className={`text-sm font-medium ${trendStyles[trend.direction]}`}>
            {trendIcons[trend.direction]} {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}
