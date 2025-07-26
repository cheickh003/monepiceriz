<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\ShopDataVersion;
use App\Services\ShopVersionService;
use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\Category;
use App\Events\ProductUpdated;
use App\Events\CategoryUpdated;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Event;

class ShopVersionOptimizationTest extends TestCase
{
    use RefreshDatabase;

    private ShopVersionService $versionService;

    protected function setUp(): void
    {
        parent::setUp();
        $this->versionService = app(ShopVersionService::class);
    }

    /** @test */
    public function it_can_initialize_shop_data_versions()
    {
        // Initialiser les versions
        $this->versionService->initializeVersions();

        // Vérifier que toutes les versions sont créées
        $this->assertDatabaseCount('shop_data_version', 4);
        
        foreach (ShopVersionService::DATA_TYPES as $dataType) {
            $this->assertDatabaseHas('shop_data_version', [
                'data_type' => $dataType
            ]);
        }
    }

    /** @test */
    public function it_updates_version_when_product_is_modified()
    {
        $this->versionService->initializeVersions();
        
        // Récupérer la version initiale
        $initialVersion = ShopDataVersion::where('data_type', 'products')->first();
        
        // Créer un produit
        $category = Category::factory()->create();
        $product = Product::factory()->create(['category_id' => $category->id]);
        
        // Déclencher l'événement
        event(new ProductUpdated($product, 'created'));
        
        // Vérifier que la version a été mise à jour
        $updatedVersion = ShopDataVersion::where('data_type', 'products')->first();
        $this->assertNotEquals($initialVersion->version_hash, $updatedVersion->version_hash);
        $this->assertEquals(1, $updatedVersion->change_count);
    }

    /** @test */
    public function it_updates_version_when_category_is_modified()
    {
        $this->versionService->initializeVersions();
        
        // Récupérer la version initiale
        $initialVersion = ShopDataVersion::where('data_type', 'categories')->first();
        
        // Créer une catégorie
        $category = Category::factory()->create();
        
        // Déclencher l'événement
        event(new CategoryUpdated($category, 'created'));
        
        // Vérifier que la version a été mise à jour
        $updatedVersion = ShopDataVersion::where('data_type', 'categories')->first();
        $this->assertNotEquals($initialVersion->version_hash, $updatedVersion->version_hash);
        $this->assertEquals(1, $updatedVersion->change_count);
    }

    /** @test */
    public function it_provides_fast_global_version_retrieval()
    {
        $this->versionService->initializeVersions();
        
        // Mesurer le temps d'exécution
        $start = microtime(true);
        $version = ShopDataVersion::getGlobalVersion();
        $executionTime = microtime(true) - $start;
        
        // Vérifier que la version est retournée
        $this->assertNotEmpty($version);
        $this->assertEquals(32, strlen($version)); // MD5 hash
        
        // Vérifier que l'exécution est rapide (moins de 10ms)
        $this->assertLessThan(0.01, $executionTime);
    }

    /** @test */
    public function it_caches_version_queries_effectively()
    {
        $this->versionService->initializeVersions();
        
        // Première requête (met en cache)
        $version1 = ShopDataVersion::getGlobalVersion();
        
        // Deuxième requête (depuis le cache)
        $version2 = ShopDataVersion::getGlobalVersion();
        
        // Vérifier que les versions sont identiques
        $this->assertEquals($version1, $version2);
        
        // Vérifier que le cache existe
        $this->assertTrue(Cache::has('inertia.data.version'));
    }

    /** @test */
    public function it_invalidates_cache_when_versions_are_updated()
    {
        $this->versionService->initializeVersions();
        
        // Mettre en cache la version
        $initialVersion = ShopDataVersion::getGlobalVersion();
        $this->assertTrue(Cache::has('inertia.data.version'));
        
        // Mettre à jour une version
        ShopDataVersion::updateVersion('products');
        
        // Vérifier que le cache a été invalidé
        $this->assertFalse(Cache::has('inertia.data.version'));
        
        // Vérifier que la nouvelle version est différente
        $newVersion = ShopDataVersion::getGlobalVersion();
        $this->assertNotEquals($initialVersion, $newVersion);
    }

