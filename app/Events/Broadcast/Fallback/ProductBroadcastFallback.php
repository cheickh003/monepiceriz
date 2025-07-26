<?php

namespace App\Events\Broadcast\Fallback;

use App\Domain\Catalog\Models\Product;
use App\Events\ProductUpdated;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Classe de fallback pour ProductBroadcast
 * Fournit une implémentation minimale en cas de problème avec la classe principale
 */
class ProductBroadcastFallback implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

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
     */
    public function broadcastOn(): array
    {
        $channelName = config('shop.broadcasting.channels.shop_updates', 'shop-updates');
        
        return [
            new Channel($channelName),
        ];
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        return [
            'product' => [
                'id' => $this->product->id,
                'name' => $this->product->name,
                'is_active' => $this->product->is_active,
                'updated_at' => $this->product->updated_at?->toISOString(),
            ],
            'action' => $this->action,
            'timestamp' => now()->toISOString(),
            'version' => 'fallback',
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'product.updated';
    }
} 