<?php

namespace Tests\Feature\Checkout;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use App\Domain\Order\Models\Order;
use App\Domain\Order\Models\OrderItem;
use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\ProductSku;
use App\Domain\Catalog\Models\Category;
use App\Jobs\SendOrderNotification;
use Illuminate\Support\Facades\Queue;
use Illuminate\Support\Facades\Http;

class CheckoutFlowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Créer une catégorie de base
        $this->category = Category::factory()->create([
            'name' => 'Alimentation',
            'slug' => 'alimentation',
        ]);
    }

    /** @test */
    public function customer_can_access_checkout_page_with_items_in_cart()
    {
        $response = $this->get('/shop/checkout');
        
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page
            ->component('Shop/Checkout')
            ->has('minimumOrderAmount')
            ->has('pickupTimeSlots')
        );
    }

    /** @test */
    public function checkout_requires_minimum_order_amount_for_delivery()
    {
        // Créer un produit avec un prix inférieur au minimum
        $product = Product::factory()->create(['category_id' => $this->category->id]);
        $sku = ProductSku::factory()->create([
            'product_id' => $product->id,
            'price_ttc' => 1000, // Moins que le minimum de 3000
            'stock_quantity' => 10,
        ]);

        $cartData = [
            'customer' => [
                'name' => 'Test Client',
                'phone' => '+2250700000000',
                'email' => 'test@example.com',
            ],
            'delivery' => [
                'method' => 'delivery',
                'address' => 'Cocody, Abidjan',
            ],
            'payment_method' => 'cash',
            'cart' => [
                'items' => [
                    [
                        'sku_id' => $sku->id,
                        'quantity' => 1,
                        'price' => 1000,
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/shop/checkout', $cartData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['delivery.method']);
    }

    /** @test */
    public function customer_can_complete_checkout_with_pickup()
    {
        Queue::fake();

        $product = Product::factory()->create(['category_id' => $this->category->id]);
        $sku = ProductSku::factory()->create([
            'product_id' => $product->id,
            'price_ttc' => 5000,
            'stock_quantity' => 10,
        ]);

        $cartData = [
            'customer' => [
                'name' => 'Jean Dupont',
                'phone' => '+2250700000000',
                'email' => 'jean@example.com',
            ],
            'delivery' => [
                'method' => 'pickup',
                'pickup_date' => now()->addDay()->format('Y-m-d'),
                'pickup_time_slot' => '09:00-12:00',
            ],
            'payment_method' => 'cash',
            'cart' => [
                'items' => [
                    [
                        'sku_id' => $sku->id,
                        'quantity' => 2,
                        'price' => 5000,
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/shop/checkout', $cartData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        // Vérifier la création de la commande
        $this->assertDatabaseHas('orders', [
            'customer_name' => 'Jean Dupont',
            'customer_phone' => '+2250700000000',
            'delivery_method' => 'pickup',
            'subtotal' => 10000,
            'delivery_fee' => 0,
            'total_amount' => 10000,
            'status' => Order::STATUS_PENDING,
        ]);

        // Vérifier l'envoi de notification
        Queue::assertPushed(SendOrderNotification::class);
    }

    /** @test */
    public function customer_can_complete_checkout_with_delivery()
    {
        Queue::fake();

        $product = Product::factory()->create(['category_id' => $this->category->id]);
        $sku = ProductSku::factory()->create([
            'product_id' => $product->id,
            'price_ttc' => 5000,
            'stock_quantity' => 10,
        ]);

        $cartData = [
            'customer' => [
                'name' => 'Marie Kouassi',
                'phone' => '+2250500000000',
                'email' => 'marie@example.com',
            ],
            'delivery' => [
                'method' => 'delivery',
                'address' => 'Riviera 3, Cocody, Abidjan',
                'notes' => 'Près de la pharmacie',
            ],
            'payment_method' => 'cash',
            'cart' => [
                'items' => [
                    [
                        'sku_id' => $sku->id,
                        'quantity' => 2,
                        'price' => 5000,
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/shop/checkout', $cartData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
        ]);

        // Vérifier la création de la commande avec frais de livraison
        $order = Order::where('customer_name', 'Marie Kouassi')->first();
        $this->assertNotNull($order);
        $this->assertEquals('delivery', $order->delivery_method);
        $this->assertGreaterThan(0, $order->delivery_fee);
        $this->assertEquals($order->subtotal + $order->delivery_fee, $order->total_amount);
    }

    /** @test */
    public function checkout_with_variable_weight_products_creates_proper_order()
    {
        Queue::fake();

        // Créer un produit à poids variable (viande)
        $product = Product::factory()->create([
            'category_id' => $this->category->id,
            'name' => 'Bœuf - Filet',
        ]);
        
        $sku = ProductSku::factory()->create([
            'product_id' => $product->id,
            'name' => 'Au poids',
            'price_ttc' => 8000, // Prix au kg
            'is_variable_weight' => true,
            'stock_quantity' => 100,
        ]);

        $cartData = [
            'customer' => [
                'name' => 'Paul Koffi',
                'phone' => '+2250100000000',
            ],
            'delivery' => [
                'method' => 'pickup',
                'pickup_date' => now()->addDay()->format('Y-m-d'),
                'pickup_time_slot' => '14:00-17:00',
            ],
            'payment_method' => 'cash',
            'cart' => [
                'items' => [
                    [
                        'sku_id' => $sku->id,
                        'quantity' => 1.5, // 1.5 kg
                        'price' => 8000,
                        'estimated_weight' => 1500, // 1500g
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/shop/checkout', $cartData);

        $response->assertStatus(200);

        // Vérifier que la commande nécessite une confirmation de poids
        $order = Order::where('customer_name', 'Paul Koffi')->first();
        $this->assertTrue($order->requires_weight_confirmation);
        $this->assertNull($order->weight_confirmed_at);

        // Vérifier l'item avec poids estimé
        $item = $order->items()->first();
        $this->assertTrue($item->is_variable_weight);
        $this->assertEquals(1500, $item->estimated_weight);
        $this->assertNull($item->actual_weight);
    }

    /** @test */
    public function checkout_validates_phone_number_format()
    {
        $product = Product::factory()->create(['category_id' => $this->category->id]);
        $sku = ProductSku::factory()->create([
            'product_id' => $product->id,
            'price_ttc' => 5000,
        ]);

        $cartData = [
            'customer' => [
                'name' => 'Test Client',
                'phone' => '123456', // Format invalide
                'email' => 'test@example.com',
            ],
            'delivery' => [
                'method' => 'pickup',
                'pickup_date' => now()->addDay()->format('Y-m-d'),
                'pickup_time_slot' => '09:00-12:00',
            ],
            'payment_method' => 'cash',
            'cart' => [
                'items' => [
                    [
                        'sku_id' => $sku->id,
                        'quantity' => 1,
                        'price' => 5000,
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/shop/checkout', $cartData);

        $response->assertStatus(422);
        $response->assertJsonValidationErrors(['customer.phone']);
    }

    /** @test */
    public function checkout_with_card_payment_initializes_cinetpay()
    {
        // Mock CinetPay response
        Http::fake([
            '*cinetpay.com*' => Http::response([
                'code' => '201',
                'data' => [
                    'payment_url' => 'https://checkout.cinetpay.com/payment/test123',
                ]
            ], 200),
        ]);

        $product = Product::factory()->create(['category_id' => $this->category->id]);
        $sku = ProductSku::factory()->create([
            'product_id' => $product->id,
            'price_ttc' => 5000,
            'stock_quantity' => 10,
        ]);

        $cartData = [
            'customer' => [
                'name' => 'Sophie Yao',
                'phone' => '+2250700000000',
                'email' => 'sophie@example.com',
            ],
            'delivery' => [
                'method' => 'pickup',
                'pickup_date' => now()->addDay()->format('Y-m-d'),
                'pickup_time_slot' => '09:00-12:00',
            ],
            'payment_method' => 'card',
            'cart' => [
                'items' => [
                    [
                        'sku_id' => $sku->id,
                        'quantity' => 2,
                        'price' => 5000,
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/shop/checkout', $cartData);

        $response->assertStatus(200);
        $response->assertJson([
            'success' => true,
            'redirect' => true,
        ]);
        $response->assertJsonStructure(['payment_url']);
    }

    /** @test */
    public function stock_is_decremented_after_successful_checkout()
    {
        Queue::fake();

        $product = Product::factory()->create(['category_id' => $this->category->id]);
        $sku = ProductSku::factory()->create([
            'product_id' => $product->id,
            'price_ttc' => 5000,
            'stock_quantity' => 10,
        ]);

        $initialStock = $sku->stock_quantity;

        $cartData = [
            'customer' => [
                'name' => 'Test Client',
                'phone' => '+2250700000000',
            ],
            'delivery' => [
                'method' => 'pickup',
                'pickup_date' => now()->addDay()->format('Y-m-d'),
                'pickup_time_slot' => '09:00-12:00',
            ],
            'payment_method' => 'cash',
            'cart' => [
                'items' => [
                    [
                        'sku_id' => $sku->id,
                        'quantity' => 3,
                        'price' => 5000,
                    ]
                ]
            ]
        ];

        $this->postJson('/shop/checkout', $cartData);

        // Vérifier que le stock a été décrémenté
        $sku->refresh();
        $this->assertEquals($initialStock - 3, $sku->stock_quantity);
    }

    /** @test */
    public function checkout_fails_when_insufficient_stock()
    {
        $product = Product::factory()->create(['category_id' => $this->category->id]);
        $sku = ProductSku::factory()->create([
            'product_id' => $product->id,
            'price_ttc' => 5000,
            'stock_quantity' => 2, // Stock insuffisant
        ]);

        $cartData = [
            'customer' => [
                'name' => 'Test Client',
                'phone' => '+2250700000000',
            ],
            'delivery' => [
                'method' => 'pickup',
                'pickup_date' => now()->addDay()->format('Y-m-d'),
                'pickup_time_slot' => '09:00-12:00',
            ],
            'payment_method' => 'cash',
            'cart' => [
                'items' => [
                    [
                        'sku_id' => $sku->id,
                        'quantity' => 5, // Plus que le stock disponible
                        'price' => 5000,
                    ]
                ]
            ]
        ];

        $response = $this->postJson('/shop/checkout', $cartData);

        $response->assertStatus(422);
        $response->assertJsonFragment([
            'success' => false,
        ]);
    }

    /** @test */
    public function delivery_fee_calculation_endpoint_works()
    {
        $response = $this->postJson('/shop/checkout/calculate-delivery-fee', [
            'address' => 'Riviera 3, Cocody, Abidjan',
            'subtotal' => 5000,
        ]);

        $response->assertStatus(200);
        $response->assertJsonStructure([
            'success',
            'delivery_fee',
            'formatted_fee',
        ]);
    }
}