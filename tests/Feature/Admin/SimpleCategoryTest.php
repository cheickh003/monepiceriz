<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use App\Domain\Catalog\Models\Category;
use Tests\TestCase;
use PHPUnit\Framework\Attributes\Test;

class SimpleCategoryTest extends TestCase
{
    private ?User $admin = null;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Créer un utilisateur admin pour les tests
        $this->admin = User::factory()->create([
            'role' => 'admin',
            'email' => 'test-admin@example.com'
        ]);
    }

    #[Test]
    public function admin_can_access_categories_index()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.categories.index'));

        $response->assertOk();
    }

    #[Test]
    public function admin_can_view_create_category_form()
    {
        $response = $this->actingAs($this->admin)
            ->get(route('admin.categories.create'));

        $response->assertOk();
    }

    #[Test]
    public function admin_can_create_simple_category()
    {
        $categoryData = [
            'name' => 'Test Category ' . time(),
            'slug' => 'test-category-' . time(),
            'is_active' => true,
            'position' => 99
        ];

        $response = $this->actingAs($this->admin)
            ->post(route('admin.categories.store'), $categoryData);

        $response->assertRedirect();
        
        // Vérifier que la catégorie a été créée
        $this->assertDatabaseHas('categories', [
            'name' => $categoryData['name'],
            'slug' => $categoryData['slug']
        ]);
    }

    #[Test]
    public function non_admin_cannot_access_categories()
    {
        // Créer un utilisateur non-admin
        $customer = User::factory()->create(['role' => 'customer']);

        $response = $this->actingAs($customer)
            ->get(route('admin.categories.index'));

        $response->assertForbidden();
    }

    #[Test]
    public function guest_cannot_access_categories()
    {
        $response = $this->get(route('admin.categories.index'));

        $response->assertRedirect(route('login'));
    }
}