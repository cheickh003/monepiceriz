# Optimisation des Versions de Données du Shop

## Vue d'ensemble

Cette optimisation remplace les requêtes `MAX()` coûteuses sur les tables `products` et `categories` par un système de versioning optimisé utilisant une table dédiée `shop_data_version`.

## Problème résolu

### Avant l'optimisation
```php
// Dans HandleInertiaRequests::calculateDataVersion()
$productMaxUpdated = Product::max('updated_at');      // ❌ Scan complet de la table
$categoryMaxUpdated = Category::max('updated_at');    // ❌ Scan complet de la table
```

### Impact performance
- **Tables importantes** : Requêtes `MAX()` scannent toutes les lignes
- **Latence élevée** : ~50-200ms par requête sur de grandes tables
- **Charge DB** : CPU élevé sur des requêtes fréquentes
- **Scalabilité** : Performance dégradée avec la croissance des données

## Solution implémentée

### Table `shop_data_version`

```sql
CREATE TABLE shop_data_version (
    id BIGINT PRIMARY KEY,
    data_type VARCHAR(255) UNIQUE,     -- 'products', 'categories', 'global'
    last_updated_at TIMESTAMP,         -- Timestamp de dernière modification
    version_hash VARCHAR(32),          -- Hash MD5 pour comparaison rapide
    change_count INTEGER DEFAULT 0,    -- Compteur de changements
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    INDEX(data_type, last_updated_at)
);
```

### Nouveau flux optimisé

1. **Mise à jour automatique** : Les événements `ProductUpdated`/`CategoryUpdated` mettent à jour la table
2. **Requête rapide** : `SELECT version_hash FROM shop_data_version` (quelques lignes seulement)
3. **Cache intelligent** : Mise en cache avec invalidation automatique
4. **Scalabilité** : Performance constante indépendamment de la taille des tables

## Installation et configuration

### 1. Exécuter la migration

```bash
php artisan migrate
```

### 2. Initialiser les versions

```bash
php artisan shop:optimize-versions init
```

### 3. Vérifier l'installation

```bash
php artisan shop:optimize-versions validate
```

## Utilisation

### Commandes disponibles

```bash
# Initialiser les versions
php artisan shop:optimize-versions init

# Afficher les statistiques
php artisan shop:optimize-versions stats

# Benchmarker les performances
php artisan shop:optimize-versions benchmark --iterations=1000

# Valider la cohérence
php artisan shop:optimize-versions validate

# Nettoyer les versions (développement uniquement)
php artisan shop:optimize-versions clear
```

### API du service

```php
use App\Services\ShopVersionService;

$service = app(ShopVersionService::class);

// Initialiser toutes les versions
$service->initializeVersions();

// Forcer la mise à jour
$service->forceUpdateAllVersions();

// Récupérer les statistiques détaillées
$stats = $service->getDetailedStats();

// Benchmarker les performances
$benchmark = $service->benchmarkPerformance(100);

// Valider la cohérence
$validation = $service->validateVersionConsistency();
```

### API du modèle

```php
use App\Models\ShopDataVersion;

// Mettre à jour une version
ShopDataVersion::updateVersion('products');

// Mettre à jour plusieurs versions
ShopDataVersion::updateVersions(['products', 'categories', 'global']);

// Récupérer la version globale (avec cache)
$globalVersion = ShopDataVersion::getGlobalVersion();

// Récupérer une version spécifique
$productVersion = ShopDataVersion::getVersionForType('products');

// Statistiques de version
$stats = ShopDataVersion::getVersionStats();
```

## Performance et métriques

### Résultats attendus

```
Benchmark Results (1000 iterations):
┌─────────────────────────┬─────────────┐
│ Métrique                │ Valeur      │
├─────────────────────────┼─────────────┤
│ Nouvelle méthode        │ 12.5ms      │
│ Ancienne méthode        │ 156.8ms     │
│ Amélioration            │ 12.5x       │
│ Temps économisé/requête │ 0.144ms     │
└─────────────────────────┴─────────────┘
```

### Métriques détaillées

```php
$stats = $service->getDetailedStats();

// Exemple de sortie
[
    'versions' => [
        [
            'data_type' => 'products',
            'version_hash' => 'a1b2c3d4...',
            'last_updated_at' => '2025-01-28 10:30:00',
            'change_count' => 42,
            'seconds_since_update' => 120
        ]
    ],
    'global_version' => 'f9e8d7c6...',
    'performance_metrics' => [
        'products_count' => 15000,
        'categories_count' => 250,
        'rows_scanned_new_method' => 4,
        'efficiency_improvement' => '3812.5x'
    ]
]
```

## Architecture technique

### Composants

1. **Migration** : `2025_01_28_000000_create_shop_data_version_table.php`
2. **Modèle** : `App\Models\ShopDataVersion`
3. **Service** : `App\Services\ShopVersionService`
4. **Listener** : `App\Listeners\InvalidateShopCache` (modifié)
5. **Middleware** : `App\Http\Middleware\HandleInertiaRequests` (optimisé)
6. **Commande** : `App\Console\Commands\OptimizeShopVersions`

