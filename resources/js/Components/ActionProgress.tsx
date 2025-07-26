import React from 'react';
import { Card, CardContent } from '@/Components/ui/card';
import { Progress } from '@/Components/ui/progress';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionProgressProps {
  title: string;
  description?: string;
  progress?: number;
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  className?: string;
  showProgress?: boolean;
}

export function ActionProgress({
  title,
  description,
  progress = 0,
  status,
  error,
  className,
  showProgress = true
}: ActionProgressProps) {
  const getStatusIcon = () => {
    switch (status) {
      case 'loading':
        return <Loader2 className="h-5 w-5 animate-spin text-blue-600" />;
      case 'success':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'error':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'loading':
        return 'border-blue-200 bg-blue-50';
      case 'success':
        return 'border-green-200 bg-green-50';
      case 'error':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  if (status === 'idle') return null;

  return (
    <Card className={cn(
      'transition-all duration-200',
      getStatusColor(),
      className
    )}>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {getStatusIcon()}
          <div className="flex-1">
            <h4 className="font-medium text-sm">{title}</h4>
            {description && (
              <p className="text-sm text-muted-foreground mt-1">{description}</p>
            )}
            {error && (
              <p className="text-sm text-red-600 mt-1">{error}</p>
            )}
            {status === 'loading' && showProgress && (
              <div className="mt-3">
                <Progress 
                  value={progress} 
                  className="h-2" 
                  variant="default"
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>Progression</span>
                  <span>{Math.round(progress)}%</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface MultiActionProgressProps {
  actions: Array<{
    id: string;
    title: string;
    description?: string;
    progress?: number;
    status: 'idle' | 'loading' | 'success' | 'error';
    error?: string;
  }>;
  className?: string;
}

export function MultiActionProgress({ actions, className }: MultiActionProgressProps) {
  const activeActions = actions.filter(action => action.status !== 'idle');
  
  if (activeActions.length === 0) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {activeActions.map((action) => (
        <ActionProgress
          key={action.id}
          title={action.title}
          description={action.description}
          progress={action.progress}
          status={action.status}
          error={action.error}
        />
      ))}
    </div>
  );
} 