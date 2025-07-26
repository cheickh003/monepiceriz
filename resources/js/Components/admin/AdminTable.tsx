import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { 
    Table, 
    TableHeader, 
    TableBody, 
    TableHead, 
    TableRow, 
    TableCell 
} from '@/Components/ui/table';
import { Button } from '@/Components/ui/button';
import { Badge } from '@/Components/ui/badge';
import { Card, CardContent } from '@/Components/ui/card';
import { 
    ChevronUp, 
    ChevronDown, 
    ChevronsUpDown,
    ArrowUpDown
} from 'lucide-react';
import { Pagination } from '@/Components/Pagination';
import { EmptyState } from './EmptyState';

export interface Column<T = any> {
    key: string;
    title: string;
    sortable?: boolean;
    align?: 'left' | 'center' | 'right';
    width?: string;
    render?: (value: any, record: T, index: number) => React.ReactNode;
    /** Important: Do not call React hooks inside the render function */
}

export interface AdminTableProps<T = any> {
    data: T[];
    columns: Column<T>[];
    loading?: boolean;
    pagination?: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
        from: number;
        to: number;
        links: Array<{
            url: string | null;
            label: string;
            active: boolean;
        }>;
    };
    onSort?: (key: string, direction: 'asc' | 'desc') => void;
    sortKey?: string;
    sortDirection?: 'asc' | 'desc';
    className?: string;
    emptyState?: {
        title: string;
        description: string;
        icon?: React.ReactNode;
        action?: {
            label: string;
            onClick: () => void;
        };
    };
}

export function AdminTable<T = any>({
    data = [],
    columns = [],
    loading = false,
    pagination,
    onSort,
    sortKey,
    sortDirection,
    className,
    emptyState
}: AdminTableProps<T>) {
    const [localSortKey, setLocalSortKey] = useState<string | undefined>(sortKey);
    const [localSortDirection, setLocalSortDirection] = useState<'asc' | 'desc'>('asc');

    const handleSort = (key: string) => {
        if (!onSort) return;

        let direction: 'asc' | 'desc' = 'asc';
        
        if (localSortKey === key) {
            direction = localSortDirection === 'asc' ? 'desc' : 'asc';
        }

        setLocalSortKey(key);
        setLocalSortDirection(direction);
        onSort(key, direction);
    };

    const getSortIcon = (columnKey: string) => {
        if (localSortKey !== columnKey) {
            return <ChevronsUpDown className="ml-2 h-4 w-4 text-muted-foreground" />;
        }
        
        return localSortDirection === 'asc' 
            ? <ChevronUp className="ml-2 h-4 w-4" />
            : <ChevronDown className="ml-2 h-4 w-4" />;
    };

    const getAlignClass = (align?: string) => {
        switch (align) {
            case 'center':
                return 'text-center justify-center';
            case 'right':
                return 'text-right justify-end';
            default:
                return 'text-left justify-start';
        }
    };

    const renderCellContent = (column: Column<T>, record: T, index: number) => {
        const value = record ? (record as any)[column.key] : undefined;
        
        if (column.render) {
            try {
                return column.render(value, record, index);
            } catch (error) {
                console.error(`Error rendering column ${column.key}:`, error);
                return <span className="text-red-500">Error</span>;
            }
        }

        // Rendu par défaut selon le type de valeur
        if (typeof value === 'boolean') {
            return (
                <Badge variant={value ? 'default' : 'secondary'}>
                    {value ? 'Oui' : 'Non'}
                </Badge>
            );
        }

        if (value === null || value === undefined) {
            return <span className="text-muted-foreground">-</span>;
        }

        // Safely convert to string
        try {
            return String(value);
        } catch {
            return <span className="text-muted-foreground">-</span>;
        }
    };

    // État vide
    if (!loading && data.length === 0) {
        if (emptyState) {
            return (
                <Card className={className}>
                    <CardContent className="p-8">
                        <EmptyState
                            title={emptyState.title}
                            description={emptyState.description}
                            icon={emptyState.icon}
                            action={emptyState.action}
                        />
                    </CardContent>
                </Card>
            );
        }
        
        return (
            <Card className={className}>
                <CardContent className="p-8">
                    <EmptyState
                        title="Aucune donnée"
                        description="Aucun élément à afficher pour le moment."
                    />
                </CardContent>
            </Card>
        );
    }

    return (
        <div className={cn("space-y-4", className)}>
            <Card>
                <CardContent className="p-0">
                    <div className="relative">
                        {loading && (
                            <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                            </div>
                        )}
                        
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    {columns.map((column) => (
                                        <TableHead
                                            key={column.key}
                                            className={cn(
                                                getAlignClass(column.align),
                                                column.sortable && onSort && "cursor-pointer hover:bg-muted/50",
                                                column.width && `w-[${column.width}]`
                                            )}
                                            onClick={() => column.sortable && onSort && handleSort(column.key)}
                                        >
                                            <div className={cn(
                                                "flex items-center",
                                                getAlignClass(column.align)
                                            )}>
                                                {column.title}
                                                {column.sortable && onSort && getSortIcon(column.key)}
                                            </div>
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {data.map((record, index) => (
                                    <TableRow key={index} className="hover:bg-muted/30">
                                        {columns.map((column) => (
                                            <TableCell
                                                key={column.key}
                                                className={cn(
                                                    getAlignClass(column.align),
                                                    column.width && `w-[${column.width}]`
                                                )}
                                            >
                                                <div className={cn(
                                                    "flex items-center",
                                                    getAlignClass(column.align)
                                                )}>
                                                    {renderCellContent(column, record, index)}
                                                </div>
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Pagination */}
            {pagination && pagination.last_page > 1 && (
                <div className="flex items-center justify-between">
                    <div className="text-sm text-muted-foreground">
                        Affichage de {pagination.from} à {pagination.to} sur {pagination.total} résultats
                    </div>
                    <Pagination links={pagination.links} />
                </div>
            )}
        </div>
    );
} 