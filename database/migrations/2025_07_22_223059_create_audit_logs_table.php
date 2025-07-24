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
        
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained();
            $table->uuid('guest_token')->nullable();
            $table->string('action', 100); // 'create', 'update', 'delete', 'login', etc.
            $table->string('model_type', 100)->nullable(); // Classe du modèle
            $table->bigInteger('model_id')->nullable(); // ID du modèle
            
            // Use jsonb for PostgreSQL, json for others
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('old_values')->nullable(); // Valeurs avant modification
                $table->jsonb('new_values')->nullable(); // Valeurs après modification
            } else {
                $table->json('old_values')->nullable(); // Valeurs avant modification
                $table->json('new_values')->nullable(); // Valeurs après modification
            }
            
            $table->text('description')->nullable();
            $table->ipAddress('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('created_at')->useCurrent();
            
            // Index
            $table->index('user_id');
            $table->index('guest_token');
            $table->index('action');
            $table->index('model_type');
            $table->index('model_id');
            $table->index('created_at');
        });
        
        // PostgreSQL-specific: Composite indexes and Row Level Security
        if (DB::getDriverName() === 'pgsql') {
            // Index composites pour les requêtes fréquentes
            DB::statement('CREATE INDEX idx_audit_model_lookup ON laravel.audit_logs(model_type, model_id)');
            DB::statement('CREATE INDEX idx_audit_user_action ON laravel.audit_logs(user_id, action, created_at DESC)');
            
            // Activer RLS
            DB::statement('ALTER TABLE laravel.audit_logs ENABLE ROW LEVEL SECURITY');
            
            // Politique pour l'accès admin uniquement
            DB::statement('
                CREATE POLICY "Admin read access to audit logs" ON laravel.audit_logs
                FOR SELECT USING (
                    EXISTS (
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
        Schema::dropIfExists('audit_logs');
    }
};
