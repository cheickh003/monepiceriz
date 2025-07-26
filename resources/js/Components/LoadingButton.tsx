import React from 'react';
import { Button, ButtonProps } from '@/Components/ui/button';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingButtonProps extends ButtonProps {
  loading?: boolean;
  loadingText?: string;
  loadingIcon?: React.ReactNode;
  showSpinner?: boolean;
}

export function LoadingButton({
  children,
  loading = false,
  loadingText,
  loadingIcon,
  showSpinner = true,
  disabled,
  className,
  ...props
}: LoadingButtonProps) {
  const isDisabled = loading || disabled;
  
  return (
    <Button
      {...props}
      disabled={isDisabled}
      className={cn(
        loading && 'cursor-not-allowed',
        className
      )}
    >
      {loading && showSpinner && (
        loadingIcon || <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      )}
      {loading && loadingText ? loadingText : children}
    </Button>
  );
} 