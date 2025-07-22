# Documentation CinetPay - Intégration pour MonEpice&Riz

**Version:** 1.0.0  
**Dernière mise à jour:** 2025-07-22  
**Documentation parente:** [structure.md](./structure.md)

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis](#prérequis)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Workflow de paiement](#workflow-de-paiement)
6. [Implémentation Laravel](#implémentation-laravel)
7. [Gestion des produits à poids variable](#gestion-des-produits-à-poids-variable)
8. [Test et débogage](#test-et-débogage)

## Vue d'ensemble

CinetPay est une solution de paiement en ligne adaptée au marché africain, permettant d'accepter les paiements par Mobile Money et cartes bancaires. Pour MonEpice&Riz, nous utiliserons le SDK PHP officiel de CinetPay avec Laravel.

### Avantages de CinetPay
- Support du Mobile Money (Orange Money, MTN Money, Moov Money)
- Paiement par carte bancaire
- API simple et bien documentée
- Support de la pré-autorisation (essentiel pour les produits à poids variable)
- Interface de test pour le développement

## Prérequis

Avant de commencer l'intégration, vous devez :

1. **Avoir un compte marchand CinetPay**
   - Inscription sur [www.cinetpay.com](https://www.cinetpay.com)
   - Validation du compte marchand

2. **Récupérer vos identifiants API**
   - Connectez-vous à votre espace marchand
   - Allez dans "Intégrations"
   - Récupérez votre `API_KEY` et `SITE_ID`

3. **Préparer votre environnement**
   - PHP >= 7.4
   - Laravel >= 8.0
   - Composer installé

## Installation

### Option 1 : SDK PHP Officiel

```bash
composer require cinetpay/cinetpay-php
```

### Option 2 : Package Laravel spécifique (Recommandé)

```bash
composer require rikudosama/cinetpay
```

Publier la configuration :
```bash
php artisan vendor:publish --provider="Rikudosama\Cinetpay\CinetpayServiceProvider" --tag="config"
```

## Configuration

### 1. Variables d'environnement

Toutes les variables d'environnement CinetPay sont centralisées dans la configuration principale.

👉 **Voir : [structure.md#72-variables-denvironnement](./structure.md#72-variables-denvironnement)** (section CINETPAY PAYMENT)

Variables requises :
- `CINETPAY_API_KEY` : Votre clé API
- `CINETPAY_SITE_ID` : Identifiant de votre site marchand
- `CINETPAY_SECRET_KEY` : Clé secrète pour les webhooks
- `CINETPAY_MODE` : TEST ou PRODUCTION

### 2. Configuration Laravel (config/cinetpay.php)

```php
<?php

return [
    'api_key' => env('CINETPAY_API_KEY'),
    'site_id' => env('CINETPAY_SITE_ID'),
    'secret_key' => env('CINETPAY_SECRET_KEY'),
    'mode' => env('CINETPAY_MODE', 'TEST'),
    'notify_url' => env('CINETPAY_NOTIFY_URL'),
    'return_url' => env('CINETPAY_RETURN_URL'),
    'cancel_url' => env('CINETPAY_CANCEL_URL'),
    'currency' => 'XOF', // Franc CFA
];
```

### 3. Exclusion CSRF

Dans `app/Http/Middleware/VerifyCsrfToken.php` :

```php
protected $except = [
    'api/cinetpay/notify',
    'api/cinetpay/callback'
];
```

## Workflow de paiement

### Diagramme du flux de paiement standard

```
Client -> Panier -> Validation commande -> Redirection CinetPay
                                              |
                                              v
                                    Paiement (Mobile/Carte)
                                              |
                                              v
                            Notification webhook <- CinetPay
                                              |
                                              v
                                    Mise à jour commande
                                              |
                                              v
                            Client -> Page de confirmation
```

### Workflow spécifique pour MonEpice&Riz

1. **Client finalise son panier**
2. **Choix du mode de livraison** (retrait ou Yango)
3. **Vérification montant minimum** (3000 F CFA pour livraison)
4. **Saisie des informations client**
5. **Initialisation du paiement CinetPay**
6. **Redirection vers la page de paiement**
7. **Traitement du paiement**
8. **Notification webhook**
9. **Confirmation de commande**

## Implémentation Laravel

### 1. Service CinetPay

```php
<?php

namespace App\Services;

use CinetPay\CinetPay;
use App\Models\Order;
use Illuminate\Support\Str;

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
    
    /**
     * Initialiser un paiement
     */
    public function initializePayment(Order $order)
    {
        $transactionId = 'CMD-' . $order->id . '-' . time();
        
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
            'channels' => 'ALL', // MOBILE_MONEY, CREDIT_CARD, ALL
        ];
        
        // Pour les produits à poids variable, utiliser la pré-autorisation
        if ($order->has_variable_weight_products) {
            $paymentData['payment_method'] = 'PREAUTH';
        }
        
        $result = $this->cinetpay->generatePaymentLink($paymentData);
        
        if ($result['code'] == '201') {
            // Sauvegarder l'ID de transaction
            $order->update([
                'transaction_id' => $transactionId,
                'payment_token' => $result['data']['payment_token']
            ]);
            
            return [
                'success' => true,
                'payment_url' => $result['data']['payment_url'],
                'payment_token' => $result['data']['payment_token']
            ];
        }
        
        return [
            'success' => false,
            'message' => $result['message'] ?? 'Erreur lors de l\'initialisation du paiement'
        ];
    }
    
    /**
     * Vérifier le statut d'une transaction
     */
    public function checkTransactionStatus($transactionId)
    {
        $result = $this->cinetpay->checkPayStatus($transactionId);
        
        return [
            'success' => $result['code'] == '00',
            'status' => $result['data']['status'] ?? null,
            'data' => $result['data'] ?? []
        ];
    }
    
    /**
     * Capturer un paiement pré-autorisé (pour produits variables)
     */
    public function capturePayment($transactionId, $finalAmount)
    {
        $captureData = [
            'transaction_id' => $transactionId,
            'amount' => $finalAmount
        ];
        
        $result = $this->cinetpay->capture($captureData);
        
        return [
            'success' => $result['code'] == '00',
            'message' => $result['message'] ?? ''
        ];
    }
}
```

### 2. Controller de paiement

```php
<?php

namespace App\Http\Controllers;

use App\Models\Order;
use App\Services\CinetPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class PaymentController extends Controller
{
    protected $cinetPayService;
    
    public function __construct(CinetPayService $cinetPayService)
    {
        $this->cinetPayService = $cinetPayService;
    }
    
    /**
     * Initialiser le paiement
     */
    public function initializePayment(Request $request, Order $order)
    {
        // Vérifier le montant minimum pour la livraison
        if ($order->delivery_method === 'delivery' && $order->total_amount < 3000) {
            return response()->json([
                'success' => false,
                'message' => 'Le montant minimum pour la livraison est de 3000 F CFA'
            ], 400);
        }
        
        $result = $this->cinetPayService->initializePayment($order);
        
        if ($result['success']) {
            return response()->json([
                'success' => true,
                'payment_url' => $result['payment_url']
            ]);
        }
        
        return response()->json([
            'success' => false,
            'message' => $result['message']
        ], 400);
    }
    
    /**
     * Webhook de notification CinetPay
     */
    public function handleNotification(Request $request)
    {
        Log::info('CinetPay Notification', $request->all());
        
        $transactionId = $request->input('cpm_trans_id');
        
        if (!$transactionId) {
            return response()->json(['status' => 'error'], 400);
        }
        
        // Vérifier le statut de la transaction
        $status = $this->cinetPayService->checkTransactionStatus($transactionId);
        
        if ($status['success']) {
            $order = Order::where('transaction_id', $transactionId)->first();
            
            if ($order) {
                switch ($status['status']) {
                    case 'ACCEPTED':
                        $order->update([
                            'payment_status' => 'paid',
                            'status' => 'confirmed'
                        ]);
                        
                        // Envoyer notification au client
                        // Notifier l'équipe pour la préparation
                        break;
                        
                    case 'REFUSED':
                    case 'CANCELLED':
                        $order->update([
                            'payment_status' => 'failed',
                            'status' => 'cancelled'
                        ]);
                        break;
                }
            }
        }
        
        return response()->json(['status' => 'ok']);
    }
    
    /**
     * Page de retour après paiement
     */
    public function paymentReturn(Request $request)
    {
        $transactionId = $request->input('transaction_id');
        $order = Order::where('transaction_id', $transactionId)->first();
        
        if (!$order) {
            return redirect()->route('home')->with('error', 'Commande introuvable');
        }
        
        // Vérifier le statut final
        $status = $this->cinetPayService->checkTransactionStatus($transactionId);
        
        if ($status['success'] && $status['status'] === 'ACCEPTED') {
            return view('orders.success', compact('order'));
        }
        
        return view('orders.failed', compact('order'));
    }
}
```

### 3. Routes

```php
// routes/api.php
Route::post('/cinetpay/notify', [PaymentController::class, 'handleNotification']);

// routes/web.php
Route::prefix('paiement')->group(function () {
    Route::get('/retour', [PaymentController::class, 'paymentReturn'])->name('payment.return');
    Route::get('/annulation', [PaymentController::class, 'paymentCancel'])->name('payment.cancel');
});

Route::post('/orders/{order}/pay', [PaymentController::class, 'initializePayment'])
    ->name('orders.pay');
```

## Gestion des produits à poids variable

Pour les produits de la boucherie/poissonnerie avec poids variable :

### 1. Workflow spécifique

```php
// Service pour gérer les produits variables
class VariableWeightProductService
{
    /**
     * Initialiser une pré-autorisation
     */
    public function initializePreAuthorization(Order $order)
    {
        // Calculer le montant maximum estimé
        $estimatedAmount = $this->calculateEstimatedAmount($order);
        
        // Ajouter une marge de sécurité de 20%
        $preAuthAmount = $estimatedAmount * 1.2;
        
        return $preAuthAmount;
    }
    
    /**
     * Finaliser la commande après pesée
     */
    public function finalizeOrderAfterWeighing(Order $order, array $actualWeights)
    {
        $finalAmount = 0;
        
        foreach ($order->items as $item) {
            if ($item->product->is_variable_weight) {
                $actualWeight = $actualWeights[$item->id] ?? $item->estimated_weight;
                $item->update([
                    'actual_weight' => $actualWeight,
                    'final_price' => $item->product->price_per_kg * $actualWeight
                ]);
                $finalAmount += $item->final_price;
            } else {
                $finalAmount += $item->price * $item->quantity;
            }
        }
        
        // Ajouter les frais de livraison
        $finalAmount += $order->delivery_fee;
        
        // Capturer le montant exact
        $captureResult = app(CinetPayService::class)->capturePayment(
            $order->transaction_id,
            $finalAmount
        );
        
        if ($captureResult['success']) {
            $order->update([
                'final_amount' => $finalAmount,
                'payment_captured' => true
            ]);
        }
        
        return $captureResult;
    }
}
```

### 2. Interface admin pour ajustement

```php
// Controller Admin
class AdminOrderController extends Controller
{
    public function updateWeights(Request $request, Order $order)
    {
        $validated = $request->validate([
            'weights' => 'required|array',
            'weights.*.item_id' => 'required|exists:order_items,id',
            'weights.*.actual_weight' => 'required|numeric|min:0.1'
        ]);
        
        $weights = collect($validated['weights'])
            ->pluck('actual_weight', 'item_id')
            ->toArray();
        
        $result = app(VariableWeightProductService::class)
            ->finalizeOrderAfterWeighing($order, $weights);
        
        if ($result['success']) {
            return redirect()
                ->route('admin.orders.show', $order)
                ->with('success', 'Commande finalisée avec succès');
        }
        
        return back()->with('error', 'Erreur lors de la capture du paiement');
    }
}
```

## Test et débogage

### 1. Mode Test

Utiliser les informations de test CinetPay :
- Numéro de test Mobile Money : Voir documentation CinetPay
- Carte de test : 4111 1111 1111 1111

### 2. Logs recommandés

```php
// config/logging.php
'channels' => [
    'cinetpay' => [
        'driver' => 'daily',
        'path' => storage_path('logs/cinetpay.log'),
        'level' => 'debug',
        'days' => 14,
    ],
],
```

### 3. Commandes Artisan utiles

```bash
# Vérifier le statut d'une transaction
php artisan cinetpay:check-status {transaction_id}

# Simuler une notification webhook
php artisan cinetpay:simulate-webhook {order_id} {status}
```

## Sécurité

1. **Validation de la signature webhook**
```php
public function validateWebhookSignature(Request $request)
{
    $signature = $request->header('X-CinetPay-Signature');
    $payload = $request->getContent();
    
    $expectedSignature = hash_hmac(
        'sha256',
        $payload,
        config('cinetpay.secret_key')
    );
    
    return hash_equals($expectedSignature, $signature);
}
```

2. **Protection contre les doublons**
```php
// Utiliser un cache pour éviter de traiter deux fois la même notification
$cacheKey = 'cinetpay_notification_' . $transactionId;

if (Cache::has($cacheKey)) {
    return response()->json(['status' => 'already_processed']);
}

Cache::put($cacheKey, true, now()->addHours(24));
```

## Ressources supplémentaires

- [Documentation officielle CinetPay](https://docs.cinetpay.com/api/1.0-fr/)
- [SDK PHP sur GitHub](https://github.com/cinetpay/cinetpay-php-sdk)
- [Package Laravel CinetPay](https://github.com/rikudosama/cinetpay)
- Support technique : support@cinetpay.com

## Checklist d'intégration

- [ ] Compte marchand CinetPay créé et validé
- [ ] API Key et Site ID récupérés
- [ ] SDK installé via Composer
- [ ] Variables d'environnement configurées
- [ ] Routes API et web créées
- [ ] Service CinetPay implémenté
- [ ] Webhook de notification fonctionnel
- [ ] Gestion des produits variables implémentée
- [ ] Tests en mode TEST effectués
- [ ] Logs configurés
- [ ] Sécurité webhook mise en place
- [ ] Documentation technique à jour