<?php

namespace App\Domain\Order\Services;

use App\Domain\Order\Models\Order;
use App\Domain\Order\Models\OrderItem;
use App\Domain\Catalog\Models\ProductSku;
use App\Domain\Shipping\Services\YangoService;
use App\Models\Customer;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class OrderService
{
    protected YangoService $yangoService;

    public function __construct(YangoService $yangoService)
    {
        $this->yangoService = $yangoService;
    }

    /**
     * Crée une commande à partir des données du panier
     */
    public function createFromCart(array $cartData, array $customerData, array $deliveryData): Order
    {
        return DB::transaction(function () use ($cartData, $customerData, $deliveryData) {
            // Valider et préparer les données
            $validatedItems = $this->validateCartItems($cartData['items']);
            
            // Calculer les montants
            $subtotal = $this->calculateSubtotal($validatedItems);
            $deliveryFee = $this->calculateDeliveryFee($deliveryData, $subtotal);
            $totalAmount = $subtotal + $deliveryFee;

            // Vérifier le montant minimum pour la livraison
            if ($deliveryData['method'] === Order::DELIVERY_METHOD_DELIVERY && $subtotal < 3000) {
                throw new \Exception('Le montant minimum pour la livraison est de 3000 FCFA');
            }

            // Créer ou récupérer le client
            $customer = $this->findOrCreateCustomer($customerData);

            // Créer la commande
            $order = Order::create([
                'customer_id' => $customer?->id,
                'customer_name' => $customerData['name'],
                'customer_email' => $customerData['email'] ?? null,
                'customer_phone' => $customerData['phone'],
                'subtotal' => $subtotal,
                'delivery_fee' => $deliveryFee,
                'total_amount' => $totalAmount,
                'status' => Order::STATUS_PENDING,
                'payment_status' => Order::PAYMENT_STATUS_PENDING,
                'payment_method' => $deliveryData['payment_method'] ?? 'cash',
                'delivery_method' => $deliveryData['method'],
                'delivery_address' => $deliveryData['method'] === Order::DELIVERY_METHOD_DELIVERY ? $deliveryData['address'] : null,
                'delivery_notes' => $deliveryData['notes'] ?? null,
                'pickup_date' => $deliveryData['method'] === Order::DELIVERY_METHOD_PICKUP ? $deliveryData['pickup_date'] : null,
                'pickup_time_slot' => $deliveryData['method'] === Order::DELIVERY_METHOD_PICKUP ? $deliveryData['pickup_time_slot'] : null,
                'requires_weight_confirmation' => false, // Sera mis à jour si nécessaire
            ]);

            // Créer les items de commande
            $requiresWeightConfirmation = false;
            foreach ($validatedItems as $item) {
                $orderItem = $order->items()->create([
                    'product_sku_id' => $item['sku']->id,
                    'product_name' => $item['sku']->product->name,
                    'sku_code' => $item['sku']->code,
                    'sku_name' => $item['sku']->name,
                    'quantity' => $item['quantity'],
                    'unit_price' => $item['sku']->effective_price ?? $item['sku']->price_ttc,
                    'line_total' => ($item['sku']->effective_price ?? $item['sku']->price_ttc) * $item['quantity'],
                    'is_variable_weight' => $item['sku']->is_variable_weight,
                    'estimated_weight' => $item['sku']->is_variable_weight ? ($item['estimated_weight'] ?? 1000) : null,
                ]);

                if ($orderItem->is_variable_weight) {
                    $requiresWeightConfirmation = true;
                }

                // Décrémenter le stock
                $item['sku']->decrement('stock_quantity', $item['quantity']);
            }

            // Mettre à jour le flag de confirmation de poids si nécessaire
            if ($requiresWeightConfirmation) {
                $order->update(['requires_weight_confirmation' => true]);
            }

            // Logger la création de la commande
            Log::info('Order created', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'total' => $order->total_amount,
                'customer' => $order->customer_name
            ]);

            return $order;
        });
    }

    /**
     * Valide les items du panier
     */
    protected function validateCartItems(array $items): array
    {
        $validatedItems = [];

        foreach ($items as $item) {
            $sku = ProductSku::with('product')->find($item['sku_id']);
            
            if (!$sku) {
                throw new \Exception("Produit introuvable (SKU ID: {$item['sku_id']})");
            }

            if (!$sku->product->is_active) {
                throw new \Exception("Le produit '{$sku->product->name}' n'est plus disponible");
            }

            if ($sku->stock_quantity < $item['quantity']) {
                throw new \Exception("Stock insuffisant pour '{$sku->product->name}' (Stock: {$sku->stock_quantity})");
            }

            $validatedItems[] = [
                'sku' => $sku,
                'quantity' => $item['quantity'],
                'estimated_weight' => $item['estimated_weight'] ?? null,
            ];
        }

        return $validatedItems;
    }

    /**
     * Calcule le sous-total
     */
    protected function calculateSubtotal(array $items): float
    {
        $subtotal = 0;

        foreach ($items as $item) {
            $price = $item['sku']->effective_price ?? $item['sku']->price_ttc;
            $subtotal += $price * $item['quantity'];
        }

        return $subtotal;
    }

    /**
     * Calcule les frais de livraison
     */
    protected function calculateDeliveryFee(array $deliveryData, float $subtotal): float
    {
        if ($deliveryData['method'] === Order::DELIVERY_METHOD_PICKUP) {
            return 0;
        }

        // Utiliser le service Yango pour calculer les frais
        try {
            return $this->yangoService->calculateDeliveryFee(
                $deliveryData['address'],
                $subtotal
            );
        } catch (\Exception $e) {
            Log::warning('Failed to calculate Yango delivery fee', [
                'error' => $e->getMessage(),
                'address' => $deliveryData['address']
            ]);
            
            // Fallback sur des frais fixes
            return config('shop.delivery.default_fee', 1000);
        }
    }

    /**
     * Trouve ou crée un client
     */
    protected function findOrCreateCustomer(array $customerData): ?Customer
    {
        if (empty($customerData['phone'])) {
            return null;
        }

        return Customer::firstOrCreate(
            ['phone' => $customerData['phone']],
            [
                'name' => $customerData['name'],
                'email' => $customerData['email'] ?? null,
            ]
        );
    }

    /**
     * Met à jour le statut d'une commande
     */
    public function updateOrderStatus(Order $order, string $status): bool
    {
        if (!$order->canTransitionTo($status)) {
            throw new \Exception("Impossible de passer du statut '{$order->status}' à '{$status}'");
        }

        return $order->updateStatus($status);
    }

    /**
     * Finalise une commande à poids variable
     */
    public function finalizeVariableWeightOrder(Order $order, array $actualWeights): Order
    {
        if (!$order->requires_weight_confirmation) {
            throw new \Exception("Cette commande ne nécessite pas de confirmation de poids");
        }

        if ($order->weight_confirmed_at) {
            throw new \Exception("Les poids ont déjà été confirmés pour cette commande");
        }

        return DB::transaction(function () use ($order, $actualWeights) {
            $totalAdjustment = 0;

            foreach ($actualWeights as $itemId => $actualWeight) {
                $item = $order->items()->find($itemId);
                
                if (!$item || !$item->is_variable_weight) {
                    continue;
                }

                // Valider le poids avec une tolérance de 20%
                if (!$item->validateActualWeight($actualWeight)) {
                    throw new \Exception(
                        "Le poids réel ({$actualWeight}g) est trop différent du poids estimé ({$item->estimated_weight}g) pour '{$item->product_name}'"
                    );
                }

                // Mettre à jour le poids réel
                $item->updateActualWeight($actualWeight);
                $totalAdjustment += $item->price_adjustment;
            }

            // Recalculer le total de la commande
            $newSubtotal = $order->items()->sum('line_total');
            $newTotal = $newSubtotal + $order->delivery_fee;

            // Mettre à jour la commande
            $order->update([
                'subtotal' => $newSubtotal,
                'total_amount' => $newTotal,
                'weight_confirmed_at' => now(),
            ]);

            // Logger la finalisation
            Log::info('Variable weight order finalized', [
                'order_id' => $order->id,
                'original_total' => $order->getOriginal('total_amount'),
                'new_total' => $newTotal,
                'adjustment' => $totalAdjustment
            ]);

            return $order->fresh();
        });
    }

    /**
     * Annule une commande
     */
    public function cancelOrder(Order $order, string $reason = null): bool
    {
        if (!$order->canBeCancelled()) {
            throw new \Exception("Cette commande ne peut pas être annulée");
        }

        return DB::transaction(function () use ($order, $reason) {
            // Restaurer le stock
            foreach ($order->items as $item) {
                $item->productSku->increment('stock_quantity', $item->quantity);
            }

            // Mettre à jour le statut
            $order->update([
                'status' => Order::STATUS_CANCELLED,
                'notes' => $reason ? "Annulation: {$reason}" : null,
            ]);

            // Logger l'annulation
            Log::info('Order cancelled', [
                'order_id' => $order->id,
                'order_number' => $order->order_number,
                'reason' => $reason
            ]);

            return true;
        });
    }

    /**
     * Récupère les statistiques des commandes
     */
    public function getOrderStatistics(string $period = 'today'): array
    {
        $query = Order::query();

        switch ($period) {
            case 'today':
                $query->whereDate('created_at', today());
                break;
            case 'week':
                $query->whereBetween('created_at', [now()->startOfWeek(), now()->endOfWeek()]);
                break;
            case 'month':
                $query->whereMonth('created_at', now()->month);
                break;
        }

        return [
            'total_orders' => $query->count(),
            'pending_orders' => $query->clone()->pending()->count(),
            'completed_orders' => $query->clone()->completed()->count(),
            'total_revenue' => $query->clone()->where('payment_status', Order::PAYMENT_STATUS_PAID)->sum('total_amount'),
            'average_order_value' => $query->clone()->where('payment_status', Order::PAYMENT_STATUS_PAID)->avg('total_amount'),
        ];
    }
}