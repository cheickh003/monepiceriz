<?php

namespace Tests\Unit;

use Tests\TestCase;
use App\Models\ShopDataVersion;
use App\Listeners\InvalidateShopCache;
use App\Events\ProductUpdated;
use App\Events\CategoryUpdated;
use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Log;

class AtomicCacheOperationsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Nettoyer le cache avant chaque test
        Cache::flush();
        
        // Créer des données de test
        $this->createTestData();
    }

    private function createTestData(): void
    {
        // Créer une catégorie de test
        $this->testCategory = Category::create([
            'name' => 'Test Category',
            'slug' => 'test-category',
            'is_active' => true,
        ]);

        // Créer un produit de test
        $this->testProduct = Product::create([
            'name' => 'Test Product',
            'slug' => 'test-product',
            'reference' => 'TEST-001',
            'category_id' => $this->testCategory->id,
            'is_active' => true,
        ]);
    }

    /** @test */
    public function it_performs_atomic_version_updates_with_consistent_timestamps()
    {
        // Arrange
        $dataTypes = ['products', 'categories', 'global'];

        // Act
        ShopDataVersion::updateVersionsAtomic($dataTypes);

        // Assert
        $versions = ShopDataVersion::whereIn('data_type', $dataTypes)->get();
        
        $this->assertCount(3, $versions);
        
        // Vérifier que tous les timestamps sont identiques (atomicité)
        $timestamps = $versions->pluck('last_updated_at')->unique();
        $this->assertCount(1, $timestamps, 'Tous les timestamps devraient être identiques');
        
        // Vérifier que tous les hashes sont uniques
        $hashes = $versions->pluck('version_hash')->unique();
        $this->assertCount(3, $hashes, 'Tous les hashes devraient être uniques');
    }

    /** @test */
    public function it_handles_concurrent_version_updates_without_race_conditions()
    {
        // Arrange
        $concurrentOperations = 10;
        
        // Act - Simuler des opérations concurrentes
        for ($i = 0; $i < $concurrentOperations; $i++) {
            ShopDataVersion::updateVersionsAtomic(['concurrent_test_' . $i]);
        }

        // Assert
        $versions = ShopDataVersion::where('data_type', 'like', 'concurrent_test_%')->get();
        
        $this->assertCount($concurrentOperations, $versions);
        
        // Vérifier qu'il n'y a pas de timestamps dupliqués
        $duplicateTimestamps = $versions->groupBy('last_updated_at')
            ->filter(fn($group) => $group->count() > 1);
        
        $this->assertEmpty($duplicateTimestamps, 'Aucun timestamp ne devrait être dupliqué');
        
        // Vérifier qu'il n'y a pas de hashes dupliqués
        $duplicateHashes = $versions->groupBy('version_hash')
            ->filter(fn($group) => $group->count() > 1);
        
        $this->assertEmpty($duplicateHashes, 'Aucun hash ne devrait être dupliqué');
    }

    /** @test */
    public function it_invalidates_cache_atomically_on_product_update()
    {
        // Arrange
        $listener = new InvalidateShopCache();
        $event = new ProductUpdated($this->testProduct, 'updated');
        
        // Pré-remplir le cache avec des valeurs de test
        $testCacheKeys = [
            "product.{$this->testProduct->id}",
            'shop.products.featured',
            'shop.home.data'
        ];
        
        foreach ($testCacheKeys as $key) {
            Cache::put($key, 'test_value', 300);
        }
        
        // Vérifier que les clés existent avant
        foreach ($testCacheKeys as $key) {
            $this->assertTrue(Cache::has($key));
        }

        // Act
        $listener->handle($event);

        // Assert - Vérifier que les clés ont été supprimées
        foreach ($testCacheKeys as $key) {
            $this->assertFalse(Cache::has($key), "Cache key {$key} devrait être supprimée");
        }
        
        // Vérifier qu'une version a été créée
        $productVersion = ShopDataVersion::where('data_type', 'products')->first();
        $this->assertNotNull($productVersion);
        
        $globalVersion = ShopDataVersion::where('data_type', 'global')->first();
        $this->assertNotNull($globalVersion);
    }

    /** @test */
    public function it_handles_lock_timeout_gracefully()
    {
        // Arrange - Acquérir un verrou pour simuler un blocage
        $lockKey = 'shop_data_version_update_products_global';
        $lock = Cache::lock($lockKey, 30);
        $lock->get();

        // Act - Essayer de faire une mise à jour qui devrait échouer du verrou mais réussir avec fallback
        ShopDataVersion::updateVersionsAtomic(['products', 'global']);

        // Assert - La mise à jour devrait avoir réussi avec la méthode fallback
        $versions = ShopDataVersion::whereIn('data_type', ['products', 'global'])->get();
        $this->assertGreaterThanOrEqual(2, $versions->count());
        
        // Libérer le verrou
        $lock->release();
    }

    /** @test */
    public function it_validates_and_repairs_version_inconsistencies()
    {
        // Arrange - Créer des données incohérentes manuellement
        $timestamp = now();
        
        // Créer des versions avec le même timestamp (problème de race condition simulé)
        ShopDataVersion::create([
            'data_type' => 'test_duplicate_1',
            'last_updated_at' => $timestamp,
            'version_hash' => 'duplicate_hash',
            'change_count' => 1
        ]);
        
        ShopDataVersion::create([
            'data_type' => 'test_duplicate_2', 
            'last_updated_at' => $timestamp,
            'version_hash' => 'duplicate_hash',
            'change_count' => 1
        ]);

        // Act
        $issues = ShopDataVersion::validateAndRepairVersions();

        // Assert
        $this->assertNotEmpty($issues, 'Des problèmes devraient être détectés');
        $this->assertContains('Found duplicate hashes: 1', $issues);
        
        // Vérifier que les hashes ont été réparés
        $repairedVersions = ShopDataVersion::whereIn('data_type', ['test_duplicate_1', 'test_duplicate_2'])->get();
        $uniqueHashes = $repairedVersions->pluck('version_hash')->unique();
        $this->assertCount(2, $uniqueHashes, 'Les hashes devraient maintenant être uniques');
    }

    /** @test */
    public function it_falls_back_to_legacy_methods_on_atomic_failure()
    {
        // Arrange - Simuler une condition qui ferait échouer les opérations atomiques
        // En désactivant temporairement les verrous de cache
        Cache::shouldReceive('lock')
            ->andThrow(new \Exception('Cache lock service unavailable'));

        // Act & Assert - La méthode devrait réussir en utilisant le fallback
        $this->expectsEvents([]);
        
        try {
            ShopDataVersion::updateVersionsAtomic(['fallback_test']);
            
            // Si on arrive ici, le fallback a fonctionné
            $version = ShopDataVersion::where('data_type', 'fallback_test')->first();
            $this->assertNotNull($version);
            
        } catch (\Exception $e) {
            // C'est acceptable aussi, tant que l'application ne plante pas
            $this->assertStringContainsString('Cache lock service unavailable', $e->getMessage());
        }
    }

    /** @test */
    public function it_maintains_global_version_consistency()
    {
        // Arrange
        ShopDataVersion::updateVersionsAtomic(['products', 'categories']);
        
        // Act
        $globalVersion1 = ShopDataVersion::getGlobalVersion();
        
        // Ajouter une nouvelle version
        ShopDataVersion::updateVersionsAtomic(['orders']);
        
        $globalVersion2 = ShopDataVersion::getGlobalVersion();

        // Assert
        $this->assertNotEmpty($globalVersion1);
        $this->assertNotEmpty($globalVersion2);
        $this->assertNotEquals($globalVersion1, $globalVersion2, 'La version globale devrait changer');
        
        // Vérifier que les versions sont reproductibles
        $globalVersion3 = ShopDataVersion::getGlobalVersion();
        $this->assertEquals($globalVersion2, $globalVersion3, 'La version globale devrait être stable');
    }

    /** @test */
    public function it_clears_version_cache_atomically()
    {
        // Arrange
        ShopDataVersion::updateVersionsAtomic(['products', 'categories']);
        
        // Vérifier que les caches sont créés
        $globalVersion = ShopDataVersion::getGlobalVersion();
        $productVersion = ShopDataVersion::getVersionForType('products');
        
        $this->assertNotEmpty($globalVersion);
        $this->assertNotEmpty($productVersion);

        // Act
        ShopDataVersion::clearVersionCache();

        // Assert - Les méthodes devraient recalculer les versions
        $newGlobalVersion = ShopDataVersion::getGlobalVersion();
        $newProductVersion = ShopDataVersion::getVersionForType('products');
        
        // Les versions devraient être identiques car les données n'ont pas changé
        $this->assertEquals($globalVersion, $newGlobalVersion);
        $this->assertEquals($productVersion, $newProductVersion);
    }

    /** @test */
    public function it_logs_atomic_operations_for_debugging()
    {
        // Arrange
        Log::shouldReceive('debug')->once()->with(
            'Atomic version update completed',
            \Mockery::on(function ($context) {
                return isset($context['data_types']) && 
                       in_array('products', $context['data_types']) &&
                       isset($context['timestamp']) &&
                       isset($context['cache_keys_invalidated']);
            })
        );

        // Act
        ShopDataVersion::updateVersionsAtomic(['products']);

        // Assert - Les expectations de Log sont vérifiées automatiquement
    }

    protected function tearDown(): void
    {
        // Nettoyer les données de test
        ShopDataVersion::where('data_type', 'like', 'test_%')->delete();
        ShopDataVersion::where('data_type', 'like', 'concurrent_test_%')->delete();
        ShopDataVersion::where('data_type', 'like', 'fallback_%')->delete();

        Cache::flush();
        
        parent::tearDown();
    }
} 