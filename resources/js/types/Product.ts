export interface Category {
  id: number
  name: string
  slug: string
  description?: string
  parent_id?: number | null
  icon?: string
  position?: number
  is_active?: boolean
  products_count?: number
}

export interface ProductSku {
  id: number
  product_id: number
  sku: string
  barcode?: string
  price_ttc: number
  promo_price?: number | null
  promo_start_date?: string | null
  promo_end_date?: string | null
  cost_price?: number
  stock_quantity: number
  min_stock_level?: number
  weight?: number
  dimensions?: string
  is_default?: boolean
}

export interface Product {
  id: number
  category_id: number
  name: string
  slug: string
  description?: string
  short_description?: string
  brand?: string
  reference?: string
  barcode?: string
  main_image?: string | null
  gallery_images?: string[]
  position?: number
  is_active: boolean
  is_featured?: boolean
  is_variable_weight?: boolean
  meta_title?: string
  meta_description?: string
  meta_keywords?: string[]
  views_count?: number
  tags?: string
  
  // Relations
  category?: Category
  default_sku?: ProductSku
  skus?: ProductSku[]
  
  // Computed properties from backend
  price_ttc?: number | null
  promo_price?: number | null
  is_promoted?: boolean
  effective_price?: number | null
  image_url?: string | null
  in_stock?: boolean
  min_price?: number
  max_price?: number
  
  // Review/Rating properties
  average_rating?: number
  reviews_count?: number
  
  // Additional properties for specific contexts
  created_at?: string
  updated_at?: string
}

export interface CartItem {
  id: number
  product: Product
  quantity: number
  selectedOptions?: Record<string, string>
}

export interface PaginatedResponse<T> {
  data: T[]
  current_page: number
  first_page_url: string
  from: number | null
  last_page: number
  last_page_url: string
  links: {
    url: string | null
    label: string
    active: boolean
  }[]
  next_page_url: string | null
  path: string
  per_page: number
  prev_page_url: string | null
  to: number | null
  total: number
}

export interface SearchSuggestion {
  id: number
  name: string
  slug?: string
  price?: number
  promo_price?: number | null
  is_promoted?: boolean
  category?: {
    name: string
    slug: string
  }
  image?: string | null
  type?: 'product' | 'category'
}

export interface Filter {
  category?: string | number
  brand?: string
  origin?: string
  rating?: number
  price_min?: number
  price_max?: number
  in_stock?: boolean
  on_sale?: boolean
  sort?: 'relevance' | 'price_asc' | 'price_desc' | 'rating' | 'newest' | 'bestsellers'
  search?: string
}

export interface FilterOption {
  label: string
  value: string
  count?: number
}