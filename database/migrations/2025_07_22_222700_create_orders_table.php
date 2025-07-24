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
        
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_number', 20)->unique();
            $table->foreignId('customer_id')->nullable()->constrained();
            $table->enum('status', ['pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled']);
            $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded']);
            $table->decimal('subtotal', 10, 2);
            $table->decimal('delivery_fee', 10, 2)->default(0);
            $table->decimal('total_amount', 10, 2);
            $table->decimal('estimated_total', 10, 2)->nullable(); // Pour produits variables
            $table->decimal('final_total', 10, 2)->nullable(); // Total final après pesée
            $table->enum('delivery_method', ['pickup', 'delivery']);
            $table->text('delivery_address')->nullable(); // Sera chiffré
            $table->text('delivery_instructions')->nullable();
            $table->date('pickup_date')->nullable();
            $table->string('pickup_time_slot', 50)->nullable();
            $table->string('payment_method', 50)->nullable();
            $table->string('transaction_id', 100)->nullable();
            $table->string('payment_token')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            $table->timestamp('completed_at')->nullable();
            
            // Index
            $table->index('order_number');
            $table->index('customer_id');
            $table->index('status');
            $table->index('payment_status');
            $table->index('transaction_id');
            $table->index('created_at');
        });
        
        // PostgreSQL-specific: Composite indexes and Row Level Security
        if (DB::getDriverName() === 'pgsql') {
            // Index composites pour les requêtes fréquentes
            DB::statement('CREATE INDEX idx_orders_status_date ON laravel.orders(status, created_at DESC)');
            DB::statement('CREATE INDEX idx_orders_customer_status ON laravel.orders(customer_id, status)');
            
            // Activer RLS
            DB::statement('ALTER TABLE laravel.orders ENABLE ROW LEVEL SECURITY');
            
            // Politique pour l'accès admin uniquement
            DB::statement('
                CREATE POLICY "Admin full access to orders" ON laravel.orders
                FOR ALL USING (
                    EXISTS (
                        SELECT 1 FROM laravel.users 
                        WHERE users.id = current_setting(\'app.current_user_id\', true)::bigint
                        AND users.role IN (\'admin\', \'manager\', \'staff\')
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
        Schema::dropIfExists('orders');
    }
};
