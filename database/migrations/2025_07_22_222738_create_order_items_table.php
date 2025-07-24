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
        
        Schema::create('order_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->onDelete('cascade');
            $table->foreignId('product_id')->nullable()->constrained();
            $table->foreignId('product_sku_id')->nullable()->constrained();
            $table->string('product_name'); // Sauvegarde du nom au moment de la commande
            $table->string('product_sku')->nullable(); // Sauvegarde du SKU
            $table->decimal('price', 10, 2); // Prix unitaire au moment de la commande
            $table->decimal('quantity', 10, 3); // Quantité (permet les décimales pour le poids)
            $table->string('unit', 20); // 'piece', 'kg', 'g', etc.
            $table->decimal('subtotal', 10, 2); // Sous-total de la ligne
            
            // Pour produits au poids variable
            $table->decimal('estimated_quantity', 10, 3)->nullable();
            $table->decimal('estimated_price', 10, 2)->nullable();
            $table->decimal('final_quantity', 10, 3)->nullable(); // Quantité réelle après pesée
            $table->decimal('final_price', 10, 2)->nullable(); // Prix final après pesée
            
            // Use jsonb for PostgreSQL, json for others
            if (DB::getDriverName() === 'pgsql') {
                $table->jsonb('product_attributes')->nullable(); // Attributs du produit
            } else {
                $table->json('product_attributes')->nullable(); // Attributs du produit
            }
            
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Index
            $table->index('order_id');
            $table->index('product_id');
            $table->index('product_sku_id');
        });
        
        // PostgreSQL-specific: Row Level Security
        if (DB::getDriverName() === 'pgsql') {
            // Activer RLS
            DB::statement('ALTER TABLE laravel.order_items ENABLE ROW LEVEL SECURITY');
            
            // Politique pour l'accès admin uniquement
            DB::statement('
                CREATE POLICY "Admin full access to order items" ON laravel.order_items
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
        Schema::dropIfExists('order_items');
    }
};
