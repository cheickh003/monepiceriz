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
        
        Schema::create('customers', function (Blueprint $table) {
            $table->id();
            $table->uuid('guest_token')->unique();
            $table->string('name'); // Sera chiffré
            $table->string('phone', 50); // Sera chiffré
            $table->string('phone_hash', 64); // Hash pour recherche
            $table->string('email')->nullable(); // Sera chiffré
            $table->timestamps();
            
            // Index
            $table->index('phone_hash');
            $table->index('guest_token');
        });
        
        // PostgreSQL-specific: Row Level Security
        if (DB::getDriverName() === 'pgsql') {
            // Activer RLS
            DB::statement('ALTER TABLE laravel.customers ENABLE ROW LEVEL SECURITY');
            
            // Politique pour l'accès restreint (admin seulement ou le client lui-même via token)
            DB::statement('
                CREATE POLICY "Customers can view own data" ON laravel.customers
                FOR SELECT USING (
                    guest_token = current_setting(\'app.current_guest_token\', true)::uuid
                    OR EXISTS (
                        SELECT 1 FROM laravel.users 
                        WHERE users.id = current_setting(\'app.current_user_id\', true)::bigint
                        AND users.role IN (\'admin\', \'manager\')
                    )
                )
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
        Schema::dropIfExists('customers');
    }
};
