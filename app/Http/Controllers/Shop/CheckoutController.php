<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Http\Requests\CheckoutRequest;
use App\Domain\Order\Services\OrderService;
use App\Domain\Payment\Services\CinetPayService;
use App\Domain\Shipping\Services\YangoService;
use App\Domain\Order\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CheckoutController extends Controller
{
    protected OrderService $orderService;
    protected CinetPayService $cinetPayService;
    protected YangoService $yangoService;

    public function __construct(
        OrderService $orderService,
        CinetPayService $cinetPayService,
        YangoService $yangoService
    ) {
        $this->orderService = $orderService;
        $this->cinetPayService = $cinetPayService;
        $this->yangoService = $yangoService;
    }

    /**
     * Affiche la page de checkout avec estimation des frais
     */
    public function index(Request $request)
    {
        // Récupérer les données du panier depuis la requête
        $cartItems = $request->input('items', []);
        
        if (empty($cartItems)) {
            return redirect()->route('shop.home')
                ->with('error', 'Votre panier est vide');
        }

        // Calculer le sous-total
        $subtotal = collect($cartItems)->sum(function ($item) {
            return $item['price'] * $item['quantity'];
        });

        // Estimer les frais de livraison par défaut
        $estimatedDeliveryFee = 0;
        if ($subtotal < 3000) {
            $estimatedDeliveryFee = null; // Livraison non disponible
        } else {
            try {
                // Utiliser une adresse par défaut pour l'estimation
                $estimatedDeliveryFee = $this->yangoService->estimateDeliveryFee();
            } catch (\Exception $e) {
                $estimatedDeliveryFee = config('shop.delivery.default_fee', 1000);
            }
        }

        return Inertia::render('Shop/Checkout', [
            'cartItems' => $cartItems,
            'subtotal' => $subtotal,
            'estimatedDeliveryFee' => $estimatedDeliveryFee,
            'minimumOrderAmount' => 3000,
            'pickupTimeSlots' => config('shop.pickup.time_slots', [
                '09:00-12:00' => 'Matin (9h - 12h)',
                '14:00-17:00' => 'Après-midi (14h - 17h)',
                '17:00-20:00' => 'Soir (17h - 20h)',
            ]),
        ]);
    }

    /**
     * Traite la commande
     */
    public function store(CheckoutRequest $request)
    {
        try {
            // Créer la commande
            $order = $this->orderService->createFromCart(
                $request->validated()['cart'],
                $request->validated()['customer'],
                $request->validated()['delivery']
            );

            // Si paiement par carte, initialiser CinetPay
            if ($request->input('payment_method') === 'card') {
                try {
                    $paymentUrl = $this->cinetPayService->initializePayment($order);
                    
                    return response()->json([
                        'success' => true,
                        'order_number' => $order->order_number,
                        'payment_url' => $paymentUrl,
                        'redirect' => true,
                    ]);
                } catch (\Exception $e) {
                    // En cas d'échec du paiement, annuler la commande
                    $this->orderService->cancelOrder($order, 'Échec de l\'initialisation du paiement');
                    
                    Log::error('Payment initialization failed', [
                        'order_id' => $order->id,
                        'error' => $e->getMessage()
                    ]);
                    
                    return response()->json([
                        'success' => false,
                        'message' => 'Impossible d\'initialiser le paiement. Veuillez réessayer.',
                    ], 500);
                }
            }

            // Pour le paiement cash, rediriger vers la page de succès
            return response()->json([
                'success' => true,
                'order_number' => $order->order_number,
                'redirect_url' => route('shop.order.success', $order),
            ]);

        } catch (\Exception $e) {
            Log::error('Checkout error', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);

            return response()->json([
                'success' => false,
                'message' => $e->getMessage(),
            ], 422);
        }
    }

    /**
     * Page de succès après paiement
     */
    public function success(Order $order)
    {
        // Vérifier que la commande appartient au client (via session ou cookie)
        if (!$this->verifyOrderAccess($order)) {
            return redirect()->route('shop.home');
        }

        return Inertia::render('Shop/OrderSuccess', [
            'order' => $order->load('items.productSku.product'),
            'clearCart' => true, // Signal pour vider le panier côté client
        ]);
    }

    /**
     * Page d'échec de paiement
     */
    public function failed(Request $request)
    {
        $orderNumber = $request->input('order_number');
        $reason = $request->input('reason', 'Le paiement a échoué');

        return Inertia::render('Shop/OrderFailed', [
            'orderNumber' => $orderNumber,
            'reason' => $reason,
            'canRetry' => true,
        ]);
    }

    /**
     * Page de paiement en attente
     */
    public function pending(Request $request)
    {
        $orderNumber = $request->input('order_number');

        return Inertia::render('Shop/OrderPending', [
            'orderNumber' => $orderNumber,
            'message' => 'Votre paiement est en cours de traitement. Vous recevrez un email de confirmation.',
        ]);
    }

    /**
     * Calcule les frais de livraison en temps réel
     */
    public function calculateDeliveryFee(Request $request)
    {
        $request->validate([
            'address' => 'required|string',
            'subtotal' => 'required|numeric|min:0',
        ]);

        try {
            $fee = $this->yangoService->calculateDeliveryFee(
                $request->input('address'),
                $request->input('subtotal')
            );

            return response()->json([
                'success' => true,
                'delivery_fee' => $fee,
                'formatted_fee' => number_format($fee, 0, ',', ' ') . ' FCFA',
            ]);
        } catch (\Exception $e) {
            Log::warning('Delivery fee calculation failed', [
                'error' => $e->getMessage(),
                'address' => $request->input('address')
            ]);

            return response()->json([
                'success' => false,
                'delivery_fee' => config('shop.delivery.default_fee', 1000),
                'message' => 'Impossible de calculer les frais exacts. Frais standards appliqués.',
            ]);
        }
    }

    /**
     * Vérifie l'accès à une commande
     */
    protected function verifyOrderAccess(Order $order): bool
    {
        // Pour l'instant, on stocke les commandes récentes en session
        $recentOrders = session('recent_orders', []);
        
        return in_array($order->id, $recentOrders) || 
               session('last_order_id') === $order->id;
    }

    /**
     * Réessayer le paiement d'une commande
     */
    public function retryPayment(Order $order)
    {
        if (!$this->verifyOrderAccess($order)) {
            return redirect()->route('shop.home');
        }

        if ($order->payment_status === Order::PAYMENT_STATUS_PAID) {
            return redirect()->route('shop.order.success', $order);
        }

        if (!in_array($order->status, [Order::STATUS_PENDING, Order::STATUS_CONFIRMED])) {
            return redirect()->route('shop.home')
                ->with('error', 'Cette commande ne peut plus être payée');
        }

        try {
            $paymentUrl = $this->cinetPayService->initializePayment($order);
            
            return redirect()->away($paymentUrl);
        } catch (\Exception $e) {
            Log::error('Payment retry failed', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
            
            return redirect()->route('shop.order.failed')
                ->with('error', 'Impossible de réessayer le paiement');
        }
    }
}