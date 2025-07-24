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
        
        Schema::create('categories', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->string('slug')->unique();
            $table->unsignedBigInteger('parent_id')->nullable();
            $table->integer('position')->default(0);
            $table->boolean('is_active')->default(true);
            $table->string('icon', 50)->nullable();
            $table->timestamps();
            
            // Index
            $table->index('slug');
            $table->index('parent_id');
            $table->index('is_active');
            
            // Foreign key
            $table->foreign('parent_id')->references('id')->on('categories')->onDelete('cascade');
        });
        
        // PostgreSQL-specific: Row Level Security
        if (DB::getDriverName() === 'pgsql') {
            // Activer RLS
            DB::statement('ALTER TABLE laravel.categories ENABLE ROW LEVEL SECURITY');
            
            // Politique pour l'accès public en lecture
            DB::statement('
                CREATE POLICY "Public read access to active categories" ON laravel.categories
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
        Schema::dropIfExists('categories');
    }
};
