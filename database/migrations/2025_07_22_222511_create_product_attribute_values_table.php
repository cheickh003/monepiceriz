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
        
        Schema::create('product_attribute_values', function (Blueprint $table) {
            $table->id();
            $table->foreignId('product_attribute_id')->constrained('product_attributes')->onDelete('cascade');
            $table->string('value');
            $table->string('label')->nullable();
            $table->string('hex_color', 7)->nullable();
            $table->integer('position')->default(0);
            $table->timestamps();
            
            // Index
            $table->index('product_attribute_id');
        });
        
        // PostgreSQL-specific: Row Level Security
        if (DB::getDriverName() === 'pgsql') {
            // Activer RLS
            DB::statement('ALTER TABLE laravel.product_attribute_values ENABLE ROW LEVEL SECURITY');
            
            // Politique pour l'accès public en lecture
            DB::statement('
                CREATE POLICY "Public read access to attribute values" ON laravel.product_attribute_values
                FOR SELECT USING (true)
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
        Schema::dropIfExists('product_attribute_values');
    }
};
