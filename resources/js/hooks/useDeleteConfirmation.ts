import { useState, useCallback } from 'react';
import { router } from '@inertiajs/react';
import { toast } from '@/Components/ui/use-toast';

interface UseDeleteConfirmationOptions {
    resource: string; // 'produit', 'catégorie', etc.
    resourceName?: (item: any) => string; // Fonction pour obtenir le nom de l'élément
    onSuccess?: () => void;
    onError?: (error: any) => void;
    customMessage?: (item: any) => string;
    redirectAfterDelete?: boolean;
    redirectUrl?: string;
}

interface DeleteState {
    isDeleting: boolean;
    itemToDelete: any | null;
    showConfirmDialog: boolean;
}

export const useDeleteConfirmation = (options: UseDeleteConfirmationOptions) => {
    const {
        resource,
        resourceName = (item) => item.name || 'cet élément',
        onSuccess,
        onError,
        customMessage,
        redirectAfterDelete = false,
        redirectUrl = '/admin'
    } = options;

    const [deleteState, setDeleteState] = useState<DeleteState>({
        isDeleting: false,
        itemToDelete: null,
        showConfirmDialog: false
    });

    // Ouvrir le dialogue de confirmation
    const confirmDelete = useCallback((item: any) => {
        setDeleteState({
            isDeleting: false,
            itemToDelete: item,
            showConfirmDialog: true
        });
    }, []);

    // Annuler la suppression
    const cancelDelete = useCallback(() => {
        setDeleteState({
            isDeleting: false,
            itemToDelete: null,
            showConfirmDialog: false
        });
    }, []);

    // Effectuer la suppression
    const executeDelete = useCallback(async () => {
        const { itemToDelete } = deleteState;
        if (!itemToDelete) return;

        setDeleteState(prev => ({ ...prev, isDeleting: true }));

        try {
            await new Promise<void>((resolve, reject) => {
                router.delete(itemToDelete.delete_url || `${itemToDelete.id}`, {
                    preserveScroll: !redirectAfterDelete,
                    preserveState: !redirectAfterDelete,
                    onSuccess: () => {
                        toast({
                            title: "Suppression réussie",
                            description: `${resource} "${resourceName(itemToDelete)}" a été supprimé${resource.endsWith('e') ? 'e' : ''} avec succès.`,
                            variant: "default",
                        });

                        setDeleteState({
                            isDeleting: false,
                            itemToDelete: null,
                            showConfirmDialog: false
                        });

                        onSuccess?.();
                        resolve();

                        if (redirectAfterDelete && redirectUrl) {
                            setTimeout(() => {
                                router.visit(redirectUrl);
                            }, 500);
                        }
                    },
                    onError: (errors) => {
                        let errorMessage = 'Une erreur est survenue lors de la suppression.';
                        
                        if (errors.message) {
                            errorMessage = errors.message;
                        } else if (typeof errors === 'string') {
                            errorMessage = errors;
                        }

                        toast({
                            title: "Erreur de suppression",
                            description: errorMessage,
                            variant: "destructive",
                        });

                        setDeleteState(prev => ({ ...prev, isDeleting: false }));
                        onError?.(errors);
                        reject(errors);
                    }
                });
            });
        } catch (error) {
            // Erreur déjà gérée dans onError
        }
    }, [deleteState.itemToDelete, resource, resourceName, onSuccess, onError, redirectAfterDelete, redirectUrl]);

    // Suppression directe sans confirmation (pour les cas spéciaux)
    const deleteWithoutConfirmation = useCallback(async (item: any) => {
        setDeleteState({
            isDeleting: true,
            itemToDelete: item,
            showConfirmDialog: false
        });

        try {
            await new Promise<void>((resolve, reject) => {
                router.delete(item.delete_url || `${item.id}`, {
                    preserveScroll: !redirectAfterDelete,
                    preserveState: !redirectAfterDelete,
                    onSuccess: () => {
                        toast({
                            title: "Suppression réussie",
                            description: `${resource} supprimé${resource.endsWith('e') ? 'e' : ''} avec succès.`,
                            variant: "default",
                        });

                        setDeleteState({
                            isDeleting: false,
                            itemToDelete: null,
                            showConfirmDialog: false
                        });

                        onSuccess?.();
                        resolve();
                    },
                    onError: (errors) => {
                        toast({
                            title: "Erreur",
                            description: "Impossible de supprimer cet élément.",
                            variant: "destructive",
                        });

                        setDeleteState({
                            isDeleting: false,
                            itemToDelete: null,
                            showConfirmDialog: false
                        });

                        onError?.(errors);
                        reject(errors);
                    }
                });
            });
        } catch (error) {
            // Erreur déjà gérée
        }
    }, [resource, onSuccess, onError, redirectAfterDelete]);

    // Obtenir le message de confirmation
    const getConfirmMessage = useCallback(() => {
        const { itemToDelete } = deleteState;
        if (!itemToDelete) return '';

        if (customMessage) {
            return customMessage(itemToDelete);
        }

        const name = resourceName(itemToDelete);
        return `Êtes-vous sûr de vouloir supprimer ${resource.toLowerCase()} "${name}" ? Cette action est irréversible.`;
    }, [deleteState.itemToDelete, resource, resourceName, customMessage]);

    // Vérifier si on peut supprimer
    const canDelete = useCallback((item: any): boolean => {
        // Logique personnalisée selon le type de ressource
        if (resource.toLowerCase().includes('catégorie')) {
            return !item.children || item.children.length === 0;
        }
        return true;
    }, [resource]);

    // Obtenir le message d'erreur si on ne peut pas supprimer
    const getCannotDeleteReason = useCallback((item: any): string => {
        if (!canDelete(item)) {
            if (resource.toLowerCase().includes('catégorie') && item.children?.length > 0) {
                return 'Cette catégorie contient des sous-catégories. Veuillez d\'abord supprimer ou déplacer les sous-catégories.';
            }
            return 'Cet élément ne peut pas être supprimé.';
        }
        return '';
    }, [resource, canDelete]);

    return {
        // État
        isDeleting: deleteState.isDeleting,
        itemToDelete: deleteState.itemToDelete,
        showConfirmDialog: deleteState.showConfirmDialog,
        
        // Actions
        confirmDelete,
        cancelDelete,
        executeDelete,
        deleteWithoutConfirmation,
        
        // Utilitaires
        getConfirmMessage,
        canDelete,
        getCannotDeleteReason,
        
        // Setters directs si besoin
        setShowConfirmDialog: (show: boolean) => 
            setDeleteState(prev => ({ ...prev, showConfirmDialog: show }))
    };
};

