<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Shop\ShopController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

// Routes publiques de la boutique
Route::get('/', [ShopController::class, 'index'])->name('home');
Route::get('/products', [ShopController::class, 'products'])->name('products');
Route::get('/products/{product:slug}', [ShopController::class, 'product'])->name('product.show');
Route::get('/category/{category:slug}', [ShopController::class, 'category'])->name('category.show');
Route::get('/search', [ShopController::class, 'search'])->name('search');

// Pages temporaires
Route::get('/favorites', function () {
    return Inertia::render('Shop/Favorites');
})->name('favorites');

Route::get('/menu', function () {
    return Inertia::render('Shop/Menu');
})->name('menu');

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
    Route::get('/', function () {
        return Inertia::render('Admin/Dashboard');
    })->name('dashboard');
    
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
});

require __DIR__.'/auth.php';
