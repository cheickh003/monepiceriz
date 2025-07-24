<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Domain\Catalog\Models\Category;
use Tests\SupabaseTestCase;
use PHPUnit\Framework\Attributes\Test;

class CategoryManagementTest extends SupabaseTestCase
{

    protected User $admin;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Créer un utilisateur admin
        $this->admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'admin@test.com'
        ]);
    }

    #[Test]
    public function admin_can_view_categories_index()
    {
        // Créer quelques catégories
        Category::factory()->count(5)->create();

        $response = $this->actingAs($this->admin)
            ->get(route('admin.categories.index'));

        $response->assertOk()
            ->assertInertia(fn ($page) => $page
                ->component('Admin/Categories/Index')
                ->has('categories', 5)
            );
    }

    #[Test]
    public function admin_can_create_category()
    {
        $categoryData = [
            'name' => 'Nouvelle Catégorie',
            'slug' => 'nouvelle-categorie',
            'icon' => 'shopping-cart',
            'is_active' => true,
            'position' => 1
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.categories.store'), $categoryData);

        $response->assertRedirect(route('admin.categories.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseHas('categories', [
            'name' => 'Nouvelle Catégorie',
            'slug' => 'nouvelle-categorie'
        ]);
    }

    #[Test]
    public function admin_can_create_subcategory()
    {
        $parentCategory = Category::factory()->create();

        $categoryData = [
            'name' => 'Sous-catégorie',
            'parent_id' => $parentCategory->id,
            'is_active' => true
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.categories.store'), $categoryData);

        $response->assertRedirect(route('admin.categories.index'));

        $this->assertDatabaseHas('categories', [
            'name' => 'Sous-catégorie',
            'parent_id' => $parentCategory->id
        ]);
    }

    #[Test]
    public function admin_can_update_category()
    {
        $category = Category::factory()->create([
            'name' => 'Ancienne Catégorie'
        ]);

        $response = $this->actingAs($this->admin)
            ->patch(route('admin.categories.update', $category), [
                'name' => 'Nouvelle Catégorie',
                'slug' => 'nouvelle-categorie',
                'is_active' => true
            ]);

        $response->assertRedirect(route('admin.categories.index'));

        $this->assertDatabaseHas('categories', [
            'id' => $category->id,
            'name' => 'Nouvelle Catégorie'
        ]);
    }

    #[Test]
    public function admin_cannot_delete_category_with_products()
    {
        $category = Category::factory()
            ->has(\App\Domain\Catalog\Models\Product::factory()->count(3))
            ->create();

        $response = $this->actingAs($this->admin)
            ->delete(route('admin.categories.destroy', $category));

        $response->assertRedirect()
            ->assertSessionHas('error');

        $this->assertDatabaseHas('categories', [
            'id' => $category->id
        ]);
    }

    #[Test]
    public function admin_can_delete_empty_category()
    {
        $category = Category::factory()->create();

        $response = $this->actingAs($this->admin)
            ->delete(route('admin.categories.destroy', $category));

        $response->assertRedirect(route('admin.categories.index'))
            ->assertSessionHas('success');

        $this->assertDatabaseMissing('categories', [
            'id' => $category->id
        ]);
    }

    #[Test]
    public function non_admin_cannot_access_category_management()
    {
        $user = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($user)
            ->get(route('admin.categories.index'));

        $response->assertForbidden();
    }

    #[Test]
    public function validation_fails_with_duplicate_slug()
    {
        Category::factory()->create(['slug' => 'existing-slug']);

        $response = $this->actingAs($this->admin)
            ->post(route('admin.categories.store'), [
                'name' => 'Test Category',
                'slug' => 'existing-slug'
            ]);

        $response->assertSessionHasErrors(['slug']);
    }
}