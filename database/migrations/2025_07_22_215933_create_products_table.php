<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // PostgreSQL-specific: Set search path
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('SET search_path TO laravel, public');
        }
        
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->foreignId('category_id')->constrained();
            $table->string('ref', 50)->nullable();
            $table->string('barcode', 50)->nullable()->unique();
            $table->string('name');
            $table->string('slug')->unique();
            $table->text('description')->nullable();
            
            // Use jsonb for PostgreSQL, json for others
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('meta_data')->nullable();
            } else {
                $table->json('meta_data')->nullable();
            }
            
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            
            // Index
            $table->index('category_id');
            $table->index('ref');
            $table->index('slug');
            $table->index('is_active');
        });
        
        // PostgreSQL-specific: Full-text search index and Row Level Security
        if (DB::getDriverName() === 'pgsql') {
            // Créer un index GIN pour la recherche full-text
            DB::statement('CREATE INDEX idx_products_search ON laravel.products USING gin(to_tsvector(\'french\', name || \' \' || COALESCE(description, \'\')))');
            
            // Activer RLS
            DB::statement('ALTER TABLE laravel.products ENABLE ROW LEVEL SECURITY');
            
            // Politique pour l'accès public en lecture
            DB::statement('
                CREATE POLICY "Public read access to active products" ON laravel.products
                FOR SELECT USING (is_active = true)
            ');
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        if (DB::getDriverName() === 'pgsql') {
            DB::statement('SET search_path TO laravel, public');
        }
        Schema::dropIfExists('products');
    }
};
