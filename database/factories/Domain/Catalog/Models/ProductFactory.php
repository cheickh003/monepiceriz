<?php

namespace Database\Factories\Domain\Catalog\Models;

use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Domain\Catalog\Models\Product>
 */
class ProductFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Product::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = $this->faker->words(3, true);
        $purchasePrice = $this->faker->randomFloat(2, 100, 10000);
        $margin = $this->faker->randomFloat(2, 1.1, 1.5); // 10% to 50% margin
        
        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => $this->faker->paragraph(),
            'category_id' => Category::factory(),
            'is_variable_weight' => $this->faker->boolean(30), // 30% chance of being variable weight
            'min_weight' => $this->faker->boolean(30) ? $this->faker->randomFloat(2, 0.1, 1) : null,
            'price_per_kg' => $this->faker->boolean(30) ? $this->faker->randomFloat(2, 1000, 50000) : null,
            'purchase_price' => $purchasePrice,
            'price_ht' => $purchasePrice * $margin,
            'price_ttc' => $purchasePrice * $margin, // No tax in CI
            'is_promoted' => $this->faker->boolean(20), // 20% chance of being promoted
            'promo_price' => null,
            'is_active' => $this->faker->boolean(90), // 90% chance of being active
            'position' => $this->faker->numberBetween(0, 100),
            'views_count' => $this->faker->numberBetween(0, 1000),
        ];
    }

    /**
     * Indicate that the product is on promotion.
     */
    public function promoted(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'is_promoted' => true,
                'promo_price' => $attributes['price_ttc'] * 0.8, // 20% discount
            ];
        });
    }

    /**
     * Indicate that the product is variable weight.
     */
    public function variableWeight(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'is_variable_weight' => true,
                'min_weight' => $this->faker->randomFloat(2, 0.1, 1),
                'price_per_kg' => $this->faker->randomFloat(2, 1000, 50000),
            ];
        });
    }

    /**
     * Indicate that the product is inactive.
     */
    public function inactive(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'is_active' => false,
            ];
        });
    }
}