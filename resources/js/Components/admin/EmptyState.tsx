import React from 'react';
import { Button } from '@/Components/ui/button';
import { Card, CardContent } from '@/Components/ui/card';
import { 
    Package, 
    Search, 
    Plus, 
    AlertCircle, 
    FileX, 
    Inbox,
    ShoppingCart,
    Users,
    FolderOpen
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface EmptyStateProps {
    title: string;
    description: string;
    icon?: React.ReactNode;
    action?: {
        label: string;
        onClick: () => void;
        variant?: 'default' | 'outline' | 'secondary';
    };
    secondaryAction?: {
        label: string;
        onClick: () => void;
        variant?: 'default' | 'outline' | 'secondary';
    };
    className?: string;
    size?: 'sm' | 'default' | 'lg';
    type?: 'default' | 'search' | 'error' | 'success';
}

const defaultIcons = {
    default: <Inbox className="h-12 w-12 text-muted-foreground" />,
    search: <Search className="h-12 w-12 text-muted-foreground" />,
    error: <AlertCircle className="h-12 w-12 text-destructive" />,
    success: <Package className="h-12 w-12 text-green-600" />,
};

export function EmptyState({
    title,
    description,
    icon,
    action,
    secondaryAction,
    className,
    size = 'default',
    type = 'default'
}: EmptyStateProps) {
    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return {
                    container: 'py-8',
                    icon: 'h-8 w-8',
                    title: 'text-lg',
                    description: 'text-sm'
                };
            case 'lg':
                return {
                    container: 'py-16',
                    icon: 'h-16 w-16',
                    title: 'text-2xl',
                    description: 'text-base'
                };
            default:
                return {
                    container: 'py-12',
                    icon: 'h-12 w-12',
                    title: 'text-xl',
                    description: 'text-sm'
                };
        }
    };

    const sizeClasses = getSizeClasses();
    const displayIcon = icon || defaultIcons[type];

    return (
        <div className={cn(
            "flex flex-col items-center justify-center text-center",
            sizeClasses.container,
            className
        )}>
            {/* Icône */}
            <div className="mb-4">
                {React.isValidElement(displayIcon) ? 
                    React.cloneElement(displayIcon as React.ReactElement, {
                        className: cn(sizeClasses.icon, (displayIcon.props as any)?.className)
                    }) : 
                    displayIcon
                }
            </div>

            {/* Titre */}
            <h3 className={cn(
                "font-semibold tracking-tight mb-2",
                sizeClasses.title
            )}>
                {title}
            </h3>

            {/* Description */}
            <p className={cn(
                "text-muted-foreground max-w-sm mx-auto mb-6",
                sizeClasses.description
            )}>
                {description}
            </p>

            {/* Actions */}
            {(action || secondaryAction) && (
                <div className="flex flex-col sm:flex-row gap-3">
                    {action && (
                        <Button
                            onClick={action.onClick}
                            variant={action.variant || 'default'}
                        >
                            {action.label}
                        </Button>
                    )}
                    {secondaryAction && (
                        <Button
                            onClick={secondaryAction.onClick}
                            variant={secondaryAction.variant || 'outline'}
                        >
                            {secondaryAction.label}
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

// États vides prédéfinis pour des cas d'usage courants
export const EmptyStates = {
    noProducts: (onCreateProduct?: () => void) => ({
        title: "Aucun produit",
        description: "Vous n'avez pas encore ajouté de produits à votre catalogue.",
        icon: <Package className="h-12 w-12 text-muted-foreground" />,
        action: onCreateProduct ? {
            label: "Ajouter un produit",
            onClick: onCreateProduct
        } : undefined
    }),

    noOrders: () => ({
        title: "Aucune commande",
        description: "Aucune commande n'a été passée pour le moment.",
        icon: <ShoppingCart className="h-12 w-12 text-muted-foreground" />
    }),

    noCategories: (onCreateCategory?: () => void) => ({
        title: "Aucune catégorie",
        description: "Créez des catégories pour organiser vos produits.",
        icon: <FolderOpen className="h-12 w-12 text-muted-foreground" />,
        action: onCreateCategory ? {
            label: "Créer une catégorie",
            onClick: onCreateCategory
        } : undefined
    }),

    noUsers: () => ({
        title: "Aucun utilisateur",
        description: "Aucun utilisateur n'est enregistré dans le système.",
        icon: <Users className="h-12 w-12 text-muted-foreground" />
    }),

    searchNoResults: (searchQuery: string, onClearSearch?: () => void) => ({
        title: "Aucun résultat",
        description: `Aucun résultat trouvé pour "${searchQuery}". Essayez avec d'autres mots-clés.`,
        icon: <Search className="h-12 w-12 text-muted-foreground" />,
        type: 'search' as const,
        action: onClearSearch ? {
            label: "Effacer la recherche",
            onClick: onClearSearch,
            variant: 'outline' as const
        } : undefined
    }),

    error: (message: string, onRetry?: () => void) => ({
        title: "Une erreur s'est produite",
        description: message,
        icon: <AlertCircle className="h-12 w-12 text-destructive" />,
        type: 'error' as const,
        action: onRetry ? {
            label: "Réessayer",
            onClick: onRetry
        } : undefined
    })
}; 