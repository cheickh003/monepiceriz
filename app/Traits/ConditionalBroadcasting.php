<?php

namespace App\Traits;

use Illuminate\Contracts\Broadcasting\ShouldBroadcast;

trait ConditionalBroadcasting
{
    /**
     * Détermine si l'événement doit être diffusé
     */
    public function shouldBroadcast(): bool
    {
        // Vérifier si le broadcasting global est activé
        if (!config('shop.broadcasting.enabled', false)) {
            return false;
        }

        // Vérifier si le broadcasting pour ce type d'événement est activé
        $eventType = $this->getBroadcastEventType();
        if ($eventType && !config("shop.broadcasting.events.{$eventType}", false)) {
            return false;
        }

        return true;
    }

    /**
     * Obtient le type d'événement pour la configuration
     */
    abstract protected function getBroadcastEventType(): string;

    /**
     * Obtient le nom de la connexion à utiliser pour le broadcasting
     */
    public function broadcastConnection(): string
    {
        return config('shop.broadcasting.connection', 'log');
    }

    /**
     * Détermine si l'événement doit être mis en queue
     */
    public function shouldQueue(): bool
    {
        return $this->shouldBroadcast() && config('shop.broadcasting.enabled', false);
    }
} 