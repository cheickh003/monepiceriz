import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { Link } from '@inertiajs/react';
import { cn } from '@/lib/utils';

interface BreadcrumbItem {
    label: string;
    href?: string;
}

interface BreadcrumbNavigationProps {
    items: BreadcrumbItem[];
    className?: string;
}

export default function BreadcrumbNavigation({ items, className }: BreadcrumbNavigationProps) {
    // Add home as the first item if not already present
    const breadcrumbItems: BreadcrumbItem[] = [
        { label: 'Accueil', href: '/' },
        ...items
    ];

    return (
        <nav 
            aria-label="Fil d'Ariane" 
            className={cn("flex items-center flex-wrap text-sm", className)}
        >
            <ol className="flex items-center space-x-1">
                {breadcrumbItems.map((item, index) => {
                    const isLast = index === breadcrumbItems.length - 1;
                    const isFirst = index === 0;

                    return (
                        <li key={index} className="flex items-center">
                            {!isFirst && (
                                <ChevronRight className="w-4 h-4 text-gray-400 mx-1 flex-shrink-0" />
                            )}
                            
                            {isLast ? (
                                <span 
                                    className="text-gray-900 font-medium truncate max-w-[200px] md:max-w-none"
                                    aria-current="page"
                                >
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href || '/'}
                                    className={cn(
                                        "text-gray-600 hover:text-green-600 transition-colors truncate max-w-[150px] md:max-w-none",
                                        isFirst && "flex items-center gap-1"
                                    )}
                                >
                                    {isFirst && <Home className="w-4 h-4" />}
                                    <span className={cn(isFirst && "hidden sm:inline")}>
                                        {item.label}
                                    </span>
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}

// Helper function to generate breadcrumb items for common pages
export function generateBreadcrumbs(page: string, data?: any): BreadcrumbItem[] {
    switch (page) {
        case 'category':
            return data?.category ? [
                { label: 'Catégories', href: '/categories' },
                { label: data.category.name }
            ] : [];
            
        case 'product':
            if (!data?.product) return [];
            const items: BreadcrumbItem[] = [];
            
            if (data.product.category) {
                items.push(
                    { label: 'Catégories', href: '/categories' },
                    { label: data.product.category.name, href: `/categories/${data.product.category.slug}` }
                );
            }
            
            items.push({ label: data.product.name });
            return items;
            
        case 'search':
            return [
                { label: 'Recherche' },
                { label: data?.query || 'Résultats' }
            ];
            
        case 'cart':
            return [{ label: 'Panier' }];
            
        case 'checkout':
            return [
                { label: 'Panier', href: '/cart' },
                { label: 'Paiement' }
            ];
            
        case 'account':
            return [{ label: 'Mon compte' }];
            
        case 'orders':
            return [
                { label: 'Mon compte', href: '/account' },
                { label: 'Mes commandes' }
            ];
            
        case 'order':
            return [
                { label: 'Mon compte', href: '/account' },
                { label: 'Mes commandes', href: '/account/orders' },
                { label: `Commande #${data?.orderNumber || ''}` }
            ];
            
        default:
            return [];
    }
}