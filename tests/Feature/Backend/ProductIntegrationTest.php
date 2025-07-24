<?php

namespace Tests\Feature\Backend;

use Tests\TestCase;
use App\Models\User;
use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\Category;
use PHPUnit\Framework\Attributes\Test;

class ProductIntegrationTest extends TestCase
{
    #[Test]
    public function test_product_crud_operations()
    {
        // 1. Créer un admin et une catégorie
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();
        
        // 2. Tester l'accès à la liste des produits
        $response = $this->actingAs($admin)->get('/admin/products');
        $response->assertOk();
        
        // 3. Créer un nouveau produit simple
        $productData = [
            'name' => 'Test Product',
            'slug' => 'test-product',
            'category_id' => $category->id,
            'description' => 'Test description',
            'is_variable_weight' => false,
            'purchase_price' => 1000,
            'price_ht' => 1200,
            'price_ttc' => 1200,
            'is_active' => true,
            'skus' => [
                [
                    'sku' => 'TEST-001',
                    'barcode' => '1234567890',
                    'price_ht' => 1200,
                    'price_ttc' => 1200,
                    'stock_quantity' => 100,
                    'is_default' => true
                ]
            ]
        ];
        
        $response = $this->actingAs($admin)
            ->post('/admin/products', $productData);
        
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        
        // 4. Vérifier que le produit existe
        $product = Product::where('slug', 'test-product')->first();
        $this->assertNotNull($product);
        $this->assertEquals('Test Product', $product->name);
        $this->assertEquals(1, $product->skus->count());
        
        // 5. Mettre à jour le produit
        $updateData = [
            'name' => 'Updated Product',
            'slug' => 'updated-product',
            'category_id' => $category->id,
            'price_ttc' => 1500,
            'is_active' => true
        ];
        
        $response = $this->actingAs($admin)
            ->patch("/admin/products/{$product->id}", $updateData);
        
        $response->assertSessionHasNoErrors();
        $response->assertRedirect();
        
        // 6. Vérifier la mise à jour
        $product->refresh();
        $this->assertEquals('Updated Product', $product->name);
        
        // 7. Nettoyer
        $product->delete();
        $category->delete();
    }
    
    #[Test]
    public function test_variable_weight_product()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();
        
        // Créer un produit à poids variable
        $productData = [
            'name' => 'Tomates',
            'slug' => 'tomates',
            'category_id' => $category->id,
            'is_variable_weight' => true,
            'min_weight' => 0.5,
            'price_per_kg' => 2500,
            'purchase_price' => 1800,
            'price_ht' => 2500,
            'price_ttc' => 2500,
            'is_active' => true,
            'skus' => [
                [
                    'sku' => 'TOM-KG',
                    'weight' => 1,
                    'stock_quantity' => 50,
                    'price_ht' => 2500,
                    'price_ttc' => 2500,
                    'is_default' => true
                ]
            ]
        ];
        
        $response = $this->actingAs($admin)
            ->post('/admin/products', $productData);
        
        $response->assertSessionHasNoErrors();
        
        $product = Product::where('slug', 'tomates')->first();
        $this->assertTrue($product->is_variable_weight);
        $this->assertEquals(0.5, $product->min_weight);
        $this->assertEquals(2500, $product->price_per_kg);
        
        // Nettoyer
        $product->delete();
        $category->delete();
    }
    
    #[Test]
    public function test_product_with_promotion()
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $category = Category::factory()->create();
        
        // Créer un produit en promotion
        $productData = [
            'name' => 'Produit Promo',
            'slug' => 'produit-promo',
            'category_id' => $category->id,
            'price_ttc' => 1000,
            'purchase_price' => 700,
            'price_ht' => 1000,
            'is_promoted' => true,
            'promo_price' => 800,
            'is_active' => true,
            'skus' => [
                [
                    'sku' => 'PROMO-001',
                    'stock_quantity' => 50,
                    'price_ht' => 1000,
                    'price_ttc' => 1000,
                    'is_default' => true
                ]
            ]
        ];
        
        $response = $this->actingAs($admin)
            ->post('/admin/products', $productData);
        
        $product = Product::where('slug', 'produit-promo')->first();
        $this->assertTrue($product->is_promoted);
        $this->assertEquals(800, $product->promo_price);
        
        // Nettoyer
        $product->delete();
        $category->delete();
    }
}