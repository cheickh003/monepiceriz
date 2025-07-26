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
        Schema::table('products', function (Blueprint $table) {
            $table->integer('position')->default(0)->after('is_variable_weight');
        });
        
        // Migration de données : initialiser les valeurs de position pour les produits existants
        // Les produits sont ordonnés par ID (ordre de création) pour assigner les positions
        DB::statement('UPDATE products SET position = id WHERE position = 0');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('position');
        });
    }
};