### Flux de données

```mermaid
graph TD
    A[Modification Produit/Catégorie] --> B[Événement ProductUpdated/CategoryUpdated]
    B --> C[InvalidateShopCache Listener]
    C --> D[ShopDataVersion::updateVersions()]
    D --> E[Mise à jour table shop_data_version]
    D --> F[Invalidation cache]
    
    G[Requête Inertia] --> H[HandleInertiaRequests::version()]
    H --> I[ShopDataVersion::getGlobalVersion()]
    I --> J{Cache existe?}
    J -->|Oui| K[Retourner depuis cache]
    J -->|Non| L[SELECT depuis shop_data_version]
    L --> M[Mettre en cache]
    M --> N[Retourner version]
```

### Types de données supportés

- `products` : Modifications des produits
- `categories` : Modifications des catégories  
- `orders` : Modifications des commandes (future extension)
- `global` : Version globale (mise à jour à chaque changement)

## Surveillance et monitoring

### Logs automatiques

```
[2025-01-28 10:30:15] INFO: Product cache invalidated {"product_id": 123, "action": "updated"}
[2025-01-28 10:30:15] INFO: Shop data versions updated {"data_types": ["products", "global"]}
```

### Métriques de performance

Surveillez ces indicateurs :

- **Temps de réponse** : `HandleInertiaRequests::version()` < 5ms
- **Fréquence de cache hit** : > 90% pour `inertia.data.version`
- **Taille de la table** : `shop_data_version` reste petite (< 10 lignes)
- **Cohérence** : Validation périodique avec `shop:optimize-versions validate`

## Tests

### Tests automatisés

```bash
# Lancer les tests d'optimisation
php artisan test tests/Feature/ShopVersionOptimizationTest.php

# Tests spécifiques
php artisan test --filter="it_provides_performance_improvement"
```

### Tests de performance

```php
// Benchmark dans vos tests
$service = app(ShopVersionService::class);
$results = $service->benchmarkPerformance(100);
$this->assertGreaterThan(2, $improvementRatio); // Au moins 2x plus rapide
```

## Débogage

### Problèmes courants

1. **Versions manquantes**
   ```bash
   php artisan shop:optimize-versions validate
   # Si échec : php artisan shop:optimize-versions init
   ```

2. **Cache non invalidé**
   ```bash
   php artisan cache:clear
   php artisan shop:optimize-versions stats
   ```

3. **Performance dégradée**
   ```bash
   php artisan shop:optimize-versions benchmark
   # Vérifier les métriques
   ```

### Commandes de diagnostic

```bash
# État complet du système
php artisan shop:optimize-versions stats

# Validation de cohérence
php artisan shop:optimize-versions validate

# Test de performance
php artisan shop:optimize-versions benchmark --iterations=1000
```

## Migration depuis l'ancienne version

### Étapes de migration

1. **Backup** : Sauvegarder la base de données
2. **Migration** : `php artisan migrate`
3. **Initialisation** : `php artisan shop:optimize-versions init`
4. **Validation** : `php artisan shop:optimize-versions validate`
5. **Test** : `php artisan shop:optimize-versions benchmark`

### Rollback (si nécessaire)

```bash
# Supprimer la table
php artisan migrate:rollback --step=1

# Rétablir l'ancienne version du middleware (git revert)
```

## Contribution et développement

### Ajouter un nouveau type de données

1. **Ajouter dans `ShopVersionService::DATA_TYPES`**
2. **Créer l'événement approprié**
3. **Modifier le listener `InvalidateShopCache`**
4. **Ajouter les tests**
5. **Mettre à jour la documentation**

### Structure des tests

- Tests d'intégration : `ShopVersionOptimizationTest`
- Tests unitaires : Service et Model
- Tests de performance : Benchmarks intégrés

## FAQ

**Q: Que se passe-t-il si la table `shop_data_version` est corrompue ?**
R: Exécutez `php artisan shop:optimize-versions clear` puis `init` pour recréer.

**Q: L'optimisation affecte-t-elle les requêtes existantes ?**
R: Non, seul le calcul de version Inertia est optimisé. Les autres requêtes restent inchangées.

**Q: Comment surveiller les performances en production ?**
R: Utilisez `php artisan shop:optimize-versions stats` et surveillez les logs de cache.

**Q: Puis-je désactiver temporairement l'optimisation ?**
R: Oui, commentez `ShopDataVersion::getGlobalVersion()` et restaurez l'ancienne méthode.

## Versions et compatibilité

- **Laravel** : ≥ 9.0
- **PHP** : ≥ 8.1
- **Base de données** : MySQL, PostgreSQL, SQLite
- **Cache** : Redis recommandé pour la production

---

*Dernière mise à jour : 28 janvier 2025* 