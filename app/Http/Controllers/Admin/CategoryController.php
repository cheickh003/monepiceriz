<?php

namespace App\Http\Controllers\Admin;

use App\Domain\Catalog\Models\Category;
use App\Events\CategoryUpdated;
use App\Http\Controllers\Controller;
use App\Services\BroadcastManager;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;

class CategoryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Charger les catégories avec leurs enfants pour construire la hiérarchie
        $categories = Category::with(['children' => function($query) {
                $query->withCount('products')->orderBy('position');
            }])
            ->withCount('products')
            ->whereNull('parent_id') // Seulement les catégories racines
            ->orderBy('position')
            ->get()
            ->map(function ($category) {
                // Ensure children and products_count are always defined
                $category->children = $category->children ?? collect([]);
                $category->products_count = $category->products_count ?? 0;
                
                // Recursively ensure children have proper defaults
                $category->children = $category->children->map(function ($child) {
                    $child->children = $child->children ?? collect([]);
                    $child->products_count = $child->products_count ?? 0;
                    return $child;
                });
                
                return $category;
            });
            
        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories
        ]);
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        $parentCategories = Category::whereNull('parent_id')
            ->orderBy('name')
            ->get();
            
        return Inertia::render('Admin/Categories/Create', [
            'parentCategories' => $parentCategories
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Convert 'none' to null for parent_id
        $data = $request->all();
        if (isset($data['parent_id']) && $data['parent_id'] === 'none') {
            $data['parent_id'] = null;
        }
        if (isset($data['icon']) && $data['icon'] === 'none') {
            $data['icon'] = '';
        }
        
        $validated = validator($data, [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories',
            'parent_id' => 'nullable|exists:categories,id',
            'icon' => 'nullable|string|max:50',
            'position' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'description' => 'nullable|string',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ])->validate();
        
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        
        if (!isset($validated['position'])) {
            $validated['position'] = Category::where('parent_id', $validated['parent_id'] ?? null)
                ->max('position') + 1;
        }
        
        $category = Category::create($validated);
        
        // Déclencher l'événement de synchronisation via BroadcastManager
        try {
            BroadcastManager::dispatch()->categoryUpdated($category, 'created');
        } catch (\Exception $e) {
            \Log::warning('Échec de la synchronisation lors de la création de la catégorie', [
                'category_id' => $category->id,
                'error' => $e->getMessage()
            ]);
        }
        
        return redirect()->route('admin.categories.index')
            ->with('success', 'Catégorie créée avec succès.');
    }

    /**
     * Display the specified resource.
     */
    public function show(Category $category)
    {
        $category->load(['parent', 'children', 'products']);
        
        return Inertia::render('Admin/Categories/Show', [
            'category' => $category
        ]);
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(Category $category)
    {
        // Load the category with all its descendants
        $category->load('children');
        
        // Get all descendant IDs to exclude (to prevent circular references)
        $excludeIds = $this->getAllDescendantIds($category);
        $excludeIds[] = $category->id; // Also exclude the category itself
        
        // Get all root categories with their children, excluding the category and its descendants
        $categories = Category::with(['children' => function ($query) use ($excludeIds) {
                $query->whereNotIn('id', $excludeIds)->orderBy('position');
            }])
            ->whereNull('parent_id')
            ->whereNotIn('id', $excludeIds)
            ->orderBy('position')
            ->get();
            
        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
            'categories' => $categories
        ]);
    }
    
    /**
     * Get all descendant IDs of a category recursively
     */
    private function getAllDescendantIds(Category $category): array
    {
        $descendantIds = [];
        
        foreach ($category->children as $child) {
            $descendantIds[] = $child->id;
            $descendantIds = array_merge($descendantIds, $this->getAllDescendantIds($child));
        }
        
        return $descendantIds;
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Category $category)
    {
        // Convert 'none' to null for parent_id
        $data = $request->all();
        if (isset($data['parent_id']) && $data['parent_id'] === 'none') {
            $data['parent_id'] = null;
        }
        if (isset($data['icon']) && $data['icon'] === 'none') {
            $data['icon'] = '';
        }
        
        $validated = validator($data, [
            'name' => 'required|string|max:255',
            'slug' => 'nullable|string|max:255|unique:categories,slug,' . $category->id,
            'description' => 'nullable|string',
            'parent_id' => 'nullable|exists:categories,id|not_in:' . $category->id,
            'icon' => 'nullable|string|max:50',
            'position' => 'nullable|integer|min:0',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'meta_title' => 'nullable|string|max:255',
            'meta_description' => 'nullable|string|max:500',
        ])->validate();
        
        if (empty($validated['slug'])) {
            $validated['slug'] = Str::slug($validated['name']);
        }
        
        $category->update($validated);
        
        // Déclencher l'événement de synchronisation via BroadcastManager
        try {
            BroadcastManager::dispatch()->categoryUpdated($category, 'updated');
        } catch (\Exception $e) {
            \Log::warning('Échec de la synchronisation lors de la mise à jour de la catégorie', [
                'category_id' => $category->id,
                'error' => $e->getMessage()
            ]);
        }
        
        return redirect()->route('admin.categories.index')
            ->with('success', 'Catégorie mise à jour avec succès.');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Category $category)
    {
        // Check if category has products
        if ($category->products()->exists()) {
            return redirect()->back()
                ->with('error', 'Impossible de supprimer cette catégorie car elle contient des produits.');
        }
        
        // Move children to parent
        if ($category->children()->exists()) {
            $category->children()->update(['parent_id' => $category->parent_id]);
        }
        
        $category->delete();
        
        // Déclencher l'événement de synchronisation via BroadcastManager
        try {
            BroadcastManager::dispatch()->categoryUpdated($category, 'deleted');
        } catch (\Exception $e) {
            \Log::warning('Échec de la synchronisation lors de la suppression de la catégorie', [
                'category_id' => $category->id,
                'error' => $e->getMessage()
            ]);
        }
        
        return redirect()->route('admin.categories.index')
            ->with('success', 'Catégorie supprimée avec succès.');
    }
    
    /**
     * Update categories positions
     */
    public function updatePositions(Request $request)
    {
        $validated = $request->validate([
            'positions' => 'required|array',
            'positions.*.id' => 'required|exists:categories,id',
            'positions.*.position' => 'required|integer|min:0',
        ]);
        
        foreach ($validated['positions'] as $item) {
            $category = Category::find($item['id']);
            $category->update(['position' => $item['position']]);
            
            // Déclencher l'événement de synchronisation via BroadcastManager
            try {
                BroadcastManager::dispatch()->categoryUpdated($category, 'position_updated');
            } catch (\Exception $e) {
                \Log::warning('Échec de la synchronisation lors de la mise à jour de position de la catégorie', [
                    'category_id' => $category->id,
                    'error' => $e->getMessage()
                ]);
            }
        }
        
        return response()->json(['message' => 'Positions mises à jour avec succès.']);
    }
}