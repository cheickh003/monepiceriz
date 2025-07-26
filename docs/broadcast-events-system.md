# Système d'Événements de Diffusion Robuste

## Vue d'ensemble

Le système d'événements de diffusion a été conçu pour être robuste et tolérant aux erreurs. Il comprend des vérifications d'existence des classes et des mécanismes de fallback pour garantir la continuité du service même en cas de problème avec les classes principales.

## Architecture

### Classes Principales

1. **`App\Events\Broadcast\ProductBroadcast`** - Classe de diffusion enrichie pour les produits
2. **`App\Events\Broadcast\CategoryBroadcast`** - Classe de diffusion enrichie pour les catégories

### Classes de Fallback

1. **`App\Events\Broadcast\Fallback\ProductBroadcastFallback`** - Version minimale de sauvegarde pour les produits
2. **`App\Events\Broadcast\Fallback\CategoryBroadcastFallback`** - Version minimale de sauvegarde pour les catégories

### Gestionnaire Central

**`App\Services\BroadcastManager`** - Service centralisé qui gère tous les événements de diffusion avec logique de fallback

## Fonctionnement

### Vérifications de Sécurité

1. **Vérification d'existence des classes** : `broadcastClassExists()` vérifie que la classe existe et implémente `ShouldBroadcast`
2. **Gestion des exceptions** : Try-catch autour de chaque instanciation d'événement
3. **Fallback automatique** : Si la classe principale échoue, utilise automatiquement la classe de fallback
4. **Logging des erreurs** : Toutes les erreurs sont loggées pour débogage

### Flux de Traitement

```
1. Événement déclenché (ex: Product mis à jour)
2. BroadcastManager vérifie si broadcasting activé
3. Tente d'utiliser ProductBroadcast (classe principale)
4. Si erreur → utilise ProductBroadcastFallback
5. Si erreur même avec fallback → log l'erreur
```

### Configuration

Le système utilise plusieurs configurations :

```php
// Configuration principale
config('shop.broadcasting.enabled', false)

// Canaux de diffusion
config('shop.broadcasting.channels.shop_updates', 'shop-updates')
config('shop.broadcasting.channels.admin_updates', 'admin-updates')

// Fonctionnalités temps réel
config('shop.features.realtime_updates', false)
config('app.phase', 1)
```

## Utilisation

### Via BroadcastManager

```php
// Mise à jour de produit
BroadcastManager::dispatch()->productUpdated($product, 'updated', [
    'additional_data' => 'valeur'
]);

// Mise à jour de stock
BroadcastManager::dispatch()->stockUpdated($product, [
    'previous' => 10,
    'new' => 5,
    'difference' => -5
]);
```

### Événements Spécialisés

1. **`stockUpdated()`** - Changements de stock
2. **`priceUpdated()`** - Changements de prix
3. **`availabilityChanged()`** - Changements de disponibilité
4. **`categoryHierarchyChanged()`** - Changements hiérarchie catégories
5. **`categoryVisibilityChanged()`** - Changements visibilité catégories

## Données Diffusées

### Classes Principales (Version Enrichie)

- Informations complètes du produit/catégorie
- Données contextuelles selon l'action
- Multiples canaux de diffusion
- Métadonnées enrichies

### Classes de Fallback (Version Minimale)

- Informations de base uniquement
- Canal unique de diffusion
- Données essentielles pour continuité
- Marquage 'fallback' dans la version

## Avantages

1. **Robustesse** - Le système continue à fonctionner même si certaines classes ont des problèmes
2. **Flexibilité** - Peut basculer entre versions enrichies et minimales
3. **Traçabilité** - Logging complet des erreurs et fallbacks
4. **Compatibilité** - Compatible avec toutes les phases du projet
5. **Performance** - Vérifications rapides avant instanciation

## Tests et Débogage

### Logs à Surveiller

- `Aucune classe de diffusion disponible` - Aucune classe trouvée
- `Erreur lors de la diffusion d'événement` - Erreur classe principale
- `Erreur même avec la classe de fallback` - Erreur critique

### Tests Possibles

```php
// Test existence classes
BroadcastManager::broadcastClassExists('ProductBroadcast');

// Test avec broadcasting désactivé
config(['shop.broadcasting.enabled' => false]);

// Test avec Phase 3 activée
config(['app.phase' => 3]);
```

## Évolutions Futures

Le système est conçu pour s'adapter facilement aux évolutions :

1. Nouvelles classes de diffusion spécialisées
2. Canaux de diffusion additionnels
3. Données enrichies selon les besoins
4. Intégration WebSocket plus avancée 