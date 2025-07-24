<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Shop Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration générale de la boutique MonEpice&Riz
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Store Information
    |--------------------------------------------------------------------------
    */
    'store' => [
        'name' => env('SHOP_STORE_NAME', 'MonEpice&Riz'),
        'address' => env('SHOP_STORE_ADDRESS', 'Abidjan, Côte d\'Ivoire'),
        'phone' => env('SHOP_STORE_PHONE', '+225XXXXXXXXXX'),
        'email' => env('SHOP_STORE_EMAIL', 'contact@monepiceriz.com'),
        'timezone' => env('SHOP_TIMEZONE', 'Africa/Abidjan'),
        'currency' => env('SHOP_CURRENCY', 'XOF'),
        'currency_symbol' => 'F CFA',
        'locale' => 'fr_CI',
    ],

    /*
    |--------------------------------------------------------------------------
    | Business Rules
    |--------------------------------------------------------------------------
    */
    'business' => [
        'min_delivery_amount' => env('SHOP_MIN_DELIVERY_AMOUNT', 3000), // Montant minimum pour livraison
        'delivery_radius' => 20, // km
        'opening_hours' => [
            'monday' => ['08:00', '20:00'],
            'tuesday' => ['08:00', '20:00'],
            'wednesday' => ['08:00', '20:00'],
            'thursday' => ['08:00', '20:00'],
            'friday' => ['08:00', '20:00'],
            'saturday' => ['08:00', '20:00'],
            'sunday' => ['09:00', '18:00'],
        ],
        'pickup_slots' => [
            '09:00-11:00',
            '11:00-13:00',
            '14:00-16:00',
            '16:00-18:00',
            '18:00-20:00',
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Inventory Settings
    |--------------------------------------------------------------------------
    */
    'inventory' => [
        'low_stock_threshold' => 10, // Seuil d'alerte stock bas
        'out_of_stock_behavior' => 'hide', // hide, show_unavailable, allow_preorder
        'reserve_stock_duration' => 30, // minutes - durée de réservation du stock dans le panier
    ],

    /*
    |--------------------------------------------------------------------------
    | Order Settings
    |--------------------------------------------------------------------------
    */
    'orders' => [
        'number_prefix' => 'CMD',
        'number_length' => 8,
        'auto_confirm_payment' => true,
        'cancel_unpaid_after' => 24, // heures
        'retention_period' => 365, // jours
    ],

    /*
    |--------------------------------------------------------------------------
    | Variable Weight Products
    |--------------------------------------------------------------------------
    |
    | Configuration pour les produits vendus au poids (boucherie, poissonnerie)
    |
    */
    'variable_weight' => [
        'categories' => ['boucherie', 'poissonnerie'], // Slugs des catégories concernées
        'estimation_margin' => 1.2, // Marge de 20% pour la pré-autorisation
        'units' => [
            'display' => 'kg', // Unité d'affichage
            'storage' => 'g', // Unité de stockage en base
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Promotions
    |--------------------------------------------------------------------------
    */
    'promotions' => [
        'enable_flash_sales' => true,
        'enable_bulk_discounts' => true,
        'enable_coupons' => false, // Pour v2
    ],

    /*
    |--------------------------------------------------------------------------
    | SEO Settings
    |--------------------------------------------------------------------------
    */
    'seo' => [
        'default_title' => 'MonEpice&Riz - Votre épicerie en ligne à Abidjan',
        'default_description' => 'Commandez vos courses en ligne et faites-vous livrer à Abidjan. Produits frais, épicerie, boucherie et plus encore.',
        'default_keywords' => 'épicerie, courses en ligne, livraison Abidjan, MonEpice&Riz, produits frais',
        'og_image' => '/images/og-default.jpg',
    ],

    /*
    |--------------------------------------------------------------------------
    | Features Flags
    |--------------------------------------------------------------------------
    |
    | Activer/désactiver des fonctionnalités
    |
    */
    'features' => [
        'guest_checkout' => true,
        'user_accounts' => false, // Pour v2
        'wishlist' => false, // Pour v2
        'reviews' => false, // Pour v2
        'loyalty_program' => false, // Pour v2
        'multi_language' => false, // Pour v2
        'live_chat' => false, // Pour v2
    ],

    /*
    |--------------------------------------------------------------------------
    | Analytics
    |--------------------------------------------------------------------------
    */
    'analytics' => [
        'google_analytics_id' => env('GOOGLE_ANALYTICS_ID'),
        'facebook_pixel_id' => env('FACEBOOK_PIXEL_ID'),
        'enable_heatmaps' => env('ENABLE_HEATMAPS', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Notifications
    |--------------------------------------------------------------------------
    */
    'notifications' => [
        'order_confirmed' => [
            'email' => true,
            'sms' => false, // Pour v2
        ],
        'order_ready' => [
            'email' => true,
            'sms' => false, // Pour v2
        ],
        'low_stock_alert' => [
            'email' => true,
            'threshold' => 10,
        ],
    ],
];