<?php

namespace App\Events\Broadcast;

use App\Domain\Catalog\Models\Product;
use App\Traits\ConditionalBroadcasting;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Événement broadcast spécialisé pour Phase 3
 * Fournit des données enrichies pour les fonctionnalités temps réel
 */
class ProductBroadcast implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels, ConditionalBroadcasting;

    public Product $product;
    public string $action;
    public array $additionalData;

    /**
     * Create a new event instance.
     */
    public function __construct(Product $product, string $action = 'updated', array $additionalData = [])
    {
        $this->product = $product;
        $this->action = $action;
        $this->additionalData = $additionalData;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [];
        
        // Canal public pour les mises à jour de produits
        $shopChannel = config('shop.broadcasting.channels.shop_updates', 'shop-updates');
        $channels[] = new Channel($shopChannel);
        
        // Canal privé pour les administrateurs
        $adminChannel = config('shop.broadcasting.channels.admin_updates', 'admin-updates');
        $channels[] = new PrivateChannel($adminChannel);
        
        // Canal spécifique à la catégorie pour un filtrage fin
        if ($this->product->category_id) {
            $channels[] = new Channel("category.{$this->product->category_id}");
        }
        
        return $channels;
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $baseData = [
            'product' => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'slug' => $this->product->slug,
                'reference' => $this->product->reference,
                'is_active' => $this->product->is_active,
                'category_id' => $this->product->category_id,
                'category_name' => $this->product->category?->name,
                'main_image' => $this->product->main_image,
                'price_range' => $this->getProductPriceRange(),
                'stock_status' => $this->getStockStatus(),
                'updated_at' => $this->product->updated_at?->toISOString(),
            ],
            'action' => $this->action,
            'timestamp' => now()->toISOString(),
            'version' => 2, // Version améliorée pour Phase 3
        ];

        // Ajouter des données contextuelles selon l'action
        switch ($this->action) {
            case 'stock_updated':
                $baseData['stock_changes'] = $this->additionalData['stock_changes'] ?? [];
                break;
            case 'price_updated':
                $baseData['price_changes'] = $this->additionalData['price_changes'] ?? [];
                break;
            case 'availability_changed':
                $baseData['availability'] = $this->additionalData['availability'] ?? null;
                break;
        }

        return array_merge($baseData, $this->additionalData);
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return "product.{$this->action}";
    }

    /**
     * Obtient le type d'événement pour la configuration
     */
    protected function getBroadcastEventType(): string
    {
        return 'product_updated';
    }

    /**
     * Obtient la gamme de prix du produit
     */
    private function getProductPriceRange(): array
    {
        $skus = $this->product->skus;
        
        if ($skus->isEmpty()) {
            return ['min' => 0, 'max' => 0];
        }

        $prices = $skus->pluck('price_ttc');
        
        return [
            'min' => $prices->min(),
            'max' => $prices->max(),
            'currency' => config('shop.store.currency', 'XOF'),
        ];
    }

    /**
     * Détermine le statut de stock
     */
    private function getStockStatus(): string
    {
        $totalStock = $this->product->skus->sum('stock_quantity');
        $threshold = config('shop.inventory.low_stock_threshold', 10);
        
        if ($totalStock <= 0) {
            return 'out_of_stock';
        } elseif ($totalStock <= $threshold) {
            return 'low_stock';
        }
        
        return 'in_stock';
    }
} 