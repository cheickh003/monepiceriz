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
        
        Schema::create('payment_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained();
            $table->string('transaction_id', 100)->nullable();
            $table->string('payment_method', 50); // 'cinetpay', 'cash_on_delivery'
            $table->enum('action', ['initiate', 'preauth', 'capture', 'refund', 'void', 'callback']);
            $table->enum('status', ['pending', 'success', 'failed', 'cancelled']);
            $table->decimal('amount', 10, 2);
            $table->string('currency', 3)->default('XOF');
            
            // Use jsonb for PostgreSQL, json for others
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('request_data')->nullable(); // Données envoyées
                $table->jsonb('response_data')->nullable(); // Réponse reçue
            } else {
                $table->json('request_data')->nullable(); // Données envoyées
                $table->json('response_data')->nullable(); // Réponse reçue
            }
            
            $table->text('error_message')->nullable();
            $table->string('reference_number')->nullable(); // Référence externe
            $table->ipAddress('ip_address')->nullable();
            $table->timestamps();
            
            // Index
            $table->index('order_id');
            $table->index('transaction_id');
            $table->index('payment_method');
            $table->index('action');
            $table->index('status');
            $table->index('created_at');
        });
        
        // PostgreSQL-specific: Composite indexes and Row Level Security
        if (DB::getDriverName() === 'pgsql') {
            // Index composite pour les recherches fréquentes
            DB::statement('CREATE INDEX idx_payment_order_status ON laravel.payment_logs(order_id, status)');
            
            // Activer RLS
            DB::statement('ALTER TABLE laravel.payment_logs ENABLE ROW LEVEL SECURITY');
            
            // Politique pour l'accès admin uniquement
            DB::statement('
                CREATE POLICY "Admin full access to payment logs" ON laravel.payment_logs
                FOR ALL USING (
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
        Schema::dropIfExists('payment_logs');
    }
};
