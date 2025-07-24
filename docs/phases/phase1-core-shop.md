# Phase 1 : Développement du Cœur de la Boutique

**Durée estimée :** 2-3 semaines  
**Objectif :** Construire un catalogue de produits consultable par le public. Pas encore de panier ni de paiement.

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Architecture technique](#architecture-technique)
3. [Tâches détaillées](#tâches-détaillées)
4. [Implémentation](#implémentation)
5. [Tests requis](#tests-requis)
6. [Checklist de validation](#checklist-de-validation)

## Vue d'ensemble

La Phase 1 établit le cœur fonctionnel de la boutique : un catalogue de produits navigable avec une interface d'administration pour gérer les produits et catégories.

### Livrables attendus
- [x] Panneau admin fonctionnel avec auth 2FA
- [x] CRUD complet pour catégories et produits
- [x] Upload d'images fonctionnel via Supabase Storage
- [x] Base de données peuplée avec données de démonstration
- [ ] Site vitrine navigable avec recherche (Frontend à implémenter)

## Architecture technique

### Stack front-end
- **Framework :** Inertia.js avec React TypeScript
- **UI :** Tailwind CSS + Shadcn/ui
- **État :** Context API pour le panier (localStorage)
- **Routing :** Inertia router

### Stack back-end
- **Framework :** Laravel 11
- **ORM :** Eloquent avec Query Builders personnalisés
- **Cache :** Redis pour les produits populaires
- **Search :** PostgreSQL full-text search

## Tâches détaillées

### P1.1 - Panneau d'Admin avec Authentification 2FA

#### Configuration Laravel Fortify
```bash
composer require laravel/fortify
php artisan vendor:publish --provider="Laravel\Fortify\FortifyServiceProvider"
php artisan migrate
```

#### Implémentation 2FA
```php
// app/Models/User.php
use Laravel\Fortify\TwoFactorAuthenticatable;

class User extends Authenticatable
{
    use TwoFactorAuthenticatable;
    
    protected $casts = [
        'two_factor_confirmed_at' => 'datetime',
    ];
}
```

#### Middleware Admin
```php
// app/Http/Middleware/AdminMiddleware.php
public function handle($request, Closure $next)
{
    if (!auth()->user() || !in_array(auth()->user()->role, ['admin', 'manager'])) {
        abort(403);
    }
    
    return $next($request);
}
```

### P1.2 - CRUD Catégories

#### Migration
```php
Schema::create('categories', function (Blueprint $table) {
    $table->id();
    $table->string('name');
    $table->string('slug')->unique();
    $table->unsignedBigInteger('parent_id')->nullable();
    $table->integer('position')->default(0);
    $table->boolean('is_active')->default(true);
    $table->string('icon', 50)->nullable();
    $table->timestamps();
    
    $table->index('slug');
    $table->index('parent_id');
    $table->index('is_active');
});
```

#### Model avec relations
```php
// app/Domain/Catalog/Models/Category.php
class Category extends Model
{
    protected $fillable = [
        'name', 'slug', 'parent_id', 
        'position', 'is_active', 'icon'
    ];
    
    public function parent()
    {
        return $this->belongsTo(Category::class, 'parent_id');
    }
    
    public function children()
    {
        return $this->hasMany(Category::class, 'parent_id')
            ->orderBy('position');
    }
    
    public function products()
    {
        return $this->hasMany(Product::class);
    }
}
```

### P1.3 - CRUD Produits avec SKUs

#### Structure des produits variables
```php
// app/Domain/Catalog/Models/Product.php
class Product extends Model
{
    public function skus()
    {
        return $this->hasMany(ProductSku::class);
    }
    
    public function defaultSku()
    {
        return $this->hasOne(ProductSku::class)
            ->orderBy('id');
    }
    
    public function category()
    {
        return $this->belongsTo(Category::class);
    }
}

// app/Domain/Catalog/Models/ProductSku.php
class ProductSku extends Model
{
    protected $casts = [
        'images' => 'array',
        'is_variable_weight' => 'boolean',
    ];
    
    public function product()
    {
        return $this->belongsTo(Product::class);
    }
}
```

### P1.4 - Service Storage Supabase

#### Upload d'images
```php
// app/Infrastructure/Storage/SupabaseStorageService.php
class SupabaseStorageService
{
    public function uploadProductImage(UploadedFile $file, string $productSlug): string
    {
        $fileName = $productSlug . '-' . Str::random(10) . '.' . $file->extension();
        $path = 'products/' . date('Y/m') . '/' . $fileName;
        
        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . config('supabase.service_key'),
            'Content-Type' => $file->getMimeType(),
        ])->withBody(
            $file->get(), 
            $file->getMimeType()
        )->post(config('supabase.url') . '/storage/v1/object/products/' . $path);
        
        if ($response->successful()) {
            return config('supabase.url') . '/storage/v1/object/public/products/' . $path;
        }
        
        throw new \Exception('Failed to upload image');
    }
}
```

### P1.5 - Seeders de Données

#### Import depuis le catalogue PDF
```php
// database/seeders/CatalogSeeder.php
class CatalogSeeder extends Seeder
{
    public function run()
    {
        $categories = [
            'Alimentation' => ['icon' => 'shopping-basket'],
            'Boissons' => ['icon' => 'cup-soda'],
            'Hygiène' => ['icon' => 'soap'],
            'Entretien' => ['icon' => 'spray-can'],
            'Boucherie' => ['icon' => 'beef'],
            'Poissonnerie' => ['icon' => 'fish'],
        ];
        
        foreach ($categories as $name => $data) {
            Category::create([
                'name' => $name,
                'slug' => Str::slug($name),
                'icon' => $data['icon'],
                'is_active' => true
            ]);
        }
        
        // Import des produits depuis le CSV/JSON
        $this->importProducts();
    }
}
```

### P1.6 - Front-end : Page d'accueil

#### Layout principal
```jsx
// resources/js/Layouts/ShopLayout.jsx
import { Header } from '@/Components/layout/Header'
import { Footer } from '@/Components/layout/Footer'

export default function ShopLayout({ children }) {
    return (
        <div className="min-h-screen bg-background">
            <Header />
            <main className="container mx-auto px-4 py-8">
                {children}
            </main>
            <Footer />
        </div>
    )
}
```

#### Page d'accueil
```jsx
// resources/js/Pages/Shop/Home.jsx
import { Head } from '@inertiajs/react'
import { HeroSection } from '@/Components/shop/HeroSection'
import { FeaturedProducts } from '@/Components/shop/FeaturedProducts'
import { Categories } from '@/Components/shop/Categories'

export default function Home({ featured, categories, promotions }) {
    return (
        <>
            <Head title="Accueil" />
            <HeroSection promotions={promotions} />
            <Categories categories={categories} />
            <FeaturedProducts 
                title="Nouveautés" 
                products={featured.new} 
            />
            <FeaturedProducts 
                title="En promotion" 
                products={featured.promo} 
            />
        </>
    )
}
```

### P1.7 - Liste des produits avec filtres

#### Composant de filtrage
```jsx
// resources/js/Components/shop/ProductFilters.jsx
import { useState } from 'react'
import { Slider } from '@/Components/ui/slider'
import { Checkbox } from '@/Components/ui/checkbox'

export function ProductFilters({ categories, onFilterChange }) {
    const [filters, setFilters] = useState({
        category: null,
        priceRange: [0, 100000],
        inStock: true,
        onPromo: false
    })
    
    const updateFilter = (key, value) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        onFilterChange(newFilters)
    }
    
    return (
        <div className="space-y-4">
            {/* Implémentation des filtres */}
        </div>
    )
}
```

### P1.8 - Page détail produit

#### Galerie d'images
```jsx
// resources/js/Components/shop/ProductGallery.jsx
import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export function ProductGallery({ images }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    
    return (
        <div className="relative">
            <img 
                src={images[currentIndex]} 
                alt="Product"
                className="w-full h-96 object-cover rounded-lg"
            />
            {/* Navigation entre images */}
        </div>
    )
}
```

### P1.9 - Recherche Full-Text

#### Configuration PostgreSQL
```php
// Migration pour l'index de recherche
DB::statement('
    CREATE INDEX idx_products_search 
    ON products 
    USING gin(to_tsvector(\'french\', name || \' \' || COALESCE(description, \'\')))
');
```

#### Service de recherche
```php
// app/Domain/Catalog/Services/SearchService.php
class SearchService
{
    public function searchProducts(string $query, array $filters = [])
    {
        return Product::query()
            ->when($query, function ($q) use ($query) {
                $q->whereRaw(
                    "to_tsvector('french', name || ' ' || COALESCE(description, '')) @@ plainto_tsquery('french', ?)",
                    [$query]
                );
            })
            ->when($filters['category'] ?? null, function ($q, $category) {
                $q->where('category_id', $category);
            })
            ->with(['defaultSku', 'category'])
            ->paginate(20);
    }
}
```

## Tests requis

### Tests unitaires
```php
// tests/Unit/Domain/Catalog/ProductServiceTest.php
class ProductServiceTest extends TestCase
{
    /** @test */
    public function it_can_create_product_with_multiple_skus()
    {
        // Test implementation
    }
    
    /** @test */
    public function it_handles_variable_weight_products()
    {
        // Test implementation
    }
}
```

### Tests d'intégration
```php
// tests/Feature/Shop/CatalogTest.php
class CatalogTest extends TestCase
{
    /** @test */
    public function visitors_can_browse_products()
    {
        // Test implementation
    }
    
    /** @test */
    public function search_returns_relevant_results()
    {
        // Test implementation
    }
}
```

## Checklist de validation

### Backend
- [x] Authentication 2FA fonctionnelle (Laravel Fortify configuré)
- [x] CRUD catégories complet (CategoryController avec relations parent/enfant)
- [x] CRUD produits avec SKUs (ProductController avec support poids variable)
- [x] Upload images vers Supabase (SupabaseStorageService + trait HasProductImages)
- [x] Structure pour recherche full-text PostgreSQL (migrations prêtes)
- [x] Controllers admin testés et fonctionnels

### Frontend
- [ ] Page d'accueil responsive
- [ ] Navigation entre catégories
- [ ] Liste produits avec pagination
- [ ] Filtres fonctionnels
- [ ] Page détail produit
- [ ] Recherche temps réel

### Performance
- [ ] Cache Redis configuré
- [ ] Images optimisées
- [ ] Lazy loading implémenté
- [ ] Score Lighthouse > 90

### Sécurité
- [ ] Authentification admin sécurisée
- [ ] Protection CSRF
- [ ] Validation des entrées
- [ ] Rate limiting API

## Prochaines étapes

Une fois la Phase 1 complétée et validée, nous pourrons passer à la [Phase 2 : Workflow de Commande et Intégrations](./phase2-order-workflow.md).

## Notes d'implémentation

```
[Date] - [Développeur] - [Note]
22/07/2025 - Initialisation - Documentation de la Phase 1 créée

23-24/07/2025 - Implémentation Backend Phase 1
COMPLÉTÉ:
- P1.1: Laravel Fortify installé et configuré avec 2FA
  - Migration add_two_factor_columns_to_users_table créée
  - AdminMiddleware pour protection des routes
  - Configuration dans FortifyServiceProvider
  
- P1.2: CRUD Catégories fonctionnel
  - CategoryController avec toutes les méthodes CRUD
  - Support hiérarchique (parent/enfant)
  - Gestion des positions pour l'ordre d'affichage
  - CategorySeeder avec 38 catégories du PDF
  
- P1.3: CRUD Produits avec architecture complexe
  - ProductController avec gestion multi-SKUs
  - ProductAttributeController pour les variantes
  - Modèles: Product, ProductSku, ProductAttribute, ProductAttributeValue
  - Support complet des produits à poids variable
  - Système de prix triple (achat, HT, TTC)
  
- P1.4: Service Storage Supabase implémenté
  - SupabaseStorageService avec toutes les méthodes
  - Trait HasProductImages pour les modèles
  - Support image principale + galerie
  - Validation et organisation des fichiers
  
- P1.5: Seeders de données créés
  - ProductAttributeSeeder (Poids, Volume, Format, Conditionnement)
  - ProductSeeder avec produits de démonstration
  - 6 catégories populées avec produits variés

ARCHITECTURE:
- Domain-Driven Design respecté
- app/Domain/Catalog/ pour les modèles métier
- app/Services/ pour la logique métier
- app/Traits/ pour les comportements réutilisables
- Migrations compatibles SQLite/PostgreSQL

À FAIRE (Frontend):
- P1.6 à P1.9: Toute l'interface utilisateur
- Composants React avec Inertia.js
- UI avec Tailwind CSS et Shadcn/ui
- Intégration avec le backend API
```