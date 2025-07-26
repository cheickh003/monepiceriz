<?php

namespace App\Events;

use App\Domain\Catalog\Models\Category;
use App\Traits\ConditionalBroadcasting;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class CategoryUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels, ConditionalBroadcasting;

    public Category $category;
    public string $action;

    /**
     * Create a new event instance.
     */
    public function __construct(Category $category, string $action = 'updated')
    {
        $this->category = $category;
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
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
                'is_active' => $this->category->is_active,
                'parent_id' => $this->category->parent_id,
                'description' => $this->category->description,
                'updated_at' => $this->category->updated_at?->toISOString(),
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
        return 'category.updated';
    }

    /**
     * Obtient le type d'événement pour la configuration
     */
    protected function getBroadcastEventType(): string
    {
        return 'category_updated';
    }
} 