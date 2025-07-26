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
        'address' => env('SHOP_STORE_ADDRESS', 'Allocodrome non loin de l\'école, Av. Jean Mermoz, Abidjan'),
        'phone' => env('SHOP_STORE_PHONE', '+225XXXXXXXXXX'),
        'email' => env('SHOP_STORE_EMAIL', 'contact@monepiceriz.com'),
        'timezone' => env('SHOP_TIMEZONE', 'Africa/Abidjan'),
        'currency' => env('SHOP_CURRENCY', 'XOF'),
        'currency_symbol' => 'F CFA',
        'locale' => 'fr_CI',
    ],

    /*
    |--------------------------------------------------------------------------
    | Contact Information
    |--------------------------------------------------------------------------
    */
    'contact' => [
        'phone' => env('SHOP_CONTACT_PHONE', '+225 07 00 00 00 00'),
        'whatsapp' => env('SHOP_CONTACT_WHATSAPP', '+225 07 00 00 00 00'),
        'email' => env('SHOP_CONTACT_EMAIL', 'contact@monepiceriz.ci'),
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
    | Delivery Settings
    |--------------------------------------------------------------------------
    */
    'delivery' => [
        'default_fee' => env('SHOP_DEFAULT_DELIVERY_FEE', 1500),
        'zones' => [
            'cocody' => ['name' => 'Cocody', 'base_fee' => 1000],
            'plateau' => ['name' => 'Plateau', 'base_fee' => 1500],
            'marcory' => ['name' => 'Marcory', 'base_fee' => 2000],
            'yopougon' => ['name' => 'Yopougon', 'base_fee' => 2500],
            'abobo' => ['name' => 'Abobo', 'base_fee' => 2500],
            'adjame' => ['name' => 'Adjamé', 'base_fee' => 2000],
            'treichville' => ['name' => 'Treichville', 'base_fee' => 2000],
            'koumassi' => ['name' => 'Koumassi', 'base_fee' => 2500],
            'port-bouet' => ['name' => 'Port-Bouët', 'base_fee' => 3000],
            'attécoubé' => ['name' => 'Attécoubé', 'base_fee' => 2500],
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Pickup Settings
    |--------------------------------------------------------------------------
    */
    'pickup' => [
        'time_slots' => [
            '09:00-12:00' => 'Matin (9h - 12h)',
            '14:00-17:00' => 'Après-midi (14h - 17h)',
            '17:00-20:00' => 'Soir (17h - 20h)',
        ],
        'preparation_time' => 2, // heures minimum pour préparer une commande
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
        'tolerance_percent' => 20, // Tolérance en % pour la différence de poids
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
        'order_processing' => [
            'email' => true,
            'sms' => false,
        ],
        'order_delivered' => [
            'email' => true,
            'sms' => false,
        ],
        'low_stock_alert' => [
            'email' => true,
            'threshold' => 10,
        ],
        'admin_new_order' => [
            'email' => true,
            'recipients' => env('SHOP_ADMIN_EMAILS', ''), // Emails séparés par des virgules
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Payment Settings
    |--------------------------------------------------------------------------
    */
    'payment' => [
        'methods' => [
            'cash' => [
                'enabled' => true,
                'label' => 'Paiement à la livraison',
                'description' => 'Payez en espèces lors de la livraison ou du retrait',
            ],
            'card' => [
                'enabled' => true,
                'label' => 'Paiement par carte',
                'description' => 'Visa, Mastercard, Orange Money, Wave',
                'provider' => 'cinetpay',
            ],
        ],
        'pre_authorization' => [
            'enabled' => true,
            'margin_percent' => 20, // Marge pour les produits à poids variable
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Admin Settings
    |--------------------------------------------------------------------------
    */
    'admin' => [
        'pagination' => [
            'orders' => 20,
            'products' => 50,
            'customers' => 50,
        ],
        'export' => [
            'formats' => ['csv', 'xlsx'],
            'max_rows' => 10000,
        ],
        'dashboard' => [
            'refresh_interval' => 300, // secondes
            'metrics_period' => 30, // jours
        ],
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Settings
    |--------------------------------------------------------------------------
    */
    'security' => [
        'order_access_duration' => 7, // jours - durée d'accès aux commandes pour les clients non connectés
        'webhook_timeout' => 30, // secondes
        'rate_limits' => [
            'checkout' => 10, // max tentatives par heure
            'api' => 60, // max requêtes API par minute
        ],
    ],
];