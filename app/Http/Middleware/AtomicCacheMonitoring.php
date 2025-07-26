<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;

class AtomicCacheMonitoring
{
    /**
     * Clés de métriques pour le monitoring
     */
    private const METRICS_PREFIX = 'atomic_cache_metrics';
    private const PERFORMANCE_THRESHOLD_MS = 1000; // 1 seconde
    private const ERROR_RATE_THRESHOLD = 0.05; // 5%

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $startTime = microtime(true);
        $requestId = uniqid('req_', true);
        
        // Enregistrer le début de la requête
        $this->recordRequestStart($requestId, $request);
        
        try {
            $response = $next($request);
            
            // Enregistrer le succès
            $this->recordRequestSuccess($requestId, $startTime);
            
            return $response;
            
        } catch (\Exception $e) {
            // Enregistrer l'erreur
            $this->recordRequestError($requestId, $startTime, $e);
            
            throw $e;
        }
    }

    /**
     * Enregistre le début d'une requête
     */
    private function recordRequestStart(string $requestId, Request $request): void
    {
        try {
            $startData = [
                'request_id' => $requestId,
                'uri' => $request->getRequestUri(),
                'method' => $request->getMethod(),
                'timestamp' => now()->toISOString(),
                'cache_operations' => []
            ];
            
            Cache::put(
                self::METRICS_PREFIX . ".requests.{$requestId}",
                $startData,
                300 // 5 minutes
            );
            
        } catch (\Exception $e) {
            Log::warning('Failed to record request start for atomic cache monitoring', [
                'request_id' => $requestId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Enregistre le succès d'une requête
     */
    private function recordRequestSuccess(string $requestId, float $startTime): void
    {
        try {
            $duration = (microtime(true) - $startTime) * 1000;
            
            // Mettre à jour les métriques de performance
            $this->updatePerformanceMetrics($duration, true);
            
            // Alerte si la performance est dégradée
            if ($duration > self::PERFORMANCE_THRESHOLD_MS) {
                $this->logPerformanceAlert($requestId, $duration);
            }
            
            // Nettoyer les données de requête
            Cache::forget(self::METRICS_PREFIX . ".requests.{$requestId}");
            
        } catch (\Exception $e) {
            Log::warning('Failed to record request success for atomic cache monitoring', [
                'request_id' => $requestId,
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Enregistre une erreur de requête
     */
    private function recordRequestError(string $requestId, float $startTime, \Exception $error): void
    {
        try {
            $duration = (microtime(true) - $startTime) * 1000;
            
            // Mettre à jour les métriques d'erreur
            $this->updatePerformanceMetrics($duration, false);
            
            // Enregistrer les détails de l'erreur
            Log::error('Atomic cache operation error detected', [
                'request_id' => $requestId,
                'duration_ms' => $duration,
                'error_type' => get_class($error),
                'error_message' => $error->getMessage(),
                'stack_trace' => $error->getTraceAsString()
            ]);
            
            // Vérifier si le taux d'erreur dépasse le seuil
            $this->checkErrorRateThreshold();
            
            // Nettoyer les données de requête
            Cache::forget(self::METRICS_PREFIX . ".requests.{$requestId}");
            
        } catch (\Exception $e) {
            Log::critical('Failed to record request error for atomic cache monitoring', [
                'request_id' => $requestId,
                'original_error' => $error->getMessage(),
                'monitoring_error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Met à jour les métriques de performance
     */
    private function updatePerformanceMetrics(float $duration, bool $success): void
    {
        $metricsKey = self::METRICS_PREFIX . '.performance';
        
        try {
            $currentMetrics = Cache::get($metricsKey, [
                'total_requests' => 0,
                'successful_requests' => 0,
                'total_duration' => 0,
                'max_duration' => 0,
                'min_duration' => PHP_FLOAT_MAX,
                'last_updated' => now()->toISOString()
            ]);
            
            $currentMetrics['total_requests']++;
            $currentMetrics['total_duration'] += $duration;
            $currentMetrics['max_duration'] = max($currentMetrics['max_duration'], $duration);
            $currentMetrics['min_duration'] = min($currentMetrics['min_duration'], $duration);
            $currentMetrics['last_updated'] = now()->toISOString();
            
            if ($success) {
                $currentMetrics['successful_requests']++;
            }
            
            // Calculer des métriques dérivées
            $currentMetrics['average_duration'] = $currentMetrics['total_duration'] / $currentMetrics['total_requests'];
            $currentMetrics['success_rate'] = $currentMetrics['successful_requests'] / $currentMetrics['total_requests'];
            $currentMetrics['error_rate'] = 1 - $currentMetrics['success_rate'];
            
            Cache::put($metricsKey, $currentMetrics, 3600); // 1 heure
            
        } catch (\Exception $e) {
            Log::warning('Failed to update performance metrics', [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Enregistre une alerte de performance
     */
    private function logPerformanceAlert(string $requestId, float $duration): void
    {
        Log::warning('Atomic cache operation performance alert', [
            'request_id' => $requestId,
            'duration_ms' => $duration,
            'threshold_ms' => self::PERFORMANCE_THRESHOLD_MS,
            'exceeded_by_ms' => $duration - self::PERFORMANCE_THRESHOLD_MS
        ]);
        
        // Incrémenter le compteur d'alertes
        $alertsKey = self::METRICS_PREFIX . '.alerts.performance';
        $currentCount = Cache::get($alertsKey, 0);
        Cache::put($alertsKey, $currentCount + 1, 3600);
    }

    /**
     * Vérifie si le taux d'erreur dépasse le seuil
     */
    private function checkErrorRateThreshold(): void
    {
        try {
            $metricsKey = self::METRICS_PREFIX . '.performance';
            $metrics = Cache::get($metricsKey);
            
            if ($metrics && isset($metrics['error_rate'])) {
                if ($metrics['error_rate'] > self::ERROR_RATE_THRESHOLD) {
                    Log::critical('Atomic cache error rate threshold exceeded', [
                        'current_error_rate' => $metrics['error_rate'],
                        'threshold' => self::ERROR_RATE_THRESHOLD,
                        'total_requests' => $metrics['total_requests'],
                        'successful_requests' => $metrics['successful_requests']
                    ]);
                    
                    // Déclencher des mesures d'urgence si nécessaire
                    $this->triggerEmergencyMeasures($metrics);
                }
            }
            
        } catch (\Exception $e) {
            Log::error('Failed to check error rate threshold', [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Déclenche des mesures d'urgence en cas de taux d'erreur élevé
     */
    private function triggerEmergencyMeasures(array $metrics): void
    {
        try {
            // Enregistrer l'incident
            $incidentKey = self::METRICS_PREFIX . '.incidents.' . time();
            $incidentData = [
                'timestamp' => now()->toISOString(),
                'type' => 'high_error_rate',
                'metrics' => $metrics,
                'actions_taken' => []
            ];
            
            // Action 1: Nettoyer les verrous potentiellement bloqués
            $this->clearStaleLocks();
            $incidentData['actions_taken'][] = 'cleared_stale_locks';
            
            // Action 2: Réinitialiser les métriques pour éviter les fausses alertes continues
            $this->resetMetrics();
            $incidentData['actions_taken'][] = 'reset_metrics';
            
            // Enregistrer l'incident
            Cache::put($incidentKey, $incidentData, 86400); // 24 heures
            
            Log::critical('Emergency measures triggered for atomic cache operations', $incidentData);
            
        } catch (\Exception $e) {
            Log::critical('Failed to trigger emergency measures', [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Nettoie les verrous potentiellement bloqués
     */
    private function clearStaleLocks(): void
    {
        try {
            $lockPatterns = [
                'shop_cache_invalidation_*',
                'shop_data_version_update_*',
                'global_version_calculation',
                'clear_version_cache',
                'validate_repair_versions'
            ];
            
            foreach ($lockPatterns as $pattern) {
                // Note: Ceci est une implémentation simplifiée
                // En production, il faudrait utiliser les APIs spécifiques du driver de cache
                try {
                    Cache::forget($pattern);
                } catch (\Exception $lockError) {
                    Log::warning('Failed to clear lock pattern', [
                        'pattern' => $pattern,
                        'error' => $lockError->getMessage()
                    ]);
                }
            }
            
        } catch (\Exception $e) {
            Log::error('Failed to clear stale locks', [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Réinitialise les métriques
     */
    private function resetMetrics(): void
    {
        try {
            $metricsKey = self::METRICS_PREFIX . '.performance';
            Cache::forget($metricsKey);
            
            Log::info('Atomic cache metrics reset due to emergency measures');
            
        } catch (\Exception $e) {
            Log::error('Failed to reset metrics', [
                'error' => $e->getMessage()
            ]);
        }
    }

    /**
     * Récupère les métriques actuelles (méthode utilitaire publique)
     */
    public static function getCurrentMetrics(): array
    {
        try {
            $metricsKey = self::METRICS_PREFIX . '.performance';
            return Cache::get($metricsKey, []);
            
        } catch (\Exception $e) {
            Log::warning('Failed to retrieve current metrics', [
                'error' => $e->getMessage()
            ]);
            
            return [];
        }
    }

    /**
     * Récupère les incidents récents (méthode utilitaire publique)
     */
    public static function getRecentIncidents(int $hours = 24): array
    {
        try {
            $incidents = [];
            $cutoffTime = now()->subHours($hours)->timestamp;
            
            // Récupérer tous les incidents depuis le cutoff
            for ($timestamp = $cutoffTime; $timestamp <= time(); $timestamp += 3600) {
                $incidentKey = self::METRICS_PREFIX . '.incidents.' . $timestamp;
                $incident = Cache::get($incidentKey);
                
                if ($incident) {
                    $incidents[] = $incident;
                }
            }
            
            return $incidents;
            
        } catch (\Exception $e) {
            Log::warning('Failed to retrieve recent incidents', [
                'error' => $e->getMessage()
            ]);
            
            return [];
        }
    }
} 