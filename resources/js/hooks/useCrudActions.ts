import { useMemo } from 'react';
import { router } from '@inertiajs/react';
import type { ActionItem } from '@/Components/admin/ActionDropdown';

export interface CrudActionsOptions {
    canView?: boolean;
    canEdit?: boolean;
    canDelete?: boolean;
    canDuplicate?: boolean;
    deleteDisabled?: boolean;
    editDisabled?: boolean;
    viewDisabled?: boolean;
    duplicateDisabled?: boolean;
    onView?: () => void;
    onEdit?: () => void;
    onDelete?: () => void;
    onDuplicate?: () => void;
    customActions?: ActionItem[];
    deleteConfirmMessage?: string;
    duplicateConfirmMessage?: string;
}

export interface CrudEntity {
    id: number | string;
    name?: string;
    title?: string;
    [key: string]: any;
}

export function useCrudActions<T extends CrudEntity>(
    baseUrl: string,
    entity: T,
    options: CrudActionsOptions = {}
): ActionItem[] {
    const {
        canView = true,
        canEdit = true,
        canDelete = true,
        canDuplicate = false,
        deleteDisabled = false,
        editDisabled = false,
        viewDisabled = false,
        duplicateDisabled = false,
        onView,
        onEdit,
        onDelete,
        onDuplicate,
        customActions = [],
        deleteConfirmMessage,
        duplicateConfirmMessage
    } = options;

    return useMemo(() => {
        const actions: ActionItem[] = [];

        // Action Voir
        if (canView && !viewDisabled) {
            actions.push({
                key: 'view',
                label: 'Voir',
                href: onView ? undefined : `${baseUrl}/${entity.id}`,
                onClick: onView,
                disabled: viewDisabled
            });
        }

        // Action Modifier
        if (canEdit && !editDisabled) {
            actions.push({
                key: 'edit',
                label: 'Modifier',
                href: onEdit ? undefined : `${baseUrl}/${entity.id}/edit`,
                onClick: onEdit,
                disabled: editDisabled
            });
        }

        // Actions personnalisées (avant les actions destructives)
        if (customActions.length > 0) {
            actions.push(...customActions);
        }

        // Action Dupliquer
        if (canDuplicate && !duplicateDisabled) {
            const handleDuplicate = () => {
                const entityName = entity.name || entity.title || `l'élément #${entity.id}`;
                const message = duplicateConfirmMessage || 
                    `Êtes-vous sûr de vouloir dupliquer ${entityName} ?`;
                
                if (confirm(message)) {
                    if (onDuplicate) {
                        onDuplicate();
                    } else {
                        router.post(`${baseUrl}/${entity.id}/duplicate`, {}, {
                            onSuccess: () => {
                                // Le succès est géré par le backend
                            },
                            onError: (errors) => {
                                console.error('Erreur lors de la duplication:', errors);
                            }
                        });
                    }
                }
            };

            actions.push({
                key: 'duplicate',
                label: 'Dupliquer',
                onClick: handleDuplicate,
                disabled: duplicateDisabled,
                separator: canDelete && !deleteDisabled
            });
        }

        // Action Supprimer (toujours en dernier)
        if (canDelete && !deleteDisabled) {
            const handleDelete = () => {
                const entityName = entity.name || entity.title || `l'élément #${entity.id}`;
                const message = deleteConfirmMessage || 
                    `Êtes-vous sûr de vouloir supprimer ${entityName} ? Cette action est irréversible.`;
                
                if (confirm(message)) {
                    if (onDelete) {
                        onDelete();
                    } else {
                        router.delete(`${baseUrl}/${entity.id}`, {
                            onSuccess: () => {
                                // Le succès est géré par le backend
                            },
                            onError: (errors) => {
                                console.error('Erreur lors de la suppression:', errors);
                            }
                        });
                    }
                }
            };

            actions.push({
                key: 'delete',
                label: 'Supprimer',
                onClick: handleDelete,
                variant: 'destructive',
                disabled: deleteDisabled
            });
        }

        return actions;
    }, [
        baseUrl,
        entity,
        canView,
        canEdit,
        canDelete,
        canDuplicate,
        deleteDisabled,
        editDisabled,
        viewDisabled,
        duplicateDisabled,
        onView,
        onEdit,
        onDelete,
        onDuplicate,
        customActions,
        deleteConfirmMessage,
        duplicateConfirmMessage
    ]);
}

// Hook spécialisé pour les actions en lot
export interface BulkActionsOptions {
    selectedIds: (number | string)[];
    onBulkDelete?: (ids: (number | string)[]) => void;
    onBulkExport?: (ids: (number | string)[]) => void;
    onBulkArchive?: (ids: (number | string)[]) => void;
    onBulkRestore?: (ids: (number | string)[]) => void;
    customBulkActions?: ActionItem[];
}

export function useBulkActions(
    baseUrl: string,
    options: BulkActionsOptions
): ActionItem[] {
    const {
        selectedIds,
        onBulkDelete,
        onBulkExport,
        onBulkArchive,
        onBulkRestore,
        customBulkActions = []
    } = options;

    return useMemo(() => {
        if (selectedIds.length === 0) {
            return [];
        }

        const actions: ActionItem[] = [];

        // Export en lot
        if (onBulkExport) {
            actions.push({
                key: 'bulk-export',
                label: `Exporter (${selectedIds.length})`,
                onClick: () => onBulkExport(selectedIds)
            });
        }

        // Actions personnalisées
        if (customBulkActions.length > 0) {
            actions.push(...customBulkActions);
        }

        // Archiver en lot
        if (onBulkArchive) {
            actions.push({
                key: 'bulk-archive',
                label: `Archiver (${selectedIds.length})`,
                onClick: () => onBulkArchive(selectedIds),
                variant: 'warning',
                separator: true
            });
        }

        // Restaurer en lot
        if (onBulkRestore) {
            actions.push({
                key: 'bulk-restore',
                label: `Restaurer (${selectedIds.length})`,
                onClick: () => onBulkRestore(selectedIds)
            });
        }

        // Supprimer en lot
        if (onBulkDelete) {
            const handleBulkDelete = () => {
                const message = `Êtes-vous sûr de vouloir supprimer ${selectedIds.length} élément(s) ? Cette action est irréversible.`;
                
                if (confirm(message)) {
                    onBulkDelete(selectedIds);
                }
            };

            actions.push({
                key: 'bulk-delete',
                label: `Supprimer (${selectedIds.length})`,
                onClick: handleBulkDelete,
                variant: 'destructive'
            });
        }

        return actions;
    }, [selectedIds, onBulkDelete, onBulkExport, onBulkArchive, onBulkRestore, customBulkActions]);
} 