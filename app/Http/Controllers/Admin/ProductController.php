<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Catalog\Models\Product;
use App\Domain\Catalog\Models\ProductSku;
use App\Domain\Catalog\Models\Category;
use App\Domain\Catalog\Models\ProductAttribute;
use App\Domain\Catalog\Models\ProductAttributeValue;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Product::with(['category', 'skus']);
        
        // Filtering
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }
        
        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('reference', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }
        
        if ($request->filled('is_active')) {
            $query->where('is_active', $request->boolean('is_active'));
        }
        
        if ($request->filled('is_variable_weight')) {
            $query->where('is_variable_weight', $request->boolean('is_variable_weight'));
        }
        
        // Sorting
        $sortField = $request->get('sort', 'created_at');
        $sortDirection = $request->get('direction', 'desc');
        $query->orderBy($sortField, $sortDirection);
        
        $products = $query->paginate(20)->withQueryString();
        
        $categories = Category::orderBy('name')->get();
        
        return Inertia::render('Admin/Products/Index', [
            'products' => $products,
            'categories' => $categories,
            'filters' => $request->only(['category_id', 'search', 'is_active', 'is_variable_weight'])
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $categories = Category::orderBy('name')->get();
        $attributes = ProductAttribute::orderBy('name')->get();
        
        return Inertia::render('Admin/Products/Create', [
            'categories' => $categories,
            'attributes' => $attributes
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products',
            'reference' => 'required|string|max:50|unique:products',
            'barcode' => 'nullable|string|max:50|unique:products',
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'is_active' => 'boolean',
            'is_variable_weight' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'main_image' => 'nullable|image|max:10240', // 10MB max
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'image|max:10240',
            'skus' => 'required|array|min:1',
            'skus.*.purchase_price' => 'required|numeric|min:0',
            'skus.*.price_ht' => 'required|numeric|min:0',
            'skus.*.price_ttc' => 'required|numeric|min:0',
            'skus.*.weight' => 'nullable|numeric|min:0',
            'skus.*.stock_quantity' => 'nullable|integer|min:0',
            'skus.*.is_default' => 'boolean',
            'skus.*.attributes' => 'array'
        ]);
        
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        
        DB::transaction(function () use ($validated, $request) {
            // Create product
            $productData = $validated;
            unset($productData['skus'], $productData['main_image'], $productData['gallery_images']);
            $product = Product::create($productData);
            
            // Handle main image upload
            if ($request->hasFile('main_image')) {
                $product->uploadMainImage($request->file('main_image'));
            }
            
            // Handle gallery images upload
            if ($request->hasFile('gallery_images')) {
                $product->uploadGalleryImages($request->file('gallery_images'));
            }
            
            // Create SKUs
            $hasDefault = false;
            foreach ($validated['skus'] as $index => $skuData) {
                $attributes = $skuData['attributes'] ?? [];
                unset($skuData['attributes']);
                
                // Ensure only one default SKU
                if (!empty($skuData['is_default'])) {
                    if ($hasDefault) {
                        $skuData['is_default'] = false;
                    } else {
                        $hasDefault = true;
                    }
                }
                
                // First SKU is default if none specified
                if ($index === 0 && !$hasDefault) {
                    $skuData['is_default'] = true;
                    $hasDefault = true;
                }
                
                $sku = $product->skus()->create($skuData);
                
                // Attach attributes
                foreach ($attributes as $attributeId => $valueId) {
                    if ($valueId) {
                        $sku->attributeValues()->attach($valueId);
                    }
                }
            }
        });
        
        return redirect()->route('admin.products.index')
            ->with('success', 'Produit créé avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Product $product)
    {
        $product->load(['category', 'skus.attributeValues.attribute']);
        
        return Inertia::render('Admin/Products/Show', [
            'product' => $product
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Product $product)
    {
        $product->load(['skus.attributeValues']);
        $categories = Category::orderBy('name')->get();
        $attributes = ProductAttribute::with('values')->orderBy('name')->get();
        
        return Inertia::render('Admin/Products/Edit', [
            'product' => $product,
            'categories' => $categories,
            'attributes' => $attributes
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:products,slug,' . $product->id,
            'reference' => 'required|string|max:50|unique:products,reference,' . $product->id,
            'barcode' => 'nullable|string|max:50|unique:products,barcode,' . $product->id,
            'description' => 'nullable|string',
            'category_id' => 'required|exists:categories,id',
            'is_active' => 'boolean',
            'is_variable_weight' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
            'main_image' => 'nullable|image|max:10240',
            'gallery_images' => 'nullable|array',
            'gallery_images.*' => 'image|max:10240',
            'remove_gallery_images' => 'nullable|array',
            'remove_gallery_images.*' => 'string',
            'skus' => 'required|array|min:1',
            'skus.*.id' => 'nullable|exists:product_skus,id',
            'skus.*.purchase_price' => 'required|numeric|min:0',
            'skus.*.price_ht' => 'required|numeric|min:0',
            'skus.*.price_ttc' => 'required|numeric|min:0',
            'skus.*.weight' => 'nullable|numeric|min:0',
            'skus.*.stock_quantity' => 'nullable|integer|min:0',
            'skus.*.is_default' => 'boolean',
            'skus.*.attributes' => 'array'
        ]);
        
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        
        DB::transaction(function () use ($validated, $product, $request) {
            // Update product
            $productData = $validated;
            unset($productData['skus'], $productData['main_image'], $productData['gallery_images'], $productData['remove_gallery_images']);
            $product->update($productData);
            
            // Handle main image upload
            if ($request->hasFile('main_image')) {
                $product->uploadMainImage($request->file('main_image'));
            }
            
            // Handle gallery image removals
            if (!empty($validated['remove_gallery_images'])) {
                foreach ($validated['remove_gallery_images'] as $imagePath) {
                    $product->deleteGalleryImage($imagePath);
                }
            }
            
            // Handle gallery images upload
            if ($request->hasFile('gallery_images')) {
                $product->uploadGalleryImages($request->file('gallery_images'));
            }
            
            // Track existing SKU IDs
            $existingSkuIds = $product->skus->pluck('id')->toArray();
            $updatedSkuIds = [];
            
            // Update or create SKUs
            $hasDefault = false;
            foreach ($validated['skus'] as $index => $skuData) {
                $attributes = $skuData['attributes'] ?? [];
                unset($skuData['attributes']);
                
                // Ensure only one default SKU
                if (!empty($skuData['is_default'])) {
                    if ($hasDefault) {
                        $skuData['is_default'] = false;
                    } else {
                        $hasDefault = true;
                    }
                }
                
                if (!empty($skuData['id'])) {
                    // Update existing SKU
                    $sku = ProductSku::find($skuData['id']);
                    unset($skuData['id']);
                    $sku->update($skuData);
                    $updatedSkuIds[] = $sku->id;
                } else {
                    // Create new SKU
                    unset($skuData['id']);
                    $sku = $product->skus()->create($skuData);
                    $updatedSkuIds[] = $sku->id;
                }
                
                // Update attributes
                $sku->attributeValues()->sync(array_filter($attributes));
            }
            
            // Ensure at least one default SKU
            if (!$hasDefault) {
                ProductSku::where('product_id', $product->id)
                    ->orderBy('id')
                    ->first()
                    ->update(['is_default' => true]);
            }
            
            // Delete removed SKUs
            $skusToDelete = array_diff($existingSkuIds, $updatedSkuIds);
            if (!empty($skusToDelete)) {
                ProductSku::whereIn('id', $skusToDelete)->delete();
            }
        });
        
        return redirect()->route('admin.products.index')
            ->with('success', 'Produit mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Product $product)
    {
        // Delete all images first
        $product->deleteAllImages();
        
        // Delete the product
        $product->delete();
        
        return redirect()->route('admin.products.index')
            ->with('success', 'Produit supprimé avec succès.');
    }
    
    /**
     * Duplicate a product
     */
    public function duplicate(Product $product)
    {
        DB::transaction(function () use ($product) {
            $product->load(['skus.attributeValues']);
            
            // Create new product
            $newProduct = $product->replicate();
            $newProduct->name = $product->name . ' (Copie)';
            $newProduct->slug = Str::slug($newProduct->name) . '-' . uniqid();
            $newProduct->reference = $product->reference . '-' . uniqid();
            $newProduct->barcode = $product->barcode ? $product->barcode . '-' . uniqid() : null;
            $newProduct->save();
            
            // Duplicate SKUs
            foreach ($product->skus as $sku) {
                $newSku = $sku->replicate();
                $newSku->product_id = $newProduct->id;
                $newSku->save();
                
                // Copy attribute values
                $newSku->attributeValues()->sync($sku->attributeValues->pluck('id'));
            }
        });
        
        return redirect()->route('admin.products.index')
            ->with('success', 'Produit dupliqué avec succès.');
    }
    
    /**
     * Update product stock
     */
    public function updateStock(Request $request, Product $product)
    {
        $validated = $request->validate([
            'skus' => 'required|array',
            'skus.*.id' => 'required|exists:product_skus,id',
            'skus.*.stock_quantity' => 'required|integer|min:0'
        ]);
        
        foreach ($validated['skus'] as $skuData) {
            ProductSku::where('id', $skuData['id'])
                ->where('product_id', $product->id)
                ->update(['stock_quantity' => $skuData['stock_quantity']]);
        }
        
        return response()->json(['message' => 'Stock mis à jour avec succès.']);
    }
}