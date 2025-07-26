export interface Category {
    id: number;
    name: string;
    slug: string;
    parent_id: number | null;
    position: number;
    is_active: boolean;
    is_featured?: boolean;
    icon?: string;
    description?: string;
    created_at: string;
    updated_at: string;
    
    // Relations
    parent?: Category;
    children: Category[]; // Always required, defaults to empty array
    products_count: number; // Always required, defaults to 0
}

export interface CategoryFormData {
    name: string;
    slug: string;
    parent_id: number | null;
    position: number;
    is_active: boolean;
    icon?: string;
    description?: string;
    _method?: string;
}

export interface CategoryTree extends Category {
    children: CategoryTree[];
    level: number;
}

export interface CategoryFilter {
    parent_id?: number | null;
    is_active?: boolean;
    search?: string;
    sort?: 'name' | 'position' | 'created_at';
    order?: 'asc' | 'desc';
} 