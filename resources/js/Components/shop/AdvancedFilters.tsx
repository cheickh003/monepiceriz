import React, { useState, useEffect } from 'react';
import { Filter, X, ChevronDown, Star, Package } from 'lucide-react';
import SafeButton from '@/Components/SafeButton';
import { Slider } from '@/Components/ui/slider';
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from '@/Components/ui/sheet';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/Components/ui/select';
import { cn } from '@/lib/utils';

interface FilterOption {
    label: string;
    value: string;
    count?: number;
}

interface PriceRange {
    min: number;
    max: number;
}

interface AdvancedFiltersProps {
    categories?: FilterOption[];
    brands?: FilterOption[];
    origins?: FilterOption[];
    onFiltersChange: (filters: any) => void;
    productCount?: number;
    className?: string;
}

export default function AdvancedFilters({
    categories = [],
    brands = [],
    origins = [],
    onFiltersChange,
    productCount = 0,
    className
}: AdvancedFiltersProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [priceRange, setPriceRange] = useState<PriceRange>({ min: 0, max: 100 });
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [selectedBrand, setSelectedBrand] = useState<string>('all');
    const [selectedOrigin, setSelectedOrigin] = useState<string>('all');
    const [selectedRating, setSelectedRating] = useState<number>(0);
    const [inStockOnly, setInStockOnly] = useState(false);
    const [onSaleOnly, setOnSaleOnly] = useState(false);
    const [sortBy, setSortBy] = useState('relevance');

    // Calculate active filters count
    const activeFiltersCount = [
        selectedCategory,
        selectedBrand !== 'all' && selectedBrand,
        selectedOrigin !== 'all' && selectedOrigin,
        selectedRating > 0,
        inStockOnly,
        onSaleOnly,
        priceRange.min > 0 || priceRange.max < 100
    ].filter(Boolean).length;

    // Update URL with filters
    useEffect(() => {
        const filters = {
            category: selectedCategory,
            brand: selectedBrand === 'all' ? '' : selectedBrand,
            origin: selectedOrigin === 'all' ? '' : selectedOrigin,
            rating: selectedRating,
            price_min: priceRange.min,
            price_max: priceRange.max,
            in_stock: inStockOnly,
            on_sale: onSaleOnly,
            sort: sortBy
        };

        // Update URL params
        const params = new URLSearchParams();
        Object.entries(filters).forEach(([key, value]) => {
            if (value !== undefined && value !== null && value !== 0 && value !== '' && value !== false) {
                params.set(key, String(value));
            }
        });

        const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
        window.history.replaceState({}, '', newUrl);

        onFiltersChange(filters);
    }, [
        selectedCategory,
        selectedBrand,
        selectedOrigin,
        selectedRating,
        priceRange,
        inStockOnly,
        onSaleOnly,
        sortBy
    ]);

    const clearAllFilters = () => {
        setSelectedCategory('');
        setSelectedBrand('');
        setSelectedOrigin('');
        setSelectedRating(0);
        setPriceRange({ min: 0, max: 100 });
        setInStockOnly(false);
        setOnSaleOnly(false);
        setSortBy('relevance');
    };

    const renderStars = (rating: number, clickable = false) => {
        return (
            <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        onClick={() => clickable && setSelectedRating(star)}
                        disabled={!clickable}
                        className={cn(
                            "transition-colors",
                            clickable && "cursor-pointer hover:scale-110"
                        )}
                    >
                        <Star
                            className={cn(
                                "w-4 h-4",
                                star <= (clickable ? selectedRating : rating)
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                            )}
                        />
                    </button>
                ))}
            </div>
        );
    };

    const FiltersContent = () => (
        <div className="space-y-6">
            {/* Price Range */}
            <div>
                <h3 className="font-semibold text-gray-900 mb-3" id="price-filter-label">Prix</h3>
                <div className="space-y-4">
                    <Slider
                        value={[priceRange.min, priceRange.max]}
                        onValueChange={([min, max]) => setPriceRange({ min, max })}
                        max={100}
                        step={1}
                        className="w-full"
                        aria-labelledby="price-filter-label"
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-valuenow={priceRange.max}
                        aria-valuetext={`Prix entre ${priceRange.min} CFA et ${priceRange.max} CFA`}
                    />
                    <div className="flex justify-between text-sm text-gray-600" aria-live="polite">
                        <span>{priceRange.min} CFA</span>
                        <span>{priceRange.max} CFA</span>
                    </div>
                </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
                <div role="group" aria-labelledby="category-filter-label">
                    <h3 className="font-semibold text-gray-900 mb-3" id="category-filter-label">Catégorie</h3>
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <label
                                key={category.value}
                                className="flex items-center gap-2 cursor-pointer hover:text-green-600 focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 rounded-md px-2 py-1"
                            >
                                <input
                                    type="radio"
                                    name="category"
                                    value={category.value}
                                    checked={selectedCategory === category.value}
                                    onChange={(e) => setSelectedCategory(e.target.value)}
                                    className="text-green-600 focus:ring-green-500"
                                    aria-describedby={`category-count-${category.value}`}
                                />
                                <span className="text-sm">{category.label}</span>
                                {category.count && (
                                    <span id={`category-count-${category.value}`} className="text-xs text-gray-500">({category.count})</span>
                                )}
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Rating */}
            <div role="group" aria-labelledby="rating-filter-label">
                <h3 className="font-semibold text-gray-900 mb-3" id="rating-filter-label">Note client</h3>
                <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                        <label
                            key={rating}
                            className="flex items-center gap-2 cursor-pointer focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 rounded-md px-2 py-1"
                        >
                            <input
                                type="radio"
                                name="rating"
                                value={rating}
                                checked={selectedRating === rating}
                                onChange={() => setSelectedRating(rating)}
                                className="text-green-600 focus:ring-green-500"
                                aria-label={`${rating} étoiles et plus`}
                            />
                            <div className="flex items-center gap-1" aria-hidden="true">
                                {renderStars(rating)}
                                <span className="text-sm text-gray-600">& plus</span>
                            </div>
                        </label>
                    ))}
                </div>
            </div>

            {/* Availability */}
            <div role="group" aria-labelledby="availability-filter-label">
                <h3 className="font-semibold text-gray-900 mb-3" id="availability-filter-label">Disponibilité</h3>
                <div className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 rounded-md px-2 py-1">
                        <input
                            type="checkbox"
                            checked={inStockOnly}
                            onChange={(e) => setInStockOnly(e.target.checked)}
                            className="text-green-600 focus:ring-green-500 rounded"
                            aria-describedby="in-stock-desc"
                        />
                        <span className="text-sm" id="in-stock-desc">En stock uniquement</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer focus-within:ring-2 focus-within:ring-green-500 focus-within:ring-offset-2 rounded-md px-2 py-1">
                        <input
                            type="checkbox"
                            checked={onSaleOnly}
                            onChange={(e) => setOnSaleOnly(e.target.checked)}
                            className="text-green-600 focus:ring-green-500 rounded"
                            aria-describedby="on-sale-desc"
                        />
                        <span className="text-sm" id="on-sale-desc">En promotion</span>
                    </label>
                </div>
            </div>

            {/* Brands */}
            {brands.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Marque</h3>
                    <Select value={selectedBrand} onValueChange={setSelectedBrand}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Toutes les marques" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les marques</SelectItem>
                            {brands.map((brand) => (
                                <SelectItem key={brand.value} value={brand.value}>
                                    {brand.label}
                                    {brand.count && ` (${brand.count})`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}

            {/* Origins */}
            {origins.length > 0 && (
                <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Origine</h3>
                    <Select value={selectedOrigin} onValueChange={setSelectedOrigin}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Toutes les origines" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Toutes les origines</SelectItem>
                            {origins.map((origin) => (
                                <SelectItem key={origin.value} value={origin.value}>
                                    {origin.label}
                                    {origin.count && ` (${origin.count})`}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            )}
        </div>
    );

    return (
        <div className={cn("", className)}>
            {/* Desktop Filters Bar */}
            <div className="hidden lg:flex items-center justify-between gap-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4 flex-wrap">
                    {/* Sort Dropdown */}
                    <Select value={sortBy} onValueChange={setSortBy}>
                        <SelectTrigger className="w-[180px]">
                            <SelectValue placeholder="Trier par" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="relevance">Pertinence</SelectItem>
                            <SelectItem value="price_asc">Prix croissant</SelectItem>
                            <SelectItem value="price_desc">Prix décroissant</SelectItem>
                            <SelectItem value="rating">Meilleures notes</SelectItem>
                            <SelectItem value="newest">Nouveautés</SelectItem>
                            <SelectItem value="bestsellers">Meilleures ventes</SelectItem>
                        </SelectContent>
                    </Select>

                    {/* Quick Filters */}
                    <div className="flex items-center gap-2">
                        <SafeButton
                            variant={inStockOnly ? "default" : "outline"}
                            size="sm"
                            onClick={() => setInStockOnly(!inStockOnly)}
                            className="gap-2"
                            aria-pressed={inStockOnly}
                            aria-label="Filtrer les produits en stock uniquement"
                        >
                            <Package className="w-4 h-4" aria-hidden="true" />
                            En stock
                        </SafeButton>
                        <SafeButton
                            variant={onSaleOnly ? "default" : "outline"}
                            size="sm"
                            onClick={() => setOnSaleOnly(!onSaleOnly)}
                            aria-pressed={onSaleOnly}
                            aria-label="Filtrer les produits en promotion uniquement"
                        >
                            En promotion
                        </SafeButton>
                    </div>

                    {/* More Filters Button */}
                    <Sheet open={isOpen} onOpenChange={setIsOpen}>
                        <SheetTrigger asChild>
                            <SafeButton 
                                variant="outline" 
                                size="sm" 
                                className="gap-2"
                                aria-label={`Plus de filtres${activeFiltersCount > 0 ? `, ${activeFiltersCount} filtres actifs` : ''}`}
                            >
                                <Filter className="w-4 h-4" aria-hidden="true" />
                                Plus de filtres
                                {activeFiltersCount > 0 && (
                                    <span className="ml-1 px-1.5 py-0.5 bg-green-600 text-white text-xs rounded-full" aria-hidden="true">
                                        {activeFiltersCount}
                                    </span>
                                )}
                            </SafeButton>
                        </SheetTrigger>
                        <SheetContent>
                            <SheetHeader>
                                <SheetTitle>Filtres avancés</SheetTitle>
                                <SheetDescription>
                                    Affinez votre recherche parmi {productCount} produits
                                </SheetDescription>
                            </SheetHeader>
                            <div className="mt-6">
                                {FiltersContent()}
                                <div className="mt-6 space-y-2">
                                    <SafeButton
                                        onClick={() => setIsOpen(false)}
                                        className="w-full"
                                    >
                                        Appliquer les filtres
                                    </SafeButton>
                                    <SafeButton
                                        variant="outline"
                                        onClick={clearAllFilters}
                                        className="w-full"
                                        aria-label="Effacer tous les filtres appliqués"
                                    >
                                        Effacer les filtres
                                    </SafeButton>
                                </div>
                            </div>
                        </SheetContent>
                    </Sheet>
                </div>

                {/* Results Count & Clear Filters */}
                <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-600">
                        {productCount} résultat{productCount > 1 ? 's' : ''}
                    </span>
                    {activeFiltersCount > 0 && (
                        <SafeButton
                            variant="ghost"
                            size="sm"
                            onClick={clearAllFilters}
                            className="gap-2 text-red-600 hover:text-red-700"
                            aria-label="Effacer tous les filtres appliqués"
                        >
                            <X className="w-4 h-4" aria-hidden="true" />
                            Effacer
                        </SafeButton>
                    )}
                </div>
            </div>

            {/* Mobile Filters Bar */}
            <div className="lg:hidden flex items-center justify-between gap-2 p-4 bg-gray-50 rounded-lg">
                <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-[140px]">
                        <SelectValue placeholder="Trier" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="relevance">Pertinence</SelectItem>
                        <SelectItem value="price_asc">Prix ↑</SelectItem>
                        <SelectItem value="price_desc">Prix ↓</SelectItem>
                        <SelectItem value="rating">Notes</SelectItem>
                        <SelectItem value="newest">Nouveautés</SelectItem>
                    </SelectContent>
                </Select>

                <Sheet open={isOpen} onOpenChange={setIsOpen}>
                    <SheetTrigger asChild>
                        <SafeButton variant="outline" size="sm" className="gap-2">
                            <Filter className="w-4 h-4" />
                            Filtres
                            {activeFiltersCount > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 bg-green-600 text-white text-xs rounded-full">
                                    {activeFiltersCount}
                                </span>
                            )}
                        </SafeButton>
                    </SheetTrigger>
                    <SheetContent side="bottom" className="h-[80vh]">
                        <SheetHeader>
                            <SheetTitle>Filtres</SheetTitle>
                            <SheetDescription>
                                {productCount} produits disponibles
                            </SheetDescription>
                        </SheetHeader>
                        <div className="mt-6 overflow-y-auto max-h-[60vh]">
                            {FiltersContent()}
                            <div className="mt-6 space-y-2 sticky bottom-0 bg-white pt-4">
                                <SafeButton
                                    onClick={() => setIsOpen(false)}
                                    className="w-full"
                                >
                                    Voir les résultats
                                </SafeButton>
                                <SafeButton
                                    variant="outline"
                                    onClick={clearAllFilters}
                                    className="w-full"
                                >
                                    Effacer les filtres
                                </SafeButton>
                            </div>
                        </div>
                    </SheetContent>
                </Sheet>

                <span className="text-sm text-gray-600">
                    {productCount} produits
                </span>
            </div>
        </div>
    );
}