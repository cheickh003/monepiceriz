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
        
        Schema::create('product_sku_attributes', function (Blueprint $table) {
            $table->foreignId('product_sku_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_attribute_value_id')->constrained()->onDelete('cascade');
            
            // Clé primaire composite
            $table->primary(['product_sku_id', 'product_attribute_value_id']);
        });
        
        // PostgreSQL-specific: Row Level Security
        if (DB::getDriverName() === 'pgsql') {
            // Activer RLS
            DB::statement('ALTER TABLE laravel.product_sku_attributes ENABLE ROW LEVEL SECURITY');
            
            // Politique pour l'accès public en lecture
            DB::statement('
                CREATE POLICY "Public read access to SKU attributes" ON laravel.product_sku_attributes
                FOR SELECT USING (EXISTS (
                    SELECT 1 FROM laravel.product_skus 
                    JOIN laravel.products ON products.id = product_skus.product_id
                    WHERE product_skus.id = product_sku_attributes.product_sku_id 
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
        Schema::dropIfExists('product_sku_attributes');
    }
};
