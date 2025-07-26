import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import { Input } from '@/Components/ui/input';
import { Badge } from '@/Components/ui/badge';
import { 
    Plus, 
    Search, 
    Filter, 
    Download, 
    Upload,
    RefreshCw,
    Settings,
    MoreVertical
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';

interface PageHeaderProps {
    title: string;
    description?: string;
    badge?: {
        text: string;
        variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    };
    actions?: PageHeaderAction[];
    searchConfig?: {
        value: string;
        onChange: (value: string) => void;
        placeholder?: string;
        onSubmit?: () => void;
    };
    stats?: PageHeaderStat[];
    className?: string;
}

interface PageHeaderAction {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: 'default' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'default' | 'sm' | 'lg' | 'icon';
    disabled?: boolean;
    loading?: boolean;
    tooltip?: string;
    dropdown?: PageHeaderDropdownItem[];
}

interface PageHeaderDropdownItem {
    label: string;
    href?: string;
    onClick?: () => void;
    icon?: React.ComponentType<{ className?: string }>;
    disabled?: boolean;
    separator?: boolean;
}

interface PageHeaderStat {
    label: string;
    value: string | number;
    icon?: React.ComponentType<{ className?: string }>;
    trend?: {
        value: number;
        isPositive: boolean;
    };
}

export const PageHeader: React.FC<PageHeaderProps> = ({
    title,
    description,
    badge,
    actions = [],
    searchConfig,
    stats = [],
    className = ''
}) => {
    const defaultIcons: Record<string, React.ComponentType<{ className?: string }>> = {
        'créer': Plus,
        'ajouter': Plus,
        'nouveau': Plus,
        'exporter': Download,
        'importer': Upload,
        'actualiser': RefreshCw,
        'paramètres': Settings,
        'filtrer': Filter
    };

    const getActionIcon = (action: PageHeaderAction) => {
        if (action.icon) return action.icon;
        
        const lowerLabel = action.label.toLowerCase();
        for (const [key, icon] of Object.entries(defaultIcons)) {
            if (lowerLabel.includes(key)) return icon;
        }
        return null;
    };

    const renderAction = (action: PageHeaderAction, index: number) => {
        const Icon = getActionIcon(action);
        
        if (action.dropdown && action.dropdown.length > 0) {
            return (
                <DropdownMenu key={index}>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant={action.variant || 'outline'}
                            size={action.size || 'default'}
                            disabled={action.disabled}
                            className="gap-2"
                        >
                            {Icon && <Icon className="h-4 w-4" />}
                            {action.label}
                            <MoreVertical className="h-4 w-4 ml-1" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {action.dropdown.map((item, idx) => {
                            if (item.separator) {
                                return <DropdownMenuSeparator key={idx} />;
                            }
                            
                            const ItemIcon = item.icon;
                            
                            return (
                                <DropdownMenuItem
                                    key={idx}
                                    disabled={item.disabled}
                                    onClick={item.onClick}
                                    asChild={!!item.href}
                                >
                                    {item.href ? (
                                        <Link href={item.href} className="flex items-center gap-2">
                                            {ItemIcon && <ItemIcon className="h-4 w-4" />}
                                            {item.label}
                                        </Link>
                                    ) : (
                                        <span className="flex items-center gap-2">
                                            {ItemIcon && <ItemIcon className="h-4 w-4" />}
                                            {item.label}
                                        </span>
                                    )}
                                </DropdownMenuItem>
                            );
                        })}
                    </DropdownMenuContent>
                </DropdownMenu>
            );
        }

        const button = (
            <Button
                key={index}
                variant={action.variant || 'default'}
                size={action.size || 'default'}
                onClick={action.onClick}
                disabled={action.disabled || action.loading}
                className="gap-2"
                title={action.tooltip}
            >
                {action.loading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                ) : Icon ? (
                    <Icon className="h-4 w-4" />
                ) : null}
                {action.label}
            </Button>
        );

        if (action.href) {
            return (
                <Link key={index} href={action.href}>
                    {button}
                </Link>
            );
        }

        return button;
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Header principal */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div>
                        <div className="flex items-center gap-2">
                            <h1 className="text-2xl font-bold tracking-tight">
                                {title}
                            </h1>
                            {badge && (
                                <Badge variant={badge.variant || 'secondary'}>
                                    {badge.text}
                                </Badge>
                            )}
                        </div>
                        {description && (
                            <p className="text-muted-foreground mt-1">
                                {description}
                            </p>
                        )}
                    </div>
                </div>

                {/* Actions */}
                {actions.length > 0 && (
                    <div className="flex items-center gap-2">
                        {actions.map(renderAction)}
                    </div>
                )}
            </div>

            {/* Statistiques */}
            {stats.length > 0 && (
                <div className="grid gap-4 grid-cols-2 sm:grid-cols-4">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        return (
                            <div 
                                key={index}
                                className="rounded-lg border bg-card p-4"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground">
                                            {stat.label}
                                        </p>
                                        <p className="text-2xl font-bold">
                                            {stat.value}
                                        </p>
                                    </div>
                                    {Icon && (
                                        <Icon className="h-8 w-8 text-muted-foreground" />
                                    )}
                                </div>
                                {stat.trend && (
                                    <p className={`text-xs mt-2 ${
                                        stat.trend.isPositive ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {stat.trend.isPositive ? '+' : ''}{stat.trend.value}%
                                    </p>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Barre de recherche */}
            {searchConfig && (
                <div className="flex items-center gap-2 max-w-md">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            type="search"
                            placeholder={searchConfig.placeholder || "Rechercher..."}
                            value={searchConfig.value}
                            onChange={(e) => searchConfig.onChange(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && searchConfig.onSubmit) {
                                    searchConfig.onSubmit();
                                }
                            }}
                            className="pl-9"
                        />
                    </div>
                    {searchConfig.onSubmit && (
                        <Button
                            variant="secondary"
                            size="icon"
                            onClick={searchConfig.onSubmit}
                        >
                            <Search className="h-4 w-4" />
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
};

// Composant simplifié pour les cas d'usage courants
export const SimpleCrudHeader: React.FC<{
    title: string;
    createLabel?: string;
    createHref?: string;
    totalItems?: number;
    searchValue?: string;
    onSearchChange?: (value: string) => void;
}> = ({
    title,
    createLabel = "Créer",
    createHref,
    totalItems,
    searchValue,
    onSearchChange
}) => {
    const actions: PageHeaderAction[] = createHref ? [{
        label: createLabel,
        href: createHref,
        icon: Plus,
        variant: 'default' as const
    }] : [];

    const searchConfig = searchValue !== undefined && onSearchChange ? {
        value: searchValue,
        onChange: onSearchChange,
        placeholder: `Rechercher dans ${title.toLowerCase()}...`
    } : undefined;

    const badge = totalItems !== undefined ? {
        text: `${totalItems} élément${totalItems > 1 ? 's' : ''}`
    } : undefined;

    return (
        <PageHeader
            title={title}
            badge={badge}
            actions={actions}
            searchConfig={searchConfig}
        />
    );
};