<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Rename ref to reference
            $table->renameColumn('ref', 'reference');
            
            // Add missing columns
            $table->string('brand')->nullable()->after('slug');
            $table->boolean('is_featured')->default(false)->after('is_active');
            $table->boolean('is_variable_weight')->default(false)->after('is_featured');
            $table->string('meta_title')->nullable()->after('description');
            $table->text('meta_description')->nullable()->after('meta_title');
            $table->json('meta_keywords')->nullable()->after('meta_description');
            
            // Drop meta_data as we now have individual meta fields
            $table->dropColumn('meta_data');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            // Rename back
            $table->renameColumn('reference', 'ref');
            
            // Add back meta_data
            $table->json('meta_data')->nullable()->after('description');
            
            // Remove added columns
            $table->dropColumn([
                'brand',
                'is_featured',
                'is_variable_weight',
                'meta_title',
                'meta_description',
                'meta_keywords'
            ]);
        });
    }
};
