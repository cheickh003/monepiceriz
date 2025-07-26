import React from 'react';
import { cn } from '@/lib/utils';

interface ProgressProps {
  value: number;
  max?: number;
  className?: string;
  showPercentage?: boolean;
  label?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'success' | 'warning' | 'error';
}

const sizeClasses = {
  sm: 'h-2',
  md: 'h-3',
  lg: 'h-4',
};

const variantClasses = {
  default: 'bg-green-600',
  success: 'bg-green-500',
  warning: 'bg-yellow-500',
  error: 'bg-red-500',
};

export function Progress({
  value,
  max = 100,
  className,
  showPercentage = false,
  label,
  size = 'md',
  variant = 'default',
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={cn('w-full', className)}>
      {(label || showPercentage) && (
        <div className="flex justify-between items-center mb-2">
          {label && <span className="text-sm font-medium text-gray-700">{label}</span>}
          {showPercentage && (
            <span className="text-sm text-gray-500">{Math.round(percentage)}%</span>
          )}
        </div>
      )}
      <div className={cn(
        'w-full bg-gray-200 rounded-full overflow-hidden',
        sizeClasses[size]
      )}>
        <div
          className={cn(
            'h-full transition-all duration-300 ease-in-out rounded-full',
            variantClasses[variant]
          )}
          style={{ width: `${percentage}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>
    </div>
  );
}

interface MultiProgressProps {
  items: Array<{
    id: string;
    label: string;
    value: number;
    max?: number;
    variant?: 'default' | 'success' | 'warning' | 'error';
  }>;
  className?: string;
}

export function MultiProgress({ items, className }: MultiProgressProps) {
  return (
    <div className={cn('space-y-3', className)}>
      {items.map((item) => (
        <Progress
          key={item.id}
          value={item.value}
          max={item.max}
          label={item.label}
          variant={item.variant}
          showPercentage
          size="sm"
        />
      ))}
    </div>
  );
} 