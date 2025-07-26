// Types de pagination
export interface PaginatedResponse<T> {
    data: T[];
    current_page: number;
    first_page_url: string;
    from: number | null;
    last_page: number;
    last_page_url: string;
    links: PaginationLink[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number | null;
    total: number;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface PaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
}

// Types de réponses API
export interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    errors?: Record<string, string[]>;
    meta?: any;
}

export interface ApiError {
    message: string;
    errors?: Record<string, string[]>;
    status?: number;
}

export interface ValidationError {
    message: string;
    errors: Record<string, string[]>;
}

// Types de filtres et tri
export interface BaseFilter {
    search?: string;
    sort?: string;
    order?: 'asc' | 'desc';
    per_page?: number;
    page?: number;
}

export interface FilterOption {
    label: string;
    value: string | number;
    count?: number;
    disabled?: boolean;
}

export interface SortOption {
    label: string;
    value: string;
    order?: 'asc' | 'desc';
}

// Types de formulaires
export interface FormError {
    field: string;
    message: string;
}

export interface FormState {
    loading: boolean;
    errors: Record<string, string>;
    touched: Record<string, boolean>;
    dirty: boolean;
}

export interface UploadedFile {
    id: number;
    name: string;
    url: string;
    size: number;
    type: string;
    created_at: string;
}

export interface FileUploadProgress {
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    error?: string;
    result?: UploadedFile;
}

// Types de modales et notifications
export interface ModalProps {
    show: boolean;
    onClose: () => void;
    title?: string;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
    closable?: boolean;
}

export interface NotificationData {
    id: string;
    type: 'success' | 'error' | 'warning' | 'info';
    title: string;
    message?: string;
    duration?: number;
    actions?: NotificationAction[];
}

export interface NotificationAction {
    label: string;
    action: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
}

// Types de navigation et menu
export interface MenuItem {
    id: string;
    label: string;
    icon?: string;
    url?: string;
    route?: string;
    children?: MenuItem[];
    active?: boolean;
    disabled?: boolean;
    badge?: string | number;
    permission?: string;
}

export interface BreadcrumbItem {
    label: string;
    url?: string;
    route?: string;
    active?: boolean;
}

// Types de statistiques et métriques
export interface StatCard {
    title: string;
    value: string | number;
    change?: number;
    changeType?: 'increase' | 'decrease' | 'neutral';
    icon?: string;
    color?: string;
    description?: string;
}

export interface ChartData {
    labels: string[];
    datasets: ChartDataset[];
}

export interface ChartDataset {
    label: string;
    data: number[];
    backgroundColor?: string | string[];
    borderColor?: string | string[];
    borderWidth?: number;
}

// Types de configuration
export interface AppConfig {
    name: string;
    version: string;
    environment: 'local' | 'staging' | 'production';
    debug: boolean;
    locale: string;
    timezone: string;
    currency: string;
    features: Record<string, boolean>;
}

export interface ShopConfig {
    name: string;
    description?: string;
    logo?: string;
    favicon?: string;
    contact: {
        email: string;
        phone: string;
        address?: string;
    };
    social: {
        facebook?: string;
        instagram?: string;
        twitter?: string;
    };
    settings: {
        allow_guest_checkout: boolean;
        require_email_verification: boolean;
        auto_confirm_orders: boolean;
        enable_reviews: boolean;
        enable_wishlist: boolean;
    };
}

// Types utilitaires
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type WithTimestamps = {
    created_at: string;
    updated_at: string;
};

export type WithId = {
    id: number;
};

export type ModelBase = WithId & WithTimestamps;

// Types d'événements
export interface EventData<T = any> {
    type: string;
    payload: T;
    timestamp: number;
}

export interface WebSocketMessage<T = any> {
    event: string;
    data: T;
    channel?: string;
}

// Types de géolocalisation
export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface Address {
    street: string;
    city: string;
    postal_code: string;
    country: string;
    coordinates?: Coordinates;
}

// Types de devise et prix
export interface Price {
    amount: number;
    currency: string;
    formatted: string;
}

export interface PriceRange {
    min: Price;
    max: Price;
}

// Types de recherche
export interface SearchResult<T = any> {
    results: T[];
    total: number;
    query: string;
    filters?: Record<string, any>;
    suggestions?: string[];
    facets?: SearchFacet[];
}

export interface SearchFacet {
    name: string;
    values: SearchFacetValue[];
}

export interface SearchFacetValue {
    value: string;
    count: number;
    selected?: boolean;
} 