import { ProductSku } from './Product';

export interface Order {
    id: number;
    order_number: string;
    customer_id?: number;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    subtotal: number;
    delivery_fee: number;
    total_amount: number;
    status: OrderStatus;
    payment_status: PaymentStatus;
    payment_method?: string;
    payment_reference?: string;
    delivery_method: DeliveryMethod;
    delivery_address?: string;
    delivery_notes?: string;
    pickup_date?: string;
    pickup_time_slot?: string;
    requires_weight_confirmation: boolean;
    weight_confirmed_at?: string;
    completed_at?: string;
    notes?: string;
    created_at: string;
    updated_at: string;
    
    // Relations
    items?: OrderItem[];
    customer?: Customer;
}

export interface OrderItem {
    id: number;
    order_id: number;
    product_sku_id: number;
    product_name: string;
    sku_code: string;
    sku_name: string;
    quantity: number;
    unit_price: number;
    line_total: number;
    estimated_weight?: number;
    actual_weight?: number;
    is_variable_weight: boolean;
    weight_difference?: number;
    price_adjustment?: number;
    created_at: string;
    updated_at: string;
    
    // Relations
    order?: Order;
    product_sku?: ProductSku;
    
    // Computed attributes
    formatted_unit_price?: string;
    formatted_line_total?: string;
    formatted_weight?: string;
    weight_difference_percent?: number;
    display_info?: OrderItemDisplayInfo;
}

export interface OrderItemDisplayInfo {
    name: string;
    sku: string;
    quantity: number;
    unit_price: string;
    total: string;
    weight?: {
        estimated: string;
        actual?: string;
        difference?: string;
        difference_percent: number;
    };
}

export interface Customer {
    id: number;
    name: string;
    email: string;
    phone: string;
    address?: string;
    created_at: string;
    updated_at: string;
    
    // Relations
    orders?: Order[];
}

export interface OrderFormData {
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    delivery_method: DeliveryMethod;
    delivery_address?: string;
    delivery_notes?: string;
    pickup_date?: string;
    pickup_time_slot?: string;
    payment_method?: string;
    items: OrderItemFormData[];
    _method?: string;
}

export interface OrderItemFormData {
    product_sku_id: number;
    quantity: number;
    estimated_weight?: number;
    unit_price: number;
    selected_attributes?: Record<number, number>;
}

export interface CheckoutData {
    customer: {
        name: string;
        email: string;
        phone: string;
    };
    delivery: {
        method: DeliveryMethod;
        address?: string;
        notes?: string;
        pickup_date?: string;
        pickup_time_slot?: string;
    };
    payment: {
        method: string;
    };
    items: CartItemCheckout[];
}

export interface CartItemCheckout {
    product_sku_id: number;
    quantity: number;
    estimated_weight?: number;
    unit_price: number;
    line_total: number;
}

export interface OrderFilter {
    status?: OrderStatus;
    payment_status?: PaymentStatus;
    delivery_method?: DeliveryMethod;
    customer_email?: string;
    customer_phone?: string;
    order_number?: string;
    date_from?: string;
    date_to?: string;
    requires_weight_confirmation?: boolean;
    search?: string;
    sort?: 'created_at' | 'total_amount' | 'order_number' | 'status';
    order?: 'asc' | 'desc';
}

export interface OrderSummary {
    total_orders: number;
    pending_orders: number;
    confirmed_orders: number;
    processing_orders: number;
    completed_orders: number;
    total_revenue: number;
    average_order_value: number;
    orders_requiring_weight_confirmation: number;
}

export interface WeightConfirmation {
    order_item_id: number;
    actual_weight: number;
    notes?: string;
}

export interface OrderStatusUpdate {
    status: OrderStatus;
    notes?: string;
}

// Enums
export type OrderStatus = 
    | 'pending'
    | 'confirmed' 
    | 'processing'
    | 'ready'
    | 'delivering'
    | 'completed'
    | 'cancelled';

export type PaymentStatus = 
    | 'pending'
    | 'authorized'
    | 'paid'
    | 'failed'
    | 'refunded';

export type DeliveryMethod = 
    | 'pickup'
    | 'delivery';

// Constants
export const ORDER_STATUSES: Record<OrderStatus, string> = {
    pending: 'En attente',
    confirmed: 'Confirmée',
    processing: 'En préparation',
    ready: 'Prête',
    delivering: 'En livraison',
    completed: 'Terminée',
    cancelled: 'Annulée'
};

export const PAYMENT_STATUSES: Record<PaymentStatus, string> = {
    pending: 'En attente',
    authorized: 'Autorisé',
    paid: 'Payé',
    failed: 'Échec',
    refunded: 'Remboursé'
};

export const DELIVERY_METHODS: Record<DeliveryMethod, string> = {
    pickup: 'Retrait en magasin',
    delivery: 'Livraison à domicile'
}; 