import React from 'react';
import { Link } from '@inertiajs/react';
import { Button } from '@/Components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/Components/ui/dropdown-menu';
import { 
    MoreHorizontal, 
    Eye, 
    Edit, 
    Trash2, 
    Copy,
    ExternalLink,
    Download,
    Archive,
    RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';

export interface ActionItem {
    key: string;
    label: string;
    icon?: React.ReactNode;
    href?: string;
    onClick?: () => void;
    variant?: 'default' | 'destructive' | 'warning';
    disabled?: boolean;
    external?: boolean;
    separator?: boolean;
}

export interface ActionDropdownProps {
    actions: ActionItem[];
    trigger?: React.ReactNode;
    label?: string;
    className?: string;
    align?: 'start' | 'end' | 'center';
    side?: 'top' | 'right' | 'bottom' | 'left';
}

const defaultIcons: Record<string, React.ReactNode> = {
    view: <Eye className="mr-2 h-4 w-4" />,
    show: <Eye className="mr-2 h-4 w-4" />,
    edit: <Edit className="mr-2 h-4 w-4" />,
    delete: <Trash2 className="mr-2 h-4 w-4" />,
    duplicate: <Copy className="mr-2 h-4 w-4" />,
    copy: <Copy className="mr-2 h-4 w-4" />,
    download: <Download className="mr-2 h-4 w-4" />,
    archive: <Archive className="mr-2 h-4 w-4" />,
    restore: <RotateCcw className="mr-2 h-4 w-4" />,
    external: <ExternalLink className="mr-2 h-4 w-4" />,
};

export function ActionDropdown({
    actions,
    trigger,
    label = "Actions",
    className,
    align = "end",
    side = "bottom"
}: ActionDropdownProps) {
    if (actions.length === 0) {
        return null;
    }

    const defaultTrigger = (
        <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{label}</span>
            <MoreHorizontal className="h-4 w-4" />
        </Button>
    );

    const getItemVariantClass = (variant?: string) => {
        switch (variant) {
            case 'destructive':
                return 'text-destructive focus:text-destructive hover:text-destructive';
            case 'warning':
                return 'text-orange-600 focus:text-orange-600 hover:text-orange-600';
            default:
                return '';
        }
    };

    const renderAction = (action: ActionItem) => {
        const icon = action.icon || defaultIcons[action.key];
        const itemClass = cn(
            "cursor-pointer",
            getItemVariantClass(action.variant),
            action.disabled && "opacity-50 cursor-not-allowed"
        );

        const content = (
            <>
                {icon}
                {action.label}
                {action.external && <ExternalLink className="ml-auto h-3 w-3" />}
            </>
        );

        if (action.href && !action.disabled) {
            if (action.external) {
                return (
                    <DropdownMenuItem asChild className={itemClass}>
                        <a 
                            href={action.href} 
                            target="_blank" 
                            rel="noopener noreferrer"
                        >
                            {content}
                        </a>
                    </DropdownMenuItem>
                );
            }
            
            return (
                <DropdownMenuItem asChild className={itemClass}>
                    <Link href={action.href}>
                        {content}
                    </Link>
                </DropdownMenuItem>
            );
        }

        return (
            <DropdownMenuItem
                className={itemClass}
                onClick={action.disabled ? undefined : action.onClick}
                disabled={action.disabled}
            >
                {content}
            </DropdownMenuItem>
        );
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild className={className}>
                {trigger || defaultTrigger}
            </DropdownMenuTrigger>
            <DropdownMenuContent align={align} side={side} className="w-48">
                <DropdownMenuLabel>{label}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {actions.map((action, index) => (
                    <React.Fragment key={action.key}>
                        {renderAction(action)}
                        {action.separator && index < actions.length - 1 && (
                            <DropdownMenuSeparator />
                        )}
                    </React.Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// Composant simplifié pour les actions courantes
export interface QuickActionsProps {
    viewHref?: string;
    editHref?: string;
    onDelete?: () => void;
    onDuplicate?: () => void;
    deleteDisabled?: boolean;
    className?: string;
}

export function QuickActions({
    viewHref,
    editHref,
    onDelete,
    onDuplicate,
    deleteDisabled = false,
    className
}: QuickActionsProps) {
    const actions: ActionItem[] = [];

    if (viewHref) {
        actions.push({
            key: 'view',
            label: 'Voir',
            href: viewHref,
            icon: <Eye className="mr-2 h-4 w-4" />
        });
    }

    if (editHref) {
        actions.push({
            key: 'edit',
            label: 'Modifier',
            href: editHref,
            icon: <Edit className="mr-2 h-4 w-4" />
        });
    }

    if (onDuplicate) {
        actions.push({
            key: 'duplicate',
            label: 'Dupliquer',
            onClick: onDuplicate,
            icon: <Copy className="mr-2 h-4 w-4" />,
            separator: onDelete ? true : false
        });
    }

    if (onDelete) {
        actions.push({
            key: 'delete',
            label: 'Supprimer',
            onClick: onDelete,
            variant: 'destructive',
            disabled: deleteDisabled,
            icon: <Trash2 className="mr-2 h-4 w-4" />
        });
    }

    return <ActionDropdown actions={actions} className={className} />;
} 