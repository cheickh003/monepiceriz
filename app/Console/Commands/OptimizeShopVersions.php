<?php

namespace App\Console\Commands;

use App\Services\ShopVersionService;
use Illuminate\Console\Command;

class OptimizeShopVersions extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'shop:optimize-versions
                          {action : Action to perform: init|stats|benchmark|validate|clear}
                          {--iterations=100 : Number of iterations for benchmark}';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Gère et surveille l\'optimisation des versions de données du shop';

    private ShopVersionService $versionService;

    /**
     * Execute the console command.
     */
    public function handle(ShopVersionService $versionService): int
    {
        $this->versionService = $versionService;
        $action = $this->argument('action');

        return match($action) {
            'init' => $this->initializeVersions(),
            'stats' => $this->showStats(),
            'benchmark' => $this->runBenchmark(),
            'validate' => $this->validateConsistency(),
            'clear' => $this->clearVersions(),
            default => $this->error("Action non reconnue: {$action}")
        };
    }

    /**
     * Initialise les versions
     */
    private function initializeVersions(): int
    {
        $this->info('Initialisation des versions de données du shop...');
        
        $this->versionService->initializeVersions();
        
        $this->info('✅ Versions initialisées avec succès.');
        $this->showStats();
        
        return Command::SUCCESS;
    }

    /**
     * Affiche les statistiques détaillées
     */
    private function showStats(): int
    {
        $stats = $this->versionService->getDetailedStats();
        
        $this->info('📊 Statistiques des versions du shop');
        $this->line('');
        
        // Versions actuelles
        $this->info('🔄 Versions actuelles:');
        $this->table(
            ['Type', 'Version Hash', 'Dernière MAJ', 'Nb. Changements', 'Depuis'],
            collect($stats['versions'])->map(function ($version) {
                return [
                    $version['data_type'],
                    substr($version['version_hash'], 0, 8) . '...',
                    $version['last_updated_at'],
                    $version['change_count'],
                    $version['seconds_since_update'] . 's'
                ];
            })->toArray()
        );
        
        $this->line('');
        $this->info("🌐 Version globale: " . substr($stats['global_version'], 0, 16) . '...');
        
        // Métriques de performance
        $this->line('');
        $this->info('⚡ Métriques de performance:');
        foreach ($stats['performance_metrics'] as $key => $value) {
            $this->line("  • " . str_replace('_', ' ', ucfirst($key)) . ": {$value}");
        }
        
        // Informations sur le cache
        $this->line('');
        $this->info('💾 État du cache:');
        foreach ($stats['cache_info'] as $key => $info) {
            $status = $info['exists'] ? '✅' : '❌';
            $this->line("  {$status} {$key}");
        }
        
        return Command::SUCCESS;
    }

    /**
     * Lance un benchmark de performance
     */
    private function runBenchmark(): int
    {
        $iterations = (int) $this->option('iterations');
        
        $this->info("🏃 Lancement du benchmark de performance ({$iterations} itérations)...");
        $this->line('');
        
        $progressBar = $this->output->createProgressBar($iterations * 2);
        $progressBar->start();
        
        // Simuler le progress bar (le vrai benchmark est dans $versionService)
        for ($i = 0; $i < $iterations * 2; $i++) {
            usleep(1000); // 1ms pour simuler
            $progressBar->advance();
        }
        
        $progressBar->finish();
        $this->line('');
        $this->line('');
        
        $results = $this->versionService->benchmarkPerformance($iterations);
        
        $this->info('📈 Résultats du benchmark:');
        $this->table(
            ['Métrique', 'Valeur'],
            [
                ['Itérations', $results['iterations']],
                ['Nouvelle méthode', $results['new_method_time']],
                ['Ancienne méthode', $results['old_method_time']],
                ['Amélioration', $results['improvement_ratio']],
                ['Temps économisé/requête', $results['time_saved_per_request']],
            ]
        );
        
        $improvementRatio = floatval(str_replace('x', '', $results['improvement_ratio']));
        if ($improvementRatio > 5) {
            $this->info('🚀 Excellente optimisation! Performance améliorée de plus de 5x.');
        } elseif ($improvementRatio > 2) {
            $this->info('✅ Bonne optimisation! Performance significativement améliorée.');
        } else {
            $this->warn('⚠️  Optimisation modérée. Vérifiez la configuration.');
        }
        
        return Command::SUCCESS;
    }

    /**
     * Valide la cohérence des versions
     */
    private function validateConsistency(): int
    {
        $this->info('🔍 Validation de la cohérence des versions...');
        
        $validation = $this->versionService->validateVersionConsistency();
        
        if ($validation['is_consistent']) {
            $this->info('✅ Toutes les versions sont cohérentes.');
        } else {
            $this->error('❌ Problèmes de cohérence détectés:');
            foreach ($validation['issues'] as $issue) {
                $this->line("  • {$issue}");
            }
        }
        
        $this->line('');
        $this->info("📊 Résumé:");
        $this->line("  • Versions actuelles: {$validation['total_versions']}");
        $this->line("  • Versions attendues: {$validation['expected_versions']}");
        
        if (!$validation['is_consistent']) {
            $this->line('');
            $this->info('💡 Pour corriger les problèmes, exécutez: php artisan shop:optimize-versions init');
        }
        
        return $validation['is_consistent'] ? Command::SUCCESS : Command::FAILURE;
    }

    /**
     * Nettoie toutes les versions
     */
    private function clearVersions(): int
    {
        if (!$this->confirm('⚠️  Êtes-vous sûr de vouloir supprimer toutes les versions? Cette action est irréversible.')) {
            $this->info('Opération annulée.');
            return Command::SUCCESS;
        }
        
        $this->info('🧹 Nettoyage des versions...');
        
        $this->versionService->clearAllVersions();
        
        $this->info('✅ Toutes les versions ont été supprimées.');
        $this->line('💡 N\'oubliez pas de relancer: php artisan shop:optimize-versions init');
        
        return Command::SUCCESS;
    }
} 