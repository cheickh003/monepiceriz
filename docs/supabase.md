# Guide d'intégration Supabase - MonEpice&Riz

**Version:** 1.0.0  
**Dernière mise à jour:** 2025-07-22  
**Documentation parente:** [structure.md](./structure.md)

## Table des matières
1. [Introduction](#introduction)
2. [Configuration initiale](#configuration-initiale)
3. [Schéma de base de données](#schéma-de-base-de-données)
4. [Sécurité et RLS](#sécurité-et-rls)
5. [Storage pour les images](#storage-pour-les-images)
6. [Migrations Laravel](#migrations-laravel)
7. [Services et intégrations](#services-et-intégrations)
8. [Monitoring et maintenance](#monitoring-et-maintenance)

## Introduction

Supabase est notre plateforme de base de données PostgreSQL managée. Elle offre :
- PostgreSQL complet avec toutes les extensions
- Sécurité intégrée avec Row Level Security
- Storage pour les fichiers et images
- API REST et GraphQL automatiques
- Dashboard web pour la gestion

## Configuration initiale

### 1. Créer un projet Supabase

1. Aller sur [app.supabase.com](https://app.supabase.com)
2. Créer un nouveau projet "monepiceriz-production"
3. Choisir la région la plus proche (Europe West - Paris)
4. Noter les credentials fournis

### 2. Configuration du schéma Laravel

Se connecter au SQL Editor de Supabase et exécuter :

```sql
-- Créer le schéma dédié à Laravel
CREATE SCHEMA IF NOT EXISTS laravel;

-- Créer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Pour la recherche full-text

-- Créer un rôle spécifique pour Laravel (optionnel)
CREATE ROLE laravel_user WITH LOGIN PASSWORD 'secure_password';
GRANT ALL PRIVILEGES ON SCHEMA laravel TO laravel_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA laravel GRANT ALL ON TABLES TO laravel_user;

-- Configurer le search_path
ALTER DATABASE postgres SET search_path TO laravel, public, extensions;
```

### 3. Configuration Laravel

Configuration des variables d'environnement :

👉 **Voir : [structure.md#72-variables-denvironnement](./structure.md#72-variables-denvironnement)** (section SUPABASE DATABASE)

Points clés :
- Utiliser le pooler (`pooler.supabase.com`) pour la production
- Port 5432 pour connexion directe, 6543 pour le pooler
- Schéma `laravel` pour isoler les données de l'API publique
- Conserver précieusement la `SUPABASE_SERVICE_KEY` (accès admin)

## Schéma de base de données

### Structure des tables avec Supabase

Les tables sont créées dans le schéma `laravel` pour éviter les conflits avec l'API publique de Supabase.

#### Exemple de migration avec spécificités Supabase

```php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        // S'assurer d'être dans le bon schéma
        DB::statement('SET search_path TO laravel');
        
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained();
            $table->string('ref', 50)->nullable()->index();
            $table->string('barcode', 50)->nullable()->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            $table->jsonb('meta_data')->nullable();
            $table->boolean('is_active')->default(true)->index();
            $table->timestamps();
        });
        
        // Créer un index GIN pour la recherche full-text
        DB::statement('CREATE INDEX idx_products_search ON laravel.products USING gin(to_tsvector(\'french\', name || \' \' || COALESCE(description, \'\')))');
        
        // Activer RLS
        DB::statement('ALTER TABLE laravel.products ENABLE ROW LEVEL SECURITY');
        
        // Créer une politique pour l'accès public en lecture
        DB::statement('
            CREATE POLICY "Public read access" ON laravel.products
            FOR SELECT USING (is_active = true)
        ');
    }
    
    public function down()
    {
        DB::statement('SET search_path TO laravel');
        Schema::dropIfExists('products');
    }
};
```

## Sécurité et RLS

### 1. Row Level Security (RLS)

RLS permet de contrôler l'accès aux données au niveau de la base de données :

```sql
-- Activer RLS sur toutes les tables sensibles
ALTER TABLE laravel.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE laravel.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE laravel.payment_logs ENABLE ROW LEVEL SECURITY;

-- Politique pour les commandes (accès admin uniquement)
CREATE POLICY "Admin full access to orders" ON laravel.orders
    FOR ALL 
    USING (auth.jwt() ->> 'role' = 'admin');

-- Politique pour les clients (accès à leurs propres données)
CREATE POLICY "Customers can view own data" ON laravel.customers
    FOR SELECT 
    USING (id = (auth.jwt() ->> 'customer_id')::bigint);
```

### 2. Chiffrement des données sensibles

Utiliser pgcrypto pour chiffrer les données sensibles directement dans la base :

```sql
-- Fonction pour chiffrer/déchiffrer
CREATE OR REPLACE FUNCTION laravel.encrypt_text(plain_text text)
RETURNS text AS $$
BEGIN
    RETURN encode(encrypt(plain_text::bytea, current_setting('app.encryption_key')::bytea, 'aes'), 'base64');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour chiffrer automatiquement
CREATE OR REPLACE FUNCTION laravel.encrypt_customer_data()
RETURNS TRIGGER AS $$
BEGIN
    NEW.phone = laravel.encrypt_text(NEW.phone);
    NEW.email = laravel.encrypt_text(NEW.email);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER encrypt_customer_trigger
BEFORE INSERT OR UPDATE ON laravel.customers
FOR EACH ROW EXECUTE FUNCTION laravel.encrypt_customer_data();
```

## Storage pour les images

### 1. Configuration du bucket

Dans le dashboard Supabase, créer un bucket pour les images :

```sql
-- Via SQL
INSERT INTO storage.buckets (id, name, public)
VALUES ('products', 'products', true);

-- Politique pour upload admin uniquement
CREATE POLICY "Admin upload" ON storage.objects
FOR INSERT WITH CHECK (
    bucket_id = 'products' AND
    auth.jwt() ->> 'role' = 'admin'
);

-- Politique pour lecture publique
CREATE POLICY "Public read" ON storage.objects
FOR SELECT USING (bucket_id = 'products');
```

### 2. Service Laravel pour le storage

```php
<?php

namespace App\Services;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class SupabaseStorageService
{
    private string $baseUrl;
    private string $serviceKey;
    
    public function __construct()
    {
        $this->baseUrl = config('supabase.url');
        $this->serviceKey = config('supabase.service_key');
    }
    
    public function uploadProductImage(UploadedFile $file, string $productSlug): string
    {
        $fileName = $productSlug . '-' . Str::random(10) . '.' . $file->extension();
        $path = 'products/' . date('Y/m') . '/' . $fileName;
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->serviceKey,
            'Content-Type' => $file->getMimeType(),
        ])->withBody(
            $file->get(), 
            $file->getMimeType()
        )->post($this->baseUrl . '/storage/v1/object/products/' . $path);
        
        if ($response->successful()) {
            return $this->baseUrl . '/storage/v1/object/public/products/' . $path;
        }
        
        throw new \Exception('Failed to upload image: ' . $response->body());
    }
    
    public function deleteProductImage(string $path): bool
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->serviceKey,
        ])->delete($this->baseUrl . '/storage/v1/object/products/' . $path);
        
        return $response->successful();
    }
    
    public function getSignedUrl(string $path, int $expiresIn = 3600): string
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->serviceKey,
        ])->post($this->baseUrl . '/storage/v1/object/sign/products/' . $path, [
            'expiresIn' => $expiresIn
        ]);
        
        if ($response->successful()) {
            return $response->json()['signedURL'];
        }
        
        throw new \Exception('Failed to generate signed URL');
    }
}
```

## Migrations Laravel

### Best practices pour les migrations avec Supabase

1. **Toujours spécifier le schéma** :
```php
DB::statement('SET search_path TO laravel');
```

2. **Utiliser les types PostgreSQL natifs** :
```php
$table->uuid('id')->primary();
$table->jsonb('meta_data');
$table->inet('ip_address');
$table->decimal('price', 10, 2);
```

3. **Créer des index optimisés** :
```php
// Index partiel
DB::statement('CREATE INDEX idx_active_products ON laravel.products(id) WHERE is_active = true');

// Index GIN pour JSONB
DB::statement('CREATE INDEX idx_product_meta ON laravel.products USING gin(meta_data)');
```

## Services et intégrations

### 1. Service de base Supabase

```php
<?php

namespace App\Services;

use GuzzleHttp\Client;

class SupabaseService
{
    protected Client $client;
    protected string $baseUrl;
    protected string $anonKey;
    protected string $serviceKey;
    
    public function __construct()
    {
        $this->baseUrl = config('supabase.url');
        $this->anonKey = config('supabase.anon_key');
        $this->serviceKey = config('supabase.service_key');
        
        $this->client = new Client([
            'base_uri' => $this->baseUrl,
            'headers' => [
                'apikey' => $this->serviceKey,
                'Authorization' => 'Bearer ' . $this->serviceKey,
            ]
        ]);
    }
    
    /**
     * Appeler une fonction Edge
     */
    public function callEdgeFunction(string $functionName, array $data = [])
    {
        $response = $this->client->post("/functions/v1/{$functionName}", [
            'json' => $data
        ]);
        
        return json_decode($response->getBody(), true);
    }
    
    /**
     * Utiliser l'API REST pour des requêtes complexes
     */
    public function queryRestApi(string $table, array $filters = [])
    {
        $query = http_build_query($filters);
        $response = $this->client->get("/rest/v1/{$table}?{$query}");
        
        return json_decode($response->getBody(), true);
    }
}
```

### 2. Listener pour les événements temps réel (future v2)

```php
<?php

namespace App\Services;

use Pusher\Pusher;

class SupabaseRealtimeService
{
    private $pusher;
    
    public function __construct()
    {
        // Supabase Realtime utilise un protocole compatible Pusher
        $this->pusher = new Pusher(
            config('supabase.anon_key'),
            '',
            '',
            [
                'host' => parse_url(config('supabase.url'), PHP_URL_HOST),
                'port' => 443,
                'scheme' => 'https',
                'encrypted' => true,
            ]
        );
    }
    
    public function subscribeToOrders(callable $callback)
    {
        $channel = $this->pusher->subscribe('realtime:public:orders');
        $channel->bind('UPDATE', $callback);
    }
}
```

## Monitoring et maintenance

### 1. Dashboard Supabase

Utiliser le dashboard pour :
- Monitorer les performances des requêtes
- Gérer les index
- Visualiser l'utilisation du storage
- Configurer les alertes

### 2. Logs et métriques

```php
// Middleware pour logger les requêtes lentes
class LogSlowQueries
{
    public function handle($request, Closure $next)
    {
        DB::listen(function ($query) {
            if ($query->time > 1000) { // Plus d'une seconde
                Log::warning('Slow query detected', [
                    'sql' => $query->sql,
                    'bindings' => $query->bindings,
                    'time' => $query->time
                ]);
            }
        });
        
        return $next($request);
    }
}
```

### 3. Backups automatiques

Supabase effectue des backups automatiques quotidiens. Pour des backups supplémentaires :

```bash
# Script de backup manuel
pg_dump $DATABASE_URL -f backup_$(date +%Y%m%d).sql

# Avec compression
pg_dump $DATABASE_URL | gzip > backup_$(date +%Y%m%d).sql.gz
```

### 4. Optimisations

```sql
-- Analyser les tables régulièrement
ANALYZE laravel.products;
ANALYZE laravel.orders;

-- Vérifier les index inutilisés
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
WHERE schemaname = 'laravel'
ORDER BY idx_scan;

-- Vacuum pour libérer l'espace
VACUUM ANALYZE laravel.orders;
```

## Checklist de mise en production

- [ ] Schéma Laravel créé et configuré
- [ ] RLS activé sur toutes les tables sensibles
- [ ] Politiques de sécurité définies
- [ ] Bucket storage configuré
- [ ] Variables d'environnement sécurisées
- [ ] Connection pooler activé
- [ ] Monitoring configuré
- [ ] Backups testés
- [ ] Index optimisés
- [ ] SSL/TLS vérifié

## Ressources

- [Documentation Supabase](https://supabase.com/docs)
- [Dashboard Supabase](https://app.supabase.com)
- [Status Supabase](https://status.supabase.com)
- Support : support@supabase.com