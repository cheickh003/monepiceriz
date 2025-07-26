import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { toast } from '@/Components/ui/use-toast';

export interface ErrorState {
    hasErrors: boolean;
    validationErrors: Record<string, string>;
    serverError: string | null;
    isLoading: boolean;
}

export interface ErrorHandlerOptions {
    showToast?: boolean;
    toastDuration?: number;
    clearOnSuccess?: boolean;
    onError?: (error: any) => void;
    onSuccess?: () => void;
}

export interface UseErrorHandlerReturn extends ErrorState {
    clearErrors: () => void;
    handleError: (error: any) => void;
    handleSuccess: (message?: string) => void;
    setLoading: (loading: boolean) => void;
    getFieldError: (field: string) => string | undefined;
    hasFieldError: (field: string) => boolean;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}): UseErrorHandlerReturn {
    const {
        showToast = true,
        toastDuration = 5000,
        clearOnSuccess = true,
        onError,
        onSuccess
    } = options;

    const { props } = usePage();
    const [errorState, setErrorState] = useState<ErrorState>({
        hasErrors: false,
        validationErrors: {},
        serverError: null,
        isLoading: false
    });

    // Synchroniser avec les erreurs d'Inertia
    useEffect(() => {
        const inertiaErrors = props.errors as Record<string, string> || {};
        const hasInertiaErrors = Object.keys(inertiaErrors).length > 0;

        if (hasInertiaErrors) {
            setErrorState(prev => ({
                ...prev,
                hasErrors: true,
                validationErrors: inertiaErrors,
                serverError: null
            }));

            if (showToast) {
                const firstError = Object.values(inertiaErrors)[0];
                toast({
                    title: "Erreur de validation",
                    description: firstError || 'Veuillez corriger les erreurs dans le formulaire',
                    variant: "destructive",
                });
            }
        }
    }, [props.errors, showToast, toastDuration]);

    // Gérer les messages de succès d'Inertia
    useEffect(() => {
        const flash = props.flash as Record<string, any> | undefined;
        const successMessage = flash?.success as string;
        if (successMessage) {
            handleSuccess(successMessage);
        }
    }, [props.flash]);

    // Gérer les messages d'erreur flash d'Inertia
    useEffect(() => {
        const flash = props.flash as Record<string, any> | undefined;
        const errorMessage = flash?.error as string;
        if (errorMessage) {
            handleError({ message: errorMessage });
        }
    }, [props.flash]);

    const clearErrors = () => {
        setErrorState({
            hasErrors: false,
            validationErrors: {},
            serverError: null,
            isLoading: false
        });
    };

    const handleError = (error: any) => {
        console.error('Error caught by useErrorHandler:', error);

        let errorMessage = 'Une erreur inattendue s\'est produite';
        let validationErrors: Record<string, string> = {};

        if (error) {
            // Erreur Inertia avec erreurs de validation
            if (error.response?.data?.errors) {
                validationErrors = error.response.data.errors;
                const firstError = Object.values(validationErrors)[0] as string;
                errorMessage = firstError || errorMessage;
            }
            // Erreur avec message personnalisé
            else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            }
            // Erreur avec message direct
            else if (error.message) {
                errorMessage = error.message;
            }
            // Erreur string
            else if (typeof error === 'string') {
                errorMessage = error;
            }
        }

        setErrorState({
            hasErrors: true,
            validationErrors,
            serverError: Object.keys(validationErrors).length === 0 ? errorMessage : null,
            isLoading: false
        });

        if (showToast) {
            toast({
                title: "Erreur",
                description: errorMessage,
                variant: "destructive",
            });
        }

        onError?.(error);
    };

    const handleSuccess = (message?: string) => {
        if (clearOnSuccess) {
            clearErrors();
        } else {
            setErrorState(prev => ({
                ...prev,
                isLoading: false
            }));
        }

        if (message && showToast) {
            toast({
                title: "Succès",
                description: message,
                variant: "default",
            });
        }

        onSuccess?.();
    };

    const setLoading = (loading: boolean) => {
        setErrorState(prev => ({
            ...prev,
            isLoading: loading
        }));
    };

    const getFieldError = (field: string): string | undefined => {
        return errorState.validationErrors[field];
    };

    const hasFieldError = (field: string): boolean => {
        return !!errorState.validationErrors[field];
    };

    return {
        ...errorState,
        clearErrors,
        handleError,
        handleSuccess,
        setLoading,
        getFieldError,
        hasFieldError
    };
}

// Hook spécialisé pour les formulaires
export function useFormErrorHandler(options: ErrorHandlerOptions = {}) {
    const errorHandler = useErrorHandler(options);

    // Wrapper pour les soumissions de formulaire
    const handleFormSubmit = async (submitFn: () => Promise<any> | any) => {
        try {
            errorHandler.setLoading(true);
            errorHandler.clearErrors();
            
            const result = await submitFn();
            
            // Si c'est une promesse Inertia, elle se résoudra automatiquement
            // Les erreurs seront gérées par les effets du hook
            return result;
        } catch (error) {
            errorHandler.handleError(error);
            throw error; // Re-throw pour permettre la gestion locale si nécessaire
        } finally {
            errorHandler.setLoading(false);
        }
    };

    return {
        ...errorHandler,
        handleFormSubmit
    };
}

// Handlers spécifiques pour les actions CRUD
export function useCrudErrorHandlers() {
    const { handleError } = useErrorHandler();

    const handlers = {
        create: (error: any) => {
            handleError({
                ...error,
                message: error.message || 'Erreur lors de la création'
            });
        },
        update: (error: any) => {
            handleError({
                ...error,
                message: error.message || 'Erreur lors de la mise à jour'
            });
        },
        delete: (error: any) => {
            handleError({
                ...error,
                message: error.message || 'Erreur lors de la suppression'
            });
        },
        fetch: (error: any) => {
            handleError({
                ...error,
                message: error.message || 'Erreur lors du chargement des données'
            });
        }
    };

    return { handlers };
}

export default useErrorHandler; 