<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Shop\ShopController;
use App\Http\Controllers\Shop\CheckoutController;
use App\Http\Controllers\Webhook\CinetPayController;
use App\Http\Controllers\Admin\OrderController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Routes publiques de la boutique
Route::get('/', [ShopController::class, 'index'])->name('home');
Route::get('/products', [ShopController::class, 'products'])->name('products');
Route::get('/products/{product:slug}', [ShopController::class, 'product'])->name('product.show');
Route::get('/category/{category:slug}', [ShopController::class, 'category'])->name('category.show');
Route::get('/search', [ShopController::class, 'search'])->name('search');
Route::get('/api/search-suggestions', [ShopController::class, 'searchSuggestions'])->name('search.suggestions');

// Pages temporaires
Route::get('/favorites', function () {
    return Inertia::render('Shop/Favorites');
})->name('favorites');

Route::get('/menu', function () {
    return Inertia::render('Shop/Menu');
})->name('menu');

// Newsletter
Route::post('/newsletter/subscribe', [ShopController::class, 'subscribeNewsletter'])->name('newsletter.subscribe');

// Checkout routes
Route::prefix('shop')->name('shop.')->group(function () {
    Route::get('/checkout', [CheckoutController::class, 'index'])->name('checkout');
    Route::post('/checkout', [CheckoutController::class, 'store'])->name('checkout.store');
    Route::post('/checkout/calculate-delivery-fee', [CheckoutController::class, 'calculateDeliveryFee'])->name('checkout.calculate-fee');
    
    // Order status pages
    Route::get('/order/success/{order}', [CheckoutController::class, 'success'])->name('order.success');
    Route::get('/order/failed', [CheckoutController::class, 'failed'])->name('order.failed');
    Route::get('/order/pending', [CheckoutController::class, 'pending'])->name('order.pending');
    Route::post('/order/{order}/retry-payment', [CheckoutController::class, 'retryPayment'])->name('order.retry-payment');
});

// Webhook routes (no CSRF protection)
Route::post('/webhooks/cinetpay', [CinetPayController::class, 'handle'])
    ->name('webhooks.cinetpay')
    ->withoutMiddleware(['web']);
    
Route::post('/webhooks/cinetpay/check-status', [CinetPayController::class, 'checkStatus'])
    ->name('webhooks.cinetpay.check-status');

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

// Admin routes
Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [\App\Http\Controllers\Admin\AdminController::class, 'dashboard'])
        ->name('dashboard');
    
    // Categories management
    Route::resource('categories', \App\Http\Controllers\Admin\CategoryController::class);
    Route::post('categories/update-positions', [\App\Http\Controllers\Admin\CategoryController::class, 'updatePositions'])
        ->name('categories.update-positions');
    
    // Products management
    Route::resource('products', \App\Http\Controllers\Admin\ProductController::class);
    Route::post('products/{product}/duplicate', [\App\Http\Controllers\Admin\ProductController::class, 'duplicate'])
        ->name('products.duplicate');
    Route::patch('products/{product}/stock', [\App\Http\Controllers\Admin\ProductController::class, 'updateStock'])
        ->name('products.update-stock');
    
    // Product attributes management
    Route::resource('product-attributes', \App\Http\Controllers\Admin\ProductAttributeController::class);
    Route::post('product-attributes/{productAttribute}/values', [\App\Http\Controllers\Admin\ProductAttributeController::class, 'addValue'])
        ->name('product-attributes.add-value');
    Route::delete('product-attributes/{productAttribute}/values/{value}', [\App\Http\Controllers\Admin\ProductAttributeController::class, 'deleteValue'])
        ->name('product-attributes.delete-value');
    
    // Orders management
    Route::resource('orders', OrderController::class)->only(['index', 'show']);
    Route::get('orders/dashboard', [OrderController::class, 'dashboard'])->name('orders.dashboard');
    Route::patch('orders/{order}/status', [OrderController::class, 'updateStatus'])->name('orders.update-status');
    Route::patch('orders/{order}/weights', [OrderController::class, 'updateWeights'])->name('orders.update-weights');
    Route::post('orders/{order}/capture', [OrderController::class, 'capturePayment'])->name('orders.capture-payment');
    Route::post('orders/{order}/cancel', [OrderController::class, 'cancel'])->name('orders.cancel');
    Route::get('orders/{order}/print', [OrderController::class, 'print'])->name('orders.print');
    Route::get('orders/export', [OrderController::class, 'export'])->name('orders.export');
    
    // Demo page for loading states
    Route::get('loading-states-demo', function () {
        return inertia('Admin/LoadingStatesDemo');
    })->name('admin.loading-states-demo');
});

require __DIR__.'/auth.php';
