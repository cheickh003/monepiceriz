<?php

namespace App\Http\Controllers\Shop;

use App\Http\Controllers\Controller;
use App\Domain\Catalog\Models\Category;
use App\Domain\Catalog\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ShopController extends Controller
{
    /**
     * Page d'accueil de la boutique
     */
    public function index()
    {
        // Catégories principales actives
        $categories = Category::with('children')
            ->whereNull('parent_id')
            ->where('is_active', true)
            ->orderBy('position')
            ->take(8)
            ->get();

        // Produits en vedette (featured)
        $promotedProducts = Product::with(['category', 'defaultSku' => function($query) {
                $query->orderBy('id');
            }])
            ->where('is_active', true)
            ->where('is_featured', true)
            ->orderBy('id', 'desc')
            ->take(8)
            ->get();

        // Nouveaux produits
        $newProducts = Product::with(['category', 'defaultSku' => function($query) {
                $query->orderBy('id');
            }])
            ->where('is_active', true)
            ->orderBy('created_at', 'desc')
            ->take(8)
            ->get();

        // Produits populaires (random pour l'instant)
        $popularProducts = Product::with(['category', 'defaultSku' => function($query) {
                $query->orderBy('id');
            }])
            ->where('is_active', true)
            ->inRandomOrder()
            ->take(8)
            ->get();

        return Inertia::render('Shop/Home', [
            'categories' => $categories,
            'promotions' => [
                'title' => 'Jusqu\'à 30% de réduction',
                'subtitle' => 'Profitez de nos offres exceptionnelles',
                'image' => '/images/hero-banner.jpg',
            ],
            'featured' => [
                'promoted' => $promotedProducts,
                'new' => $newProducts,
                'popular' => $popularProducts,
            ],
        ]);
    }

    /**
     * Liste des produits avec filtres
     */
    public function products(Request $request)
    {
        $query = Product::with(['category', 'defaultSku' => function($query) {
                $query->orderBy('id');
            }])
            ->where('is_active', true);

        // Filtre par catégorie
        if ($request->has('category')) {
            $query->where('category_id', $request->category);
        }

        // Filtre par prix
        if ($request->has('min_price')) {
            $query->where('price_ttc', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price_ttc', '<=', $request->max_price);
        }

        // Filtre par promotion
        if ($request->boolean('promo')) {
            $query->where('is_promoted', true)
                ->whereNotNull('promo_price');
        }

        // Filtre par stock
        if ($request->boolean('in_stock')) {
            $query->whereHas('skus', function ($q) {
                $q->where('stock_quantity', '>', 0);
            });
        }

        // Tri
        $sortBy = $request->get('sort', 'position');
        switch ($sortBy) {
            case 'price_asc':
                $query->orderBy('price_ttc', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price_ttc', 'desc');
                break;
            case 'name':
                $query->orderBy('name', 'asc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            default:
                $query->orderBy('position')->orderBy('created_at', 'desc');
        }

        $products = $query->paginate(20)->through(function ($product) {
            // Ajouter des métadonnées pour chaque produit
            if ($product->is_promoted && $product->promo_price) {
                $product->savings = $product->price_ttc - $product->promo_price;
                $product->savings_percentage = round((($product->price_ttc - $product->promo_price) / $product->price_ttc) * 100);
            }
            // Ajouter une note fictive
            $product->rating = rand(35, 50) / 10;
            $product->reviews_count = rand(50, 500);
            
            // Indicateur de stock faible
            if ($product->defaultSku) {
                $stock = $product->defaultSku->stock_quantity;
                $product->stock_status = $stock <= 0 ? 'out_of_stock' : ($stock <= 5 ? 'low_stock' : 'in_stock');
            }
            
            return $product;
        });

        // Catégories avec comptage pour les filtres
        $categories = Category::where('is_active', true)
            ->orderBy('position')
            ->get();

        return Inertia::render('Shop/Products', [
            'products' => $products,
            'categories' => $categories,
            'filters' => [
                'category' => $request->category,
                'min_price' => $request->min_price,
                'max_price' => $request->max_price,
                'promo' => $request->boolean('promo'),
                'in_stock' => $request->boolean('in_stock'),
                'sort' => $sortBy,
            ],
        ]);
    }

    /**
     * Détail d'un produit
     */
    public function product(Product $product)
    {
        if (!$product->is_active) {
            abort(404);
        }

        // Incrémenter le compteur de vues
        $product->increment('views_count');

        // Charger les relations nécessaires
        $product->load([
            'category',
            'skus' => function ($query) {
                $query->with(['attributeValues.attribute']);
            }
        ]);

        // Produits similaires
        $relatedProducts = Product::with(['category', 'defaultSku' => function($query) {
                $query->orderBy('id');
            }])
            ->where('category_id', $product->category_id)
            ->where('id', '!=', $product->id)
            ->where('is_active', true)
            ->take(4)
            ->get();

        return Inertia::render('Shop/ProductDetail', [
            'product' => $product,
            'relatedProducts' => $relatedProducts,
        ]);
    }

    /**
     * Produits d'une catégorie
     */
    public function category(Category $category, Request $request)
    {
        if (!$category->is_active) {
            abort(404);
        }

        $query = Product::with(['category', 'defaultSku' => function($query) {
                $query->orderBy('id');
            }])
            ->where('is_active', true)
            ->where('category_id', $category->id);

        // Appliquer les mêmes filtres que la page produits
        if ($request->has('min_price')) {
            $query->where('price_ttc', '>=', $request->min_price);
        }
        if ($request->has('max_price')) {
            $query->where('price_ttc', '<=', $request->max_price);
        }
        if ($request->boolean('promo')) {
            $query->where('is_promoted', true)
                ->whereNotNull('promo_price');
        }
        if ($request->boolean('in_stock')) {
            $query->whereHas('skus', function ($q) {
                $q->where('stock_quantity', '>', 0);
            });
        }

        $sortBy = $request->get('sort', 'position');
        switch ($sortBy) {
            case 'price_asc':
                $query->orderBy('price_ttc', 'asc');
                break;
            case 'price_desc':
                $query->orderBy('price_ttc', 'desc');
                break;
            case 'name':
                $query->orderBy('name', 'asc');
                break;
            case 'newest':
                $query->orderBy('created_at', 'desc');
                break;
            default:
                $query->orderBy('position')->orderBy('created_at', 'desc');
        }

        $products = $query->paginate(20);

        // Sous-catégories
        $subcategories = $category->children()
            ->where('is_active', true)
            ->orderBy('position')
            ->get();

        return Inertia::render('Shop/Category', [
            'category' => $category,
            'subcategories' => $subcategories,
            'products' => $products,
            'filters' => [
                'min_price' => $request->min_price,
                'max_price' => $request->max_price,
                'promo' => $request->boolean('promo'),
                'in_stock' => $request->boolean('in_stock'),
                'sort' => $sortBy,
            ],
        ]);
    }

    /**
     * Recherche de produits
     */
    public function search(Request $request)
    {
        $query = $request->get('q', '');
        
        if (empty($query)) {
            return Inertia::render('Shop/Search', [
                'query' => '',
                'products' => [],
                'categories' => [],
            ]);
        }

        // Recherche dans les produits
        $products = Product::with(['category', 'defaultSku' => function($query) {
                $query->orderBy('id');
            }])
            ->where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                    ->orWhere('description', 'like', "%{$query}%");
            })
            ->orderBy('name')
            ->paginate(20);

        // Recherche dans les catégories
        $categories = Category::where('is_active', true)
            ->where('name', 'like', "%{$query}%")
            ->orderBy('name')
            ->get();

        return Inertia::render('Shop/Search', [
            'query' => $query,
            'products' => $products,
            'categories' => $categories,
        ]);
    }

    /**
     * API pour les suggestions de recherche
     */
    public function searchSuggestions(Request $request)
    {
        $query = $request->get('q', '');
        
        if (strlen($query) < 2) {
            return response()->json([
                'products' => [],
                'categories' => [],
            ]);
        }

        // Recherche des produits
        $products = Product::where('is_active', true)
            ->where(function ($q) use ($query) {
                $q->where('name', 'like', "%{$query}%")
                  ->orWhere('description', 'like', "%{$query}%")
                  ->orWhere('short_description', 'like', "%{$query}%")
                  ->orWhere('tags', 'like', "%{$query}%");
            })
            ->with(['category', 'defaultSku'])
            ->select('id', 'name', 'slug', 'price_ttc', 'promo_price', 'is_promoted', 'category_id')
            ->take(5)
            ->get()
            ->map(function ($product) {
                return [
                    'id' => $product->id,
                    'name' => $product->name,
                    'slug' => $product->slug,
                    'price' => $product->price_ttc,
                    'promo_price' => $product->promo_price,
                    'is_promoted' => $product->is_promoted,
                    'category' => $product->category ? [
                        'name' => $product->category->name,
                        'slug' => $product->category->slug,
                    ] : null,
                    'image' => $product->getFirstImageUrl(),
                ];
            });

        // Recherche des catégories
        $categories = Category::where('is_active', true)
            ->where('name', 'like', "%{$query}%")
            ->select('id', 'name', 'slug', 'icon')
            ->take(3)
            ->get()
            ->map(function ($category) {
                return [
                    'id' => $category->id,
                    'name' => $category->name,
                    'slug' => $category->slug,
                    'icon' => $category->icon,
                    'products_count' => $category->products()->where('is_active', true)->count(),
                ];
            });

        return response()->json([
            'products' => $products,
            'categories' => $categories,
        ]);
    }
    
    /**
     * S'abonner à la newsletter
     */
    public function subscribeNewsletter(Request $request)
    {
        $request->validate([
            'email' => 'required|email|max:255',
            'consent' => 'accepted',
        ]);
        
        // TODO: Implémenter la logique de stockage
        // Pour l'instant, on retourne juste un succès
        
        return response()->json([
            'success' => true,
            'message' => 'Merci de votre inscription ! Vous recevrez bientôt nos actualités.',
        ]);
    }
}