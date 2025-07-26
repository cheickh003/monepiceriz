<?php

namespace App\Domain\Shipping\Services;

use App\Domain\Order\Models\Order;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Cache;

class YangoService
{
    protected string $apiKey;
    protected string $apiUrl;
    protected string $webhookSecret;
    protected array $pickupLocation;
    protected array $deliveryZones;

    public function __construct()
    {
        $this->apiKey = config('services.yango.api_key', '');
        $this->apiUrl = config('services.yango.api_url', 'https://api.yango.com/v1');
        $this->webhookSecret = config('services.yango.webhook_secret', '');
        
        // Coordonnées du magasin pour le pickup
        $this->pickupLocation = [
            'latitude' => 5.3484, // Cocody, Abidjan
            'longitude' => -3.9866,
            'address' => 'MonEpice&Riz, Cocody, Abidjan',
        ];
        
        // Zones de livraison supportées
        $this->deliveryZones = config('shop.delivery.zones', [
            'cocody' => ['name' => 'Cocody', 'base_fee' => 1000],
            'plateau' => ['name' => 'Plateau', 'base_fee' => 1500],
            'marcory' => ['name' => 'Marcory', 'base_fee' => 2000],
            'yopougon' => ['name' => 'Yopougon', 'base_fee' => 2500],
            'abobo' => ['name' => 'Abobo', 'base_fee' => 2500],
            'adjame' => ['name' => 'Adjamé', 'base_fee' => 2000],
            'treichville' => ['name' => 'Treichville', 'base_fee' => 2000],
            'koumassi' => ['name' => 'Koumassi', 'base_fee' => 2500],
            'port-bouet' => ['name' => 'Port-Bouët', 'base_fee' => 3000],
            'attécoubé' => ['name' => 'Attécoubé', 'base_fee' => 2500],
        ]);
    }

    /**
     * Calcule les frais de livraison
     */
    public function calculateDeliveryFee(string $address, float $orderAmount): float
    {
        try {
            // Déterminer la zone depuis l'adresse
            $zone = $this->detectZoneFromAddress($address);
            
            if ($zone && isset($this->deliveryZones[$zone])) {
                $baseFee = $this->deliveryZones[$zone]['base_fee'];
                
                // Frais supplémentaires selon le montant de la commande
                if ($orderAmount > 50000) {
                    $baseFee += 500; // Frais supplémentaires pour grosses commandes
                }
                
                // Si l'API Yango est disponible, calculer le prix exact
                if ($this->apiKey) {
                    return $this->calculateExactFee($address, $baseFee);
                }
                
                return $baseFee;
            }
            
            // Zone non supportée ou non détectée
            return config('shop.delivery.default_fee', 2000);
            
        } catch (\Exception $e) {
            Log::warning('Failed to calculate delivery fee', [
                'error' => $e->getMessage(),
                'address' => $address
            ]);
            
            return config('shop.delivery.default_fee', 2000);
        }
    }

    /**
     * Estime les frais de livraison par défaut
     */
    public function estimateDeliveryFee(): float
    {
        return config('shop.delivery.default_fee', 1500);
    }

    /**
     * Crée une livraison Yango
     */
    public function createDelivery(Order $order): array
    {
        try {
            if (!$this->apiKey) {
                throw new \Exception('Yango API not configured');
            }

            $data = [
                'order_id' => $order->order_number,
                'pickup' => [
                    'location' => $this->pickupLocation,
                    'contact' => [
                        'name' => 'MonEpice&Riz',
                        'phone' => config('shop.contact.phone'),
                    ],
                    'comment' => "Commande {$order->order_number}",
                ],
                'dropoff' => [
                    'location' => [
                        'address' => $order->delivery_address,
                    ],
                    'contact' => [
                        'name' => $order->customer_name,
                        'phone' => $this->formatPhoneForYango($order->customer_phone),
                    ],
                    'comment' => $order->delivery_notes,
                ],
                'items' => $this->formatOrderItems($order),
                'payment' => [
                    'type' => $order->payment_method === 'cash' ? 'cash' : 'prepaid',
                    'amount' => $order->payment_method === 'cash' ? $order->total_amount : 0,
                ],
                'vehicle_type' => $this->determineVehicleType($order),
                'webhook_url' => route('webhooks.yango'),
            ];

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->post($this->apiUrl . '/deliveries', $data);

            if ($response->successful()) {
                $result = $response->json();
                
                Log::info('Yango delivery created', [
                    'order_id' => $order->id,
                    'delivery_id' => $result['id'],
                ]);

                return [
                    'success' => true,
                    'delivery_id' => $result['id'],
                    'tracking_url' => $result['tracking_url'] ?? null,
                    'estimated_time' => $result['estimated_delivery_time'] ?? null,
                ];
            }

            throw new \Exception('Failed to create delivery: ' . $response->body());

        } catch (\Exception $e) {
            Log::error('Yango delivery creation error', [
                'order_id' => $order->id,
                'error' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'message' => $e->getMessage(),
            ];
        }
    }

    /**
     * Suit une livraison
     */
    public function trackDelivery(string $deliveryId): array
    {
        try {
            if (!$this->apiKey) {
                throw new \Exception('Yango API not configured');
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])->get($this->apiUrl . '/deliveries/' . $deliveryId);

            if ($response->successful()) {
                $result = $response->json();
                
                return [
                    'status' => $result['status'],
                    'driver' => $result['driver'] ?? null,
                    'location' => $result['current_location'] ?? null,
                    'estimated_arrival' => $result['estimated_arrival'] ?? null,
                    'tracking_url' => $result['tracking_url'] ?? null,
                ];
            }

            throw new \Exception('Failed to track delivery');

        } catch (\Exception $e) {
            Log::error('Delivery tracking error', [
                'delivery_id' => $deliveryId,
                'error' => $e->getMessage(),
            ]);
            
            throw $e;
        }
    }

