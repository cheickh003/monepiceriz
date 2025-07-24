import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock, TrendingUp } from 'lucide-react';
import { router } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from '@/Components/ui/use-toast';

interface SearchSuggestion {
    id: number;
    name: string;
    category?: string;
    type: 'product' | 'category' | 'recent' | 'popular';
}

interface SearchBarProps {
    className?: string;
    placeholder?: string;
    onSearch?: (query: string) => void;
}

export function SearchBar({ 
    className, 
    placeholder = "Rechercher des produits...",
    onSearch 
}: SearchBarProps) {
    const [query, setQuery] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([]);
    const [loading, setLoading] = useState(false);
    const [recentSearches, setRecentSearches] = useState<string[]>([]);
    const searchRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    // Load recent searches from localStorage
    useEffect(() => {
        const recent = localStorage.getItem('recentSearches');
        if (recent) {
            setRecentSearches(JSON.parse(recent));
        }
    }, []);

    // Handle keyboard shortcuts (Ctrl+K or Cmd+K)
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                inputRef.current?.focus();
            }
        };

        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, []);

    // Handle click outside to close suggestions
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Fetch suggestions based on query
    useEffect(() => {
        const fetchSuggestions = async () => {
            if (query.length < 2) {
                setSuggestions([]);
                return;
            }

            setLoading(true);
            try {
                const response = await fetch(`/api/search-suggestions?q=${encodeURIComponent(query)}`);
                if (!response.ok) {
                    throw new Error('Erreur lors de la recherche');
                }
                const data = await response.json();
                setSuggestions(data.suggestions || []);
            } catch (error) {
                console.error('Error fetching suggestions:', error);
                setSuggestions([]);
                toast({
                    title: "Erreur de recherche",
                    description: "Impossible de charger les suggestions. Veuillez réessayer.",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchSuggestions, 300);
        return () => clearTimeout(debounceTimer);
    }, [query]);

    const handleSearch = (searchQuery: string = query) => {
        if (!searchQuery.trim()) return;

        // Save to recent searches
        const updatedRecent = [searchQuery, ...recentSearches.filter(s => s !== searchQuery)].slice(0, 5);
        setRecentSearches(updatedRecent);
        localStorage.setItem('recentSearches', JSON.stringify(updatedRecent));

        // Navigate to search results
        router.visit(`/search?q=${encodeURIComponent(searchQuery)}`);
        setIsOpen(false);
        setQuery('');

        if (onSearch) {
            onSearch(searchQuery);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        } else if (e.key === 'Escape') {
            setIsOpen(false);
            inputRef.current?.blur();
        }
    };

    const clearSearch = () => {
        setQuery('');
        setSuggestions([]);
        inputRef.current?.focus();
    };

    const renderSuggestions = () => {
        if (!isOpen) return null;

        const hasContent = suggestions.length > 0 || recentSearches.length > 0 || loading;
        if (!hasContent && query.length > 0) return null;

        return (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 z-50 max-h-96 overflow-y-auto">
                {loading && (
                    <div className="p-4 text-center text-gray-500">
                        <div className="animate-spin inline-block w-5 h-5 border-2 border-gray-300 border-t-green-600 rounded-full"></div>
                        <span className="ml-2">Recherche en cours...</span>
                    </div>
                )}

                {!loading && query.length === 0 && recentSearches.length > 0 && (
                    <div className="p-2">
                        <p className="px-3 py-2 text-sm font-medium text-gray-700">Recherches récentes</p>
                        {recentSearches.map((search, index) => (
                            <button
                                key={index}
                                onClick={() => handleSearch(search)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm"
                            >
                                <Clock className="w-4 h-4 text-gray-400" />
                                <span>{search}</span>
                            </button>
                        ))}
                    </div>
                )}

                {!loading && suggestions.length > 0 && (
                    <div className="p-2">
                        {suggestions.map((suggestion) => (
                            <button
                                key={`${suggestion.type}-${suggestion.id}`}
                                onClick={() => handleSearch(suggestion.name)}
                                className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center justify-between group"
                            >
                                <div className="flex items-center gap-2">
                                    {suggestion.type === 'popular' && (
                                        <TrendingUp className="w-4 h-4 text-green-600" />
                                    )}
                                    {suggestion.type === 'recent' && (
                                        <Clock className="w-4 h-4 text-gray-400" />
                                    )}
                                    {suggestion.type === 'product' && (
                                        <Search className="w-4 h-4 text-gray-400" />
                                    )}
                                    <span className="text-sm">{suggestion.name}</span>
                                </div>
                                {suggestion.category && (
                                    <span className="text-xs text-gray-500">{suggestion.category}</span>
                                )}
                            </button>
                        ))}
                    </div>
                )}

                {!loading && query.length > 1 && (
                    <div className="border-t border-gray-200 p-2">
                        <button
                            onClick={() => handleSearch()}
                            className="w-full px-3 py-2 text-left hover:bg-gray-100 flex items-center gap-2 text-sm font-medium text-green-600"
                        >
                            <Search className="w-4 h-4" />
                            <span>Voir tous les résultats pour "{query}"</span>
                        </button>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div ref={searchRef} className={cn("relative w-full", className)}>
            <div className="relative">
                <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="w-full px-4 py-3 pl-12 pr-12 text-gray-900 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    aria-label="Barre de recherche"
                    aria-autocomplete="list"
                    aria-expanded={isOpen}
                    role="combobox"
                />
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                
                {query && (
                    <button
                        onClick={clearSearch}
                        className="absolute right-12 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors"
                        aria-label="Effacer la recherche"
                    >
                        <X className="w-4 h-4 text-gray-500" />
                    </button>
                )}

                <Button
                    onClick={() => handleSearch()}
                    size="sm"
                    className="absolute right-1 top-1/2 transform -translate-y-1/2 h-10 px-4 bg-green-600 hover:bg-green-700"
                    aria-label="Lancer la recherche"
                >
                    <Search className="w-4 h-4" />
                </Button>

                <kbd className="hidden md:inline-flex absolute right-14 top-1/2 transform -translate-y-1/2 px-2 py-1 text-xs text-gray-500 bg-gray-100 rounded border border-gray-300">
                    ⌘K
                </kbd>
            </div>

            {renderSuggestions()}
        </div>
    );
}