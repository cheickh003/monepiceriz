import { Category } from './Category';

export interface ProductAttribute {
    id: number;
    product_id: number;
    name: string;
    slug: string;
    type: string;
    is_required: boolean;
    position: number;
    created_at: string;
    updated_at: string;
    
    // Relations
    values?: ProductAttributeValue[];
}

export interface ProductAttributeValue {
    id: number;
    product_attribute_id: number;
    value: string;
    label: string;
    hex_color?: string;
    position: number;
    created_at: string;
    updated_at: string;
    
    // Relations
    attribute?: ProductAttribute;
}

export interface ProductSku {
    id: number;
    product_id: number;
    sku: string;
    purchase_price: number;
    price_ht: number;
    price_ttc: number;
    compare_at_price?: number;
    stock_quantity: number;
    reserved_quantity: number;
    low_stock_threshold: number;
    weight_grams?: number;
    is_variable_weight: boolean;
    min_weight_grams?: number;
    max_weight_grams?: number;
    weight?: number;
    images?: string[];
    is_default: boolean;
    created_at: string;
    updated_at: string;
    
    // Computed attributes
    is_on_promo?: boolean;
    effective_price?: number;
    discount_percentage?: number;
    
    // Relations
    product?: Product;
    attribute_values?: ProductAttributeValue[];
}

export interface Product {
    id: number;
    category_id: number;
    name: string;
    slug: string;
    description?: string;
    brand?: string;
    reference: string;
    barcode?: string;
    main_image?: string;
    gallery_images?: string[];
    position: number;
    is_active: boolean;
    is_featured: boolean;
    is_variable_weight: boolean;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string[];
    views_count: number;
    created_at: string;
    updated_at: string;
    
    // Computed attributes
    price_ttc?: number;
    promo_price?: number;
    is_promoted?: boolean;
    effective_price?: number;
    image_url?: string;
    
    // Relations
    category?: Category;
    skus?: ProductSku[];
    attributes?: ProductAttribute[];
    default_sku?: ProductSku;
}

export interface ProductFormData {
    name: string;
    slug: string;
    reference: string;
    barcode?: string;
    brand?: string;
    description?: string;
    short_description?: string;
    category_id: number | string;
    country_of_origin?: string;
    is_active: boolean;
    is_featured: boolean;
    is_variable_weight?: boolean;
    position?: number;
    meta_title?: string;
    meta_description?: string;
    meta_keywords?: string[];
    main_image?: File | string | null;
    gallery_images?: (File | string)[];
    images_to_delete?: number[];
    skus: ProductSkuFormData[];
    attributes?: ProductAttributeFormData[];
    _method?: string;
}

export interface ProductSkuFormData {
    id?: number;
    sku: string;
    purchase_price: number;
    price_ht: number;
    price_ttc: number;
    compare_at_price?: number;
    stock_quantity: number;
    reserved_quantity: number;
    low_stock_threshold: number;
    weight_grams?: number;
    is_variable_weight: boolean;
    min_weight_grams?: number;
    max_weight_grams?: number;
    weight?: number;
    images?: (File | string)[];
    is_default: boolean;
    attribute_values?: number[];
    _destroy?: boolean;
}

export interface ProductAttributeFormData {
    id?: number;
    name: string;
    slug: string;
    type: string;
    is_required: boolean;
    position: number;
    values: ProductAttributeValueFormData[];
    _destroy?: boolean;
}

export interface ProductAttributeValueFormData {
    id?: number;
    value: string;
    label: string;
    hex_color?: string;
    position: number;
    _destroy?: boolean;
}

export interface ProductFilter {
    category_id?: number;
    brand?: string;
    is_active?: boolean;
    is_featured?: boolean;
    is_variable_weight?: boolean;
    price_min?: number;
    price_max?: number;
    in_stock?: boolean;
    on_sale?: boolean;
    search?: string;
    sort?: 'name' | 'price' | 'created_at' | 'position' | 'views_count';
    order?: 'asc' | 'desc';
}

export interface CartItem {
    id: number;
    product: Product;
    sku: ProductSku;
    quantity: number;
    selected_attributes?: Record<number, number>;
    estimated_weight?: number;
    unit_price: number;
    line_total: number;
}

export interface ProductSearchSuggestion {
    id: number;
    name: string;
    slug: string;
    price?: number;
    promo_price?: number;
    is_promoted?: boolean;
    category?: {
        id: number;
        name: string;
        slug: string;
    };
    image?: string;
    type: 'product';
}

export interface CategorySearchSuggestion {
    id: number;
    name: string;
    slug: string;
    products_count?: number;
    type: 'category';
}

export type SearchSuggestion = ProductSearchSuggestion | CategorySearchSuggestion;

// Types spécifiques pour la gestion des formulaires
export interface ProductImage {
    id: number;
    product_id: number;
    url: string;
    is_main: boolean;
    position: number;
    created_at: string;
    updated_at: string;
}

export interface Sku extends ProductSkuFormData {
    name: string;
    tempId?: string;
    barcode?: string;
    vat_rate?: number;
    attributes: Record<number, number>; // Ensure attributes is always defined
}

// Types pour la gestion des attributs dans les formulaires
export interface AttributeFormValue {
    id: number;
    value: string;
    label: string;
    hex_color?: string;
}

export interface AttributeFormOption {
    id: number;
    name: string;
    type: string;
    values: AttributeFormValue[];
}

// Type pour les attributs globaux (non liés à un produit)
export interface Attribute {
    id: number;
    name: string;
    slug: string;
    type: 'select' | 'color' | 'size' | 'text' | 'weight';
    is_global?: boolean;
    is_required?: boolean;
    position?: number;
    created_at: string;
    updated_at: string;
    values: AttributeValue[]; // Always required, defaults to empty array
    values_count?: number;
    products_count?: number;
}

export interface AttributeValue {
    id: number;
    attribute_id?: number;
    product_attribute_id?: number;
    value: string;
    label?: string;
    hex_color?: string;
    position?: number;
    created_at?: string;
    updated_at?: string;
}