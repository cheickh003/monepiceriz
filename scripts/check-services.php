#!/usr/bin/env php
<?php

/**
 * Script de vérification des services tiers
 * Usage: php scripts/check-services.php
 */

echo "\n🔍 Vérification des services MonEpice&Riz\n";
echo str_repeat("=", 50) . "\n\n";

// Charger l'autoloader de Composer si disponible
if (file_exists(__DIR__ . '/../vendor/autoload.php')) {
    require __DIR__ . '/../vendor/autoload.php';
    $dotenv = Dotenv\Dotenv::createImmutable(__DIR__ . '/..');
    $dotenv->load();
}

// Fonction pour tester une connexion
function testService($name, $test) {
    echo "🔸 Test de $name... ";
    try {
        $result = $test();
        if ($result === true) {
            echo "✅ OK\n";
            return true;
        } else {
            echo "❌ ERREUR: $result\n";
            return false;
        }
    } catch (Exception $e) {
        echo "❌ ERREUR: " . $e->getMessage() . "\n";
        return false;
    }
}

// Test 1: Variables d'environnement
echo "1️⃣ VARIABLES D'ENVIRONNEMENT\n";
echo str_repeat("-", 30) . "\n";

$requiredEnvVars = [
    'APP_NAME',
    'APP_KEY',
    'DB_CONNECTION',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'CINETPAY_API_KEY',
    'CINETPAY_SITE_ID',
];

$missingVars = [];
foreach ($requiredEnvVars as $var) {
    $value = $_ENV[$var] ?? getenv($var);
    if (empty($value) || strpos($value, '[') !== false) {
        $missingVars[] = $var;
        echo "❌ $var: Non configuré\n";
    } else {
        echo "✅ $var: " . substr($value, 0, 20) . "...\n";
    }
}

echo "\n";

// Test 2: Connexion Supabase
echo "2️⃣ CONNEXION SUPABASE\n";
echo str_repeat("-", 30) . "\n";

testService('Connexion PostgreSQL', function() {
    $dbUrl = $_ENV['DATABASE_URL'] ?? getenv('DATABASE_URL');
    if (empty($dbUrl) || strpos($dbUrl, '[project-ref]') !== false) {
        return "DATABASE_URL non configuré";
    }
    
    // Parser l'URL
    $parts = parse_url($dbUrl);
    if (!$parts) {
        return "URL de base de données invalide";
    }
    
    // Test simple avec pg_connect si disponible
    if (function_exists('pg_connect')) {
        $conn = @pg_connect($dbUrl);
        if ($conn) {
            pg_close($conn);
            return true;
        }
    }
    
    return "Impossible de se connecter à PostgreSQL";
});

testService('API Supabase', function() {
    $url = $_ENV['SUPABASE_URL'] ?? getenv('SUPABASE_URL');
    $key = $_ENV['SUPABASE_ANON_KEY'] ?? getenv('SUPABASE_ANON_KEY');
    
    if (empty($url) || strpos($url, '[project-ref]') !== false) {
        return "SUPABASE_URL non configuré";
    }
    
    $ch = curl_init($url . '/rest/v1/');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'apikey: ' . $key,
        'Authorization: Bearer ' . $key
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return $httpCode === 200 || $httpCode === 401;
});

echo "\n";

// Test 3: CinetPay
echo "3️⃣ CINETPAY\n";
echo str_repeat("-", 30) . "\n";

testService('API CinetPay', function() {
    $apiKey = $_ENV['CINETPAY_API_KEY'] ?? getenv('CINETPAY_API_KEY');
    $siteId = $_ENV['CINETPAY_SITE_ID'] ?? getenv('CINETPAY_SITE_ID');
    
    if (empty($apiKey) || empty($siteId)) {
        return "Credentials CinetPay non configurés";
    }
    
    // Test avec l'endpoint de vérification
    $ch = curl_init('https://api-checkout.cinetpay.com/v2/auth/login');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'apikey' => $apiKey,
        'password' => $siteId
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json'
    ]);
    curl_setopt($ch, CURLOPT_TIMEOUT, 5);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    return $httpCode === 200 || $httpCode === 401;
});

$mode = $_ENV['CINETPAY_MODE'] ?? getenv('CINETPAY_MODE');
echo "📌 Mode: " . ($mode ?: 'Non défini') . "\n";

echo "\n";

// Test 4: Redis (optionnel)
echo "4️⃣ REDIS (Optionnel)\n";
echo str_repeat("-", 30) . "\n";

testService('Connexion Redis', function() {
    $host = $_ENV['REDIS_HOST'] ?? getenv('REDIS_HOST') ?? '127.0.0.1';
    $port = $_ENV['REDIS_PORT'] ?? getenv('REDIS_PORT') ?? 6379;
    
    if (!class_exists('Redis')) {
        return "Extension Redis non installée";
    }
    
    $redis = new Redis();
    $connected = @$redis->connect($host, $port, 1);
    
    if ($connected) {
        $redis->close();
        return true;
    }
    
    return "Impossible de se connecter à Redis";
});

echo "\n";

// Test 5: Yango (si configuré)
echo "5️⃣ YANGO DELIVERY\n";
echo str_repeat("-", 30) . "\n";

$yangoKey = $_ENV['YANGO_API_KEY'] ?? getenv('YANGO_API_KEY');
if (empty($yangoKey)) {
    echo "⚠️  API Yango non configurée (sera nécessaire pour la production)\n";
} else {
    testService('API Yango', function() use ($yangoKey) {
        $url = $_ENV['YANGO_API_URL'] ?? getenv('YANGO_API_URL');
        
        $ch = curl_init($url . '/ping');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $yangoKey,
            'Accept: application/json'
        ]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 5);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return $httpCode === 200 || $httpCode === 401;
    });
}

// Résumé
echo "\n" . str_repeat("=", 50) . "\n";
echo "📊 RÉSUMÉ\n";
echo str_repeat("=", 50) . "\n";

if (empty($missingVars)) {
    echo "✅ Toutes les variables requises sont configurées\n";
} else {
    echo "❌ Variables manquantes: " . implode(', ', $missingVars) . "\n";
    echo "\n💡 Conseil: Copiez .env.example vers .env et configurez les valeurs\n";
}

echo "\n";
echo "📚 Documentation:\n";
echo "- Supabase: docs/supabase.md\n";
echo "- CinetPay: docs/cinetpay.md\n";
echo "- Structure: docs/structure.md\n";
echo "\n";