<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Third Party Services
    |--------------------------------------------------------------------------
    |
    | This file is for storing the credentials for third party services such
    | as Mailgun, Postmark, AWS and more. This file provides the de facto
    | location for this type of information, allowing packages to have
    | a conventional file to locate the various service credentials.
    |
    */

    'postmark' => [
        'token' => env('POSTMARK_TOKEN'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'resend' => [
        'key' => env('RESEND_KEY'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],
    
    'supabase' => [
        'url' => env('SUPABASE_URL'),
        'anon_key' => env('SUPABASE_ANON_KEY'),
        'service_key' => env('SUPABASE_SERVICE_KEY'),
        'storage_bucket' => env('SUPABASE_STORAGE_BUCKET', 'products'),
    ],
    
    'cinetpay' => [
        'api_key' => env('CINETPAY_API_KEY'),
        'site_id' => env('CINETPAY_SITE_ID'),
        'secret_key' => env('CINETPAY_SECRET_KEY'),
        'mode' => env('CINETPAY_MODE', 'TEST'),
        'notify_url' => env('CINETPAY_NOTIFY_URL'),
        'return_url' => env('CINETPAY_RETURN_URL'),
        'cancel_url' => env('CINETPAY_CANCEL_URL'),
    ],
    
    'yango' => [
        'api_key' => env('YANGO_API_KEY'),
        'api_url' => env('YANGO_API_URL'),
        'webhook_secret' => env('YANGO_WEBHOOK_SECRET'),
        'min_order_amount' => env('YANGO_MIN_ORDER_AMOUNT', 3000),
        'base_delivery_fee' => env('YANGO_BASE_DELIVERY_FEE', 1000),
        'distance_rate' => env('YANGO_DISTANCE_RATE', 200),
    ],

];
