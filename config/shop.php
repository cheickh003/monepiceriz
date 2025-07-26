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
    | Inventory Settings & Stock Thresholds
    |--------------------------------------------------------------------------
    |
    | Configuration de la gestion des stocks et des seuils d'alerte
    |
    | low_stock_threshold: Seuil d'alerte stock bas (quantité)
    | critical_stock_threshold: Seuil critique nécessitant action immédiate
    | out_of_stock_threshold: Seuil considéré comme rupture de stock
    | overstock_threshold: Seuil de surstockage pour optimisation
    | reserve_stock_duration: Durée de réservation du stock dans le panier
    | auto_restock_enabled: Réassort automatique activé
    | stock_movement_tracking: Suivi des mouvements de stock
    |
    */
    'inventory' => [
        // === Seuils de stock ===
        'low_stock_threshold' => env('SHOP_LOW_STOCK_THRESHOLD', 10),
        'critical_stock_threshold' => env('SHOP_CRITICAL_STOCK_THRESHOLD', 3),
        'out_of_stock_threshold' => env('SHOP_OUT_OF_STOCK_THRESHOLD', 0),
        'overstock_threshold' => env('SHOP_OVERSTOCK_THRESHOLD', 1000),
        'safety_stock_percentage' => env('SHOP_SAFETY_STOCK_PERCENT', 20), // Pourcentage de stock de sécurité
        
        // === Comportements ===
        'out_of_stock_behavior' => env('SHOP_OUT_OF_STOCK_BEHAVIOR', 'hide'), // hide, show_unavailable, allow_preorder
        'reserve_stock_duration' => env('SHOP_RESERVE_STOCK_DURATION', 30), // minutes
        'auto_restock_enabled' => env('SHOP_AUTO_RESTOCK', false),
        'negative_stock_allowed' => env('SHOP_NEGATIVE_STOCK', false),
        'backorder_enabled' => env('SHOP_BACKORDER', false),
        
        // === Alertes et notifications ===
        'alert_enabled' => env('SHOP_INVENTORY_ALERTS', true),
        'alert_frequency' => env('SHOP_ALERT_FREQUENCY', 'daily'), // hourly, daily, weekly
        'alert_recipients' => env('SHOP_INVENTORY_ALERT_EMAILS', ''),
        'sms_alerts_enabled' => env('SHOP_SMS_INVENTORY_ALERTS', false),
        
        // === Seuils par catégorie ===
        'category_thresholds' => [
            'default' => [
                'low_stock' => 10,
                'critical_stock' => 3,
                'overstock' => 1000,
            ],
            'perishable' => [ // Produits périssables
                'low_stock' => 20,
                'critical_stock' => 5,
                'overstock' => 200,
            ],
            'seasonal' => [ // Produits saisonniers
                'low_stock' => 50,
                'critical_stock' => 10,
                'overstock' => 500,
            ],
            'high_rotation' => [ // Produits à forte rotation
                'low_stock' => 50,
                'critical_stock' => 15,
                'overstock' => 2000,
            ],
            'luxury' => [ // Produits de luxe
                'low_stock' => 5,
                'critical_stock' => 1,
                'overstock' => 50,
            ],
        ],
        
        // === Tracking et analytics ===
        'stock_movement_tracking' => env('SHOP_STOCK_TRACKING', true),
        'inventory_reports_enabled' => env('SHOP_INVENTORY_REPORTS', true),
        'stock_prediction_enabled' => env('SHOP_STOCK_PREDICTION', false),
        'demand_forecasting' => env('SHOP_DEMAND_FORECASTING', false),
        
        // === Optimisation ===
        'batch_updates_enabled' => env('SHOP_BATCH_INVENTORY_UPDATES', true),
        'realtime_sync_enabled' => env('SHOP_REALTIME_INVENTORY_SYNC', false),
        'cache_inventory_data' => env('SHOP_CACHE_INVENTORY', true),
        'cache_duration' => env('SHOP_INVENTORY_CACHE_DURATION', 300), // secondes
        
        // === Validation ===
        'validate_stock_on_checkout' => env('SHOP_VALIDATE_STOCK_CHECKOUT', true),
        'stock_check_frequency' => env('SHOP_STOCK_CHECK_FREQUENCY', 60), // secondes
        'concurrent_order_protection' => env('SHOP_CONCURRENT_ORDER_PROTECTION', true),
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
    | Activer/désactiver des fonctionnalités de la boutique
    | 
    | Phase 1: Fonctionnalités de base (guest_checkout, basic_features)
    | Phase 2: Fonctionnalités avancées (user_accounts, wishlist, reviews)
    | Phase 3: Fonctionnalités temps réel et intelligence (realtime_updates, ai_features)
    |
    */
    'features' => [
        // === PHASE 1: Fonctionnalités de base ===
        'guest_checkout' => env('SHOP_GUEST_CHECKOUT', true),
        'product_search' => env('SHOP_PRODUCT_SEARCH', true),
        'category_filters' => env('SHOP_CATEGORY_FILTERS', true),
        'price_filters' => env('SHOP_PRICE_FILTERS', true),
        'inventory_tracking' => env('SHOP_INVENTORY_TRACKING', true),
        'order_confirmation_email' => env('SHOP_ORDER_EMAIL', true),
        
        // === PHASE 2: Fonctionnalités utilisateur ===
        'user_accounts' => env('SHOP_USER_ACCOUNTS', false),
        'user_profiles' => env('SHOP_USER_PROFILES', false),
        'order_history' => env('SHOP_ORDER_HISTORY', false),
        'address_book' => env('SHOP_ADDRESS_BOOK', false),
        'wishlist' => env('SHOP_WISHLIST', false),
        'favorites' => env('SHOP_FAVORITES', false),
        'product_comparison' => env('SHOP_PRODUCT_COMPARISON', false),
        
        // === PHASE 2: Avis et évaluations ===
        'reviews' => env('SHOP_REVIEWS', false),
        'ratings' => env('SHOP_RATINGS', false),
        'review_moderation' => env('SHOP_REVIEW_MODERATION', false),
        'verified_purchases_only' => env('SHOP_VERIFIED_REVIEWS', false),
        
        // === PHASE 2: Fidélisation ===
        'loyalty_program' => env('SHOP_LOYALTY_PROGRAM', false),
        'loyalty_points' => env('SHOP_LOYALTY_POINTS', false),
        'referral_system' => env('SHOP_REFERRAL_SYSTEM', false),
        'coupon_system' => env('SHOP_COUPON_SYSTEM', false),
        
        // === PHASE 3: Temps réel ===
        'realtime_updates' => env('SHOP_REALTIME_UPDATES', false),
        'live_stock_updates' => env('SHOP_LIVE_STOCK_UPDATES', false),
        'live_price_updates' => env('SHOP_LIVE_PRICE_UPDATES', false),
        'price_change_notifications' => env('SHOP_PRICE_NOTIFICATIONS', false),
        'real_time_order_tracking' => env('SHOP_REALTIME_TRACKING', false),
        
        // === PHASE 3: Communication ===
        'live_chat' => env('SHOP_LIVE_CHAT', false),
        'customer_support_chat' => env('SHOP_SUPPORT_CHAT', false),
        'chatbot' => env('SHOP_CHATBOT', false),
        'sms_notifications' => env('SHOP_SMS_NOTIFICATIONS', false),
        'push_notifications' => env('SHOP_PUSH_NOTIFICATIONS', false),
        
        // === PHASE 3: Fonctionnalités avancées ===
        'multi_language' => env('SHOP_MULTI_LANGUAGE', false),
        'multi_currency' => env('SHOP_MULTI_CURRENCY', false),
        'advanced_search' => env('SHOP_ADVANCED_SEARCH', false),
        'search_suggestions' => env('SHOP_SEARCH_SUGGESTIONS', false),
        'recently_viewed' => env('SHOP_RECENTLY_VIEWED', false),
        'recommended_products' => env('SHOP_RECOMMENDATIONS', false),
        
        // === PHASE 3: Analytics et intelligence ===
        'advanced_analytics' => env('SHOP_ADVANCED_ANALYTICS', false),
        'user_behavior_tracking' => env('SHOP_BEHAVIOR_TRACKING', false),
        'conversion_tracking' => env('SHOP_CONVERSION_TRACKING', false),
        'ab_testing' => env('SHOP_AB_TESTING', false),
        'personalization' => env('SHOP_PERSONALIZATION', false),
        
        // === Fonctionnalités experimentales ===
        'voice_search' => env('SHOP_VOICE_SEARCH', false),
        'augmented_reality' => env('SHOP_AR_FEATURES', false),
        'social_login' => env('SHOP_SOCIAL_LOGIN', false),
        'social_sharing' => env('SHOP_SOCIAL_SHARING', false),
        
        // === Maintenance et développement ===
        'maintenance_mode' => env('SHOP_MAINTENANCE_MODE', false),
        'debug_mode' => env('SHOP_DEBUG_MODE', false),
        'feature_preview' => env('SHOP_FEATURE_PREVIEW', false),
        'beta_features' => env('SHOP_BETA_FEATURES', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Broadcasting Channel Names & Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration détaillée des canaux de diffusion en temps réel
    | 
    | Chaque canal a un nom, une description, un niveau de visibilité et
    | des paramètres spécifiques pour l'optimisation des performances.
    |
    | Types de canaux:
    | - public: Accessible à tous les utilisateurs
    | - private: Nécessite une authentification
    | - presence: Canal de présence avec liste des utilisateurs connectés
    |
    */
    'channels' => [
        // === Canaux publics ===
        'public_channels' => [
            'shop_updates' => [
                'name' => 'shop-updates',
                'type' => 'public',
                'description' => 'Mises à jour générales de la boutique (nouveaux produits, promotions)',
                'max_connections' => 1000,
                'rate_limit' => 100, // messages par minute
                'cache_events' => true,
                'cache_duration' => 300, // secondes
            ],
            'product_updates' => [
                'name' => 'product-updates',
                'type' => 'public',
                'description' => 'Mises à jour des produits (stock, prix, disponibilité)',
                'max_connections' => 500,
                'rate_limit' => 200,
                'cache_events' => true,
                'cache_duration' => 60,
            ],
            'category_updates' => [
                'name' => 'category-updates',
                'type' => 'public', 
                'description' => 'Mises à jour des catégories et navigation',
                'max_connections' => 300,
                'rate_limit' => 50,
                'cache_events' => true,
                'cache_duration' => 600,
            ],
            'promotions' => [
                'name' => 'promotions-live',
                'type' => 'public',
                'description' => 'Promotions flash et offres limitées en temps réel',
                'max_connections' => 2000,
                'rate_limit' => 20,
                'cache_events' => false,
                'priority' => 'high',
            ],
        ],

        // === Canaux privés (authentifiés) ===
        'private_channels' => [
            'user_notifications' => [
                'name' => 'user-notifications-{userId}',
                'type' => 'private',
                'description' => 'Notifications personnalisées pour chaque utilisateur',
                'authentication_required' => true,
                'rate_limit' => 50,
                'persistence' => true, // Conserver les messages pour utilisateurs déconnectés
            ],
            'order_tracking' => [
                'name' => 'order-tracking-{orderId}',
                'type' => 'private',
                'description' => 'Suivi des commandes en temps réel',
                'authentication_required' => true,
                'rate_limit' => 30,
                'encryption' => true,
                'ttl' => 86400, // 24 heures
            ],
            'cart_sync' => [
                'name' => 'cart-sync-{sessionId}',
                'type' => 'private',
                'description' => 'Synchronisation du panier entre appareils',
                'authentication_required' => false,
                'rate_limit' => 100,
                'session_based' => true,
            ],
        ],

        // === Canaux administrateur ===
        'admin_channels' => [
            'admin_dashboard' => [
                'name' => 'admin-dashboard',
                'type' => 'private',
                'description' => 'Tableau de bord administrateur temps réel',
                'authentication_required' => true,
                'role_required' => 'admin',
                'rate_limit' => 200,
                'real_time_stats' => true,
            ],
            'inventory_alerts' => [
                'name' => 'inventory-alerts',
                'type' => 'private',
                'description' => 'Alertes de stock et gestion inventaire',
                'authentication_required' => true,
                'role_required' => ['admin', 'inventory_manager'],
                'rate_limit' => 50,
                'priority' => 'critical',
                'notification_sound' => true,
            ],
            'order_management' => [
                'name' => 'order-management',
                'type' => 'private',
                'description' => 'Gestion des commandes en temps réel',
                'authentication_required' => true,
                'role_required' => ['admin', 'order_manager'],
                'rate_limit' => 100,
                'auto_refresh' => 30, // secondes
            ],
            'system_monitoring' => [
                'name' => 'system-monitoring',
                'type' => 'private',
                'description' => 'Monitoring système et performances',
                'authentication_required' => true,
                'role_required' => ['admin', 'developer'],
                'rate_limit' => 500,
                'debug_info' => true,
            ],
        ],

        // === Canaux de présence ===
        'presence_channels' => [
            'online_support' => [
                'name' => 'presence-support',
                'type' => 'presence',
                'description' => 'Support client avec présence des agents',
                'authentication_required' => true,
                'max_users' => 100,
                'show_user_info' => true,
                'typing_indicators' => true,
            ],
            'admin_collaboration' => [
                'name' => 'presence-admin-team',
                'type' => 'presence',
                'description' => 'Collaboration équipe administrative',
                'authentication_required' => true,
                'role_required' => 'admin',
                'max_users' => 20,
                'show_user_info' => true,
                'activity_status' => true,
            ],
        ],

        // === Configuration globale des canaux ===
        'global_settings' => [
            'default_rate_limit' => 60, // par minute
            'connection_timeout' => 30, // secondes
            'heartbeat_interval' => 25, // secondes
            'max_message_size' => 1024, // bytes
            'compression_enabled' => true,
            'ssl_required' => env('SHOP_CHANNELS_SSL_REQUIRED', true),
            'cors_origins' => env('SHOP_CHANNELS_CORS_ORIGINS', '*'),
            'log_events' => env('SHOP_CHANNELS_LOG_EVENTS', true),
            'metrics_enabled' => env('SHOP_CHANNELS_METRICS', true),
        ],
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

    /*
    |--------------------------------------------------------------------------
    | Real-time Broadcasting Settings
    |--------------------------------------------------------------------------
    |
    | Configuration pour la diffusion en temps réel des événements de la boutique.
    | 
    | enabled: Active/désactive complètement le système de broadcasting
    | fallback_enabled: Active le système de fallback quand broadcasting échoue
    | max_retries: Nombre maximum de tentatives en cas d'échec
    | retry_delay: Délai entre les tentatives (en millisecondes)
    | batch_size: Nombre d'événements à traiter par lot
    | queue_connection: Connexion de queue pour les événements différés
    |
    | Peut être désactivé pour éviter la surcharge en Phase 1-2, activé en Phase 3.
    |
    */
    'broadcasting' => [
        'enabled' => env('SHOP_BROADCASTING_ENABLED', false),
        'fallback_enabled' => env('SHOP_BROADCASTING_FALLBACK_ENABLED', true),
        'max_retries' => env('SHOP_BROADCASTING_MAX_RETRIES', 3),
        'retry_delay' => env('SHOP_BROADCASTING_RETRY_DELAY', 1000), // millisecondes
        'batch_size' => env('SHOP_BROADCASTING_BATCH_SIZE', 10),
        'queue_connection' => env('SHOP_BROADCASTING_QUEUE', 'redis'),
        'timeout' => env('SHOP_BROADCASTING_TIMEOUT', 5), // secondes
        
        // Événements spécifiques à diffuser
        'events' => [
            'product_updated' => env('SHOP_BROADCAST_PRODUCT_EVENTS', false),
            'category_updated' => env('SHOP_BROADCAST_CATEGORY_EVENTS', false),
            'order_updated' => env('SHOP_BROADCAST_ORDER_EVENTS', false),
            'stock_updated' => env('SHOP_BROADCAST_STOCK_EVENTS', false),
            'price_changed' => env('SHOP_BROADCAST_PRICE_EVENTS', false),
            'product_featured' => env('SHOP_BROADCAST_FEATURED_EVENTS', false),
            'flash_sale_started' => env('SHOP_BROADCAST_FLASH_SALE_EVENTS', false),
        ],
        
        // Canaux de diffusion avec leur description
        'channels' => [
            'shop_updates' => [
                'name' => 'shop-updates',
                'description' => 'Mises à jour générales de la boutique (stock, prix, produits)',
                'public' => true,
            ],
            'admin_updates' => [
                'name' => 'admin-updates', 
                'description' => 'Notifications admin (nouvelles commandes, alertes stock)',
                'public' => false,
            ],
            'category_updates' => [
                'name' => 'category-updates',
                'description' => 'Mises à jour des catégories',
                'public' => true,
            ],
            'order_tracking' => [
                'name' => 'order-tracking',
                'description' => 'Suivi des commandes en temps réel',
                'public' => false,
            ],
            'inventory_alerts' => [
                'name' => 'inventory-alerts',
                'description' => 'Alertes de stock et gestion inventaire',
                'public' => false,
            ],
        ],
        
        'connection' => env('SHOP_BROADCAST_CONNECTION', 'log'),
        
        // Configuration par environnement
        'connections' => [
            'local' => 'log',
            'testing' => 'null',
            'staging' => 'pusher',
            'production' => 'pusher',
        ],
    ],
];