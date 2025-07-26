// Export des types principaux
export * from './User';
export * from './Category';
export * from './Product';
export * from './Order';
export * from './Common';

// Import des types pour les interfaces locales
import type { User } from './User';
import type { AppConfig, ShopConfig } from './Common';

// Types spécifiques à Inertia.js
export type PageProps<
    T extends Record<string, unknown> = Record<string, unknown>
> = T & {
    auth: {
        user: User;
    };
    flash?: {
        success?: string;
        error?: string;
        warning?: string;
        info?: string;
    };
    errors?: Record<string, string>;
    app?: AppConfig;
    shop?: ShopConfig;
}

// Helper type for ensuring required properties with defaults
export type WithDefaults<T> = T & {
    [K in keyof T]-?: T[K];
};

// Types pour les props de composants Inertia
export interface InertiaFormProps {
    data: any;
    setData: (key: string, value: any) => void;
    post: (url: string, options?: any) => void;
    put: (url: string, options?: any) => void;
    patch: (url: string, options?: any) => void;
    delete: (url: string, options?: any) => void;
    processing: boolean;
    errors: Record<string, string>;
    hasErrors: boolean;
    progress?: {
        percentage: number;
        loaded: number;
        total: number;
    };
    wasSuccessful: boolean;
    recentlySuccessful: boolean;
    reset: (...fields: string[]) => void;
    clearErrors: (...fields: string[]) => void;
    transform: (callback: (data: any) => any) => void;
}

// Types pour les visites Inertia
export interface InertiaVisitOptions {
    method?: 'get' | 'post' | 'put' | 'patch' | 'delete';
    data?: any;
    replace?: boolean;
    preserveState?: boolean;
    preserveScroll?: boolean;
    only?: string[];
    headers?: Record<string, string>;
    errorBag?: string;
    forceFormData?: boolean;
    onBefore?: () => boolean | void;
    onStart?: () => void;
    onProgress?: (progress: { percentage: number; loaded: number; total: number }) => void;
    onSuccess?: (page: any) => void;
    onError?: (errors: Record<string, string>) => void;
    onCancel?: () => void;
    onFinish?: () => void;
}

// Re-export de types utiles de React
export interface ReactSelectOption {
    value: string | number;
    label: string;
    disabled?: boolean;
    [key: string]: any;
}

export interface ReactSelectProps {
    options: ReactSelectOption[];
    value?: ReactSelectOption | ReactSelectOption[] | null;
    onChange: (option: ReactSelectOption | ReactSelectOption[] | null) => void;
    isMulti?: boolean;
    placeholder?: string;
    isDisabled?: boolean;
    isLoading?: boolean;
    isClearable?: boolean;
    isSearchable?: boolean;
    className?: string;
} 