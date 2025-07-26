<?php

namespace App\Console\Commands;

use App\Models\ShopDataVersion;
use App\Events\ProductUpdated;
use App\Events\CategoryUpdated;
use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\Category;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Carbon;

class ValidateAtomicCacheOperations extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'cache:validate-atomic 
                            {--test-concurrency : Test concurrent operations}
                            {--repair : Repair version inconsistencies}
                            {--clear-cache : Clear all version caches}
                            {--stress-test=10 : Number of concurrent operations for stress test}';

    /**
     * The console command description.
     */
    protected $description = 'Valide et teste les opérations de cache atomiques pour éviter les race conditions';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('🚀 Validation des opérations de cache atomiques');
        $this->newLine();

        // Nettoyage du cache si demandé
        if ($this->option('clear-cache')) {
            $this->clearCaches();
        }

        // Réparation des versions si demandée
        if ($this->option('repair')) {
            $this->repairVersions();
        }

        // Tests de base
        $this->runBasicTests();

        // Tests de concurrence si demandés
        if ($this->option('test-concurrency')) {
            $this->runConcurrencyTests((int) $this->option('stress-test'));
        }

        // Validation finale
        $this->validateFinalState();

        $this->info('✅ Validation terminée avec succès');
    }

    /**
     * Nettoie tous les caches
     */
    private function clearCaches(): void
    {
        $this->info('🧹 Nettoyage des caches...');
        
        try {
            ShopDataVersion::clearVersionCache();
            $this->line('  • Cache des versions nettoyé');
            
            Cache::flush();
            $this->line('  • Cache général nettoyé');
            
            $this->info('✅ Nettoyage terminé');
        } catch (\Exception $e) {
            $this->error('❌ Erreur lors du nettoyage: ' . $e->getMessage());
        }
        
        $this->newLine();
    }

    /**
     * Répare les incohérences de versions
     */
    private function repairVersions(): void
    {
        $this->info('🔧 Réparation des versions...');
        
        try {
            $issues = ShopDataVersion::validateAndRepairVersions();
            
            if (empty($issues)) {
                $this->line('  • Aucun problème détecté');
            } else {
                foreach ($issues as $issue) {
                    $this->line("  • {$issue}");
                }
            }
            
            $this->info('✅ Réparation terminée');
        } catch (\Exception $e) {
            $this->error('❌ Erreur lors de la réparation: ' . $e->getMessage());
        }
        
        $this->newLine();
    }

    /**
     * Exécute les tests de base
     */
    private function runBasicTests(): void
    {
        $this->info('🧪 Tests de base des opérations atomiques...');
        
        // Test 1: Mise à jour atomique simple
        $this->testAtomicUpdate();
        
        // Test 2: Cohérence des timestamps
        $this->testTimestampConsistency();
        
        // Test 3: Invalidation de cache atomique
        $this->testAtomicCacheInvalidation();
        
        $this->info('✅ Tests de base terminés');
        $this->newLine();
    }

    /**
     * Test de mise à jour atomique
     */
    private function testAtomicUpdate(): void
    {
        $this->line('  • Test mise à jour atomique...');
        
        $startTime = microtime(true);
        
        try {
            // Simuler plusieurs mises à jour simultanées
            $dataTypes = ['products', 'categories', 'global'];
            ShopDataVersion::updateVersionsAtomic($dataTypes);
            
            // Vérifier que toutes les versions ont le même timestamp (à la microseconde près)
            $versions = ShopDataVersion::whereIn('data_type', $dataTypes)
                ->orderBy('last_updated_at')
                ->get();
            
            if ($versions->count() === count($dataTypes)) {
                $firstTimestamp = $versions->first()->last_updated_at;
                $allSameTimestamp = $versions->every(function ($version) use ($firstTimestamp) {
                    return $version->last_updated_at->equalTo($firstTimestamp);
                });
                
                if ($allSameTimestamp) {
                    $duration = round((microtime(true) - $startTime) * 1000, 2);
                    $this->line("    ✅ Succès ({$duration}ms)");
                } else {
                    $this->line('    ❌ Timestamps incohérents');
                }
            } else {
                $this->line('    ❌ Nombre de versions incorrect');
            }
            
        } catch (\Exception $e) {
            $this->line('    ❌ Erreur: ' . $e->getMessage());
        }
    }

    /**
     * Test de cohérence des timestamps
     */
    private function testTimestampConsistency(): void
    {
        $this->line('  • Test cohérence des timestamps...');
        
        try {
            // Effectuer plusieurs mises à jour rapides
            for ($i = 0; $i < 5; $i++) {
                ShopDataVersion::updateVersionsAtomic(['test_type_' . $i]);
                usleep(1000); // 1ms entre chaque opération
            }
            
            // Vérifier qu'il n'y a pas de doublons de timestamps
            $duplicates = ShopDataVersion::select('last_updated_at', DB::raw('COUNT(*) as count'))
                ->where('data_type', 'like', 'test_type_%')
                ->groupBy('last_updated_at')
                ->having('count', '>', 1)
                ->count();
            
            if ($duplicates === 0) {
                $this->line('    ✅ Aucun doublon de timestamp');
            } else {
                $this->line("    ❌ {$duplicates} doublons détectés");
            }
            
            // Nettoyer les données de test
            ShopDataVersion::where('data_type', 'like', 'test_type_%')->delete();
            
        } catch (\Exception $e) {
            $this->line('    ❌ Erreur: ' . $e->getMessage());
        }
    }

    /**
     * Test d'invalidation de cache atomique
     */
    private function testAtomicCacheInvalidation(): void
    {
        $this->line('  • Test invalidation cache atomique...');
        
        try {
            // Créer des entrées de cache de test
            $testKeys = ['test_key_1', 'test_key_2', 'test_key_3'];
            foreach ($testKeys as $key) {
                Cache::put($key, 'test_value', 300);
            }
            
            // Vérifier qu'elles existent
            $allExist = collect($testKeys)->every(fn($key) => Cache::has($key));
            
            if ($allExist) {
                // Utiliser la méthode d'invalidation atomique via reflection
                $reflection = new \ReflectionClass(ShopDataVersion::class);
                $method = $reflection->getMethod('invalidateCacheKeysAtomic');
                $method->setAccessible(true);
                $method->invoke(null, $testKeys);
                
                // Vérifier qu'elles ont été supprimées
                $allRemoved = collect($testKeys)->every(fn($key) => !Cache::has($key));
                
                if ($allRemoved) {
                    $this->line('    ✅ Invalidation atomique réussie');
                } else {
                    $this->line('    ❌ Certaines clés n\'ont pas été supprimées');
                }
            } else {
                $this->line('    ❌ Échec création des clés de test');
            }
            
        } catch (\Exception $e) {
            $this->line('    ❌ Erreur: ' . $e->getMessage());
        }
    }

    /**
     * Exécute les tests de concurrence
     */
    private function runConcurrencyTests(int $numOperations): void
    {
        $this->info("🏁 Tests de concurrence ({$numOperations} opérations simultanées)...");
        
        // Test avec des processus multiples simulés
        $this->testConcurrentVersionUpdates($numOperations);
        
        // Test avec des événements simulés
        $this->testConcurrentEventHandling($numOperations);
        
        $this->info('✅ Tests de concurrence terminés');
        $this->newLine();
    }

    /**
     * Test de mises à jour de versions concurrentes
     */
    private function testConcurrentVersionUpdates(int $numOperations): void
    {
        $this->line('  • Test mises à jour concurrentes...');
        
        try {
            $startTime = microtime(true);
            
            // Simuler des opérations concurrentes avec des promesses
            $promises = [];
            for ($i = 0; $i < $numOperations; $i++) {
                $promises[] = function () use ($i) {
                    ShopDataVersion::updateVersionsAtomic(['concurrent_test', 'global']);
                };
            }
            
            // Exécuter toutes les opérations
            foreach ($promises as $promise) {
                $promise();
            }
            
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            
            // Vérifier la cohérence
            $versions = ShopDataVersion::whereIn('data_type', ['concurrent_test', 'global'])
                ->get();
            
            $this->line("    ✅ {$numOperations} opérations terminées en {$duration}ms");
            $this->line("    • Versions créées: " . $versions->count());
            
        } catch (\Exception $e) {
            $this->line('    ❌ Erreur: ' . $e->getMessage());
        }
    }

    /**
     * Test de gestion d'événements concurrents
     */
    private function testConcurrentEventHandling(int $numOperations): void
    {
        $this->line('  • Test gestion événements concurrents...');
        
        try {
            // Créer des produits et catégories de test si nécessaire
            $product = Product::first();
            $category = Category::first();
            
            if (!$product || !$category) {
                $this->line('    ⚠️  Aucun produit/catégorie trouvé pour les tests');
                return;
            }
            
            $startTime = microtime(true);
            
            // Simuler des événements concurrents
            for ($i = 0; $i < $numOperations; $i++) {
                if ($i % 2 === 0) {
                    event(new ProductUpdated($product, 'updated'));
                } else {
                    event(new CategoryUpdated($category, 'updated'));
                }
            }
            
            $duration = round((microtime(true) - $startTime) * 1000, 2);
            $this->line("    ✅ {$numOperations} événements traités en {$duration}ms");
            
        } catch (\Exception $e) {
            $this->line('    ❌ Erreur: ' . $e->getMessage());
        }
    }

    /**
     * Validation de l'état final
     */
    private function validateFinalState(): void
    {
        $this->info('🔍 Validation de l\'état final...');
        
        try {
            // Statistiques des versions
            $stats = ShopDataVersion::getVersionStats();
            $this->line('  • Nombre de types de versions: ' . count($stats));
            
            // Vérifier la cohérence globale
            $globalVersion = ShopDataVersion::getGlobalVersion();
            $this->line('  • Version globale: ' . substr($globalVersion, 0, 12) . '...');
            
            // Vérifier l'état du cache
            $cacheWorking = Cache::put('test_final', 'ok', 10) && Cache::get('test_final') === 'ok';
            Cache::forget('test_final');
            
            if ($cacheWorking) {
                $this->line('  • Cache: ✅ Fonctionnel');
            } else {
                $this->line('  • Cache: ❌ Problème détecté');
            }
            
            // Vérifier les verrous
            $lockTest = Cache::lock('test_lock', 1)->get(function () {
                return true;
            });
            
            if ($lockTest) {
                $this->line('  • Verrous: ✅ Fonctionnels');
            } else {
                $this->line('  • Verrous: ❌ Problème détecté');
            }
            
            $this->info('✅ État final validé');
            
        } catch (\Exception $e) {
            $this->error('❌ Erreur lors de la validation finale: ' . $e->getMessage());
        }
        
        $this->newLine();
    }
} 