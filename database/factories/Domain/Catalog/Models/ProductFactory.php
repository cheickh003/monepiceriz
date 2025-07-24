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
        $name = implode(' ', $this->faker->words(3));
        
        return [
            'category_id' => Category::factory(),
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'description' => $this->faker->paragraph(),
            'brand' => $this->faker->optional(0.7)->company(),
            'reference' => $this->faker->optional(0.8)->regexify('[A-Z]{2}[0-9]{4}'),
            'barcode' => $this->faker->optional(0.6)->ean13(),
            'main_image' => null, // Images will be handled separately
            'gallery_images' => null,
            'is_active' => $this->faker->boolean(90), // 90% chance of being active
            'is_featured' => $this->faker->boolean(20), // 20% chance of being featured
            'is_variable_weight' => $this->faker->boolean(30), // 30% chance of being variable weight
            'meta_title' => $this->faker->optional(0.5)->sentence(6),
            'meta_description' => $this->faker->optional(0.5)->text(160),
            'meta_keywords' => $this->faker->optional(0.4)->randomElements(['riz', 'épices', 'bio', 'qualité', 'cuisine', 'africain', 'naturel'], 5),
        ];
    }

    /**
     * Indicate that the product is featured.
     */
    public function featured(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'is_featured' => true,
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

    /**
     * Indicate that the product has complete metadata.
     */
    public function withMetadata(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'meta_title' => $this->faker->sentence(8),
                'meta_description' => $this->faker->text(155),
                'meta_keywords' => $this->faker->randomElements(['riz', 'épices', 'bio', 'qualité', 'cuisine', 'africain', 'naturel', 'frais'], 8),
            ];
        });
    }

    /**
     * Indicate that the product has a reference and barcode.
     */
    public function withIdentifiers(): Factory
    {
        return $this->state(function (array $attributes) {
            return [
                'reference' => $this->faker->regexify('[A-Z]{2}[0-9]{6}'),
                'barcode' => $this->faker->ean13(),
            ];
        });
    }
}