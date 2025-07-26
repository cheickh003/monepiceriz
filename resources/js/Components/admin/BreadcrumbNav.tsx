import React from 'react';
import { Link } from '@inertiajs/react';
import { ChevronRight, Home } from 'lucide-react';

export interface BreadcrumbItem {
    label: string;
    href?: string;
    icon?: React.ComponentType<{ className?: string }>;
    current?: boolean;
}

interface BreadcrumbNavProps {
    items: BreadcrumbItem[];
    separator?: React.ReactNode;
    showHome?: boolean;
    homeLabel?: string;
    homeHref?: string;
    className?: string;
}

export const BreadcrumbNav: React.FC<BreadcrumbNavProps> = ({
    items,
    separator,
    showHome = true,
    homeLabel = 'Dashboard',
    homeHref = '/admin',
    className = ''
}) => {
    const allItems = showHome 
        ? [{ label: homeLabel, href: homeHref, icon: Home }, ...items]
        : items;

    const defaultSeparator = (
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
    );

    return (
        <nav 
            className={`flex items-center space-x-2 text-sm ${className}`}
            aria-label="Breadcrumb"
        >
            <ol className="flex items-center space-x-2">
                {allItems.map((item, index) => {
                    const isLast = index === allItems.length - 1;
                    const Icon = item.icon;

                    return (
                        <li key={index} className="flex items-center">
                            {index > 0 && (
                                <span className="mx-2">
                                    {separator || defaultSeparator}
                                </span>
                            )}
                            
                            {isLast || !item.href ? (
                                <span 
                                    className={`flex items-center gap-1.5 ${
                                        isLast 
                                            ? 'font-medium text-foreground' 
                                            : 'text-muted-foreground'
                                    }`}
                                    aria-current={isLast ? 'page' : undefined}
                                >
                                    {Icon && <Icon className="h-4 w-4" />}
                                    {item.label}
                                </span>
                            ) : (
                                <Link
                                    href={item.href}
                                    className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {Icon && <Icon className="h-4 w-4" />}
                                    {item.label}
                                </Link>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

// Hook pour générer automatiquement les breadcrumbs
export const useBreadcrumbs = (
    currentPage: string,
    parentPages?: Array<{ label: string; href: string }>
): BreadcrumbItem[] => {
    const items: BreadcrumbItem[] = parentPages || [];
    
    return [
        ...items,
        { label: currentPage, current: true }
    ];
};

// Composant pour les breadcrumbs CRUD standards
export const CrudBreadcrumbs: React.FC<{
    resource: string;
    resourceHref: string;
    action?: 'create' | 'edit' | 'show';
    itemName?: string;
    parentResource?: {
        label: string;
        href: string;
    };
}> = ({ resource, resourceHref, action, itemName, parentResource }) => {
    const items: BreadcrumbItem[] = [];

    if (parentResource) {
        items.push({
            label: parentResource.label,
            href: parentResource.href
        });
    }

    items.push({
        label: resource,
        href: resourceHref
    });

    if (action) {
        const actionLabels = {
            create: 'Créer',
            edit: 'Modifier',
            show: 'Détails'
        };

        if (action === 'create') {
            items.push({
                label: actionLabels[action],
                current: true
            });
        } else if (itemName) {
            items.push({
                label: itemName,
                href: action === 'show' ? undefined : `${resourceHref}/${itemName}`,
                current: action === 'show'
            });

            if (action === 'edit') {
                items.push({
                    label: actionLabels[action],
                    current: true
                });
            }
        }
    }

    return <BreadcrumbNav items={items} />;
};

// Variante minimaliste
export const MinimalBreadcrumbs: React.FC<{
    currentPage: string;
    parentPage?: {
        label: string;
        href: string;
    };
}> = ({ currentPage, parentPage }) => {
    return (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {parentPage && (
                <>
                    <Link 
                        href={parentPage.href}
                        className="hover:text-foreground transition-colors"
                    >
                        {parentPage.label}
                    </Link>
                    <span>/</span>
                </>
            )}
            <span className="text-foreground font-medium">{currentPage}</span>
        </div>
    );
};