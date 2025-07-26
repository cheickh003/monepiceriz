import { ButtonHTMLAttributes } from 'react';
import { Loader2 } from 'lucide-react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    processing?: boolean;
    loadingText?: string;
}

export default function PrimaryButton({
    className = '',
    disabled,
    processing = false,
    loadingText,
    children,
    ...props
}: PrimaryButtonProps) {
    const isDisabled = disabled || processing;
    
    return (
        <button
            {...props}
            className={
                `inline-flex items-center justify-center rounded-md border border-transparent bg-gray-800 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-white transition duration-150 ease-in-out hover:bg-gray-700 focus:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 active:bg-gray-900 ${
                    isDisabled && 'opacity-50 cursor-not-allowed'
                } ` + className
            }
            disabled={isDisabled}
        >
            {processing && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            )}
            {processing && loadingText ? loadingText : children}
        </button>
    );
}
