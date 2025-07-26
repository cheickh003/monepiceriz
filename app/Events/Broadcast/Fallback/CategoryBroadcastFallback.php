<?php

namespace App\Events\Broadcast\Fallback;

use App\Domain\Catalog\Models\Category;
use App\Events\CategoryUpdated;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Classe de fallback pour CategoryBroadcast
 * Fournit une implémentation minimale en cas de problème avec la classe principale
 */
class CategoryBroadcastFallback implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public Category $category;
    public string $action;
    public array $additionalData;

    /**
     * Create a new event instance.
     */
    public function __construct(Category $category, string $action = 'updated', array $additionalData = [])
    {
        $this->category = $category;
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
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'is_active' => $this->category->is_active,
                'updated_at' => $this->category->updated_at?->toISOString(),
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
        return 'category.updated';
    }
} 