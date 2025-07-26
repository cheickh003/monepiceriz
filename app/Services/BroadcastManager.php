<?php

namespace App\Services;

use App\Domain\Catalog\Models\Category;
use App\Domain\Catalog\Models\Product;
use App\Events\CategoryUpdated;
use App\Events\ProductUpdated;
use App\Events\Broadcast\CategoryBroadcast;
use App\Events\Broadcast\ProductBroadcast;
use App\Events\Broadcast\Fallback\CategoryBroadcastFallback;
use App\Events\Broadcast\Fallback\ProductBroadcastFallback;

/**
 * Service de gestion centralisée des événements broadcast
 * Facilite la transition entre les phases et la gestion des événements
 */
class BroadcastManager
{
    /**
     * Envoie un événement de mise à jour de produit
     */
    public function productUpdated(Product $product, string $action = 'updated', array $additionalData = []): void
    {
        // Toujours déclencher l'événement de base pour la synchronisation administrative
        event(new ProductUpdated($product, $action));

        // Déclencher l'événement broadcast enrichi si configuré pour Phase 3
        if ($this->shouldUseBroadcastEvents()) {
            $this->dispatchProductBroadcast($product, $action, $additionalData);
        }
    }

    /**
     * Envoie un événement de mise à jour de catégorie
     */
    public function categoryUpdated(Category $category, string $action = 'updated', array $additionalData = []): void
    {
        // Toujours déclencher l'événement de base pour la synchronisation administrative
        event(new CategoryUpdated($category, $action));

        // Déclencher l'événement broadcast enrichi si configuré pour Phase 3
        if ($this->shouldUseBroadcastEvents()) {
            $this->dispatchCategoryBroadcast($category, $action, $additionalData);
        }
    }

