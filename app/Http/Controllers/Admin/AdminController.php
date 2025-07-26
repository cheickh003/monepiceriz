<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Domain\Order\Models\Order;
use App\Domain\Order\Services\OrderService;
use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\Category;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class AdminController extends Controller
{
    public function __construct(
        private OrderService $orderService
    ) {}

    public function dashboard()
    {
        // Get date ranges
        $today = Carbon::today();
        $startOfWeek = Carbon::now()->startOfWeek();
        $startOfMonth = Carbon::now()->startOfMonth();

        // Orders statistics
        $ordersToday = Order::whereDate('created_at', $today)->count();
        $ordersWeek = Order::whereBetween('created_at', [$startOfWeek, now()])->count();
        $ordersMonth = Order::whereBetween('created_at', [$startOfMonth, now()])->count();

        // Revenue statistics
        $revenueToday = Order::whereDate('created_at', $today)
            ->whereNotIn('status', [Order::STATUS_CANCELLED])
            ->sum('total_amount');
            
        $revenueWeek = Order::whereBetween('created_at', [$startOfWeek, now()])
            ->whereNotIn('status', [Order::STATUS_CANCELLED])
            ->sum('total_amount');
            
        $revenueMonth = Order::whereBetween('created_at', [$startOfMonth, now()])
            ->whereNotIn('status', [Order::STATUS_CANCELLED])
            ->sum('total_amount');

        // Products and categories
        $activeProducts = Product::where('is_active', true)->count();
        $totalCategories = Category::count();

        // Pending orders
        $pendingOrders = Order::where('status', Order::STATUS_PENDING)->count();
        $processingOrders = Order::where('status', Order::STATUS_PROCESSING)->count();

        // Recent orders
        $recentOrders = Order::with('customer')
            ->orderBy('created_at', 'desc')
            ->take(10)
            ->get()
            ->map(function ($order) {
                return [
                    'id' => $order->id,
                    'order_number' => $order->order_number,
                    'customer_name' => $order->customer_name,
                    'total_amount' => $order->total_amount,
                    'status' => $order->status,
                    'created_at' => $order->created_at->toISOString(),
                ];
            });

        // Alerts
        $alerts = [];

        // Check for pending orders older than 1 hour
        $oldPendingOrders = Order::where('status', Order::STATUS_PENDING)
            ->where('created_at', '<', now()->subHour())
            ->count();
            
        if ($oldPendingOrders > 0) {
            $alerts[] = [
                'type' => 'warning',
                'message' => "{$oldPendingOrders} commande(s) en attente depuis plus d'une heure",
                'action' => 'Voir les commandes',
                'action_url' => route('admin.orders.index', ['status' => Order::STATUS_PENDING])
            ];
        }

        // TODO: Implement weight confirmation feature when needed
        // Check for orders requiring weight confirmation will be added later

        // Check for low stock products (optional - if stock management is implemented)
        $lowStockProducts = Product::whereHas('skus', function ($query) {
            $query->where('stock_quantity', '<=', 5)
                  ->where('stock_quantity', '>', 0);
        })->count();
        
        if ($lowStockProducts > 0) {
            $alerts[] = [
                'type' => 'warning',
                'message' => "{$lowStockProducts} produit(s) avec un stock faible",
                'action' => 'Voir les produits',
                'action_url' => route('admin.products.index', ['low_stock' => true])
            ];
        }

        return Inertia::render('Admin/Dashboard', [
            'stats' => [
                'orders_today' => $ordersToday,
                'orders_week' => $ordersWeek,
                'orders_month' => $ordersMonth,
                'revenue_today' => $revenueToday,
                'revenue_week' => $revenueWeek,
                'revenue_month' => $revenueMonth,
                'active_products' => $activeProducts,
                'total_categories' => $totalCategories,
                'pending_orders' => $pendingOrders,
                'processing_orders' => $processingOrders,
            ],
            'recent_orders' => $recentOrders,
            'alerts' => $alerts,
        ]);
    }
}