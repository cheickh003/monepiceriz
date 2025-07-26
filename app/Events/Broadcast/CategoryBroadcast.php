<?php

namespace App\Events\Broadcast;

use App\Domain\Catalog\Models\Category;
use App\Traits\ConditionalBroadcasting;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

/**
 * Événement broadcast spécialisé pour Phase 3
 * Fournit des données enrichies pour les fonctionnalités temps réel des catégories
 */
class CategoryBroadcast implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels, ConditionalBroadcasting;

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
     *
     * @return array<int, \Illuminate\Broadcasting\Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [];
        
        // Canal public pour les mises à jour de catégories
        $shopChannel = config('shop.broadcasting.channels.shop_updates', 'shop-updates');
        $channels[] = new Channel($shopChannel);
        
        // Canal privé pour les administrateurs
        $adminChannel = config('shop.broadcasting.channels.admin_updates', 'admin-updates');
        $channels[] = new PrivateChannel($adminChannel);
        
        // Canal spécifique aux catégories
        $channels[] = new Channel('categories');
        
        // Canal spécifique à cette catégorie
        $channels[] = new Channel("category.{$this->category->id}");
        
        // Si c'est une sous-catégorie, ajouter le canal de la catégorie parent
        if ($this->category->parent_id) {
            $channels[] = new Channel("category.{$this->category->parent_id}");
        }
        
        return $channels;
    }

    /**
     * Get the data to broadcast.
     */
    public function broadcastWith(): array
    {
        $baseData = [
            'category' => [
                'id' => $this->category->id,
                'name' => $this->category->name,
                'slug' => $this->category->slug,
                'description' => $this->category->description,
                'is_active' => $this->category->is_active,
                'parent_id' => $this->category->parent_id,
                'parent_name' => $this->category->parent?->name,
                'image' => $this->category->image,
                'position' => $this->category->position,
                'products_count' => $this->getActiveProductsCount(),
                'subcategories_count' => $this->getActiveSubcategoriesCount(),
                'updated_at' => $this->category->updated_at?->toISOString(),
            ],
            'action' => $this->action,
            'timestamp' => now()->toISOString(),
            'version' => 2, // Version améliorée pour Phase 3
        ];

        // Ajouter des données contextuelles selon l'action
        switch ($this->action) {
            case 'products_count_changed':
                $baseData['products_count_change'] = $this->additionalData['products_count_change'] ?? 0;
                break;
            case 'hierarchy_changed':
                $baseData['hierarchy_changes'] = $this->additionalData['hierarchy_changes'] ?? [];
                break;
            case 'visibility_changed':
                $baseData['visibility'] = $this->additionalData['visibility'] ?? null;
                break;
        }

        return array_merge($baseData, $this->additionalData);
    }

    /**
     * The event's broadcast name.
     */
    public function broadcastAs(): string
    {
        return "category.{$this->action}";
    }

    /**
     * Obtient le type d'événement pour la configuration
     */
    protected function getBroadcastEventType(): string
    {
        return 'category_updated';
    }

    /**
     * Compte le nombre de produits actifs dans cette catégorie
     */
    private function getActiveProductsCount(): int
    {
        return $this->category->products()
            ->where('is_active', true)
            ->count();
    }

    /**
     * Compte le nombre de sous-catégories actives
     */
    private function getActiveSubcategoriesCount(): int
    {
        return $this->category->children()
            ->where('is_active', true)
            ->count();
    }
} 