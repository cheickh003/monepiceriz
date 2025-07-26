<?php

namespace Database\Factories;

use App\Domain\Order\Models\Order;
use App\Models\Customer;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Domain\Order\Models\Order>
 */
class OrderFactory extends Factory
{
    protected $model = Order::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $subtotal = $this->faker->randomFloat(2, 3000, 100000);
        $deliveryMethod = $this->faker->randomElement(['pickup', 'delivery']);
        $deliveryFee = $deliveryMethod === 'delivery' ? $this->faker->randomElement([1000, 1500, 2000, 2500]) : 0;
        $totalAmount = $subtotal + $deliveryFee;

        $customerName = $this->faker->firstName() . ' ' . $this->faker->lastName();
        $customerPhone = '+225' . $this->generateIvorianPhoneNumber();
        
        return [
            'order_number' => $this->generateOrderNumber(),
            'customer_id' => $this->faker->boolean(30) ? Customer::factory() : null,
            'customer_name' => $customerName,
            'customer_email' => $this->faker->boolean(70) ? $this->faker->safeEmail() : null,
            'customer_phone' => $customerPhone,
            'subtotal' => $subtotal,
            'delivery_fee' => $deliveryFee,
            'total_amount' => $totalAmount,
            'status' => $this->faker->randomElement([
                Order::STATUS_PENDING,
                Order::STATUS_CONFIRMED,
                Order::STATUS_PROCESSING,
                Order::STATUS_READY,
                Order::STATUS_DELIVERING,
                Order::STATUS_COMPLETED,
                Order::STATUS_CANCELLED,
            ]),
            'payment_status' => $this->faker->randomElement([
                Order::PAYMENT_STATUS_PENDING,
                Order::PAYMENT_STATUS_AUTHORIZED,
                Order::PAYMENT_STATUS_PAID,
                Order::PAYMENT_STATUS_FAILED,
            ]),
            'payment_method' => $this->faker->randomElement(['cash', 'card']),
            'payment_reference' => $this->faker->boolean(50) ? 'TRX-' . strtoupper(Str::random(10)) : null,
            'delivery_method' => $deliveryMethod,
            'delivery_address' => $deliveryMethod === 'delivery' ? $this->generateIvorianAddress() : null,
            'delivery_notes' => $this->faker->boolean(20) ? $this->faker->sentence() : null,
            'pickup_date' => $deliveryMethod === 'pickup' ? $this->faker->dateTimeBetween('now', '+7 days') : null,
            'pickup_time_slot' => $deliveryMethod === 'pickup' ? $this->faker->randomElement(['09:00-12:00', '14:00-17:00', '17:00-20:00']) : null,
            'requires_weight_confirmation' => $this->faker->boolean(20),
            'weight_confirmed_at' => null,
            'completed_at' => null,
            'notes' => $this->faker->boolean(10) ? $this->faker->sentence() : null,
            'created_at' => $this->faker->dateTimeBetween('-30 days', 'now'),
            'updated_at' => now(),
        ];
    }

    /**
     * Indicate that the order is pending.
     */
    public function pending(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Order::STATUS_PENDING,
            'payment_status' => Order::PAYMENT_STATUS_PENDING,
            'completed_at' => null,
        ]);
    }

    /**
     * Indicate that the order is confirmed.
     */
    public function confirmed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Order::STATUS_CONFIRMED,
            'payment_status' => Order::PAYMENT_STATUS_PAID,
        ]);
    }

    /**
     * Indicate that the order is completed.
     */
    public function completed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Order::STATUS_COMPLETED,
            'payment_status' => Order::PAYMENT_STATUS_PAID,
            'completed_at' => now(),
        ]);
    }

    /**
     * Indicate that the order is cancelled.
     */
    public function cancelled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => Order::STATUS_CANCELLED,
            'notes' => 'Commande annulée: ' . $this->faker->randomElement([
                'Client indisponible',
                'Stock insuffisant',
                'Problème de paiement',
                'Demande du client',
            ]),
        ]);
    }

    /**
     * Indicate that the order requires weight confirmation.
     */
    public function withVariableWeight(): static
    {
        return $this->state(fn (array $attributes) => [
            'requires_weight_confirmation' => true,
            'weight_confirmed_at' => null,
        ]);
    }

    /**
     * Indicate that the order has confirmed weights.
     */
    public function withConfirmedWeight(): static
    {
        return $this->state(fn (array $attributes) => [
            'requires_weight_confirmation' => true,
            'weight_confirmed_at' => now(),
        ]);
    }

    /**
     * Indicate that the order is for pickup.
     */
    public function pickup(): static
    {
        return $this->state(fn (array $attributes) => [
            'delivery_method' => 'pickup',
            'delivery_fee' => 0,
            'delivery_address' => null,
            'pickup_date' => $this->faker->dateTimeBetween('now', '+7 days'),
            'pickup_time_slot' => $this->faker->randomElement(['09:00-12:00', '14:00-17:00', '17:00-20:00']),
        ])->recalculateTotal();
    }

    /**
     * Indicate that the order is for delivery.
     */
    public function delivery(): static
    {
        return $this->state(fn (array $attributes) => [
            'delivery_method' => 'delivery',
            'delivery_fee' => $this->faker->randomElement([1000, 1500, 2000, 2500]),
            'delivery_address' => $this->generateIvorianAddress(),
            'pickup_date' => null,
            'pickup_time_slot' => null,
        ])->recalculateTotal();
    }

    /**
     * Recalculate the total amount.
     */
    public function recalculateTotal(): static
    {
        return $this->state(function (array $attributes) {
            $attributes['total_amount'] = $attributes['subtotal'] + $attributes['delivery_fee'];
            return $attributes;
        });
    }

    /**
     * Generate a realistic order number.
     */
    private function generateOrderNumber(): string
    {
        $date = now()->format('Ymd');
        $random = strtoupper(Str::random(4));
        $sequence = $this->faker->numberBetween(1, 9999);
        
        return sprintf('CMD-%s-%04d-%s', $date, $sequence, $random);
    }

    /**
     * Generate an Ivorian phone number.
     */
    private function generateIvorianPhoneNumber(): string
    {
        $prefixes = ['07', '05', '01', '03', '04', '06', '08'];
        $prefix = $this->faker->randomElement($prefixes);
        return $prefix . $this->faker->numerify('########');
    }

    /**
     * Generate an Ivorian address.
     */
    private function generateIvorianAddress(): string
    {
        $communes = [
            'Cocody' => ['Riviera', 'Angré', '2 Plateaux', 'Riviera Palmeraie', 'Riviera 3'],
            'Plateau' => ['Centre', 'Pyramid', 'Cité Administrative'],
            'Marcory' => ['Zone 4', 'Biétry', 'Remblais'],
            'Yopougon' => ['Ananeraie', 'Niangon', 'Selmer', 'Maroc'],
            'Abobo' => ['Belleville', 'Sagbé', 'Avocatier'],
            'Adjamé' => ['220 Logements', 'Liberté', 'Williamsville'],
            'Treichville' => ['Avenue 16', 'Habitat', 'Arras'],
            'Koumassi' => ['Grand Campement', 'Prodomo', 'Campement'],
            'Port-Bouët' => ['Vridi', 'Gonzagueville', 'Jean Folly'],
            'Attécoubé' => ['Sebroko', 'Agban', 'Abobo-Doumé'],
        ];

        $commune = $this->faker->randomElement(array_keys($communes));
        $quartier = $this->faker->randomElement($communes[$commune]);
        $rue = $this->faker->boolean(70) ? 'Rue ' . $this->faker->numberBetween(1, 50) : $this->faker->streetName();
        $details = $this->faker->boolean(50) ? ', ' . $this->faker->randomElement(['près de ', 'derrière ', 'face à ', 'à côté de ']) . 
                   $this->faker->randomElement(['la pharmacie', 'l\'école', 'la mosquée', 'l\'église', 'le marché', 'la station']) : '';

        return $rue . ', ' . $quartier . ', ' . $commune . $details . ', Abidjan';
    }
}