    /**
     * Annule une livraison
     */
    public function cancelDelivery(string $deliveryId, string $reason = null): bool
    {
        try {
            if (!$this->apiKey) {
                return false;
            }

            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
            ])->post($this->apiUrl . '/deliveries/' . $deliveryId . '/cancel', [
                'reason' => $reason ?? 'Order cancelled by merchant',
            ]);

            if ($response->successful()) {
                Log::info('Delivery cancelled', [
                    'delivery_id' => $deliveryId,
                    'reason' => $reason,
                ]);
                
                return true;
            }

            return false;

        } catch (\Exception $e) {
            Log::error('Delivery cancellation error', [
                'delivery_id' => $deliveryId,
                'error' => $e->getMessage(),
            ]);
            
            return false;
        }
    }

    /**
     * Calcule le prix exact via l'API Yango
     */
    protected function calculateExactFee(string $address, float $baseFee): float
    {
        $cacheKey = 'yango_fee_' . md5($address);
        
        return Cache::remember($cacheKey, 300, function () use ($address, $baseFee) {
            try {
                $response = Http::withHeaders([
                    'Authorization' => 'Bearer ' . $this->apiKey,
                ])->post($this->apiUrl . '/pricing/estimate', [
                    'pickup' => $this->pickupLocation,
                    'dropoff' => ['address' => $address],
                    'vehicle_type' => 'bike',
                ]);

                if ($response->successful()) {
                    $result = $response->json();
                    return $result['total_price'] ?? $baseFee;
                }
            } catch (\Exception $e) {
                Log::warning('Failed to get exact pricing', ['error' => $e->getMessage()]);
            }
            
            return $baseFee;
        });
    }

    /**
     * Détecte la zone depuis l'adresse
     */
    protected function detectZoneFromAddress(string $address): ?string
    {
        $address = strtolower($address);
        
        foreach ($this->deliveryZones as $key => $zone) {
            if (str_contains($address, strtolower($zone['name']))) {
                return $key;
            }
        }
        
        return null;
    }

    /**
     * Détermine le type de véhicule nécessaire
     */
    protected function determineVehicleType(Order $order): string
    {
        $totalWeight = 0;
        $totalVolume = 0;
        
        foreach ($order->items as $item) {
            $weight = $item->actual_weight ?? $item->estimated_weight ?? 0;
            $totalWeight += $weight * $item->quantity;
        }
        
        // Convertir en kg
        $totalWeightKg = $totalWeight / 1000;
        
        if ($totalWeightKg > 50) {
            return 'car'; // Voiture pour charges lourdes
        } elseif ($totalWeightKg > 20 || $order->items->count() > 10) {
            return 'bike_xl'; // Moto avec coffre
        }
        
        return 'bike'; // Moto standard
    }

    /**
     * Formate les items pour Yango
     */
    protected function formatOrderItems(Order $order): array
    {
        return $order->items->map(function ($item) {
            return [
                'name' => $item->product_name,
                'quantity' => $item->quantity,
                'weight' => ($item->actual_weight ?? $item->estimated_weight ?? 0) / 1000, // en kg
                'price' => $item->unit_price,
            ];
        })->toArray();
    }

    /**
     * Formate le numéro de téléphone pour Yango
     */
    protected function formatPhoneForYango(string $phone): string
    {
        // Nettoyer le numéro
        $phone = preg_replace('/[\s\-\.]/', '', $phone);
        
        // S'assurer du format international
        if (!str_starts_with($phone, '+')) {
            if (str_starts_with($phone, '00225')) {
                $phone = '+' . substr($phone, 2);
            } elseif (strlen($phone) === 10) {
                $phone = '+225' . $phone;
            }
        }
        
        return $phone;
    }

    /**
     * Valide la signature d'un webhook
     */
    public function validateWebhookSignature(string $payload, string $signature): bool
    {
        $expectedSignature = hash_hmac('sha256', $payload, $this->webhookSecret);
        return hash_equals($expectedSignature, $signature);
    }

    /**
     * Retourne les créneaux de livraison disponibles
     */
    public function getDeliverySlots(string $date = null): array
    {
        $date = $date ?? now()->toDateString();
        $slots = [];
        
        // Créneaux standard
        $timeSlots = [
            '09:00-12:00' => 'Matin (9h - 12h)',
            '12:00-15:00' => 'Midi (12h - 15h)',
            '15:00-18:00' => 'Après-midi (15h - 18h)',
            '18:00-21:00' => 'Soir (18h - 21h)',
        ];
        
        // Si c'est aujourd'hui, filtrer les créneaux passés
        if ($date === now()->toDateString()) {
            $currentHour = now()->hour;
            foreach ($timeSlots as $key => $label) {
                $slotHour = intval(substr($key, 0, 2));
                if ($slotHour > $currentHour + 2) { // Minimum 2h de préparation
                    $slots[$key] = $label;
                }
            }
        } else {
            $slots = $timeSlots;
        }
        
        return $slots;
    }
}