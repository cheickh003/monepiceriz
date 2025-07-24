# Phase 2 : Workflow de Commande et Intégrations

**Durée estimée :** 3-4 semaines  
**Objectif :** Implémenter l'ensemble du processus de commande, de l'ajout au panier jusqu'au paiement.

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Architecture du workflow](#architecture-du-workflow)
3. [Tâches détaillées](#tâches-détaillées)
4. [Intégrations tierces](#intégrations-tierces)
5. [Gestion des cas spéciaux](#gestion-des-cas-spéciaux)
6. [Tests et validation](#tests-et-validation)

## Vue d'ensemble

La Phase 2 transforme le catalogue statique en une boutique e-commerce fonctionnelle avec panier, checkout et paiement.

### Livrables attendus
- [ ] Panier fonctionnel avec persistance localStorage
- [ ] Processus checkout complet (guest)
- [ ] Intégration Yango opérationnelle
- [ ] Intégration CinetPay avec webhooks
- [ ] Gestion des produits à poids variable
- [ ] Interface admin pour les commandes

## Architecture du workflow

### Diagramme de flux
```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Panier    │────▶│   Checkout   │────▶│  Livraison  │
└─────────────┘     └──────────────┘     └─────────────┘
                            │                     │
                            ▼                     ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  Validation  │     │   Paiement  │
                    └──────────────┘     └─────────────┘
                            │                     │
                            ▼                     ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  Commande    │────▶│   Succès    │
                    └──────────────┘     └─────────────┘
```

## Tâches détaillées

### P2.1 - Logique Panier (LocalStorage + API)

#### Hook React pour le panier
```jsx
// resources/js/Hooks/useCart.js
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useCartStore = create(
  persist(
    (set, get) => ({
      items: [],
      
      addItem: (sku, quantity = 1) => {
        set((state) => {
          const existingItem = state.items.find(item => item.sku.id === sku.id)
          
          if (existingItem) {
            return {
              items: state.items.map(item =>
                item.sku.id === sku.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              )
            }
          }
          
          return {
            items: [...state.items, { sku, quantity }]
          }
        })
      },
      
      updateQuantity: (skuId, quantity) => {
        set((state) => ({
          items: state.items.map(item =>
            item.sku.id === skuId
              ? { ...item, quantity }
              : item
          ).filter(item => item.quantity > 0)
        }))
      },
      
      removeItem: (skuId) => {
        set((state) => ({
          items: state.items.filter(item => item.sku.id !== skuId)
        }))
      },
      
      clearCart: () => set({ items: [] }),
      
      getTotal: () => {
        const items = get().items
        return items.reduce((total, item) => 
          total + (item.sku.selling_price * item.quantity), 0
        )
      },
      
      getItemCount: () => {
        const items = get().items
        return items.reduce((count, item) => count + item.quantity, 0)
      }
    }),
    {
      name: 'monepiceriz-cart',
    }
  )
)

export default useCartStore
```

#### Composant Panier
```jsx
// resources/js/Components/shop/Cart.jsx
import useCartStore from '@/Hooks/useCart'
import { CartItem } from './CartItem'
import { Button } from '@/Components/ui/button'
import { formatPrice } from '@/Utils/formatters'

export function Cart() {
    const { items, getTotal, clearCart } = useCartStore()
    
    if (items.length === 0) {
        return (
            <div className="text-center py-8">
                <p className="text-gray-500">Votre panier est vide</p>
            </div>
        )
    }
    
    return (
        <div className="space-y-4">
            {items.map((item) => (
                <CartItem key={item.sku.id} item={item} />
            ))}
            
            <div className="border-t pt-4">
                <div className="flex justify-between text-lg font-semibold">
                    <span>Total</span>
                    <span>{formatPrice(getTotal())} F CFA</span>
                </div>
            </div>
            
            <div className="flex gap-4">
                <Button variant="outline" onClick={clearCart}>
                    Vider le panier
                </Button>
                <Button href="/checkout" className="flex-1">
                    Commander
                </Button>
            </div>
        </div>
    )
}
```

### P2.2 - Migrations Commandes

#### Tables orders et order_items
```php
// database/migrations/create_orders_table.php
Schema::create('orders', function (Blueprint $table) {
    $table->id();
    $table->string('order_number', 20)->unique();
    $table->foreignId('customer_id')->nullable();
    $table->enum('status', ['pending', 'confirmed', 'processing', 'ready', 'completed', 'cancelled']);
    $table->enum('payment_status', ['pending', 'paid', 'failed', 'refunded']);
    $table->decimal('subtotal', 10, 2);
    $table->decimal('delivery_fee', 10, 2)->default(0);
    $table->decimal('total_amount', 10, 2);
    $table->decimal('estimated_total', 10, 2)->nullable();
    $table->decimal('final_total', 10, 2)->nullable();
    $table->enum('delivery_method', ['pickup', 'delivery']);
    $table->text('delivery_address')->nullable();
    $table->text('delivery_instructions')->nullable();
    $table->date('pickup_date')->nullable();
    $table->string('pickup_time_slot', 50)->nullable();
    $table->string('payment_method', 50)->nullable();
    $table->string('transaction_id', 100)->nullable()->index();
    $table->string('payment_token', 255)->nullable();
    $table->text('notes')->nullable();
    $table->timestamps();
    $table->timestamp('completed_at')->nullable();
    
    $table->index(['status', 'created_at']);
    $table->index('customer_id');
});

// database/migrations/create_order_items_table.php
Schema::create('order_items', function (Blueprint $table) {
    $table->id();
    $table->foreignId('order_id')->constrained()->onDelete('cascade');
    $table->foreignId('product_sku_id')->constrained();
    $table->string('product_name');
    $table->decimal('quantity', 10, 3);
    $table->decimal('unit_price', 10, 2);
    $table->integer('estimated_weight')->nullable();
    $table->integer('actual_weight')->nullable();
    $table->decimal('line_total', 10, 2);
    $table->timestamps();
});
```

### P2.3 - Page Panier

#### Interface panier complète
```jsx
// resources/js/Pages/Shop/Cart/Index.jsx
import { Head } from '@inertiajs/react'
import ShopLayout from '@/Layouts/ShopLayout'
import { Cart } from '@/Components/shop/Cart'
import { CartSummary } from '@/Components/shop/CartSummary'

export default function CartPage() {
    return (
        <ShopLayout>
            <Head title="Panier" />
            
            <div className="max-w-7xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Mon panier</h1>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <Cart />
                    </div>
                    
                    <div>
                        <CartSummary />
                    </div>
                </div>
            </div>
        </ShopLayout>
    )
}
```

### P2.4 - Checkout Form (Guest)

#### Formulaire de commande
```jsx
// resources/js/Pages/Shop/Checkout/Index.jsx
import { useForm } from '@inertiajs/react'
import { useState, useEffect } from 'react'
import useCartStore from '@/Hooks/useCart'
import { Input } from '@/Components/ui/input'
import { Label } from '@/Components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/Components/ui/radio-group'
import { Button } from '@/Components/ui/button'

export default function CheckoutPage({ deliveryFee }) {
    const { items, getTotal } = useCartStore()
    const [deliveryMethod, setDeliveryMethod] = useState('pickup')
    const [estimatedDeliveryFee, setEstimatedDeliveryFee] = useState(0)
    
    const { data, setData, post, processing, errors } = useForm({
        customer_name: '',
        customer_phone: '',
        customer_email: '',
        delivery_method: 'pickup',
        delivery_address: '',
        delivery_instructions: '',
        pickup_date: '',
        pickup_time_slot: '',
        items: items.map(item => ({
            sku_id: item.sku.id,
            quantity: item.quantity
        }))
    })
    
    const handleSubmit = (e) => {
        e.preventDefault()
        
        // Validation montant minimum pour livraison
        if (data.delivery_method === 'delivery' && getTotal() < 3000) {
            alert('Le montant minimum pour la livraison est de 3000 F CFA')
            return
        }
        
        post('/checkout', {
            preserveScroll: true,
            onSuccess: (page) => {
                // Redirection vers CinetPay
                window.location.href = page.props.payment_url
            }
        })
    }
    
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Formulaire de checkout */}
        </form>
    )
}
```

### P2.5 - Service Yango

#### Intégration API Yango
```php
// app/Domain/Shipping/Services/YangoService.php
namespace App\Domain\Shipping\Services;

use Illuminate\Support\Facades\Http;
use App\Domain\Shipping\Data\DeliveryEstimate;

class YangoService
{
    private string $apiKey;
    private string $apiUrl;
    
    public function __construct()
    {
        $this->apiKey = config('services.yango.api_key');
        $this->apiUrl = config('services.yango.api_url');
    }
    
    public function estimateDeliveryFee(string $fromAddress, string $toAddress): DeliveryEstimate
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Accept' => 'application/json',
        ])->post($this->apiUrl . '/estimate', [
            'from' => [
                'address' => $fromAddress,
                'country' => 'CI',
                'city' => 'Abidjan'
            ],
            'to' => [
                'address' => $toAddress,
                'country' => 'CI',
                'city' => 'Abidjan'
            ],
            'vehicle_type' => 'motorcycle' // Moto pour livraison rapide
        ]);
        
        if ($response->successful()) {
            $data = $response->json();
            
            return new DeliveryEstimate(
                fee: $data['price']['amount'],
                estimatedTime: $data['eta']['duration'],
                distance: $data['distance']['value']
            );
        }
        
        throw new \Exception('Unable to calculate delivery fee');
    }
    
    public function createDelivery(array $orderData): string
    {
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $this->apiKey,
            'Accept' => 'application/json',
        ])->post($this->apiUrl . '/deliveries', [
            'order_id' => $orderData['order_id'],
            'pickup' => [
                'address' => config('shop.store_address'),
                'contact' => [
                    'name' => config('shop.store_name'),
                    'phone' => config('shop.store_phone')
                ]
            ],
            'dropoff' => [
                'address' => $orderData['delivery_address'],
                'contact' => [
                    'name' => $orderData['customer_name'],
                    'phone' => $orderData['customer_phone']
                ]
            ],
            'items' => $orderData['items'],
            'payment_method' => 'prepaid',
            'webhook_url' => config('app.url') . '/api/yango/webhook'
        ]);
        
        if ($response->successful()) {
            return $response->json()['delivery_id'];
        }
        
        throw new \Exception('Failed to create delivery');
    }
}
```

### P2.6 - Service CinetPay

#### Intégration complète avec webhooks
```php
// app/Domain/Payment/Services/CinetPayService.php
namespace App\Domain\Payment\Services;

use App\Models\Order;
use CinetPay\CinetPay;
use Illuminate\Support\Facades\Log;

class CinetPayService
{
    protected $cinetpay;
    
    public function __construct()
    {
        $this->cinetpay = new CinetPay(
            config('cinetpay.site_id'),
            config('cinetpay.api_key')
        );
    }
    
    public function initializePayment(Order $order): array
    {
        $transactionId = 'CMD-' . $order->id . '-' . time();
        
        // Pour les produits à poids variable, utiliser la pré-autorisation
        $paymentMethod = $order->hasVariableWeightProducts() ? 'PREAUTH' : 'PAYMENT';
        
        $paymentData = [
            'transaction_id' => $transactionId,
            'amount' => $order->total_amount,
            'currency' => 'XOF',
            'description' => 'Commande MonEpice&Riz #' . $order->order_number,
            'customer_name' => $order->customer_name,
            'customer_email' => $order->customer_email ?? 'client@monepiceriz.com',
            'customer_phone_number' => $order->customer_phone,
            'customer_address' => $order->delivery_address,
            'customer_city' => 'Abidjan',
            'customer_country' => 'CI',
            'notify_url' => config('cinetpay.notify_url'),
            'return_url' => config('cinetpay.return_url'),
            'cancel_url' => config('cinetpay.cancel_url'),
            'channels' => 'ALL',
            'payment_method' => $paymentMethod,
            'metadata' => json_encode([
                'order_id' => $order->id,
                'has_variable_weight' => $order->hasVariableWeightProducts()
            ])
        ];
        
        $result = $this->cinetpay->generatePaymentLink($paymentData);
        
        if ($result['code'] == '201') {
            $order->update([
                'transaction_id' => $transactionId,
                'payment_token' => $result['data']['payment_token']
            ]);
            
            Log::channel('cinetpay')->info('Payment initialized', [
                'order_id' => $order->id,
                'transaction_id' => $transactionId
            ]);
            
            return [
                'success' => true,
                'payment_url' => $result['data']['payment_url'],
                'payment_token' => $result['data']['payment_token']
            ];
        }
        
        Log::channel('cinetpay')->error('Payment initialization failed', [
            'order_id' => $order->id,
            'error' => $result
        ]);
        
        return [
            'success' => false,
            'message' => $result['message'] ?? 'Erreur lors de l\'initialisation du paiement'
        ];
    }
}
```

### P2.7 - Pré-autorisation pour produits variables

#### Workflow spécifique
```php
// app/Domain/Order/Services/VariableWeightService.php
namespace App\Domain\Order\Services;

use App\Models\Order;
use App\Domain\Payment\Services\CinetPayService;

class VariableWeightService
{
    public function __construct(
        private CinetPayService $cinetPayService
    ) {}
    
    public function finalizeOrder(Order $order, array $actualWeights): bool
    {
        $finalAmount = 0;
        
        // Mise à jour des poids réels
        foreach ($order->items as $item) {
            if ($item->productSku->is_variable_weight) {
                $actualWeight = $actualWeights[$item->id] ?? $item->estimated_weight;
                
                $item->update([
                    'actual_weight' => $actualWeight,
                    'line_total' => ($item->unit_price * $actualWeight) / 1000 // Prix au kg
                ]);
                
                $finalAmount += $item->line_total;
            } else {
                $finalAmount += $item->line_total;
            }
        }
        
        // Ajouter les frais de livraison
        $finalAmount += $order->delivery_fee;
        
        // Capturer le montant exact
        $captureResult = $this->cinetPayService->capturePayment(
            $order->transaction_id,
            $finalAmount
        );
        
        if ($captureResult['success']) {
            $order->update([
                'final_total' => $finalAmount,
                'status' => 'processing'
            ]);
            
            return true;
        }
        
        return false;
    }
}
```

### P2.8 - Admin : Gestion des commandes

#### Interface d'administration
```jsx
// resources/js/Pages/Admin/Orders/Index.jsx
import { useState } from 'react'
import AdminLayout from '@/Layouts/AdminLayout'
import { DataTable } from '@/Components/ui/data-table'
import { Badge } from '@/Components/ui/badge'
import { formatPrice, formatDate } from '@/Utils/formatters'

export default function OrdersIndex({ orders }) {
    const columns = [
        {
            header: 'N° Commande',
            accessor: 'order_number',
            cell: ({ row }) => (
                <a href={`/admin/orders/${row.id}`} className="font-medium">
                    {row.order_number}
                </a>
            )
        },
        {
            header: 'Client',
            accessor: 'customer_name'
        },
        {
            header: 'Montant',
            accessor: 'total_amount',
            cell: ({ row }) => formatPrice(row.total_amount)
        },
        {
            header: 'Statut',
            accessor: 'status',
            cell: ({ row }) => (
                <Badge variant={getStatusVariant(row.status)}>
                    {getStatusLabel(row.status)}
                </Badge>
            )
        },
        {
            header: 'Date',
            accessor: 'created_at',
            cell: ({ row }) => formatDate(row.created_at)
        }
    ]
    
    return (
        <AdminLayout>
            <div className="space-y-4">
                <h1 className="text-2xl font-bold">Gestion des commandes</h1>
                <DataTable columns={columns} data={orders} />
            </div>
        </AdminLayout>
    )
}
```

### P2.9 - Notifications

#### Configuration des emails
```php
// app/Notifications/OrderConfirmation.php
namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class OrderConfirmation extends Notification
{
    use Queueable;
    
    public function __construct(
        public Order $order
    ) {}
    
    public function via($notifiable): array
    {
        return ['mail'];
    }
    
    public function toMail($notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Confirmation de votre commande #' . $this->order->order_number)
            ->greeting('Bonjour ' . $this->order->customer_name . ',')
            ->line('Nous avons bien reçu votre commande.')
            ->line('Montant total : ' . number_format($this->order->total_amount, 0, ',', ' ') . ' F CFA')
            ->line('Mode de récupération : ' . $this->getDeliveryMethodLabel())
            ->action('Suivre ma commande', url('/orders/' . $this->order->order_number))
            ->line('Merci pour votre confiance !');
    }
}
```

### P2.10 - Pages de statut

#### Page de succès
```jsx
// resources/js/Pages/Shop/Orders/Success.jsx
import { CheckCircle } from 'lucide-react'
import { Button } from '@/Components/ui/button'
import confetti from 'canvas-confetti'
import { useEffect } from 'react'

export default function OrderSuccess({ order }) {
    useEffect(() => {
        // Animation de confettis
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        })
    }, [])
    
    return (
        <div className="text-center py-16">
            <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
            <h1 className="text-3xl font-bold mb-2">Commande confirmée !</h1>
            <p className="text-gray-600 mb-8">
                Votre commande #{order.order_number} a été confirmée avec succès.
            </p>
            
            <div className="bg-gray-50 p-6 rounded-lg max-w-md mx-auto mb-8">
                <h2 className="font-semibold mb-4">Détails de la commande</h2>
                <div className="space-y-2 text-left">
                    <div className="flex justify-between">
                        <span>Montant total</span>
                        <span className="font-medium">{formatPrice(order.total_amount)} F CFA</span>
                    </div>
                    <div className="flex justify-between">
                        <span>Mode de récupération</span>
                        <span className="font-medium">
                            {order.delivery_method === 'pickup' ? 'Retrait en magasin' : 'Livraison à domicile'}
                        </span>
                    </div>
                </div>
            </div>
            
            <Button href="/" size="lg">
                Continuer mes achats
            </Button>
        </div>
    )
}
```

## Intégrations tierces

### Configuration CinetPay
- Mode test pour développement
- Webhooks sécurisés
- Gestion des erreurs
- Logs détaillés

### Configuration Yango
- API de calcul des frais
- Création de livraison
- Tracking en temps réel
- Webhooks de statut

## Gestion des cas spéciaux

### Produits à poids variable
1. Estimation du poids lors de la commande
2. Pré-autorisation du montant maximum
3. Ajustement après pesée
4. Capture du montant exact

### Montant minimum livraison
- Validation côté client
- Vérification côté serveur
- Message d'erreur clair
- Suggestion de produits additionnels

## Tests et validation

### Tests E2E
```javascript
// cypress/e2e/checkout.cy.js
describe('Checkout Process', () => {
  it('completes a full checkout flow', () => {
    // Add items to cart
    cy.visit('/products')
    cy.get('[data-cy=add-to-cart]').first().click()
    
    // Go to checkout
    cy.visit('/checkout')
    
    // Fill form
    cy.get('#customer_name').type('John Doe')
    cy.get('#customer_phone').type('0123456789')
    
    // Select delivery method
    cy.get('[value=pickup]').check()
    
    // Submit
    cy.get('[type=submit]').click()
    
    // Should redirect to payment
    cy.url().should('include', 'cinetpay.com')
  })
})
```

## Checklist de validation

### Fonctionnalités
- [ ] Panier avec persistance localStorage
- [ ] Validation montant minimum
- [ ] Formulaire checkout complet
- [ ] Calcul frais de livraison Yango
- [ ] Intégration paiement CinetPay
- [ ] Gestion produits variables
- [ ] Notifications email
- [ ] Pages de statut

### Intégrations
- [ ] API Yango fonctionnelle
- [ ] Webhooks CinetPay configurés
- [ ] Pré-autorisation testée
- [ ] Capture de paiement testée

### Sécurité
- [ ] Validation des données
- [ ] Protection CSRF
- [ ] Chiffrement données sensibles
- [ ] Rate limiting

### Performance
- [ ] Optimisation requêtes
- [ ] Cache approprié
- [ ] Jobs asynchrones

## Prochaines étapes

Une fois la Phase 2 complétée et validée, nous pourrons passer à la [Phase 3 : Finalisation, Tests et Assurance Qualité](./phase3-qa-testing.md).

## Notes d'implémentation

```
[Date] - [Développeur] - [Note]
22/07/2025 - Initialisation - Documentation de la Phase 2 créée
```