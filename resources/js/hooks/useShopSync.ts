import { useEffect, useState, useCallback } from 'react';
import { router } from '@inertiajs/react';

interface ShopSyncState {
    isOutOfSync: boolean;
    lastSyncTime: number;
    updateAvailable: boolean;
}

export function useShopSync() {
    const [syncState, setSyncState] = useState<ShopSyncState>({
        isOutOfSync: false,
        lastSyncTime: Date.now(),
        updateAvailable: false,
    });

    const [isRefreshing, setIsRefreshing] = useState(false);

    // Forcer le rechargement des données
    const refreshData = useCallback(() => {
        if (isRefreshing) return;
        
        setIsRefreshing(true);
        
        router.reload({
            onFinish: () => {
                setIsRefreshing(false);
                setSyncState(prev => ({
                    ...prev,
                    isOutOfSync: false,
                    updateAvailable: false,
                    lastSyncTime: Date.now(),
                }));
            },
        });
    }, [isRefreshing]);

    // Vérifier les mises à jour automatiquement
    const checkForUpdates = useCallback(() => {
        // Cette fonction sera étendue dans la Phase 3 pour WebSockets
        // Pour l'instant, elle peut être utilisée pour des vérifications périodiques
        
        router.reload({
            only: [], // Ne recharger aucune prop, juste vérifier la version
            onFinish: () => {
                // Si la version a changé, Inertia rechargera automatiquement
                setSyncState(prev => ({
                    ...prev,
                    lastSyncTime: Date.now(),
                }));
            },
        });
    }, []);

    // Écouter les événements Inertia pour détecter les changements de version
    useEffect(() => {
        const handleBeforeVisit = () => {
            setSyncState(prev => ({ ...prev, isOutOfSync: false }));
        };

        const handleFinish = () => {
            setSyncState(prev => ({
                ...prev,
                lastSyncTime: Date.now(),
                updateAvailable: false,
            }));
        };

        const handleInvalidated = () => {
            setSyncState(prev => ({
                ...prev,
                isOutOfSync: true,
                updateAvailable: true,
            }));
        };

        // Événements Inertia
        document.addEventListener('inertia:before', handleBeforeVisit);
        document.addEventListener('inertia:finish', handleFinish);
        document.addEventListener('inertia:invalid', handleInvalidated);

        return () => {
            document.removeEventListener('inertia:before', handleBeforeVisit);
            document.removeEventListener('inertia:finish', handleFinish);
            document.removeEventListener('inertia:invalid', handleInvalidated);
        };
    }, []);

    // Vérification périodique optionnelle (désactivée par défaut)
    useEffect(() => {
        const enablePeriodicCheck = false; // Peut être activé via config
        
        if (!enablePeriodicCheck) return;

        const interval = setInterval(() => {
            checkForUpdates();
        }, 30000); // Vérifier toutes les 30 secondes

        return () => clearInterval(interval);
    }, [checkForUpdates]);

    return {
        ...syncState,
        isRefreshing,
        refreshData,
        checkForUpdates,
        
        // Utilitaires
        needsUpdate: syncState.updateAvailable && !isRefreshing,
        timeSinceLastSync: Date.now() - syncState.lastSyncTime,
    };
} 