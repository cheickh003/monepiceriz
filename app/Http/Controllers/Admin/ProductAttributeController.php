<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Catalog\Models\ProductAttribute;
use App\Domain\Catalog\Models\ProductAttributeValue;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class ProductAttributeController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $attributes = ProductAttribute::with('values')
            ->withCount('values')
            ->orderBy('name')
            ->get()
            ->map(function ($attribute) {
                // Ensure values is always an array
                $attribute->values = $attribute->values ?? collect([]);
                return $attribute;
            });
            
        return Inertia::render('Admin/ProductAttributes/Index', [
            'attributes' => $attributes
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        return Inertia::render('Admin/ProductAttributes/Create');
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:product_attributes',
            'slug' => 'nullable|string|max:255|unique:product_attributes',
            'type' => 'required|in:select,color,size,weight',
            'is_required' => 'boolean',
            'values' => 'array',
            'values.*.value' => 'required|string|max:255',
            'values.*.label' => 'nullable|string|max:255',
            'values.*.hex_color' => 'nullable|string|max:7'
        ]);
        
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        
        $values = $validated['values'] ?? [];
        unset($validated['values']);
        
        $attribute = ProductAttribute::create($validated);
        
        // Create attribute values
        foreach ($values as $valueData) {
            if (empty($valueData['label'])) {
                $valueData['label'] = $valueData['value'];
            }
            $attribute->values()->create($valueData);
        }
        
        return redirect()->route('admin.product-attributes.index')
            ->with('success', 'Attribut créé avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(ProductAttribute $productAttribute)
    {
        $productAttribute->load('values');
        
        return Inertia::render('Admin/ProductAttributes/Show', [
            'attribute' => $productAttribute
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(ProductAttribute $productAttribute)
    {
        $productAttribute->load('values');
        
        // Get products using this attribute
        $productsUsingAttribute = $productAttribute->values()
            ->with(['skus.product:id,name,reference'])
            ->get()
            ->pluck('skus')
            ->flatten()
            ->pluck('product')
            ->unique('id')
            ->values()
            ->take(20); // Limit to 20 for performance
        
        return Inertia::render('Admin/ProductAttributes/Edit', [
            'attribute' => $productAttribute,
            'products_using_attribute' => $productsUsingAttribute
        ]);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, ProductAttribute $productAttribute)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:product_attributes,name,' . $productAttribute->id,
            'slug' => 'nullable|string|max:255|unique:product_attributes,slug,' . $productAttribute->id,
            'type' => 'required|in:select,color,size,weight',
            'is_required' => 'boolean',
            'values' => 'array',
            'values.*.id' => 'nullable|exists:product_attribute_values,id',
            'values.*.value' => 'required|string|max:255',
            'values.*.label' => 'nullable|string|max:255',
            'values.*.hex_color' => 'nullable|string|max:7'
        ]);
        
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        
        $values = $validated['values'] ?? [];
        unset($validated['values']);
        
        $productAttribute->update($validated);
        
        // Update or create values
        $existingValueIds = $productAttribute->values->pluck('id')->toArray();
        $updatedValueIds = [];
        
        foreach ($values as $valueData) {
            if (empty($valueData['label'])) {
                $valueData['label'] = $valueData['value'];
            }
            
            if (!empty($valueData['id'])) {
                $value = ProductAttributeValue::find($valueData['id']);
                unset($valueData['id']);
                $value->update($valueData);
                $updatedValueIds[] = $value->id;
            } else {
                unset($valueData['id']);
                $value = $productAttribute->values()->create($valueData);
                $updatedValueIds[] = $value->id;
            }
        }
        
        // Delete removed values
        $valuesToDelete = array_diff($existingValueIds, $updatedValueIds);
        if (!empty($valuesToDelete)) {
            ProductAttributeValue::whereIn('id', $valuesToDelete)->delete();
        }
        
        return redirect()->route('admin.product-attributes.index')
            ->with('success', 'Attribut mis à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(ProductAttribute $productAttribute)
    {
        // Check if attribute is used by any SKU
        $usedInSkus = $productAttribute->values()
            ->whereHas('skus')
            ->exists();
            
        if ($usedInSkus) {
            return redirect()->back()
                ->with('error', 'Impossible de supprimer cet attribut car il est utilisé par des produits.');
        }
        
        $productAttribute->delete();
        
        return redirect()->route('admin.product-attributes.index')
            ->with('success', 'Attribut supprimé avec succès.');
    }
    
    /**
     * Add a new value to an attribute
     */
    public function addValue(Request $request, ProductAttribute $productAttribute)
    {
        $validated = $request->validate([
            'value' => 'required|string|max:255',
            'label' => 'nullable|string|max:255',
            'hex_color' => 'nullable|string|max:7'
        ]);
        
        if (empty($validated['label'])) {
            $validated['label'] = $validated['value'];
        }
        
        $value = $productAttribute->values()->create($validated);
        
        return response()->json([
            'message' => 'Valeur ajoutée avec succès.',
            'value' => $value
        ]);
    }
}