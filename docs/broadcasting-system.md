# Système de Broadcasting Conditionnel - MonEpice&Riz

## Vue d'ensemble

Le système de broadcasting conditionnel permet de gérer efficacement la diffusion en temps réel des événements de la boutique selon les phases du projet, évitant ainsi la surcharge de performance dans les phases initiales tout en préparant l'infrastructure pour les fonctionnalités temps réel de la Phase 3.

## Architecture

### Composants principaux

1. **Trait ConditionalBroadcasting** (`app/Traits/ConditionalBroadcasting.php`)
   - Gère la logique de broadcasting conditionnel
   - Vérifie les configurations avant la diffusion

2. **Événements de base** (Phase 1-2)
   - `ProductUpdated` - Synchronisation administrative
   - `CategoryUpdated` - Synchronisation administrative

3. **Événements broadcast enrichis** (Phase 3)
   - `ProductBroadcast` - Données enrichies pour fonctionnalités temps réel
   - `CategoryBroadcast` - Données enrichies pour fonctionnalités temps réel

4. **BroadcastManager** (`app/Services/BroadcastManager.php`)
   - Service centralisé pour gérer tous les événements
   - Interface unifiée pour la transition entre phases

## Configuration

### Variables d'environnement

```env
# Broadcasting général
SHOP_BROADCASTING_ENABLED=false
SHOP_BROADCAST_CONNECTION=log

# Événements spécifiques
SHOP_BROADCAST_PRODUCT_EVENTS=false
SHOP_BROADCAST_CATEGORY_EVENTS=false
SHOP_BROADCAST_ORDER_EVENTS=false
SHOP_BROADCAST_STOCK_EVENTS=false

# Fonctionnalités Phase 3
SHOP_REALTIME_UPDATES=false
SHOP_LIVE_STOCK_UPDATES=false
SHOP_PRICE_NOTIFICATIONS=false
```

### Configuration shop.php

La configuration se trouve dans `config/shop.php` :

```php
'broadcasting' => [
    'enabled' => env('SHOP_BROADCASTING_ENABLED', false),
    'events' => [
        'product_updated' => env('SHOP_BROADCAST_PRODUCT_EVENTS', false),
        'category_updated' => env('SHOP_BROADCAST_CATEGORY_EVENTS', false),
        'order_updated' => env('SHOP_BROADCAST_ORDER_EVENTS', false),
        'stock_updated' => env('SHOP_BROADCAST_STOCK_EVENTS', false),
    ],
    'channels' => [
        'shop_updates' => 'shop-updates',
        'admin_updates' => 'admin-updates',
    ],
    'connection' => env('SHOP_BROADCAST_CONNECTION', 'log'),
],

'features' => [
    'realtime_updates' => env('SHOP_REALTIME_UPDATES', false),
    'live_stock_updates' => env('SHOP_LIVE_STOCK_UPDATES', false),
    'price_change_notifications' => env('SHOP_PRICE_NOTIFICATIONS', false),
],
```

## Utilisation

### Avec BroadcastManager (Recommandé)

```php
use App\Services\BroadcastManager;

// Mise à jour simple
BroadcastManager::dispatch()->productUpdated($product, 'updated');

// Mise à jour de stock avec détails
BroadcastManager::dispatch()->stockUpdated($product, [
    'skus' => $stockChanges,
    'total_change' => $totalChange,
]);

// Changement de prix
BroadcastManager::dispatch()->priceUpdated($product, [
    'skus' => $priceChanges,
    'affected_skus' => $affectedSkus,
]);

// Changement de disponibilité
BroadcastManager::dispatch()->availabilityChanged($product, true);

// Événements de catégorie
BroadcastManager::dispatch()->categoryUpdated($category, 'updated');
BroadcastManager::dispatch()->categoryVisibilityChanged($category, false);
```

### Événements directs (Legacy)

```php
// Toujours fonctionnel pour la compatibilité
event(new ProductUpdated($product, 'updated'));
event(new CategoryUpdated($category, 'updated'));
```

## Phases du projet

### Phase 1-2 : Broadcasting désactivé

- Configuration : `SHOP_BROADCASTING_ENABLED=false`
- Seuls les événements de base sont déclenchés
- Aucune surcharge de performance
- Synchronisation administrative fonctionnelle

### Phase 3 : Broadcasting activé

- Configuration : `SHOP_BROADCASTING_ENABLED=true`
- Événements enrichis automatiquement déclenchés
- Canaux multiples (public, admin, spécifiques)
- Données contextuelles selon l'action

## Canaux de diffusion

### Phase 3 - Canaux disponibles

1. **shop-updates** : Canal public pour les mises à jour générales
2. **admin-updates** : Canal privé pour les administrateurs
3. **category.{id}** : Canal spécifique à une catégorie
4. **categories** : Canal pour toutes les catégories

## Événements enrichis (Phase 3)

### ProductBroadcast

