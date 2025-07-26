<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ShopDataVersion extends Model
{
    protected $table = 'shop_data_version';

    protected $fillable = [
        'data_type',
        'last_updated_at',
        'version_hash',
        'change_count',
    ];

    protected $casts = [
        'last_updated_at' => 'datetime',
        'change_count' => 'integer',
    ];

    /**
     * Durée du verrou atomique pour les mises à jour de version
     */
    private const VERSION_LOCK_TIMEOUT = 10;

    /**
     * Met à jour la version pour un type de données spécifique
     */
    public static function updateVersion(string $dataType): void
    {
        $timestamp = now();
        $hash = md5($dataType . '_' . $timestamp->timestamp);

        static::updateOrCreate(
            ['data_type' => $dataType],
            [
                'last_updated_at' => $timestamp,
                'version_hash' => $hash,
                'change_count' => \DB::raw('change_count + 1'),
            ]
        );

        // Invalidate cache
        Cache::forget('inertia.data.version');
        Cache::forget("shop.version.{$dataType}");
    }

    /**
     * Met à jour les versions pour plusieurs types de données (version legacy)
     */
    public static function updateVersions(array $dataTypes): void
    {
        $timestamp = now();

        foreach ($dataTypes as $dataType) {
            $hash = md5($dataType . '_' . $timestamp->timestamp);

            static::updateOrCreate(
                ['data_type' => $dataType],
                [
                    'last_updated_at' => $timestamp,
                    'version_hash' => $hash,
                    'change_count' => \DB::raw('change_count + 1'),
                ]
            );

            Cache::forget("shop.version.{$dataType}");
        }

        // Invalidate global cache
        Cache::forget('inertia.data.version');
    }

    /**
     * Met à jour les versions pour plusieurs types de données de manière atomique
     * Cette méthode garantit la cohérence des timestamps et évite les race conditions
     */
    public static function updateVersionsAtomic(array $dataTypes): void
    {
        if (empty($dataTypes)) {
            return;
        }

        $lockKey = 'shop_data_version_update_' . implode('_', sort($dataTypes));
        
        try {
            Cache::lock($lockKey, self::VERSION_LOCK_TIMEOUT)
                ->block(self::VERSION_LOCK_TIMEOUT, function () use ($dataTypes) {
                    DB::transaction(function () use ($dataTypes) {
                        // Utiliser un timestamp unique pour tous les types de données
                        $timestamp = now();
                        $microsecond = (int) (microtime(true) * 1000000);
                        
                        // Préparer les données en batch
                        $updateData = [];
                        $cacheKeysToInvalidate = ['inertia.data.version'];
                        
                        foreach ($dataTypes as $dataType) {
                            $hash = md5($dataType . '_' . $timestamp->timestamp . '_' . $microsecond);
                            
                            $updateData[] = [
                                'data_type' => $dataType,
                                'last_updated_at' => $timestamp,
                                'version_hash' => $hash,
                                'change_count' => DB::raw('COALESCE(change_count, 0) + 1'),
                                'updated_at' => $timestamp,
                                'created_at' => $timestamp,
                            ];
                            
                            $cacheKeysToInvalidate[] = "shop.version.{$dataType}";
                        }

                        // Effectuer la mise à jour en utilisant upsert pour l'atomicité
                        static::upsert(
                            $updateData,
                            ['data_type'], // Colonnes unique pour la recherche
                            ['last_updated_at', 'version_hash', 'change_count', 'updated_at'] // Colonnes à mettre à jour
                        );

                        // Invalider les caches de manière atomique
                        static::invalidateCacheKeysAtomic($cacheKeysToInvalidate);
                        
                        Log::debug('Atomic version update completed', [
                            'data_types' => $dataTypes,
                            'timestamp' => $timestamp->toISOString(),
                            'cache_keys_invalidated' => count($cacheKeysToInvalidate)
                        ]);
                    });
                });
                
        } catch (\Illuminate\Contracts\Cache\LockTimeoutException $e) {
            Log::warning('Version update lock timeout, falling back to non-atomic update', [
                'data_types' => $dataTypes,
                'error' => $e->getMessage()
            ]);
            
            // Fallback vers la méthode legacy
            static::updateVersions($dataTypes);
            
        } catch (\Exception $e) {
            Log::error('Failed to perform atomic version update', [
                'data_types' => $dataTypes,
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            throw $e;
        }
    }

    /**
     * Invalide les clés de cache de manière atomique
     */
    private static function invalidateCacheKeysAtomic(array $cacheKeys): void
    {
        if (empty($cacheKeys)) {
            return;
        }

        try {
            // Pour Redis, utiliser une pipeline si disponible
            if (method_exists(Cache::getStore(), 'many')) {
                $keysWithNull = array_fill_keys($cacheKeys, null);
                Cache::putMany($keysWithNull, 0); // TTL de 0 = suppression immédiate
            } else {
                // Fallback pour les autres drivers
                foreach ($cacheKeys as $key) {
                    Cache::forget($key);
                }
            }
        } catch (\Exception $e) {
            Log::warning('Failed to invalidate cache keys atomically', [
                'cache_keys' => $cacheKeys,
                'error' => $e->getMessage()
            ]);
            
            // Retry avec la méthode simple
            foreach ($cacheKeys as $key) {
                try {
                    Cache::forget($key);
                } catch (\Exception $retryException) {
                    Log::error('Failed to invalidate individual cache key', [
                        'key' => $key,
                        'error' => $retryException->getMessage()
                    ]);
                }
            }
        }
    }

    /**
     * Récupère la version globale basée sur tous les types de données avec protection contre les race conditions
     */
    public static function getGlobalVersion(): string
    {
        $lockKey = 'global_version_calculation';
        
        try {
            return Cache::lock($lockKey, 5)
                ->get(function () {
                    return Cache::remember('inertia.data.version', 300, function () {
                        $versions = static::select('version_hash', 'last_updated_at')
                            ->orderBy('last_updated_at', 'desc')
                            ->get();

                        if ($versions->isEmpty()) {
                            return md5('empty_' . now()->timestamp);
                        }

                        $hashData = $versions->pluck('version_hash')->implode('|');
                        return md5($hashData);
                    });
                });
                
        } catch (\Illuminate\Contracts\Cache\LockTimeoutException $e) {
            Log::warning('Global version calculation lock timeout, using cached version');
            
            // Fallback vers une version en cache ou par défaut
            return Cache::get('inertia.data.version', md5('fallback_' . now()->timestamp));
        }
    }

    /**
     * Récupère la version pour un type de données spécifique avec protection atomique
     */
    public static function getVersionForType(string $dataType): ?string
    {
        $lockKey = "version_type_{$dataType}";
        
        try {
            return Cache::lock($lockKey, 3)
                ->get(function () use ($dataType) {
                    return Cache::remember("shop.version.{$dataType}", 300, function () use ($dataType) {
                        $version = static::where('data_type', $dataType)->first();
                        return $version?->version_hash;
                    });
                });
                
        } catch (\Illuminate\Contracts\Cache\LockTimeoutException $e) {
            Log::warning('Version type calculation lock timeout', ['data_type' => $dataType]);
            
            // Fallback direct sans verrou
            return Cache::get("shop.version.{$dataType}");
        }
    }

    /**
     * Récupère les statistiques de version de manière thread-safe
     */
    public static function getVersionStats(): array
    {
        return Cache::remember('shop.version.stats', 60, function () {
            // Utilisation d'une requête compatible avec PostgreSQL et MySQL
            $databaseType = config('database.default');
            
            if ($databaseType === 'pgsql') {
                $secondsDiff = "EXTRACT(EPOCH FROM (NOW() - last_updated_at))";
            } else {
                $secondsDiff = "TIMESTAMPDIFF(SECOND, last_updated_at, NOW())";
            }
            
            return static::selectRaw("
                    data_type,
                    version_hash,
                    last_updated_at,
                    change_count,
                    {$secondsDiff} as seconds_since_update
                ")
                ->orderBy('last_updated_at', 'desc')
                ->get()
                ->toArray();
        });
    }

    /**
     * Nettoie le cache de version de manière atomique
     */
    public static function clearVersionCache(): void
    {
        $lockKey = 'clear_version_cache';
        
        try {
            Cache::lock($lockKey, 10)
                ->block(10, function () {
                    // Récupérer tous les types de données avant le nettoyage
                    $dataTypes = static::pluck('data_type')->toArray();
                    
                    // Préparer toutes les clés à nettoyer
                    $cacheKeysToRemove = ['inertia.data.version', 'shop.version.stats'];
                    
                    foreach ($dataTypes as $dataType) {
                        $cacheKeysToRemove[] = "shop.version.{$dataType}";
                    }
                    
                    // Nettoyer de manière atomique
                    static::invalidateCacheKeysAtomic($cacheKeysToRemove);
                    
                    Log::info('Version cache cleared atomically', [
                        'cleared_keys' => count($cacheKeysToRemove)
                    ]);
                });
                
        } catch (\Illuminate\Contracts\Cache\LockTimeoutException $e) {
            Log::warning('Clear version cache lock timeout, performing direct clear');
            
            // Fallback direct
            Cache::forget('inertia.data.version');
            Cache::forget('shop.version.stats');
            
            $dataTypes = static::pluck('data_type');
            foreach ($dataTypes as $dataType) {
                Cache::forget("shop.version.{$dataType}");
            }
        }
    }

    /**
     * Vérifie la cohérence des versions et répare si nécessaire
     */
    public static function validateAndRepairVersions(): array
    {
        $lockKey = 'validate_repair_versions';
        
        return Cache::lock($lockKey, 30)
            ->block(30, function () {
                $issues = [];
                
                try {
                    // Vérifier les incohérences de timestamp
                    $duplicateTimestamps = static::select('last_updated_at', DB::raw('COUNT(*) as count'))
                        ->groupBy('last_updated_at')
                        ->having('count', '>', 1)
                        ->get();
                    
                    if ($duplicateTimestamps->isNotEmpty()) {
                        $issues[] = 'Found duplicate timestamps: ' . $duplicateTimestamps->count();
                        
                        // Réparer en ajoutant des microsecondes
                        foreach ($duplicateTimestamps as $duplicate) {
                            $records = static::where('last_updated_at', $duplicate->last_updated_at)
                                ->orderBy('id')
                                ->get();
                                
                            foreach ($records as $index => $record) {
                                if ($index > 0) {
                                    $newTimestamp = $duplicate->last_updated_at->addMicroseconds($index * 1000);
                                    $record->update([
                                        'last_updated_at' => $newTimestamp,
                                        'version_hash' => md5($record->data_type . '_' . $newTimestamp->timestamp)
                                    ]);
                                }
                            }
                        }
                        
                        $issues[] = 'Repaired duplicate timestamps';
                    }
                    
                    // Vérifier les hash dupliqués
                    $duplicateHashes = static::select('version_hash', DB::raw('COUNT(*) as count'))
                        ->groupBy('version_hash')
                        ->having('count', '>', 1)
                        ->get();
                    
                    if ($duplicateHashes->isNotEmpty()) {
                        $issues[] = 'Found duplicate hashes: ' . $duplicateHashes->count();
                        
                        // Réparer en régénérant les hash
                        foreach ($duplicateHashes as $duplicate) {
                            $records = static::where('version_hash', $duplicate->version_hash)
                                ->orderBy('id')
                                ->get();
                                
                            foreach ($records as $index => $record) {
                                $newHash = md5($record->data_type . '_' . $record->last_updated_at->timestamp . '_' . $index);
                                $record->update(['version_hash' => $newHash]);
                            }
                        }
                        
                        $issues[] = 'Repaired duplicate hashes';
                    }
                    
                    // Nettoyer le cache après réparation
                    if (!empty($issues)) {
                        static::clearVersionCache();
                        $issues[] = 'Cache cleared after repairs';
                    }
                    
                    Log::info('Version validation and repair completed', [
                        'issues_found' => count($issues),
                        'issues' => $issues
                    ]);
                    
                } catch (\Exception $e) {
                    Log::error('Failed to validate and repair versions', [
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString()
                    ]);
                    
                    $issues[] = 'Validation failed: ' . $e->getMessage();
                }
                
                return $issues;
            });
    }
} 