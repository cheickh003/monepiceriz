<?php

namespace Tests\Feature\Backend;

use Tests\TestCase;
use App\Models\User;
use App\Domain\Catalog\Models\Category;
use PHPUnit\Framework\Attributes\Test;

class CategoryIntegrationTest extends TestCase
{
    #[Test]
    public function test_category_crud_operations()
    {
        // 1. Créer un utilisateur admin
        $admin = User::factory()->create(['role' => 'admin']);
        
        // 2. Tester l'accès à la liste des catégories
        $response = $this->actingAs($admin)->get('/admin/categories');
        $response->assertOk();
        
        // 3. Créer une nouvelle catégorie
        $categoryData = [
            'name' => 'Test Category',
            'slug' => 'test-category',
            'is_active' => true,
            'position' => 1
        ];
        
        $response = $this->actingAs($admin)
            ->post('/admin/categories', $categoryData);
        
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        
        // 4. Vérifier que la catégorie existe
        $category = Category::where('slug', 'test-category')->first();
        $this->assertNotNull($category);
        $this->assertEquals('Test Category', $category->name);
        
        // 5. Mettre à jour la catégorie
        $updateData = [
            'name' => 'Updated Category',
            'slug' => 'updated-category',
            'is_active' => true
        ];
        
        $response = $this->actingAs($admin)
            ->patch("/admin/categories/{$category->id}", $updateData);
        
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        
        // 6. Vérifier la mise à jour
        $category->refresh();
        $this->assertEquals('Updated Category', $category->name);
        
        // 7. Supprimer la catégorie
        $response = $this->actingAs($admin)
            ->delete("/admin/categories/{$category->id}");
        
        $response->assertRedirect();
        
        // 8. Vérifier la suppression
        $this->assertNull(Category::find($category->id));
    }
    
    #[Test] 
    public function test_category_hierarchy()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        
        // Créer une catégorie parent
        $parentData = [
            'name' => 'Parent Category',
            'slug' => 'parent-category',
            'is_active' => true
        ];
        
        $this->actingAs($admin)->post('/admin/categories', $parentData);
        $parent = Category::where('slug', 'parent-category')->first();
        
        // Créer une sous-catégorie
        $childData = [
            'name' => 'Child Category',
            'slug' => 'child-category',
            'parent_id' => $parent->id,
            'is_active' => true
        ];
        
        $this->actingAs($admin)->post('/admin/categories', $childData);
        $child = Category::where('slug', 'child-category')->first();
        
        // Vérifier la relation
        $this->assertEquals($parent->id, $child->parent_id);
        $this->assertTrue($parent->children->contains($child));
        $this->assertEquals($parent->id, $child->parent->id);
        
        // Nettoyer
        $child->delete();
        $parent->delete();
    }
    
    #[Test]
    public function test_access_control()
    {
        // Tester avec un utilisateur customer
        $customer = User::factory()->create(['role' => 'customer']);
        
        $response = $this->actingAs($customer)->get('/admin/categories');
        $response->assertForbidden();
        
        // Tester sans authentification
        $response = $this->get('/admin/categories');
        $response->assertRedirect('/login');
    }
}