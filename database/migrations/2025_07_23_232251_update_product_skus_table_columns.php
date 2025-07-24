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
        Schema::table('product_skus', function (Blueprint $table) {
            // Add new columns
            $table->decimal('price_ht', 10, 2)->default(0)->after('purchase_price');
            $table->boolean('is_default')->default(false)->after('images');
            $table->decimal('weight', 10, 3)->nullable()->after('is_default');
        });
        
        // Rename selling_price to price_ttc
        Schema::table('product_skus', function (Blueprint $table) {
            $table->renameColumn('selling_price', 'price_ttc');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Rename back
        Schema::table('product_skus', function (Blueprint $table) {
            $table->renameColumn('price_ttc', 'selling_price');
        });
        
        // Remove added columns
        Schema::table('product_skus', function (Blueprint $table) {
            $table->dropColumn(['price_ht', 'is_default', 'weight']);
        });
    }
};
