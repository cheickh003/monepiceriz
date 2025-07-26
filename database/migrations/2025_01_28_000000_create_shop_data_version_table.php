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
        Schema::create('shop_data_version', function (Blueprint $table) {
            $table->id();
            $table->string('data_type')->unique(); // 'products', 'categories', 'orders', etc.
            $table->timestamp('last_updated_at');
            $table->string('version_hash', 32); // MD5 hash pour comparaison rapide
            $table->integer('change_count')->default(0); // Compteur de changements
            $table->timestamps();
            
            // Index pour les performances
            $table->index(['data_type', 'last_updated_at'], 'idx_data_type_updated_at');
            $table->index('version_hash', 'idx_version_hash');
            $table->index('last_updated_at', 'idx_last_updated_at');
            $table->index(['data_type', 'change_count'], 'idx_data_type_change_count');
        });
        
        // Insérer les données initiales
        DB::table('shop_data_version')->insert([
            [
                'data_type' => 'products',
                'last_updated_at' => now(),
                'version_hash' => md5('products_' . now()->timestamp),
                'change_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'data_type' => 'categories',
                'last_updated_at' => now(),
                'version_hash' => md5('categories_' . now()->timestamp),
                'change_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'data_type' => 'global',
                'last_updated_at' => now(),
                'version_hash' => md5('global_' . now()->timestamp),
                'change_count' => 0,
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ]);
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('shop_data_version');
    }
}; 