// Hook spécialisé pour la suppression en masse
export const useBulkDeleteConfirmation = (options: UseDeleteConfirmationOptions) => {
    const baseHook = useDeleteConfirmation(options);
    const [selectedItems, setSelectedItems] = useState<any[]>([]);

    const confirmBulkDelete = useCallback(() => {
        if (selectedItems.length === 0) {
            toast({
                title: "Aucune sélection",
                description: "Veuillez sélectionner au moins un élément à supprimer.",
                variant: "destructive",
            });
            return;
        }

        baseHook.confirmDelete({
            id: selectedItems.map(item => item.id),
            name: `${selectedItems.length} ${options.resource}${selectedItems.length > 1 ? 's' : ''}`,
            delete_url: `bulk-delete`
        });
    }, [selectedItems, options.resource, baseHook]);

    const executeBulkDelete = useCallback(async () => {
        const itemIds = selectedItems.map(item => item.id);
        
        try {
            await new Promise<void>((resolve, reject) => {
                router.post('/admin/bulk-delete', {
                    ids: itemIds,
                    resource: options.resource
                }, {
                    onSuccess: () => {
                        toast({
                            title: "Suppression réussie",
                            description: `${selectedItems.length} ${options.resource}${selectedItems.length > 1 ? 's ont' : ' a'} été supprimé${selectedItems.length > 1 ? 's' : ''}.`,
                            variant: "default",
                        });
                        
                        setSelectedItems([]);
                        baseHook.cancelDelete();
                        options.onSuccess?.();
                        resolve();
                    },
                    onError: (errors) => {
                        toast({
                            title: "Erreur",
                            description: "Une erreur est survenue lors de la suppression.",
                            variant: "destructive",
                        });
                        
                        options.onError?.(errors);
                        reject(errors);
                    }
                });
            });
        } catch (error) {
            // Erreur déjà gérée
        }
    }, [selectedItems, options, baseHook]);

    return {
        ...baseHook,
        selectedItems,
        setSelectedItems,
        confirmBulkDelete,
        executeBulkDelete,
        hasSelection: selectedItems.length > 0,
        selectionCount: selectedItems.length
    };
};