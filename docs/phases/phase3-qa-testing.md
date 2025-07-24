# Phase 3 : Finalisation, Tests et Assurance Qualité

**Durée estimée :** 2 semaines  
**Objectif :** S'assurer que l'application est stable, sécurisée et performante avant le lancement.

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Strategy de test](#strategy-de-test)
3. [Tests automatisés](#tests-automatisés)
4. [Optimisation des performances](#optimisation-des-performances)
5. [Audit de sécurité](#audit-de-sécurité)
6. [Préparation au lancement](#préparation-au-lancement)

## Vue d'ensemble

La Phase 3 est cruciale pour garantir la qualité et la fiabilité de la plateforme avant sa mise en production.

### Livrables attendus
- [ ] Suite de tests complète (unitaires, intégration, E2E)
- [ ] Audit de sécurité validé
- [ ] Performance optimisée (scores Lighthouse 90+)
- [ ] Documentation technique et utilisateur
- [ ] Environnement de staging validé

## Strategy de test

### Pyramide de tests
```
         ╱ E2E ╲        10%  - Tests de parcours complets
        ╱──────╲
       ╱ Intégr.╲       30%  - Tests d'intégration API
      ╱──────────╲
     ╱  Unitaires ╲     60%  - Tests unitaires isolés
    ╱──────────────╲
```

## Tests automatisés

### P3.1 - Tests End-to-End (E2E)

#### Configuration Cypress
```bash
npm install --save-dev cypress @cypress/code-coverage
npx cypress open
```

#### Tests de parcours critiques
```javascript
// cypress/e2e/critical-paths.cy.js
describe('Parcours critiques', () => {
  beforeEach(() => {
    cy.task('db:seed')
  })
  
  describe('Parcours d\'achat complet', () => {
    it('permet de commander avec retrait en magasin', () => {
      // 1. Navigation catalogue
      cy.visit('/')
      cy.get('[data-cy=category-link]').contains('Alimentation').click()
      
      // 2. Ajout au panier
      cy.get('[data-cy=product-card]').first().within(() => {
        cy.get('[data-cy=add-to-cart]').click()
      })
      
      // 3. Vérification panier
      cy.get('[data-cy=cart-count]').should('contain', '1')
      cy.visit('/cart')
      
      // 4. Checkout
      cy.get('[data-cy=checkout-btn]').click()
      cy.fillCheckoutForm({
        name: 'Test Client',
        phone: '0123456789',
        method: 'pickup'
      })
      
      // 5. Paiement
      cy.get('[data-cy=submit-order]').click()
      cy.url().should('include', 'cinetpay')
      
      // Simuler retour de paiement
      cy.visit('/payment/return?status=success&transaction_id=TEST123')
      cy.contains('Commande confirmée').should('be.visible')
    })
    
    it('valide le montant minimum pour livraison', () => {
      // Ajouter produit < 3000 F
      cy.addToCart('SKU-CHEAP', 1)
      cy.visit('/checkout')
      
      // Sélectionner livraison
      cy.get('[data-cy=delivery-method-delivery]').click()
      cy.get('[data-cy=submit-order]').click()
      
      // Vérifier message d\'erreur
      cy.get('[data-cy=error-message]')
        .should('contain', 'montant minimum')
        .and('contain', '3000 F CFA')
    })
  })
  
  describe('Gestion produits variables', () => {
    it('affiche le message pour les produits au poids', () => {
      cy.visit('/products/gigot-agneau')
      cy.contains('Le prix final sera ajusté après la pesée').should('be.visible')
      cy.get('[data-cy=price-label]').should('contain', '/kg')
    })
  })
})
```

#### Tests admin
```javascript
// cypress/e2e/admin.cy.js
describe('Interface Admin', () => {
  beforeEach(() => {
    cy.loginAsAdmin()
  })
  
  it('permet de gérer les produits', () => {
    cy.visit('/admin/products')
    
    // Créer un produit
    cy.get('[data-cy=new-product]').click()
    cy.fillProductForm({
      name: 'Nouveau Produit',
      category: 'Alimentation',
      price: 1500,
      stock: 100
    })
    cy.get('[data-cy=save]').click()
    
    // Vérifier création
    cy.contains('Produit créé avec succès').should('be.visible')
    cy.get('[data-cy=products-list]').should('contain', 'Nouveau Produit')
  })
  
  it('permet d\'ajuster le poids des commandes', () => {
    cy.visit('/admin/orders')
    cy.get('[data-cy=order-row]').contains('Produits variables').click()
    
    // Ajuster le poids
    cy.get('[data-cy=weight-input]').clear().type('1.5')
    cy.get('[data-cy=update-weight]').click()
    
    // Vérifier recalcul
    cy.get('[data-cy=final-amount]').should('not.equal', '[data-cy=estimated-amount]')
  })
})
```

### P3.2 - Tests d'intégration API

#### Tests CinetPay
```php
// tests/Feature/Payment/CinetPayTest.php
namespace Tests\Feature\Payment;

use Tests\TestCase;
use App\Models\Order;
use Illuminate\Support\Facades\Http;

class CinetPayTest extends TestCase
{
    /** @test */
    public function it_initializes_payment_correctly()
    {
        Http::fake([
            'api.cinetpay.com/*' => Http::response([
                'code' => '201',
                'data' => [
                    'payment_url' => 'https://checkout.cinetpay.com/payment/test',
                    'payment_token' => 'TEST_TOKEN_123'
                ]
            ], 201)
        ]);
        
        $order = Order::factory()->create([
            'total_amount' => 5000
        ]);
        
        $response = $this->postJson("/api/orders/{$order->id}/pay");
        
        $response->assertOk()
            ->assertJsonStructure(['payment_url'])
            ->assertJson(['success' => true]);
        
        $this->assertDatabaseHas('orders', [
            'id' => $order->id,
            'transaction_id' => $response->json('transaction_id')
        ]);
    }
    
    /** @test */
    public function it_handles_webhook_notifications()
    {
        $order = Order::factory()->create([
            'transaction_id' => 'TEST-123',
            'payment_status' => 'pending'
        ]);
        
        $payload = [
            'cpm_trans_id' => 'TEST-123',
            'cpm_trans_status' => '00',
            'cpm_amount' => '5000',
            'signature' => $this->generateSignature('TEST-123')
        ];
        
        $response = $this->postJson('/api/cinetpay/notify', $payload);
        
        $response->assertOk();
        
        $order->refresh();
        $this->assertEquals('paid', $order->payment_status);
        $this->assertEquals('confirmed', $order->status);
    }
}
```

#### Tests Yango
```php
// tests/Feature/Shipping/YangoTest.php
class YangoTest extends TestCase
{
    /** @test */
    public function it_calculates_delivery_fee()
    {
        Http::fake([
            'api.yango.com/v1/estimate' => Http::response([
                'price' => ['amount' => 1500],
                'eta' => ['duration' => 30],
                'distance' => ['value' => 5.2]
            ])
        ]);
        
        $response = $this->postJson('/api/delivery/estimate', [
            'address' => 'Cocody, Abidjan'
        ]);
        
        $response->assertOk()
            ->assertJson([
                'fee' => 1500,
                'estimated_time' => 30
            ]);
    }
}
```

### P3.3 - Optimisation Base de Données

#### Analyse des requêtes
```sql
-- Identifier les requêtes lentes
SELECT 
    query,
    calls,
    total_time,
    mean_time,
    max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 20;

-- Analyser l'utilisation des index
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'laravel'
ORDER BY idx_scan;
```

#### Optimisations recommandées
```php
// database/migrations/add_performance_indexes.php
public function up()
{
    // Index composites pour les requêtes fréquentes
    DB::statement('CREATE INDEX idx_orders_status_date ON orders(status, created_at DESC)');
    DB::statement('CREATE INDEX idx_products_active_category ON products(is_active, category_id) WHERE is_active = true');
    DB::statement('CREATE INDEX idx_order_items_order_sku ON order_items(order_id, product_sku_id)');
    
    // Index partiel pour les commandes récentes
    DB::statement('CREATE INDEX idx_recent_orders ON orders(created_at DESC) WHERE created_at > NOW() - INTERVAL \'30 days\'');
    
    // Index GIN pour recherche JSONB
    DB::statement('CREATE INDEX idx_product_meta ON products USING gin(meta_data)');
}
```

### P3.4 - Cache Redis

#### Configuration du cache
```php
// app/Domain/Catalog/Services/CachedProductService.php
namespace App\Domain\Catalog\Services;

use Illuminate\Support\Facades\Cache;
use App\Domain\Catalog\Models\Product;

class CachedProductService
{
    private const CACHE_TTL = 3600; // 1 heure
    
    public function getFeaturedProducts()
    {
        return Cache::remember('featured_products', self::CACHE_TTL, function () {
            return Product::query()
                ->active()
                ->with(['defaultSku', 'category'])
                ->whereHas('skus', fn($q) => $q->where('stock_quantity', '>', 0))
                ->where('is_featured', true)
                ->limit(8)
                ->get();
        });
    }
    
    public function getProductBySlug(string $slug)
    {
        return Cache::tags(['products'])->remember(
            "product.{$slug}", 
            self::CACHE_TTL, 
            function () use ($slug) {
                return Product::with(['skus', 'category'])
                    ->where('slug', $slug)
                    ->firstOrFail();
            }
        );
    }
    
    public function clearProductCache(Product $product)
    {
        Cache::tags(['products'])->forget("product.{$product->slug}");
        Cache::forget('featured_products');
        Cache::forget('categories_menu');
    }
}
```

### P3.5 - Audit de Sécurité

#### Checklist de sécurité
```php
// tests/Security/SecurityAuditTest.php
class SecurityAuditTest extends TestCase
{
    /** @test */
    public function it_has_security_headers()
    {
        $response = $this->get('/');
        
        $response->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('X-XSS-Protection', '1; mode=block')
            ->assertHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    }
    
    /** @test */
    public function it_prevents_sql_injection()
    {
        $maliciousInput = "'; DROP TABLE users; --";
        
        $response = $this->get("/search?q={$maliciousInput}");
        
        $response->assertOk();
        $this->assertDatabaseHas('users', ['id' => 1]); // Table still exists
    }
    
    /** @test */
    public function it_encrypts_sensitive_data()
    {
        $customer = Customer::create([
            'name' => 'John Doe',
            'phone' => '0123456789',
            'email' => 'john@example.com'
        ]);
        
        $dbRecord = DB::table('customers')->where('id', $customer->id)->first();
        
        $this->assertNotEquals('John Doe', $dbRecord->name);
        $this->assertNotEquals('0123456789', $dbRecord->phone);
        $this->assertNotEquals('john@example.com', $dbRecord->email);
    }
}
```

#### Scan de vulnérabilités
```bash
# Audit des dépendances
composer audit
npm audit

# Scan OWASP
./vendor/bin/security-checker security:check

# Analyse statique
./vendor/bin/phpstan analyse --level=8
```

### P3.6 - Performance (Lighthouse)

#### Optimisations front-end
```javascript
// resources/js/app.jsx
// Lazy loading des composants
const ProductGallery = lazy(() => import('./Components/shop/ProductGallery'))
const CheckoutForm = lazy(() => import('./Components/shop/CheckoutForm'))

// Image optimization
export function OptimizedImage({ src, alt, ...props }) {
    return (
        <img
            src={src}
            alt={alt}
            loading="lazy"
            decoding="async"
            {...props}
        />
    )
}
```

#### Configuration Vite pour production
```javascript
// vite.config.js
export default defineConfig({
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    'react-vendor': ['react', 'react-dom'],
                    'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
                    'utils': ['clsx', 'tailwind-merge', 'class-variance-authority']
                }
            }
        },
        cssCodeSplit: true,
        minify: 'terser',
        terserOptions: {
            compress: {
                drop_console: true,
                drop_debugger: true
            }
        }
    }
})
```

### P3.7 - Contenu final

#### Pages légales
```blade
{{-- resources/views/legal/cgv.blade.php --}}
@extends('layouts.app')

@section('content')
<div class="max-w-4xl mx-auto prose">
    <h1>Conditions Générales de Vente</h1>
    
    <h2>Article 1 : Objet</h2>
    <p>Les présentes conditions générales de vente s'appliquent à toutes les ventes conclues sur le site Internet www.monepiceriz.com.</p>
    
    <h2>Article 2 : Prix</h2>
    <p>Les prix de nos produits sont indiqués en Francs CFA toutes taxes comprises (TTC).</p>
    
    {{-- Autres articles --}}
</div>
@endsection
```

### P3.8 - Environnement Staging

#### Configuration staging
```env
# .env.staging
APP_ENV=staging
APP_DEBUG=false
APP_URL=https://staging.monepiceriz.com

# Base de données staging
DATABASE_URL=postgres://staging_user:password@staging.supabase.co:5432/postgres

# Services en mode test
CINETPAY_MODE=TEST
YANGO_MODE=SANDBOX
```

#### Script de déploiement
```bash
#!/bin/bash
# deploy-staging.sh

echo "Déploiement sur staging..."

# Pull latest code
git pull origin develop

# Install dependencies
composer install --no-dev --optimize-autoloader
npm ci
npm run build

# Run migrations
php artisan migrate --force

# Clear caches
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Restart services
php artisan horizon:terminate
supervisorctl restart all

echo "Déploiement terminé!"
```

### P3.9 - Documentation

#### Documentation technique
```markdown
# Documentation Technique MonEpice&Riz

## Architecture
- Laravel 11 avec Inertia.js
- PostgreSQL via Supabase
- Redis pour cache et queues
- React avec TypeScript

## Installation locale
1. Cloner le repository
2. Copier `.env.example` vers `.env`
3. Configurer les variables d'environnement
4. Installer les dépendances
5. Lancer les migrations

## Conventions de code
- PSR-12 pour PHP
- ESLint + Prettier pour JavaScript
- Commits conventionnels

## API Endpoints
- `GET /api/products` - Liste des produits
- `POST /api/cart` - Gestion du panier
- `POST /api/checkout` - Validation commande
```

### P3.10 - Tests de charge

#### Configuration K6
```javascript
// k6/load-test.js
import http from 'k6/http'
import { check, sleep } from 'k6'

export const options = {
    stages: [
        { duration: '2m', target: 100 }, // Montée en charge
        { duration: '5m', target: 100 }, // Maintien
        { duration: '2m', target: 0 },   // Descente
    ],
    thresholds: {
        http_req_duration: ['p(95)<500'], // 95% des requêtes < 500ms
        http_req_failed: ['rate<0.05'],   // Taux d'erreur < 5%
    },
}

export default function () {
    // Test page d'accueil
    let res = http.get('https://staging.monepiceriz.com')
    check(res, { 'status is 200': (r) => r.status === 200 })
    
    sleep(1)
    
    // Test recherche
    res = http.get('https://staging.monepiceriz.com/search?q=riz')
    check(res, { 'search works': (r) => r.status === 200 })
    
    sleep(1)
}
```

## Checklist de validation

### Tests
- [ ] Tests unitaires passent (coverage > 80%)
- [ ] Tests d'intégration passent
- [ ] Tests E2E passent
- [ ] Tests de charge satisfaisants

### Performance
- [ ] Score Lighthouse Performance > 90
- [ ] Score Lighthouse Accessibility > 95
- [ ] Score Lighthouse Best Practices > 90
- [ ] Score Lighthouse SEO > 90

### Sécurité
- [ ] Audit de sécurité sans vulnérabilités critiques
- [ ] Headers de sécurité configurés
- [ ] Données sensibles chiffrées
- [ ] Rate limiting actif

### Documentation
- [ ] README.md complet
- [ ] Documentation API
- [ ] Guide d'installation
- [ ] Guide utilisateur

### Environnement
- [ ] Staging déployé et fonctionnel
- [ ] Backups configurés
- [ ] Monitoring actif
- [ ] Logs centralisés

## Prochaines étapes

Une fois la Phase 3 complétée et validée, nous pourrons passer à la [Phase 4 : Lancement et Opérations Post-Lancement](./phase4-launch-ops.md).

## Notes d'implémentation

```
[Date] - [Développeur] - [Note]
22/07/2025 - Initialisation - Documentation de la Phase 3 créée
```