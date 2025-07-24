<?php

return [
    /*
    |--------------------------------------------------------------------------
    | CinetPay Configuration
    |--------------------------------------------------------------------------
    |
    | Configuration pour l'intégration de CinetPay dans MonEpice&Riz.
    | Documentation complète : docs/cinetpay.md
    |
    */

    'api_key' => env('CINETPAY_API_KEY'),
    'site_id' => env('CINETPAY_SITE_ID'),
    'secret_key' => env('CINETPAY_SECRET_KEY'),
    
    /*
    |--------------------------------------------------------------------------
    | Mode de fonctionnement
    |--------------------------------------------------------------------------
    |
    | TEST : Mode test pour le développement
    | PRODUCTION : Mode production pour les transactions réelles
    |
    */
    'mode' => env('CINETPAY_MODE', 'TEST'),
    
    /*
    |--------------------------------------------------------------------------
    | URLs de callback
    |--------------------------------------------------------------------------
    |
    | Ces URLs sont utilisées par CinetPay pour les redirections et notifications
    |
    */
    'notify_url' => env('CINETPAY_NOTIFY_URL', config('app.url') . '/api/cinetpay/notify'),
    'return_url' => env('CINETPAY_RETURN_URL', config('app.url') . '/payment/return'),
    'cancel_url' => env('CINETPAY_CANCEL_URL', config('app.url') . '/payment/cancel'),
    
    /*
    |--------------------------------------------------------------------------
    | Configuration des paiements
    |--------------------------------------------------------------------------
    */
    'currency' => env('CINETPAY_CURRENCY', 'XOF'),
    
    /*
    |--------------------------------------------------------------------------
    | Canaux de paiement acceptés
    |--------------------------------------------------------------------------
    |
    | ALL : Tous les moyens de paiement
    | MOBILE_MONEY : Mobile Money uniquement
    | CREDIT_CARD : Cartes bancaires uniquement
    |
    */
    'channels' => 'ALL',
    
    /*
    |--------------------------------------------------------------------------
    | Configuration des logs
    |--------------------------------------------------------------------------
    */
    'log_channel' => env('CINETPAY_LOG_CHANNEL', 'cinetpay'),
    
    /*
    |--------------------------------------------------------------------------
    | Timeouts
    |--------------------------------------------------------------------------
    */
    'timeout' => 30, // secondes
    'connect_timeout' => 10, // secondes
];