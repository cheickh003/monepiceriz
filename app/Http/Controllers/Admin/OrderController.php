<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Domain\Order\Models\Order;
use App\Domain\Order\Services\OrderService;
use App\Domain\Payment\Services\CinetPayService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;
use Maatwebsite\Excel\Facades\Excel;
use App\Exports\OrdersExport;

class OrderController extends Controller
{
    protected OrderService $orderService;
    protected CinetPayService $cinetPayService;

    public function __construct(OrderService $orderService, CinetPayService $cinetPayService)
    {
        $this->orderService = $orderService;
        $this->cinetPayService = $cinetPayService;
    }

    /**
     * Liste les commandes avec filtres et pagination
     */
    public function index(Request $request)
    {
        $query = Order::with(['customer', 'items']);

        // Filtres
        if ($request->filled('status')) {
            $query->where('status', $request->input('status'));
        }

        if ($request->filled('payment_status')) {
            $query->where('payment_status', $request->input('payment_status'));
        }

        if ($request->filled('delivery_method')) {
            $query->where('delivery_method', $request->input('delivery_method'));
        }

        if ($request->filled('date_from')) {
            $query->whereDate('created_at', '>=', $request->input('date_from'));
        }

        if ($request->filled('date_to')) {
            $query->whereDate('created_at', '<=', $request->input('date_to'));
        }

        if ($request->filled('search')) {
            $search = $request->input('search');
            $query->where(function ($q) use ($search) {
                $q->where('order_number', 'like', "%{$search}%")
                  ->orWhere('customer_name', 'like', "%{$search}%")
                  ->orWhere('customer_phone', 'like', "%{$search}%")
                  ->orWhere('customer_email', 'like', "%{$search}%");
            });
        }

        // Tri
        $sortField = $request->input('sort', 'created_at');
        $sortDirection = $request->input('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);

        // Pagination
        $orders = $query->paginate(20)->withQueryString();

        // Statistiques
        $statistics = $this->orderService->getOrderStatistics($request->input('period', 'today'));

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['status', 'payment_status', 'delivery_method', 'date_from', 'date_to', 'search']),
            'statistics' => $statistics,
            'statuses' => [
                Order::STATUS_PENDING => 'En attente',
                Order::STATUS_CONFIRMED => 'Confirmée',
                Order::STATUS_PROCESSING => 'En préparation',
                Order::STATUS_READY => 'Prête',
                Order::STATUS_DELIVERING => 'En livraison',
                Order::STATUS_COMPLETED => 'Livrée',
                Order::STATUS_CANCELLED => 'Annulée',
            ],
            'paymentStatuses' => [
                Order::PAYMENT_STATUS_PENDING => 'En attente',
                Order::PAYMENT_STATUS_AUTHORIZED => 'Autorisé',
                Order::PAYMENT_STATUS_PAID => 'Payé',
                Order::PAYMENT_STATUS_FAILED => 'Échoué',
                Order::PAYMENT_STATUS_REFUNDED => 'Remboursé',
            ],
        ]);
    }

    /**
     * Affiche le détail d'une commande
     */
    public function show(Order $order)
    {
        $order->load(['customer', 'items.productSku.product']);

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
            'canUpdateStatus' => true,
            'canUpdateWeights' => $order->requires_weight_confirmation && !$order->weight_confirmed_at,
            'canCapturePayment' => $order->payment_status === Order::PAYMENT_STATUS_AUTHORIZED,
            'availableStatuses' => $this->getAvailableStatuses($order),
        ]);
    }

    /**
     * Met à jour le statut d'une commande
     */
    public function updateStatus(Order $order, Request $request)
    {
        $request->validate([
            'status' => 'required|string|in:' . implode(',', [
                Order::STATUS_PENDING,
                Order::STATUS_CONFIRMED,
                Order::STATUS_PROCESSING,
                Order::STATUS_READY,
                Order::STATUS_DELIVERING,
                Order::STATUS_COMPLETED,
                Order::STATUS_CANCELLED,
            ]),
            'notes' => 'nullable|string|max:500',
        ]);

        try {
            $newStatus = $request->input('status');
            
            if (!$order->canTransitionTo($newStatus)) {
                return back()->with('error', "Impossible de passer du statut '{$order->status_label}' à '{$newStatus}'");
            }

            $this->orderService->updateOrderStatus($order, $newStatus);

            if ($request->filled('notes')) {
                $order->update(['notes' => $order->notes . "\n" . $request->input('notes')]);
            }

            Log::info('Order status updated', [
                'order_id' => $order->id,
                'old_status' => $order->getOriginal('status'),
                'new_status' => $newStatus,
                'admin_id' => auth()->id(),
            ]);

            return back()->with('success', 'Statut mis à jour avec succès');

        } catch (\Exception $e) {
            Log::error('Failed to update order status', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Met à jour les poids réels des produits variables
     */
    public function updateWeights(Order $order, Request $request)
    {
        if (!$order->requires_weight_confirmation || $order->weight_confirmed_at) {
            return back()->with('error', 'Cette commande ne nécessite pas de confirmation de poids');
        }

        $request->validate([
            'weights' => 'required|array',
            'weights.*' => 'required|integer|min:100|max:50000',
        ]);

        try {
            $this->orderService->finalizeVariableWeightOrder($order, $request->input('weights'));

            return back()->with('success', 'Poids confirmés et montant ajusté');

        } catch (\Exception $e) {
            Log::error('Failed to update weights', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Capture le paiement pré-autorisé
     */
    public function capturePayment(Order $order)
    {
        if ($order->payment_status !== Order::PAYMENT_STATUS_AUTHORIZED) {
            return back()->with('error', 'Cette commande n\'a pas de paiement pré-autorisé');
        }

        try {
            $result = $this->cinetPayService->capturePayment($order);

            if ($result['success']) {
                $order->update([
                    'payment_status' => Order::PAYMENT_STATUS_PAID,
                    'payment_reference' => $result['transaction_id'],
                ]);

                return back()->with('success', 'Paiement capturé avec succès');
            } else {
                return back()->with('error', 'Échec de la capture du paiement: ' . $result['message']);
            }

        } catch (\Exception $e) {
            Log::error('Failed to capture payment', [
                'order_id' => $order->id,
                'error' => $e->getMessage()
            ]);
            return back()->with('error', 'Erreur lors de la capture du paiement');
        }
    }

    /**
     * Exporte les commandes
     */
    public function export(Request $request)
    {
        $format = $request->input('format', 'xlsx');
        $filters = $request->only(['status', 'payment_status', 'date_from', 'date_to']);

        return Excel::download(
            new OrdersExport($filters),
            'commandes_' . now()->format('Y-m-d_His') . '.' . $format
        );
    }

    /**
     * Imprime un bon de commande
     */
    public function print(Order $order)
    {
        $order->load(['customer', 'items.productSku.product']);

        return view('admin.orders.print', compact('order'));
    }

    /**
     * Annule une commande
     */
    public function cancel(Order $order, Request $request)
    {
        $request->validate([
            'reason' => 'required|string|max:500',
        ]);

        try {
            $this->orderService->cancelOrder($order, $request->input('reason'));

            return back()->with('success', 'Commande annulée avec succès');

        } catch (\Exception $e) {
            return back()->with('error', $e->getMessage());
        }
    }

    /**
     * Retourne les statuts disponibles pour une commande
     */
    protected function getAvailableStatuses(Order $order): array
    {
        $allStatuses = [
            Order::STATUS_PENDING => 'En attente',
            Order::STATUS_CONFIRMED => 'Confirmée',
            Order::STATUS_PROCESSING => 'En préparation',
            Order::STATUS_READY => 'Prête',
            Order::STATUS_DELIVERING => 'En livraison',
            Order::STATUS_COMPLETED => 'Livrée',
            Order::STATUS_CANCELLED => 'Annulée',
        ];

        $availableStatuses = [];
        foreach ($allStatuses as $status => $label) {
            if ($order->canTransitionTo($status)) {
                $availableStatuses[$status] = $label;
            }
        }

        return $availableStatuses;
    }

    /**
     * Dashboard des commandes
     */
    public function dashboard()
    {
        $todayStats = $this->orderService->getOrderStatistics('today');
        $weekStats = $this->orderService->getOrderStatistics('week');
        $monthStats = $this->orderService->getOrderStatistics('month');

        // Commandes récentes
        $recentOrders = Order::with('customer')
            ->latest()
            ->take(10)
            ->get();

        // Commandes nécessitant une action
        $ordersNeedingAction = Order::where(function ($query) {
            $query->where('status', Order::STATUS_PENDING)
                  ->orWhere('requires_weight_confirmation', true)
                  ->whereNull('weight_confirmed_at');
        })->count();

        return Inertia::render('Admin/Orders/Dashboard', [
            'todayStats' => $todayStats,
            'weekStats' => $weekStats,
            'monthStats' => $monthStats,
            'recentOrders' => $recentOrders,
            'ordersNeedingAction' => $ordersNeedingAction,
        ]);
    }
}