    /** @test */
    public function it_provides_performance_improvement_over_max_queries()
    {
        $this->versionService->initializeVersions();
        
        // Créer des données de test
        $category = Category::factory()->create();
        Product::factory()->count(100)->create(['category_id' => $category->id]);
        Category::factory()->count(50)->create();
        
        // Benchmark de performance
        $results = $this->versionService->benchmarkPerformance(10);
        
        // Vérifier que la nouvelle méthode est plus rapide
        $improvementRatio = floatval(str_replace('x', '', $results['improvement_ratio']));
        $this->assertGreaterThan(1, $improvementRatio);
        
        // Vérifier la structure des résultats
        $this->assertArrayHasKey('new_method_time', $results);
        $this->assertArrayHasKey('old_method_time', $results);
        $this->assertArrayHasKey('time_saved_per_request', $results);
    }

    /** @test */
    public function it_validates_version_consistency()
    {
        $this->versionService->initializeVersions();
        
        $validation = $this->versionService->validateVersionConsistency();
        
        $this->assertTrue($validation['is_consistent']);
        $this->assertEmpty($validation['issues']);
        $this->assertEquals(4, $validation['total_versions']);
        $this->assertEquals(4, $validation['expected_versions']);
    }

    /** @test */
    public function it_detects_version_inconsistencies()
    {
        // Créer une version avec un type de données non reconnu
        ShopDataVersion::create([
            'data_type' => 'unknown_type',
            'last_updated_at' => now(),
            'version_hash' => md5('test'),
            'change_count' => 0,
        ]);
        
        $validation = $this->versionService->validateVersionConsistency();
        
        $this->assertFalse($validation['is_consistent']);
        $this->assertNotEmpty($validation['issues']);
        $this->assertStringContainsString('unknown_type', implode(' ', $validation['issues']));
    }

    /** @test */
    public function it_provides_detailed_statistics()
    {
        $this->versionService->initializeVersions();
        
        $stats = $this->versionService->getDetailedStats();
        
        $this->assertArrayHasKey('versions', $stats);
        $this->assertArrayHasKey('global_version', $stats);
        $this->assertArrayHasKey('cache_info', $stats);
        $this->assertArrayHasKey('performance_metrics', $stats);
        
        // Vérifier la structure des versions
        $this->assertCount(4, $stats['versions']);
        
        // Vérifier les métriques de performance
        $this->assertArrayHasKey('products_count', $stats['performance_metrics']);
        $this->assertArrayHasKey('categories_count', $stats['performance_metrics']);
        $this->assertArrayHasKey('efficiency_improvement', $stats['performance_metrics']);
    }

    /** @test */
    public function it_handles_multiple_concurrent_version_updates()
    {
        $this->versionService->initializeVersions();
        
        // Simuler des mises à jour concurrentes
        $initialGlobalVersion = ShopDataVersion::getGlobalVersion();
        
        ShopDataVersion::updateVersions(['products', 'categories']);
        
        $newGlobalVersion = ShopDataVersion::getGlobalVersion();
        
        // Vérifier que la version globale a changé
        $this->assertNotEquals($initialGlobalVersion, $newGlobalVersion);
        
        // Vérifier que les compteurs ont été incrémentés
        $productsVersion = ShopDataVersion::where('data_type', 'products')->first();
        $categoriesVersion = ShopDataVersion::where('data_type', 'categories')->first();
        
        $this->assertEquals(1, $productsVersion->change_count);
        $this->assertEquals(1, $categoriesVersion->change_count);
    }

    /** @test */
    public function it_can_clear_all_versions_and_cache()
    {
        $this->versionService->initializeVersions();
        
        // Vérifier que les versions existent
        $this->assertDatabaseCount('shop_data_version', 4);
        
        // Mettre quelque chose en cache
        ShopDataVersion::getGlobalVersion();
        $this->assertTrue(Cache::has('inertia.data.version'));
        
        // Nettoyer tout
        $this->versionService->clearAllVersions();
        
        // Vérifier que tout a été supprimé
        $this->assertDatabaseCount('shop_data_version', 0);
        $this->assertFalse(Cache::has('inertia.data.version'));
    }

    /** @test */
    public function it_tracks_change_history()
    {
        $this->versionService->initializeVersions();
        
        // Faire plusieurs changements
        ShopDataVersion::updateVersion('products');
        sleep(1); // Attendre pour avoir des timestamps différents
        ShopDataVersion::updateVersion('products');
        
        $history = $this->versionService->getChangeHistory('products', 1);
        
        $this->assertGreaterThanOrEqual(2, $history->count());
        $this->assertArrayHasKey('timestamp', $history->first());
        $this->assertArrayHasKey('version_hash', $history->first());
        $this->assertArrayHasKey('change_count', $history->first());
        $this->assertArrayHasKey('human_time', $history->first());
    }
} 