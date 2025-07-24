#!/usr/bin/env php
<?php

/**
 * Script de test de connexion Supabase
 * 
 * Usage: php scripts/test-supabase.php
 */

require __DIR__ . '/../vendor/autoload.php';

$app = require_once __DIR__ . '/../bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Http;

echo "\n🔍 Test de connexion Supabase\n";
echo "==============================\n\n";

// Chargement de la configuration
$supabaseUrl = config('supabase.url');
$supabaseAnonKey = config('supabase.anon_key');
$supabaseServiceKey = config('supabase.service_key');
$dbSchema = config('database.connections.pgsql.search_path');

// Test 1: Vérification des variables d'environnement
echo "1. Vérification des variables d'environnement...\n";

$configChecks = [
    'SUPABASE_URL' => $supabaseUrl,
    'SUPABASE_ANON_KEY' => $supabaseAnonKey,
    'SUPABASE_SERVICE_KEY' => $supabaseServiceKey,
    'DB_HOST' => config('database.connections.pgsql.host'),
    'DB_DATABASE' => config('database.connections.pgsql.database'),
    'DB_USERNAME' => config('database.connections.pgsql.username'),
    'DB_SCHEMA' => $dbSchema,
];

$missingConfigs = [];
foreach ($configChecks as $key => $value) {
    if (empty($value)) {
        $missingConfigs[] = $key;
        echo "   ❌ $key: NON CONFIGURÉ\n";
    } else {
        $displayValue = in_array($key, ['SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_KEY']) 
            ? substr($value, 0, 10) . '...' 
            : $value;
        echo "   ✅ $key: $displayValue\n";
    }
}

if (!empty($missingConfigs)) {
    echo "\n⚠️  Variables manquantes: " . implode(', ', $missingConfigs) . "\n";
    echo "Veuillez configurer ces variables dans votre fichier .env\n";
    exit(1);
}

// Test 2: Connexion à la base de données
echo "\n2. Test de connexion à la base de données PostgreSQL...\n";

try {
    // Test de connexion simple
    DB::connection()->getPdo();
    echo "   ✅ Connexion établie avec succès\n";
    
    // Test du schéma
    $currentSchema = DB::select("SELECT current_schema()")[0]->current_schema;
    echo "   ✅ Schéma actuel: $currentSchema\n";
    
    // Vérifier si le schéma Laravel existe
    $schemaExists = DB::select("SELECT schema_name FROM information_schema.schemata WHERE schema_name = ?", [$dbSchema]);
    if (empty($schemaExists)) {
        echo "   ⚠️  Le schéma '$dbSchema' n'existe pas encore\n";
        echo "   ℹ️  Exécutez ce SQL dans Supabase:\n";
        echo "      CREATE SCHEMA IF NOT EXISTS $dbSchema;\n";
    } else {
        echo "   ✅ Le schéma '$dbSchema' existe\n";
    }
    
    // Tester les extensions requises
    $extensions = ['uuid-ossp', 'pgcrypto', 'pg_trgm'];
    foreach ($extensions as $ext) {
        $extExists = DB::select("SELECT * FROM pg_extension WHERE extname = ?", [$ext]);
        if (empty($extExists)) {
            echo "   ⚠️  Extension '$ext' non installée\n";
        } else {
            echo "   ✅ Extension '$ext' installée\n";
        }
    }
    
} catch (\Exception $e) {
    echo "   ❌ Erreur de connexion: " . $e->getMessage() . "\n";
    exit(1);
}

// Test 3: Vérification de l'API Supabase
echo "\n3. Test de l'API REST Supabase...\n";

if ($supabaseUrl && $supabaseAnonKey) {
    try {
        $response = Http::withHeaders([
            'apikey' => $supabaseAnonKey,
            'Authorization' => 'Bearer ' . $supabaseAnonKey,
        ])->get($supabaseUrl . '/rest/v1/');
        
        if ($response->successful()) {
            echo "   ✅ API REST accessible\n";
        } else {
            echo "   ❌ API REST inaccessible (Code: " . $response->status() . ")\n";
        }
    } catch (\Exception $e) {
        echo "   ❌ Erreur API: " . $e->getMessage() . "\n";
    }
} else {
    echo "   ⚠️  Configuration API manquante\n";
}

// Test 4: Vérification du Storage
echo "\n4. Test du Storage Supabase...\n";

$storageBucket = config('supabase.storage.bucket');
if ($supabaseUrl && $supabaseAnonKey && $storageBucket) {
    try {
        $response = Http::withHeaders([
            'apikey' => $supabaseAnonKey,
            'Authorization' => 'Bearer ' . $supabaseAnonKey,
        ])->get($supabaseUrl . '/storage/v1/bucket/' . $storageBucket);
        
        if ($response->successful()) {
            echo "   ✅ Bucket '$storageBucket' accessible\n";
            $bucketInfo = $response->json();
            echo "   ℹ️  Bucket public: " . ($bucketInfo['public'] ? 'Oui' : 'Non') . "\n";
        } else if ($response->status() === 404) {
            echo "   ❌ Bucket '$storageBucket' n'existe pas\n";
            echo "   ℹ️  Créez le bucket avec ce SQL:\n";
            echo "      INSERT INTO storage.buckets (id, name, public) VALUES ('$storageBucket', '$storageBucket', true);\n";
        } else {
            echo "   ❌ Erreur Storage (Code: " . $response->status() . ")\n";
        }
    } catch (\Exception $e) {
        echo "   ❌ Erreur Storage: " . $e->getMessage() . "\n";
    }
} else {
    echo "   ⚠️  Configuration Storage manquante\n";
}

// Test 5: Vérification des migrations
echo "\n5. État des migrations...\n";

try {
    // Vérifier si la table migrations existe
    $migrationsTableExists = DB::select("
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = ? 
        AND table_name = 'migrations'
    ", [$dbSchema]);
    
    if (empty($migrationsTableExists)) {
        echo "   ℹ️  Table des migrations non créée\n";
        echo "   ℹ️  Exécutez: php artisan migrate:install\n";
    } else {
        // Compter les migrations exécutées
        $migratedCount = DB::table('migrations')->count();
        echo "   ✅ $migratedCount migrations exécutées\n";
        
        // Vérifier les migrations en attente
        $pendingMigrations = array_diff(
            array_map('basename', glob(database_path('migrations/*.php'))),
            DB::table('migrations')->pluck('migration')->toArray()
        );
        
        if (count($pendingMigrations) > 0) {
            echo "   ⚠️  " . count($pendingMigrations) . " migrations en attente\n";
            echo "   ℹ️  Exécutez: php artisan migrate\n";
        }
    }
} catch (\Exception $e) {
    echo "   ⚠️  Impossible de vérifier les migrations: " . $e->getMessage() . "\n";
}

// Résumé
echo "\n==============================\n";
echo "📊 Résumé du test\n";
echo "==============================\n";

$allGood = empty($missingConfigs);

if ($allGood) {
    echo "✅ Supabase est correctement configuré!\n";
    echo "\nProchaines étapes:\n";
    echo "1. Créez le schéma Laravel si nécessaire\n";
    echo "2. Exécutez les migrations: php artisan migrate\n";
    echo "3. Créez le bucket storage si nécessaire\n";
} else {
    echo "❌ Configuration incomplète\n";
    echo "\nActions requises:\n";
    echo "1. Configurez les variables manquantes dans .env\n";
    echo "2. Relancez ce script pour vérifier\n";
}

echo "\n";