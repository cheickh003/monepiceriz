<?php

namespace App\Events;

use App\Domain\Catalog\Models\Product;
use App\Traits\ConditionalBroadcasting;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ProductUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels, ConditionalBroadcasting;

    public Product $product;
    public string $action;

    /**
     * Create a new event instance.
     */
    public function __construct(Product $product, string $action = 'updated')
    {
        $this->product = $product;
        $this->action = $action;
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
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
                'slug' => $this->product->slug,
                'is_active' => $this->product->is_active,
                'category_id' => $this->product->category_id,
                'reference' => $this->product->reference,
                'updated_at' => $this->product->updated_at?->toISOString(),
            ],
            'action' => $this->action,
            'timestamp' => now()->toISOString(),
            'version' => 1, // Pour la compatibilité future
        ];
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return 'product.updated';
    }

    /**
     * Obtient le type d'événement pour la configuration
     */
    protected function getBroadcastEventType(): string
    {
        return 'product_updated';
    }
} 