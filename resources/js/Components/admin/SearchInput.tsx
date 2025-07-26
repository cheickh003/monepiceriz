import React, { useState, useEffect } from 'react';
import { Input } from '@/Components/ui/input';
import { Button } from '@/Components/ui/button';
import { Search, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/useDebounce';

export interface SearchInputProps {
    value?: string;
    placeholder?: string;
    onSearch: (value: string) => void;
    onClear?: () => void;
    debounceMs?: number;
    loading?: boolean;
    className?: string;
    disabled?: boolean;
    showClearButton?: boolean;
    size?: 'sm' | 'default' | 'lg';
}

export function SearchInput({
    value = '',
    placeholder = 'Rechercher...',
    onSearch,
    onClear,
    debounceMs = 300,
    loading = false,
    className,
    disabled = false,
    showClearButton = true,
    size = 'default'
}: SearchInputProps) {
    const [localValue, setLocalValue] = useState(value);
    const debouncedValue = useDebounce(localValue, debounceMs);

    // Synchroniser avec la valeur externe
    useEffect(() => {
        setLocalValue(value);
    }, [value]);

    // Déclencher la recherche quand la valeur debouncée change
    useEffect(() => {
        if (debouncedValue !== value) {
            onSearch(debouncedValue);
        }
    }, [debouncedValue, onSearch, value]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLocalValue(e.target.value);
    };

    const handleClear = () => {
        setLocalValue('');
        onSearch('');
        onClear?.();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onSearch(localValue);
        }
        
        if (e.key === 'Escape') {
            e.preventDefault();
            handleClear();
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'h-8 text-sm';
            case 'lg':
                return 'h-12 text-base';
            default:
                return 'h-10';
        }
    };

    const getIconSize = () => {
        switch (size) {
            case 'sm':
                return 'h-3 w-3';
            case 'lg':
                return 'h-5 w-5';
            default:
                return 'h-4 w-4';
        }
    };

    return (
        <div className={cn("relative", className)}>
            <div className="relative">
                <Search className={cn(
                    "absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground",
                    getIconSize()
                )} />
                
                <Input
                    type="text"
                    value={localValue}
                    onChange={handleInputChange}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    disabled={disabled || loading}
                    className={cn(
                        "pl-10 pr-10",
                        getSizeClasses(),
                        loading && "pr-16"
                    )}
                />

                <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
                    {loading && (
                        <Loader2 className={cn(
                            "animate-spin text-muted-foreground",
                            getIconSize()
                        )} />
                    )}
                    
                    {showClearButton && localValue && !loading && (
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 hover:bg-muted"
                            onClick={handleClear}
                            disabled={disabled}
                        >
                            <X className={cn("text-muted-foreground", getIconSize())} />
                            <span className="sr-only">Effacer</span>
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// Composant de recherche avancée avec filtres
export interface AdvancedSearchProps extends Omit<SearchInputProps, 'onSearch'> {
    onSearch: (value: string) => void;
    filters?: React.ReactNode;
    showFilters?: boolean;
    onToggleFilters?: () => void;
}

export function AdvancedSearch({
    filters,
    showFilters = false,
    onToggleFilters,
    ...searchProps
}: AdvancedSearchProps) {
    return (
        <div className="space-y-4">
            <div className="flex gap-2">
                <SearchInput {...searchProps} className="flex-1" />
                
                {filters && onToggleFilters && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={onToggleFilters}
                        className={cn(
                            "shrink-0",
                            showFilters && "bg-muted"
                        )}
                    >
                        <Search className="mr-2 h-4 w-4" />
                        Filtres
                    </Button>
                )}
            </div>
            
            {showFilters && filters && (
                <div className="p-4 border rounded-lg bg-muted/30">
                    {filters}
                </div>
            )}
        </div>
    );
} 