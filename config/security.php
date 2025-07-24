<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Security Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration de sécurité pour MonEpice&Riz.
    | Ces paramètres garantissent la protection des données sensibles.
    |
    */

    /*
    |--------------------------------------------------------------------------
    | Encryption Settings
    |--------------------------------------------------------------------------
    |
    | Champs à chiffrer automatiquement dans la base de données
    |
    */
    'encryption' => [
        'customer_fields' => ['name', 'phone', 'email', 'delivery_address'],
        'algorithm' => 'AES-256-CBC',
        'key' => env('ENCRYPTION_KEY', env('APP_KEY')),
    ],

    /*
    |--------------------------------------------------------------------------
    | Rate Limiting
    |--------------------------------------------------------------------------
    |
    | Limites de requêtes pour protéger contre les abus
    |
    */
    'rate_limiting' => [
        'api' => env('RATE_LIMIT_API', '60,1'), // 60 requêtes par minute
        'checkout' => env('RATE_LIMIT_CHECKOUT', '5,1'), // 5 tentatives par minute
        'webhook' => env('RATE_LIMIT_WEBHOOK', '100,1'), // 100 webhooks par minute
        'login' => env('RATE_LIMIT_LOGIN', '5,1'), // 5 tentatives par minute
        'register' => env('RATE_LIMIT_REGISTER', '3,1'), // 3 inscriptions par minute
    ],

    /*
    |--------------------------------------------------------------------------
    | Password Policy
    |--------------------------------------------------------------------------
    |
    | Politique de mots de passe pour les utilisateurs admin
    |
    */
    'passwords' => [
        'min_length' => env('PASSWORD_MIN_LENGTH', 12),
        'require_uppercase' => env('PASSWORD_REQUIRE_UPPERCASE', true),
        'require_lowercase' => env('PASSWORD_REQUIRE_LOWERCASE', true),
        'require_numeric' => env('PASSWORD_REQUIRE_NUMERIC', true),
        'require_special' => env('PASSWORD_REQUIRE_SPECIAL', true),
        'history' => env('PASSWORD_HISTORY', 5), // Nombre de mots de passe à mémoriser
        'expiry_days' => env('PASSWORD_EXPIRY_DAYS', 90), // Expiration après X jours
    ],

    /*
    |--------------------------------------------------------------------------
    | Session Security
    |--------------------------------------------------------------------------
    */
    'sessions' => [
        'timeout' => env('SESSION_TIMEOUT', 120), // Minutes
        'encrypt' => env('SESSION_ENCRYPT', true),
        'same_site' => env('SESSION_SAME_SITE', 'strict'),
        'secure' => env('SESSION_SECURE_COOKIE', true), // HTTPS uniquement en production
        'http_only' => true,
    ],

    /*
    |--------------------------------------------------------------------------
    | Two-Factor Authentication
    |--------------------------------------------------------------------------
    */
    '2fa' => [
        'enabled' => env('2FA_ENABLED', true),
        'issuer' => env('2FA_ISSUER', 'MonEpice&Riz'),
        'window' => 1, // Fenêtre de tolérance pour les codes
        'required_for_roles' => ['admin', 'manager'], // Rôles nécessitant 2FA
    ],

    /*
    |--------------------------------------------------------------------------
    | IP Restrictions
    |--------------------------------------------------------------------------
    */
    'ip' => [
        'whitelist_enabled' => env('IP_WHITELIST_ENABLED', false),
        'whitelist' => env('IP_WHITELIST') ? explode(',', env('IP_WHITELIST')) : [],
        'blacklist' => env('IP_BLACKLIST') ? explode(',', env('IP_BLACKLIST')) : [],
    ],

    /*
    |--------------------------------------------------------------------------
    | Security Headers
    |--------------------------------------------------------------------------
    */
    'headers' => [
        'X-Content-Type-Options' => 'nosniff',
        'X-Frame-Options' => 'DENY',
        'X-XSS-Protection' => '1; mode=block',
        'Referrer-Policy' => 'strict-origin-when-cross-origin',
        'Permissions-Policy' => 'geolocation=(), microphone=(), camera=()',
        'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains',
    ],

    /*
    |--------------------------------------------------------------------------
    | File Upload Security
    |--------------------------------------------------------------------------
    */
    'uploads' => [
        'max_size' => 5 * 1024 * 1024, // 5MB
        'allowed_mimes' => [
            'image/jpeg',
            'image/png',
            'image/webp',
            'application/pdf',
        ],
        'scan_for_viruses' => env('SCAN_UPLOADS', false),
    ],

    /*
    |--------------------------------------------------------------------------
    | Audit Settings
    |--------------------------------------------------------------------------
    */
    'audit' => [
        'enabled' => env('AUDIT_ENABLED', true),
        'log_reads' => env('AUDIT_LOG_READS', false),
        'log_writes' => env('AUDIT_LOG_WRITES', true),
        'log_deletes' => env('AUDIT_LOG_DELETES', true),
        'log_auth' => env('AUDIT_LOG_AUTH', true),
        'retention_days' => env('AUDIT_RETENTION_DAYS', 365),
    ],

    /*
    |--------------------------------------------------------------------------
    | CORS Settings
    |--------------------------------------------------------------------------
    */
    'cors' => [
        'allowed_origins' => env('CORS_ALLOWED_ORIGINS') ? explode(',', env('CORS_ALLOWED_ORIGINS')) : ['*'],
        'allowed_methods' => ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        'allowed_headers' => ['Content-Type', 'Authorization', 'X-Requested-With'],
        'exposed_headers' => [],
        'max_age' => 86400,
        'supports_credentials' => true,
    ],
];