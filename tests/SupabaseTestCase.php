<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Support\Facades\DB;

abstract class SupabaseTestCase extends BaseTestCase
{
    /**
     * Indicates whether the default seeder should run before each test.
     *
     * @var bool
     */
    protected $seed = false;

    protected function setUp(): void
    {
        parent::setUp();
        
        // S'assurer que nous utilisons le bon schéma pour les tests
        if (config('database.default') === 'pgsql') {
            DB::statement('SET search_path TO ' . config('database.connections.pgsql.search_path'));
        }
        
        // Utiliser une transaction pour isoler les tests
        DB::beginTransaction();
    }

    protected function tearDown(): void
    {
        // Rollback de la transaction après chaque test
        DB::rollback();
        
        parent::tearDown();
    }
}