    /**
     * Dispatch un événement de diffusion pour les produits avec fallback
     */
    private function dispatchProductBroadcast(Product $product, string $action, array $additionalData): void
    {
        try {
            if ($this->broadcastClassExists('ProductBroadcast')) {
                event(new ProductBroadcast($product, $action, $additionalData));
            } elseif (class_exists(ProductBroadcastFallback::class)) {
                event(new ProductBroadcastFallback($product, $action, $additionalData));
            } else {
                \Log::warning('Aucune classe de diffusion de produit disponible', [
                    'product_id' => $product->id,
                    'action' => $action
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la diffusion d\'événement produit', [
                'product_id' => $product->id,
                'action' => $action,
                'error' => $e->getMessage()
            ]);
            
            // Essayer avec la classe de fallback si l'erreur vient de la classe principale
            try {
                if (class_exists(ProductBroadcastFallback::class)) {
                    event(new ProductBroadcastFallback($product, $action, $additionalData));
                }
            } catch (\Exception $fallbackError) {
                \Log::error('Erreur même avec la classe de fallback produit', [
                    'product_id' => $product->id,
                    'fallback_error' => $fallbackError->getMessage()
                ]);
            }
        }
    }

    /**
     * Dispatch un événement de diffusion pour les catégories avec fallback
     */
    private function dispatchCategoryBroadcast(Category $category, string $action, array $additionalData): void
    {
        try {
            if ($this->broadcastClassExists('CategoryBroadcast')) {
                event(new CategoryBroadcast($category, $action, $additionalData));
            } elseif (class_exists(CategoryBroadcastFallback::class)) {
                event(new CategoryBroadcastFallback($category, $action, $additionalData));
            } else {
                \Log::warning('Aucune classe de diffusion de catégorie disponible', [
                    'category_id' => $category->id,
                    'action' => $action
                ]);
            }
        } catch (\Exception $e) {
            \Log::error('Erreur lors de la diffusion d\'événement catégorie', [
                'category_id' => $category->id,
                'action' => $action,
                'error' => $e->getMessage()
            ]);
            
            // Essayer avec la classe de fallback si l'erreur vient de la classe principale
            try {
                if (class_exists(CategoryBroadcastFallback::class)) {
                    event(new CategoryBroadcastFallback($category, $action, $additionalData));
                }
            } catch (\Exception $fallbackError) {
                \Log::error('Erreur même avec la classe de fallback catégorie', [
                    'category_id' => $category->id,
                    'fallback_error' => $fallbackError->getMessage()
                ]);
            }
        }
    }

    /**
     * Envoie un événement de mise à jour de stock spécialisé
     */
    public function stockUpdated(Product $product, array $stockChanges): void
    {
        $additionalData = [
            'stock_changes' => $stockChanges,
            'previous_stock' => $stockChanges['previous'] ?? null,
            'new_stock' => $stockChanges['new'] ?? null,
        ];

        $this->productUpdated($product, 'stock_updated', $additionalData);
    }

    /**
     * Envoie un événement de changement de prix
     */
    public function priceUpdated(Product $product, array $priceChanges): void
    {
        $additionalData = [
            'price_changes' => $priceChanges,
            'affected_skus' => $priceChanges['skus'] ?? [],
        ];

        $this->productUpdated($product, 'price_updated', $additionalData);
    }

    /**
     * Envoie un événement de changement de disponibilité
     */
    public function availabilityChanged(Product $product, bool $isAvailable): void
    {
        $additionalData = [
            'availability' => $isAvailable,
            'stock_status' => $this->getStockStatus($product),
        ];

        $this->productUpdated($product, 'availability_changed', $additionalData);
    }

    /**
     * Envoie un événement de changement de hiérarchie de catégorie
     */
    public function categoryHierarchyChanged(Category $category, array $hierarchyChanges): void
    {
        $additionalData = [
            'hierarchy_changes' => $hierarchyChanges,
            'affected_categories' => $hierarchyChanges['affected'] ?? [],
        ];

        $this->categoryUpdated($category, 'hierarchy_changed', $additionalData);
    }

    /**
     * Envoie un événement de changement de visibilité de catégorie
     */
    public function categoryVisibilityChanged(Category $category, bool $isVisible): void
    {
        $additionalData = [
            'visibility' => $isVisible,
            'affects_products' => $category->products()->count(),
            'affects_subcategories' => $category->children()->count(),
        ];

        $this->categoryUpdated($category, 'visibility_changed', $additionalData);
    }

    /**
     * Vérifie si une classe de diffusion existe et est instanciable
     */
    private function broadcastClassExists(string $className): bool
    {
        $fullClassName = "App\\Events\\Broadcast\\{$className}";
        
        return class_exists($fullClassName) && 
               is_subclass_of($fullClassName, 'Illuminate\Contracts\Broadcasting\ShouldBroadcast');
    }

    /**
     * Détermine si les événements broadcast enrichis doivent être utilisés
     */
    private function shouldUseBroadcastEvents(): bool
    {
        return config('shop.broadcasting.enabled', false) && 
               config('app.env') !== 'testing' && // Éviter en tests
               $this->isPhase3Ready();
    }

    /**
     * Vérifie si l'application est prête pour les fonctionnalités Phase 3
     */
    private function isPhase3Ready(): bool
    {
        // Peut être configuré via une variable d'environnement ou une configuration
        return config('shop.features.realtime_updates', false) ||
               config('app.phase', 1) >= 3;
    }

    /**
     * Détermine le statut de stock d'un produit
     */
    private function getStockStatus(Product $product): string
    {
        $totalStock = $product->skus->sum('stock_quantity');
        $threshold = config('shop.inventory.low_stock_threshold', 10);
        
        if ($totalStock <= 0) {
            return 'out_of_stock';
        } elseif ($totalStock <= $threshold) {
            return 'low_stock';
        }
        
        return 'in_stock';
    }

    /**
     * Méthode statique pour un accès facile
     */
    public static function dispatch(): self
    {
        return new self();
    }
} 