```javascript
// Exemple de données reçues
{
    "product": {
        "id": 123,
        "name": "Produit exemple",
        "slug": "produit-exemple",
        "reference": "REF123",
        "is_active": true,
        "category_id": 5,
        "category_name": "Épicerie",
        "main_image": "/images/product.jpg",
        "price_range": {
            "min": 1500,
            "max": 2500,
            "currency": "XOF"
        },
        "stock_status": "in_stock",
        "updated_at": "2024-01-15T10:30:00Z"
    },
    "action": "stock_updated",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": 2,
    "stock_changes": [
        {
            "sku_id": 456,
            "previous": 10,
            "new": 5,
            "difference": -5
        }
    ]
}
```

### CategoryBroadcast

```javascript
// Exemple de données reçues
{
    "category": {
        "id": 5,
        "name": "Épicerie",
        "slug": "epicerie",
        "description": "Produits d'épicerie",
        "is_active": true,
        "parent_id": null,
        "parent_name": null,
        "image": "/images/category.jpg",
        "position": 1,
        "products_count": 150,
        "subcategories_count": 8,
        "updated_at": "2024-01-15T10:30:00Z"
    },
    "action": "visibility_changed",
    "timestamp": "2024-01-15T10:30:00Z",
    "version": 2,
    "visibility": false,
    "affects_products": 150,
    "affects_subcategories": 8
}
```

## Intégration frontend

### JavaScript/React

```javascript
// Configuration Echo.js pour Phase 3
import Echo from 'laravel-echo';

const echo = new Echo({
    broadcaster: 'pusher', // ou votre driver configuré
    // ... autres options
});

// Écouter les mises à jour de produits
echo.channel('shop-updates')
    .listen('.product.stock_updated', (data) => {
        // Mettre à jour l'interface utilisateur
        updateProductStock(data.product.id, data.stock_changes);
    })
    .listen('.product.price_updated', (data) => {
        updateProductPrice(data.product.id, data.price_changes);
    })
    .listen('.product.availability_changed', (data) => {
        updateProductAvailability(data.product.id, data.availability);
    });

// Écouter les mises à jour de catégories
echo.channel('categories')
    .listen('.category.visibility_changed', (data) => {
        updateCategoryVisibility(data.category.id, data.visibility);
    });
```

## Migration entre phases

### De Phase 1-2 vers Phase 3

1. **Activer le broadcasting** :
   ```env
   SHOP_BROADCASTING_ENABLED=true
   SHOP_BROADCAST_PRODUCT_EVENTS=true
   SHOP_BROADCAST_CATEGORY_EVENTS=true
   ```

2. **Configurer le driver** :
   ```env
   SHOP_BROADCAST_CONNECTION=redis
   # ou pusher, selon votre setup
   ```

3. **Activer les fonctionnalités temps réel** :
   ```env
   SHOP_REALTIME_UPDATES=true
   SHOP_LIVE_STOCK_UPDATES=true
   ```

4. **Aucun changement de code requis** si vous utilisez `BroadcastManager`

## Tests

### Tester le broadcasting conditionnel

```php
// Test avec broadcasting désactivé
Config::set('shop.broadcasting.enabled', false);
BroadcastManager::dispatch()->productUpdated($product);
// Vérifier qu'aucun broadcast n'est envoyé

// Test avec broadcasting activé
Config::set('shop.broadcasting.enabled', true);
Config::set('shop.broadcasting.events.product_updated', true);
BroadcastManager::dispatch()->productUpdated($product);
// Vérifier que le broadcast est envoyé
```

## Monitoring et débug

### Logs

Les échecs de broadcasting sont automatiquement loggés :

```php
\Log::warning('Échec de la synchronisation lors de la création du produit', [
    'product_id' => $product->id,
    'error' => $e->getMessage()
]);
```

### Commandes artisan utiles

```bash
# Tester la configuration broadcasting
php artisan tinker
>>> config('shop.broadcasting.enabled')

# Vérifier les canaux actifs
php artisan horizon:status  # Si vous utilisez Horizon

# Purger la queue broadcast
php artisan queue:flush
```

## Bonnes pratiques

1. **Utilisez toujours BroadcastManager** pour une gestion centralisée
2. **Testez en Phase 1-2** avec broadcasting désactivé
3. **Activez progressivement** les événements en Phase 3
4. **Surveillez les performances** lors de l'activation
5. **Utilisez des canaux spécifiques** pour réduire le trafic
6. **Gérez les erreurs** avec des try-catch

## Dépannage

### Broadcasting ne fonctionne pas

1. Vérifiez `SHOP_BROADCASTING_ENABLED=true`
2. Vérifiez le driver de broadcasting configuré
3. Vérifiez que les événements spécifiques sont activés
4. Vérifiez les logs Laravel pour les erreurs

### Performance dégradée

1. Désactivez temporairement le broadcasting
2. Utilisez des canaux plus spécifiques
3. Vérifiez la configuration de la queue
4. Surveillez l'utilisation mémoire

## Évolutions futures

- Support WebSockets natif
- Compression des données broadcast
- Filtrage côté serveur avancé
- Statistiques de broadcasting
- Interface admin pour gérer les canaux 