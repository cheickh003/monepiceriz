<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Supabase Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration pour l'intégration de Supabase avec Laravel.
    | Supabase fournit une base de données PostgreSQL managée avec
    | des fonctionnalités supplémentaires comme le temps réel et le storage.
    |
    */

    'url' => env('SUPABASE_URL'),
    
    'anon_key' => env('SUPABASE_ANON_KEY'),
    
    'service_key' => env('SUPABASE_SERVICE_KEY'),
    
    /*
    |--------------------------------------------------------------------------
    | Database Connection
    |--------------------------------------------------------------------------
    |
    | Configuration de connexion spécifique pour Supabase.
    | Utilisez le pooler pour une meilleure performance en production.
    |
    */
    
    'database' => [
        'use_pooler' => env('SUPABASE_USE_POOLER', true),
        'pool_mode' => env('SUPABASE_POOL_MODE', 'session'), // session ou transaction
        'schema' => env('SUPABASE_SCHEMA', 'laravel'),
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Storage Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration pour Supabase Storage.
    |
    */
    
    'storage' => [
        'bucket' => env('SUPABASE_STORAGE_BUCKET', 'products'),
        'public_url' => env('SUPABASE_URL') . '/storage/v1/object/public/',
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Realtime Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration pour les fonctionnalités temps réel (futures).
    |
    */
    
    'realtime' => [
        'enabled' => env('SUPABASE_REALTIME_ENABLED', false),
        'channels' => [
            'orders' => 'public:orders',
            'inventory' => 'public:product_skus',
        ],
    ],
    
    /*
    |--------------------------------------------------------------------------
    | Security Settings
    |--------------------------------------------------------------------------
    |
    | Paramètres de sécurité pour l'intégration Supabase.
    |
    */
    
    'security' => [
        'enable_rls' => env('SUPABASE_ENABLE_RLS', true),
        'ssl_mode' => env('SUPABASE_SSL_MODE', 'require'),
    ],
];