<?php

namespace App\Services;

use App\Models\ShopDataVersion;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Collection;

class ShopVersionService
{
    /**
     * Types de données supportés
     */
    public const DATA_TYPES = [
        'products',
        'categories',
        'orders',
        'global'
    ];

    /**
     * Initialise les versions pour tous les types de données
     */
    public function initializeVersions(): void
    {
        foreach (self::DATA_TYPES as $dataType) {
            ShopDataVersion::updateOrCreate(
                ['data_type' => $dataType],
                [
                    'last_updated_at' => now(),
                    'version_hash' => md5($dataType . '_' . now()->timestamp),
                    'change_count' => 0,
                ]
            );
        }
    }

    /**
     * Force la mise à jour de toutes les versions
     */
    public function forceUpdateAllVersions(): void
    {
        ShopDataVersion::updateVersions(self::DATA_TYPES);
    }

    /**
     * Récupère les statistiques détaillées des versions
     */
    public function getDetailedStats(): array
    {
        $stats = ShopDataVersion::getVersionStats();
        
        return [
            'versions' => $stats,
            'global_version' => ShopDataVersion::getGlobalVersion(),
            'cache_info' => $this->getCacheInfo(),
            'performance_metrics' => $this->getPerformanceMetrics(),
        ];
    }

    /**
     * Benchmark des performances entre l'ancienne et la nouvelle méthode
     */
    public function benchmarkPerformance(int $iterations = 100): array
    {
        // Benchmark nouvelle méthode
        $start = microtime(true);
        for ($i = 0; $i < $iterations; $i++) {
            ShopDataVersion::getGlobalVersion();
        }
        $newMethodTime = microtime(true) - $start;

        // Simuler l'ancienne méthode (uniquement pour le benchmark)
        $start = microtime(true);
        for ($i = 0; $i < $iterations; $i++) {
            $this->simulateOldMethod();
        }
        $oldMethodTime = microtime(true) - $start;

        return [
            'iterations' => $iterations,
            'new_method_time' => round($newMethodTime * 1000, 2) . 'ms',
            'old_method_time' => round($oldMethodTime * 1000, 2) . 'ms',
            'improvement_ratio' => round($oldMethodTime / $newMethodTime, 2) . 'x',
            'time_saved_per_request' => round(($oldMethodTime - $newMethodTime) / $iterations * 1000, 2) . 'ms',
        ];
    }

    /**
     * Simule l'ancienne méthode pour le benchmark
     */
    private function simulateOldMethod(): string
    {
        // Simulation des requêtes MAX() coûteuses
        $timestamps = [];
        
        // Simuler Product::max('updated_at')
        $productMax = DB::table('products')->max('updated_at');
        if ($productMax) {
            $timestamps[] = $productMax;
        }
        
        // Simuler Category::max('updated_at')
        $categoryMax = DB::table('categories')->max('updated_at');
        if ($categoryMax) {
            $timestamps[] = $categoryMax;
        }
        
        // Simuler cache global
        $globalUpdate = Cache::get('shop.last_update', now()->timestamp);
        $timestamps[] = $globalUpdate;
        
        return md5(implode('|', $timestamps));
    }

    /**
     * Récupère les informations sur le cache
     */
    private function getCacheInfo(): array
    {
        $cacheKeys = [
            'inertia.data.version',
            'shop.version.products',
            'shop.version.categories',
            'shop.version.global',
        ];

        $info = [];
        foreach ($cacheKeys as $key) {
            $info[$key] = [
                'exists' => Cache::has($key),
                'value' => Cache::get($key),
            ];
        }

        return $info;
    }

    /**
     * Récupère les métriques de performance
     */
    private function getPerformanceMetrics(): array
    {
        // Compter le nombre de requêtes évitées
        $productCount = DB::table('products')->count();
        $categoryCount = DB::table('categories')->count();
        
        return [
            'products_count' => $productCount,
            'categories_count' => $categoryCount,
            'estimated_rows_scanned_old_method' => $productCount + $categoryCount,
            'rows_scanned_new_method' => count(self::DATA_TYPES), // Juste quelques lignes dans shop_data_version
            'efficiency_improvement' => $productCount + $categoryCount > 0 
                ? round(($productCount + $categoryCount) / count(self::DATA_TYPES), 2) . 'x'
                : 'N/A',
        ];
    }

    /**
     * Nettoie toutes les données de version (utile pour les tests)
     */
    public function clearAllVersions(): void
    {
        ShopDataVersion::truncate();
        ShopDataVersion::clearVersionCache();
    }

    /**
     * Vérifie la cohérence des versions
     */
    public function validateVersionConsistency(): array
    {
        $issues = [];
        
        // Vérifier que tous les types de données requis existent
        $existingTypes = ShopDataVersion::pluck('data_type')->toArray();
        foreach (self::DATA_TYPES as $requiredType) {
            if (!in_array($requiredType, $existingTypes)) {
                $issues[] = "Type de données manquant: {$requiredType}";
            }
        }

        // Vérifier les versions orphelines
        foreach ($existingTypes as $type) {
            if (!in_array($type, self::DATA_TYPES)) {
                $issues[] = "Type de données non reconnu: {$type}";
            }
        }

        // Vérifier la cohérence des timestamps
        $versions = ShopDataVersion::orderBy('last_updated_at', 'desc')->get();
        foreach ($versions as $version) {
            if ($version->last_updated_at->isFuture()) {
                $issues[] = "Timestamp futur détecté pour {$version->data_type}";
            }
        }

        return [
            'is_consistent' => empty($issues),
            'issues' => $issues,
            'total_versions' => $versions->count(),
            'expected_versions' => count(self::DATA_TYPES),
        ];
    }

    /**
     * Récupère l'historique des changements pour un type de données
     */
    public function getChangeHistory(string $dataType, int $days = 7): Collection
    {
        return ShopDataVersion::where('data_type', $dataType)
            ->where('updated_at', '>=', now()->subDays($days))
            ->orderBy('updated_at', 'desc')
            ->get()
            ->map(function ($version) {
                return [
                    'timestamp' => $version->updated_at,
                    'version_hash' => $version->version_hash,
                    'change_count' => $version->change_count,
                    'human_time' => $version->updated_at->diffForHumans(),
                ];
            });
    }
} 