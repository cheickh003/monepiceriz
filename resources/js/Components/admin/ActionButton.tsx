import React from 'react';
import { Button, ButtonProps } from '@/Components/ui/button';
import LoadingSpinner from '@/Components/LoadingSpinner';
import { Loader2, LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActionButtonProps extends Omit<ButtonProps, 'children'> {
  icon?: LucideIcon;
  loading?: boolean;
  loadingText?: string;
  children: React.ReactNode;
  confirmMessage?: string;
  onConfirm?: () => void;
  showSpinner?: boolean;
}

export function ActionButton({
  icon: Icon,
  loading = false,
  loadingText = "Traitement...",
  children,
  confirmMessage,
  onConfirm,
  showSpinner = true,
  onClick,
  disabled,
  className,
  variant = "default",
  ...props
}: ActionButtonProps) {
  const isDisabled = loading || disabled;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (confirmMessage) {
      if (window.confirm(confirmMessage)) {
        onConfirm?.();
        onClick?.(e);
      }
    } else {
      onClick?.(e);
    }
  };

  return (
    <Button
      {...props}
      variant={variant}
      disabled={isDisabled}
      onClick={handleClick}
      className={cn(
        loading && 'cursor-not-allowed',
        className
      )}
    >
      {loading && showSpinner ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : (
        Icon && <Icon className="mr-2 h-4 w-4" />
      )}
      {loading ? loadingText : children}
    </Button>
  );
}

interface ActionButtonGroupProps {
  children: React.ReactNode;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
}

export function ActionButtonGroup({
  children,
  className,
  orientation = 'horizontal'
}: ActionButtonGroupProps) {
  return (
    <div className={cn(
      'flex gap-2',
      orientation === 'vertical' ? 'flex-col' : 'flex-row items-center',
      className
    )}>
      {children}
    </div>
  );
} 