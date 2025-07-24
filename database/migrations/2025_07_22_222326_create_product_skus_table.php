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
        
        Schema::create('product_skus', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_id')->constrained()->onDelete('cascade');
            $table->string('sku', 100)->unique();
            $table->decimal('purchase_price', 10, 2)->nullable();
            $table->decimal('selling_price', 10, 2);
            $table->decimal('compare_at_price', 10, 2)->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->integer('reserved_quantity')->default(0);
            $table->integer('low_stock_threshold')->default(10);
            $table->integer('weight_grams')->nullable();
            $table->boolean('is_variable_weight')->default(false);
            $table->integer('min_weight_grams')->nullable();
            $table->integer('max_weight_grams')->nullable();
            
            // Use jsonb for PostgreSQL, json for others
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('images')->nullable();
            } else {
                $table->json('images')->nullable();
            }
            
            $table->timestamps();
            
            // Index
            $table->index('product_id');
            $table->index('sku');
            $table->index(['stock_quantity', 'reserved_quantity']);
        });
        
        // PostgreSQL-specific: Partial indexes and Row Level Security
        if (DB::getDriverName() === 'pgsql') {
            // Index composites pour les requêtes fréquentes
            DB::statement('CREATE INDEX idx_skus_product_active ON laravel.product_skus(product_id, stock_quantity) WHERE stock_quantity > 0');
            
            // Index partiel pour les produits en promotion
            DB::statement('CREATE INDEX idx_products_promo ON laravel.product_skus(product_id) WHERE compare_at_price IS NOT NULL');
            
            // Activer RLS
            DB::statement('ALTER TABLE laravel.product_skus ENABLE ROW LEVEL SECURITY');
            
            // Politique pour l'accès public en lecture
            DB::statement('
                CREATE POLICY "Public read access to product SKUs" ON laravel.product_skus
                FOR SELECT USING (EXISTS (
                    SELECT 1 FROM laravel.products 
                    WHERE products.id = product_skus.product_id 
                    AND products.is_active = true
                ))
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
        Schema::dropIfExists('product_skus');
    }
};
