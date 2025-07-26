<?php

namespace App\Listeners;

use App\Events\ProductUpdated;
use App\Events\CategoryUpdated;
use App\Models\ShopDataVersion;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class InvalidateShopCache implements ShouldQueue
{
    use InteractsWithQueue;

    /**
     * Durée du verrou atomique en secondes
     */
    private const ATOMIC_LOCK_TIMEOUT = 5;
    
    /**
     * Nombre de tentatives de récupération du verrou
     */
    private const LOCK_RETRY_ATTEMPTS = 3;
    
    /**
     * Délai entre les tentatives en millisecondes
     */
    private const LOCK_RETRY_DELAY = 100;

    /**
     * Create the event listener.
     */
    public function __construct()
    {
        //
    }

    /**
     * Handle the event.
     */
    public function handle(ProductUpdated|CategoryUpdated $event): void
    {
        $lockKey = 'shop_cache_invalidation_' . time();
        $attempts = 0;
        
        while ($attempts < self::LOCK_RETRY_ATTEMPTS) {
            $lockAcquired = Cache::lock($lockKey, self::ATOMIC_LOCK_TIMEOUT)
                ->get(function () use ($event) {
                    return $this->performAtomicCacheInvalidation($event);
                });
                
            if ($lockAcquired) {
                return;
            }
            
            $attempts++;
            if ($attempts < self::LOCK_RETRY_ATTEMPTS) {
                usleep(self::LOCK_RETRY_DELAY * 1000);
            }
        }
        
        // Fallback en cas d'échec du verrou
        Log::warning('Failed to acquire cache invalidation lock, performing non-atomic operation', [
            'event_type' => get_class($event),
            'attempts' => $attempts
        ]);
        
        $this->performAtomicCacheInvalidation($event);
    }

    /**
     * Effectue l'invalidation atomique du cache
     */
    private function performAtomicCacheInvalidation(ProductUpdated|CategoryUpdated $event): bool
    {
        try {
            return DB::transaction(function () use ($event) {
                $dataTypesToUpdate = [];
                $cacheKeysToInvalidate = [];

                // Collecter les données à mettre à jour et les clés de cache à invalider
                if ($event instanceof ProductUpdated) {
                    $productCacheKeys = $this->getProductCacheKeys($event->product->id);
                    $cacheKeysToInvalidate = array_merge($cacheKeysToInvalidate, $productCacheKeys);
                    $dataTypesToUpdate[] = 'products';
                    
                    Log::info('Product cache invalidation prepared', [
                        'product_id' => $event->product->id, 
                        'action' => $event->action,
                        'cache_keys_count' => count($productCacheKeys)
                    ]);
                }

                if ($event instanceof CategoryUpdated) {
                    $categoryCacheKeys = $this->getCategoryCacheKeys($event->category->id);
                    $cacheKeysToInvalidate = array_merge($cacheKeysToInvalidate, $categoryCacheKeys);
                    $dataTypesToUpdate[] = 'categories';
                    
                    Log::info('Category cache invalidation prepared', [
                        'category_id' => $event->category->id, 
                        'action' => $event->action,
                        'cache_keys_count' => count($categoryCacheKeys)
                    ]);
                }

                // Toujours mettre à jour la version globale
                $dataTypesToUpdate[] = 'global';

                // Phase 1: Mettre à jour les versions de données AVANT l'invalidation du cache
                // Cela garantit la cohérence des timestamps
                ShopDataVersion::updateVersionsAtomic($dataTypesToUpdate);

                // Phase 2: Invalider les caches de manière atomique
                $this->invalidateCacheKeysAtomic($cacheKeysToInvalidate);

                // Phase 3: Invalider les caches avec tags si disponible
                if ($event instanceof ProductUpdated) {
                    $this->invalidateTaggedCaches(['products', 'shop']);
                }

                if ($event instanceof CategoryUpdated) {
                    $this->invalidateTaggedCaches(['categories', 'shop']);
                }

                Log::info('Atomic cache invalidation completed successfully', [
                    'data_types' => $dataTypesToUpdate,
                    'invalidated_keys' => count($cacheKeysToInvalidate)
                ]);

                return true;
            });

        } catch (\Exception $e) {
            Log::error('Failed to perform atomic cache invalidation', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'event_type' => get_class($event)
            ]);
            
            throw $e;
        }
    }

    /**
     * Récupère toutes les clés de cache liées aux produits
     */
    private function getProductCacheKeys(int $productId): array
    {
        return [
            "product.{$productId}",
            "product.detailed.{$productId}",
            'shop.products.featured',
            'shop.products.latest',
            'shop.products.popular',
            'shop.home.data',
            'shop.search.results',
        ];
    }

    /**
     * Récupère toutes les clés de cache liées aux catégories
     */
    private function getCategoryCacheKeys(int $categoryId): array
    {
        return [
            "category.{$categoryId}",
            "category.products.{$categoryId}",
            "categories.navigation",
            "categories.tree",
            'shop.categories.all',
            'shop.categories.active',
            'shop.home.categories',
        ];
    }

    /**
     * Invalide les clés de cache de manière atomique
     */
    private function invalidateCacheKeysAtomic(array $cacheKeys): void
    {
        if (empty($cacheKeys)) {
            return;
        }

        // Pour Redis, utiliser une pipeline pour l'atomicité
        if (method_exists(Cache::getStore(), 'many')) {
            $keysWithNull = array_fill_keys($cacheKeys, null);
            Cache::putMany($keysWithNull, 0); // TTL de 0 = suppression immédiate
        } else {
            // Fallback pour les autres drivers
            foreach ($cacheKeys as $key) {
                Cache::forget($key);
            }
        }
    }

    /**
     * Invalide les caches avec tags de manière atomique
     */
    private function invalidateTaggedCaches(array $tags): void
    {
        if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
            try {
                Cache::tags($tags)->flush();
            } catch (\Exception $e) {
                Log::warning('Failed to flush tagged cache', [
                    'tags' => $tags,
                    'error' => $e->getMessage()
                ]);
            }
        }
    }

    /**
     * Invalider les caches liés aux produits (méthode legacy pour compatibilité)
     */
    private function invalidateProductCaches(int $productId): void
    {
        $individualKeys = [
            "product.{$productId}",
            "product.detailed.{$productId}"
        ];

        $this->invalidateEntityCaches($individualKeys, ['products', 'shop'], function () {
            $this->flushProductListCaches();
        });
    }

    /**
     * Invalider les caches liés aux catégories (méthode legacy pour compatibilité)
     */
    private function invalidateCategoryCaches(int $categoryId): void
    {
        $individualKeys = [
            "category.{$categoryId}",
            "category.products.{$categoryId}",
            "categories.navigation",
            "categories.tree"
        ];

        $this->invalidateEntityCaches($individualKeys, ['categories', 'shop'], function () {
            $this->flushCategoryListCaches();
        });
    }

    /**
     * Logique commune d'invalidation des caches d'entités
     */
    private function invalidateEntityCaches(array $individualKeys, array $tags, callable $fallbackCallback): void
    {
        // Invalider les caches individuels
        foreach ($individualKeys as $key) {
            Cache::forget($key);
        }
        
        // Caches de listes avec tags ou fallback
        if (Cache::getStore() instanceof \Illuminate\Cache\TaggableStore) {
            Cache::tags($tags)->flush();
        } else {
            // Fallback si les tags ne sont pas supportés
            $fallbackCallback();
        }
    }

    /**
     * Fallback pour invalider les caches de produits sans tags
     */
    private function flushProductListCaches(): void
    {
        $keys = [
            'shop.products.featured',
            'shop.products.latest',
            'shop.products.popular',
            'shop.home.data',
            'shop.search.results',
        ];

        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }

    /**
     * Fallback pour invalider les caches de catégories sans tags
     */
    private function flushCategoryListCaches(): void
    {
        $keys = [
            'shop.categories.all',
            'shop.categories.active',
            'shop.home.categories',
        ];

        foreach ($keys as $key) {
            Cache::forget($key);
        }
    }
} 