<?php

namespace Database\Factories\Domain\Catalog\Models;

use App\Domain\Catalog\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Domain\Catalog\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Category::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = implode(' ', $this->faker->unique()->words(2));
        return [
            'name' => ucfirst($name),
            'slug' => Str::slug($name),
            'parent_id' => null,
            'position' => $this->faker->numberBetween(0, 10),
            'is_active' => $this->faker->boolean(90), // 90% chance of being active
            'icon' => $this->faker->randomElement(['shopping-cart', 'package', 'tag', 'grid', 'list']),
        ];
    }

    /**
     * Indicate that the category is inactive.
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
     * Indicate that the category has a parent.
     */
    public function withParent(Category $parent): Factory
    {
        return $this->state(function (array $attributes) use ($parent) {
            return [
                'parent_id' => $parent->id,
            ];
        });
    }
}