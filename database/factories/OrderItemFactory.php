<?php

namespace Database\Factories;

use App\Domain\Order\Models\OrderItem;
use App\Domain\Order\Models\Order;
use App\Domain\Catalog\Models\ProductSku;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Domain\Order\Models\OrderItem>
 */
class OrderItemFactory extends Factory
{
    protected $model = OrderItem::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $productSku = ProductSku::factory()->create();
        $isVariableWeight = $this->faker->boolean(20);
        $quantity = $isVariableWeight ? 
            $this->faker->randomFloat(3, 0.5, 5) : // Pour poids variable (en kg)
            $this->faker->numberBetween(1, 10); // Pour produits normaux
        
        $unitPrice = $productSku->effective_price ?? $productSku->price_ttc;
        
        // Pour les produits à poids variable, le prix unitaire est au kg
        if ($isVariableWeight) {
            $estimatedWeight = $this->faker->numberBetween(500, 5000); // en grammes
            $lineTotal = ($unitPrice * $estimatedWeight / 1000) * $quantity;
        } else {
            $lineTotal = $unitPrice * $quantity;
        }

        return [
            'order_id' => Order::factory(),
            'product_sku_id' => $productSku->id,
            'product_name' => $productSku->product->name,
            'sku_code' => $productSku->code,
            'sku_name' => $productSku->name,
            'quantity' => $quantity,
            'unit_price' => $unitPrice,
            'line_total' => $lineTotal,
            'is_variable_weight' => $isVariableWeight,
            'estimated_weight' => $isVariableWeight ? $this->faker->numberBetween(500, 5000) : null,
            'actual_weight' => null,
            'weight_difference' => null,
            'price_adjustment' => null,
        ];
    }

    /**
     * Indicate that the item is for a fixed-weight product.
     */
    public function fixedWeight(): static
    {
        return $this->state(function (array $attributes) {
            $quantity = $this->faker->numberBetween(1, 10);
            $lineTotal = $attributes['unit_price'] * $quantity;
            
            return [
                'quantity' => $quantity,
                'line_total' => $lineTotal,
                'is_variable_weight' => false,
                'estimated_weight' => null,
                'actual_weight' => null,
                'weight_difference' => null,
                'price_adjustment' => null,
            ];
        });
    }

    /**
     * Indicate that the item is for a variable-weight product.
     */
    public function variableWeight(): static
    {
        return $this->state(function (array $attributes) {
            $estimatedWeight = $this->faker->numberBetween(500, 5000); // grammes
            $quantity = $this->faker->randomFloat(3, 0.5, 5); // kg commandés
            $unitPrice = $attributes['unit_price']; // prix au kg
            $lineTotal = ($unitPrice * $estimatedWeight / 1000) * $quantity;
            
            return [
                'quantity' => $quantity,
                'line_total' => $lineTotal,
                'is_variable_weight' => true,
                'estimated_weight' => $estimatedWeight,
                'actual_weight' => null,
                'weight_difference' => null,
                'price_adjustment' => null,
            ];
        });
    }

    /**
     * Indicate that the variable weight has been confirmed.
     */
    public function withConfirmedWeight(): static
    {
        return $this->state(function (array $attributes) {
            if (!$attributes['is_variable_weight']) {
                return $attributes;
            }

            $estimatedWeight = $attributes['estimated_weight'];
            // Variation de -15% à +15%
            $variation = $this->faker->randomFloat(2, -0.15, 0.15);
            $actualWeight = round($estimatedWeight * (1 + $variation));
            $weightDifference = $actualWeight - $estimatedWeight;
            
            // Recalculer le prix basé sur le poids réel
            $pricePerKg = $attributes['unit_price'];
            $quantity = $attributes['quantity'];
            $newLineTotal = ($pricePerKg * $actualWeight / 1000) * $quantity;
            $priceAdjustment = $newLineTotal - $attributes['line_total'];
            
            return [
                'actual_weight' => $actualWeight,
                'weight_difference' => $weightDifference,
                'price_adjustment' => round($priceAdjustment, 2),
                'line_total' => round($newLineTotal, 2),
            ];
        });
    }

    /**
     * Indicate that this is a meat product (boucherie).
     */
    public function meat(): static
    {
        return $this->state(function (array $attributes) {
            $meatProducts = [
                'Bœuf - Filet' => ['min' => 500, 'max' => 2000, 'price' => 8000],
                'Bœuf - Côtes' => ['min' => 800, 'max' => 3000, 'price' => 6500],
                'Poulet entier' => ['min' => 1200, 'max' => 2000, 'price' => 3500],
                'Agneau - Gigot' => ['min' => 1000, 'max' => 3000, 'price' => 7500],
                'Porc - Côtelettes' => ['min' => 500, 'max' => 1500, 'price' => 5500],
            ];
            
            $product = $this->faker->randomElement(array_keys($meatProducts));
            $config = $meatProducts[$product];
            $estimatedWeight = $this->faker->numberBetween($config['min'], $config['max']);
            $quantity = 1; // Généralement 1 portion
            
            return [
                'product_name' => $product,
                'sku_name' => 'Au poids',
                'quantity' => $quantity,
                'unit_price' => $config['price'], // prix au kg
                'line_total' => ($config['price'] * $estimatedWeight / 1000) * $quantity,
                'is_variable_weight' => true,
                'estimated_weight' => $estimatedWeight,
            ];
        });
    }

    /**
     * Indicate that this is a fish product (poissonnerie).
     */
    public function fish(): static
    {
        return $this->state(function (array $attributes) {
            $fishProducts = [
                'Bar' => ['min' => 400, 'max' => 1500, 'price' => 5500],
                'Dorade' => ['min' => 500, 'max' => 1200, 'price' => 6000],
                'Thon - Tranches' => ['min' => 300, 'max' => 800, 'price' => 8500],
                'Crevettes' => ['min' => 200, 'max' => 1000, 'price' => 12000],
                'Capitaine' => ['min' => 600, 'max' => 2000, 'price' => 7000],
            ];
            
            $product = $this->faker->randomElement(array_keys($fishProducts));
            $config = $fishProducts[$product];
            $estimatedWeight = $this->faker->numberBetween($config['min'], $config['max']);
            $quantity = 1;
            
            return [
                'product_name' => $product,
                'sku_name' => 'Frais - Au poids',
                'quantity' => $quantity,
                'unit_price' => $config['price'], // prix au kg
                'line_total' => ($config['price'] * $estimatedWeight / 1000) * $quantity,
                'is_variable_weight' => true,
                'estimated_weight' => $estimatedWeight,
            ];
        });
    }

    /**
     * Indicate that this is a grocery product.
     */
    public function grocery(): static
    {
        return $this->state(function (array $attributes) {
            $groceryProducts = [
                'Riz Jasmin' => ['skus' => ['1kg' => 2500, '5kg' => 12000, '25kg' => 55000]],
                'Huile Tournesol' => ['skus' => ['1L' => 1800, '5L' => 8500]],
                'Sucre' => ['skus' => ['1kg' => 800, '5kg' => 3800]],
                'Farine' => ['skus' => ['1kg' => 1200, '5kg' => 5500]],
                'Pâtes' => ['skus' => ['500g' => 600, '1kg' => 1100]],
                'Tomate concentrée' => ['skus' => ['70g' => 200, '400g' => 800, '800g' => 1500]],
            ];
            
            $product = $this->faker->randomElement(array_keys($groceryProducts));
            $skus = $groceryProducts[$product]['skus'];
            $sku = $this->faker->randomElement(array_keys($skus));
            $price = $skus[$sku];
            $quantity = $this->faker->numberBetween(1, 5);
            
            return [
                'product_name' => $product,
                'sku_name' => $sku,
                'quantity' => $quantity,
                'unit_price' => $price,
                'line_total' => $price * $quantity,
                'is_variable_weight' => false,
                'estimated_weight' => null,
                'actual_weight' => null,
            ];
        });
    }

    /**
     * Create items for a complete order.
     */
    public function forOrder(Order $order, int $count = null): \Illuminate\Database\Eloquent\Collection
    {
        $count = $count ?? $this->faker->numberBetween(1, 8);
        $items = collect();
        
        // Assurer au moins un produit à poids variable si la commande le requiert
        if ($order->requires_weight_confirmation) {
            $items->push($this->faker->boolean() ? $this->meat() : $this->fish());
            $count--;
        }
        
        // Ajouter d'autres produits
        for ($i = 0; $i < $count; $i++) {
            $type = $this->faker->randomElement(['grocery', 'meat', 'fish', 'grocery', 'grocery']); // Plus de grocery
            $items->push($this->$type());
        }
        
        return $items->map(fn($item) => $item->create(['order_id' => $order->id]));
    }
}