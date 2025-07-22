# Structure du Projet - MonEpice&Riz

Ce document décrit l'architecture complète et la structure du code pour la plateforme e-commerce MonEpice&Riz, avec un focus sur la sécurité et la scalabilité.

**Stack Technique :**
- **Framework Back-End :** Laravel 11.x
- **Base de données :** Supabase (PostgreSQL 16+)
- **Framework Front-End :** Inertia.js avec React
- **Styling & UI :** Tailwind CSS & Shadcn/ui
- **Cache :** Redis
- **Queue :** Redis + Laravel Horizon
- **Recherche :** PostgreSQL Full-Text Search (via Supabase)
- **Temps réel :** Supabase Realtime (pour notifications futures)

## 1. Architecture de Base de Données avec Supabase

### 1.1 Pourquoi Supabase ?

Supabase est une plateforme PostgreSQL managée qui offre :
- **PostgreSQL complet** : Accès à toutes les fonctionnalités PostgreSQL
- **Sécurité intégrée** : Row Level Security (RLS), SSL automatique
- **Extensions préinstallées** : pg_trgm, pgcrypto, pgjwt, uuid-ossp
- **API automatiques** : REST et GraphQL générées automatiquement
- **Temps réel** : WebSockets pour les changements en temps réel
- **Stockage d'objets** : Pour les images produits
- **Edge Functions** : Pour la logique métier côté serveur
- **Dashboard** : Interface web pour gérer la base de données

### 1.2 Configuration Supabase pour Laravel

#### Schéma dédié pour Laravel
Supabase expose le schéma `public` via son API REST. Pour la sécurité, nous utiliserons un schéma dédié :

```sql
-- Créer un schéma séparé pour Laravel
CREATE SCHEMA IF NOT EXISTS laravel;

-- Configurer le search_path pour l'utilisateur Laravel
ALTER ROLE postgres SET search_path TO laravel, public, extensions;
```

#### Configuration Laravel (config/database.php)
```php
'pgsql' => [
    'driver' => 'pgsql',
    'url' => env('DATABASE_URL'),
    'host' => env('DB_HOST', '127.0.0.1'),
    'port' => env('DB_PORT', '5432'),
    'database' => env('DB_DATABASE', 'postgres'),
    'username' => env('DB_USERNAME', 'postgres'),
    'password' => env('DB_PASSWORD', ''),
    'charset' => 'utf8',
    'prefix' => '',
    'prefix_indexes' => true,
    'search_path' => 'laravel', // Schéma dédié
    'sslmode' => 'require', // SSL obligatoire avec Supabase
],
```

### 1.3 Politiques de Sécurité Supabase (RLS)

Pour sécuriser l'accès aux données, nous utiliserons Row Level Security :

```sql
-- Activer RLS sur toutes les tables
ALTER TABLE laravel.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE laravel.orders ENABLE ROW LEVEL SECURITY;

-- Politique pour les produits (lecture publique)
CREATE POLICY "Produits visibles publiquement" ON laravel.products
    FOR SELECT USING (is_active = true);

-- Politique pour les commandes (accès restreint)
CREATE POLICY "Commandes accessibles aux admins" ON laravel.orders
    FOR ALL USING (auth.jwt() ->> 'role' = 'admin');
```

### 1.4 Utilisation du Storage Supabase

Pour les images produits, nous utiliserons Supabase Storage :

```php
// Service pour gérer les images
class SupabaseStorageService
{
    private string $bucketName = 'products';
    
    public function uploadProductImage($file): string
    {
        $client = new \GuzzleHttp\Client();
        $response = $client->post(
            config('supabase.url') . '/storage/v1/object/' . $this->bucketName,
            [
                'headers' => [
                    'Authorization' => 'Bearer ' . config('supabase.service_key'),
                    'Content-Type' => $file->getMimeType()
                ],
                'body' => file_get_contents($file->getRealPath())
            ]
        );
        
        return json_decode($response->getBody(), true)['Key'];
    }
}
```

### 1.5 Schéma de Base de Données

#### Tables principales

##### `users` (Personnel administratif uniquement)
```sql
| Champ                | Type         | Description                          |
|---------------------|--------------|--------------------------------------|
| id                  | uuid         | Identifiant unique                   |
| name                | varchar(255) | Nom complet                          |
| email               | varchar(255) | Email unique                         |
| password            | varchar(255) | Hash bcrypt                          |
| role                | enum         | admin, manager, staff                |
| two_factor_secret   | text         | Secret 2FA (chiffré)                |
| last_login_at       | timestamp    | Dernière connexion                   |
| failed_login_count  | integer      | Compteur tentatives échouées         |
| locked_until        | timestamp    | Verrouillage temporaire              |
| created_at          | timestamp    |                                      |
| updated_at          | timestamp    |                                      |
```

##### `categories`
```sql
| Champ         | Type         | Description                            | Index    |
|--------------|--------------|----------------------------------------|----------|
| id           | bigint       | Identifiant unique                     | PRIMARY  |
| name         | varchar(255) | Nom de la catégorie                    |          |
| slug         | varchar(255) | URL-friendly, unique                   | UNIQUE   |
| parent_id    | bigint       | Référence catégorie parente (nullable) | INDEX    |
| position     | integer      | Ordre d'affichage                      |          |
| is_active    | boolean      | Statut actif/inactif                   | INDEX    |
| icon         | varchar(50)  | Icône de la catégorie (nullable)       |          |
| created_at   | timestamp    |                                        |          |
| updated_at   | timestamp    |                                        |          |
```

##### `products`
```sql
| Champ               | Type         | Description                              | Index    |
|--------------------|--------------|------------------------------------------|----------|
| id                 | bigint       | Identifiant unique                       | PRIMARY  |
| category_id        | bigint       | Référence catégorie                      | INDEX    |
| ref                | varchar(50)  | Référence interne (nullable)             | INDEX    |
| barcode            | varchar(50)  | Code-barres EAN (nullable)               | UNIQUE   |
| name               | varchar(255) | Nom du produit                           | FULLTEXT |
| slug               | varchar(255) | URL-friendly, unique                     | UNIQUE   |
| description        | text         | Description détaillée                    | FULLTEXT |
| meta_data          | jsonb        | Données additionnelles                   |          |
| is_active          | boolean      | Produit actif                           | INDEX    |
| created_at         | timestamp    |                                        |          |
| updated_at         | timestamp    |                                        |          |
```

##### `product_skus` (Stock Keeping Units)
```sql
| Champ               | Type         | Description                              | Index    |
|--------------------|--------------|------------------------------------------|----------|
| id                 | bigint       | Identifiant unique                       | PRIMARY  |
| product_id         | bigint       | Référence produit                        | INDEX    |
| sku                | varchar(100) | Code SKU unique                          | UNIQUE   |
| purchase_price     | decimal(10,2)| Prix d'achat                            |          |
| selling_price      | decimal(10,2)| Prix de vente TTC                       |          |
| compare_at_price   | decimal(10,2)| Prix barré (nullable)                   |          |
| stock_quantity     | integer      | Quantité en stock                        |          |
| reserved_quantity  | integer      | Quantité réservée (commandes en cours)  |          |
| low_stock_threshold| integer      | Seuil d'alerte stock                    |          |
| weight_grams       | integer      | Poids en grammes (nullable)              |          |
| is_variable_weight | boolean      | Produit vendu au poids                  |          |
| min_weight_grams   | integer      | Poids minimum (si variable)              |          |
| max_weight_grams   | integer      | Poids maximum (si variable)              |          |
| images             | jsonb        | URLs des images                          |          |
| created_at         | timestamp    |                                        |          |
| updated_at         | timestamp    |                                        |          |
```

##### `product_attributes`
```sql
| Champ         | Type         | Description                     | Index    |
|--------------|--------------|----------------------------------|----------|
| id           | bigint       | Identifiant unique              | PRIMARY  |
| name         | varchar(100) | Nom de l'attribut (ex: Couleur) | UNIQUE   |
| slug         | varchar(100) | Slug pour l'URL                 | UNIQUE   |
| type         | enum         | text, number, boolean, date     |          |
| is_required  | boolean      | Attribut obligatoire            |          |
| created_at   | timestamp    |                                 |          |
```

##### `product_attribute_values`
```sql
| Champ         | Type         | Description                     | Index    |
|--------------|--------------|----------------------------------|----------|
| id           | bigint       | Identifiant unique              | PRIMARY  |
| attribute_id | bigint       | Référence attribut              | INDEX    |
| value        | varchar(255) | Valeur de l'attribut            |          |
| position     | integer      | Ordre d'affichage               |          |
```

##### `product_sku_attributes` (Table pivot)
```sql
| Champ                   | Type    | Description              | Index           |
|------------------------|---------|--------------------------|-----------------|
| product_sku_id         | bigint  | Référence SKU           | COMPOSITE PK    |
| product_attribute_value_id | bigint | Référence valeur attribut | COMPOSITE PK |
```

##### `customers` (Clients invités uniquement pour v1)
```sql
| Champ              | Type         | Description                        | Index    |
|-------------------|--------------|-------------------------------------|----------|
| id                | bigint       | Identifiant unique                 | PRIMARY  |
| guest_token       | uuid         | Token unique pour invité           | UNIQUE   |
| name              | varchar(255) | Nom complet (chiffré)              |          |
| phone             | varchar(50)  | Téléphone (chiffré)                | INDEX    |
| phone_hash        | varchar(64)  | Hash du téléphone pour recherche   | INDEX    |
| email             | varchar(255) | Email optionnel (chiffré)          |          |
| created_at        | timestamp    |                                    |          |
```

##### `orders`
```sql
| Champ                  | Type         | Description                              | Index    |
|-----------------------|--------------|------------------------------------------|----------|
| id                    | bigint       | Identifiant unique                       | PRIMARY  |
| order_number          | varchar(20)  | Numéro de commande unique               | UNIQUE   |
| customer_id           | bigint       | Référence client (nullable)              | INDEX    |
| status                | enum         | pending, confirmed, processing, ready, completed, cancelled | INDEX |
| payment_status        | enum         | pending, paid, failed, refunded         | INDEX    |
| subtotal              | decimal(10,2)| Sous-total avant livraison              |          |
| delivery_fee          | decimal(10,2)| Frais de livraison                      |          |
| total_amount          | decimal(10,2)| Montant total                           |          |
| estimated_total       | decimal(10,2)| Total estimé (produits variables)       |          |
| final_total           | decimal(10,2)| Total final après pesée                 |          |
| delivery_method       | enum         | pickup, delivery                         |          |
| delivery_address      | text         | Adresse de livraison (chiffrée)         |          |
| delivery_instructions | text         | Instructions spéciales                   |          |
| pickup_date           | date         | Date de retrait souhaitée               |          |
| pickup_time_slot      | varchar(50)  | Créneau horaire de retrait              |          |
| payment_method        | varchar(50)  | Méthode de paiement utilisée            |          |
| transaction_id        | varchar(100) | ID transaction CinetPay                 | INDEX    |
| payment_token         | varchar(255) | Token de paiement                       |          |
| notes                 | text         | Notes internes                          |          |
| created_at            | timestamp    |                                         | INDEX    |
| updated_at            | timestamp    |                                         |          |
| completed_at          | timestamp    | Date de finalisation                    |          |
```

##### `order_items`
```sql
| Champ              | Type         | Description                              | Index         |
|-------------------|--------------|------------------------------------------|---------------|
| id                | bigint       | Identifiant unique                       | PRIMARY       |
| order_id          | bigint       | Référence commande                       | INDEX         |
| product_sku_id    | bigint       | Référence SKU                           | INDEX         |
| product_name      | varchar(255) | Nom du produit (snapshot)                |               |
| quantity          | decimal(10,3)| Quantité commandée                       |               |
| unit_price        | decimal(10,2)| Prix unitaire au moment de la commande  |               |
| estimated_weight  | integer      | Poids estimé en grammes (si variable)   |               |
| actual_weight     | integer      | Poids réel en grammes (si variable)     |               |
| line_total        | decimal(10,2)| Total de la ligne                       |               |
| created_at        | timestamp    |                                         |               |
```

##### `audit_logs`
```sql
| Champ         | Type         | Description                        | Index    |
|--------------|--------------|-------------------------------------|----------|
| id           | bigint       | Identifiant unique                 | PRIMARY  |
| user_id      | uuid         | Utilisateur ayant effectué l'action| INDEX    |
| action       | varchar(100) | Type d'action effectuée            | INDEX    |
| auditable_type| varchar(100)| Type de modèle affecté             | INDEX    |
| auditable_id | bigint       | ID du modèle affecté               | INDEX    |
| old_values   | jsonb        | Valeurs avant modification         |          |
| new_values   | jsonb        | Valeurs après modification         |          |
| ip_address   | inet         | Adresse IP de l'utilisateur        |          |
| user_agent   | text         | User agent du navigateur           |          |
| created_at   | timestamp    | Date de l'action                   | INDEX    |
```

##### `payment_logs`
```sql
| Champ              | Type         | Description                        | Index    |
|-------------------|--------------|-------------------------------------|----------|
| id                | bigint       | Identifiant unique                 | PRIMARY  |
| order_id          | bigint       | Référence commande                 | INDEX    |
| transaction_id    | varchar(100) | ID transaction externe             | INDEX    |
| gateway           | varchar(50)  | Passerelle utilisée (cinetpay)     |          |
| action            | varchar(50)  | init, callback, webhook, capture   | INDEX    |
| status            | varchar(50)  | Status retourné                    |          |
| amount            | decimal(10,2)| Montant de la transaction          |          |
| request_payload   | jsonb        | Données envoyées (sensibles masquées)|         |
| response_payload  | jsonb        | Réponse reçue (sensibles masquées)  |         |
| created_at        | timestamp    |                                    | INDEX    |
```

##### `failed_jobs`
```sql
| Champ         | Type         | Description                     |
|--------------|--------------|----------------------------------|
| id           | bigint       | Identifiant unique              |
| uuid         | varchar(255) | UUID unique                     |
| connection   | text         | Connection queue                |
| queue        | text         | Nom de la queue                 |
| payload      | longtext     | Payload du job                  |
| exception    | longtext     | Exception détaillée             |
| failed_at    | timestamp    | Date de l'échec                 |
```

### 1.3 Index et Optimisations

```sql
-- Index composites pour les requêtes fréquentes
CREATE INDEX idx_products_active_category ON products(is_active, category_id);
CREATE INDEX idx_skus_product_active ON product_skus(product_id, stock_quantity) WHERE stock_quantity > 0;
CREATE INDEX idx_orders_status_date ON orders(status, created_at);
CREATE INDEX idx_orders_customer_status ON orders(customer_id, status);

-- Index full-text pour la recherche
CREATE INDEX idx_products_search ON products USING gin(to_tsvector('french', name || ' ' || COALESCE(description, '')));

-- Index partiel pour les produits en promotion
CREATE INDEX idx_products_promo ON product_skus(product_id) WHERE compare_at_price IS NOT NULL;
```

## 2. Structure des Dossiers et Architecture

### 2.1 Organisation Domain-Driven Design

```
monepiceriz/
├── app/
│   ├── Domain/                    # Logique métier par domaine
│   │   ├── Catalog/
│   │   │   ├── Actions/          # Actions réutilisables
│   │   │   │   ├── CreateProductAction.php
│   │   │   │   └── UpdateStockAction.php
│   │   │   ├── Data/             # Data Transfer Objects
│   │   │   │   ├── ProductData.php
│   │   │   │   └── CategoryData.php
│   │   │   ├── Models/           # Modèles Eloquent
│   │   │   │   ├── Product.php
│   │   │   │   ├── ProductSku.php
│   │   │   │   └── Category.php
│   │   │   ├── QueryBuilders/    # Query builders personnalisés
│   │   │   │   └── ProductQueryBuilder.php
│   │   │   └── Services/         # Services métier
│   │   │       ├── ProductService.php
│   │   │       └── StockService.php
│   │   │
│   │   ├── Order/
│   │   │   ├── Actions/
│   │   │   │   ├── CreateOrderAction.php
│   │   │   │   ├── ProcessPaymentAction.php
│   │   │   │   └── FinalizeVariableWeightAction.php
│   │   │   ├── Data/
│   │   │   │   └── OrderData.php
│   │   │   ├── Enums/
│   │   │   │   ├── OrderStatus.php
│   │   │   │   └── PaymentStatus.php
│   │   │   ├── Events/
│   │   │   │   ├── OrderCreated.php
│   │   │   │   └── PaymentReceived.php
│   │   │   ├── Models/
│   │   │   │   ├── Order.php
│   │   │   │   └── OrderItem.php
│   │   │   └── Services/
│   │   │       ├── OrderService.php
│   │   │       └── CheckoutService.php
│   │   │
│   │   ├── Payment/
│   │   │   ├── Contracts/
│   │   │   │   └── PaymentGatewayInterface.php
│   │   │   ├── Gateways/
│   │   │   │   └── CinetPayGateway.php
│   │   │   ├── Services/
│   │   │   │   └── PaymentService.php
│   │   │   └── ValueObjects/
│   │   │       └── Money.php
│   │   │
│   │   └── Shipping/
│   │       ├── Contracts/
│   │       │   └── ShippingProviderInterface.php
│   │       ├── Providers/
│   │       │   └── YangoProvider.php
│   │       └── Services/
│   │           └── ShippingService.php
│   │
│   ├── Http/
│   │   ├── Controllers/
│   │   │   ├── Api/
│   │   │   │   ├── CartController.php
│   │   │   │   └── WebhookController.php
│   │   │   ├── Admin/
│   │   │   │   ├── DashboardController.php
│   │   │   │   ├── OrderController.php
│   │   │   │   └── ProductController.php
│   │   │   └── Shop/
│   │   │       ├── HomeController.php
│   │   │       ├── ProductController.php
│   │   │       ├── CartController.php
│   │   │       └── CheckoutController.php
│   │   │
│   │   ├── Middleware/
│   │   │   ├── SecurityHeaders.php
│   │   │   ├── ThrottleRequests.php
│   │   │   └── ValidateWebhookSignature.php
│   │   │
│   │   └── Resources/
│   │       ├── ProductResource.php
│   │       └── OrderResource.php
│   │
│   ├── Infrastructure/           # Services externes et intégrations
│   │   ├── Cache/
│   │   │   └── RedisCache.php
│   │   ├── Encryption/
│   │   │   └── FieldEncryption.php
│   │   └── Queue/
│   │       └── JobMiddleware/
│   │           └── RateLimited.php
│   │
│   └── Support/                  # Helpers et utilities
│       ├── Helpers/
│       │   └── PriceFormatter.php
│       └── Traits/
│           ├── HasEncryptedAttributes.php
│           └── LogsActivity.php
│
├── config/
│   ├── cinetpay.php             # Configuration CinetPay
│   ├── security.php             # Configuration sécurité
│   └── shop.php                 # Configuration boutique
│
├── database/
│   ├── factories/               # Factories pour les tests
│   ├── migrations/              # Migrations de base de données
│   └── seeders/                 # Seeders de données
│
├── resources/
│   ├── css/
│   │   └── app.css             # Tailwind CSS
│   ├── js/
│   │   ├── Components/         # Composants React réutilisables
│   │   │   ├── ui/            # Composants Shadcn/ui
│   │   │   ├── layout/
│   │   │   │   ├── Header.jsx
│   │   │   │   └── Footer.jsx
│   │   │   └── shop/
│   │   │       ├── ProductCard.jsx
│   │   │       ├── CartItem.jsx
│   │   │       └── CheckoutForm.jsx
│   │   ├── Hooks/             # Custom React hooks
│   │   │   ├── useCart.js
│   │   │   └── useToast.js
│   │   ├── Layouts/
│   │   │   ├── ShopLayout.jsx
│   │   │   └── AdminLayout.jsx
│   │   ├── Pages/             # Pages Inertia
│   │   │   ├── Shop/
│   │   │   │   ├── Home.jsx
│   │   │   │   ├── Products/
│   │   │   │   │   ├── Index.jsx
│   │   │   │   │   └── Show.jsx
│   │   │   │   ├── Cart/
│   │   │   │   │   └── Index.jsx
│   │   │   │   └── Checkout/
│   │   │   │       ├── Index.jsx
│   │   │   │       └── Success.jsx
│   │   │   └── Admin/
│   │   │       ├── Dashboard.jsx
│   │   │       └── Orders/
│   │   │           ├── Index.jsx
│   │   │           └── Edit.jsx
│   │   └── Utils/
│   │       └── formatters.js
│   └── views/
│       └── app.blade.php
│
├── routes/
│   ├── admin.php               # Routes administration
│   ├── api.php                 # Routes API
│   ├── shop.php                # Routes boutique
│   └── web.php                 # Routes principales
│
├── storage/
│   └── app/
│       └── public/
│           └── products/       # Images produits
│
└── tests/
    ├── Feature/
    │   ├── Shop/
    │   │   ├── CheckoutTest.php
    │   │   └── PaymentTest.php
    │   └── Admin/
    │       └── OrderManagementTest.php
    ├── Unit/
    │   ├── Domain/
    │   │   ├── Order/
    │   │   │   └── OrderServiceTest.php
    │   │   └── Payment/
    │   │       └── CinetPayGatewayTest.php
    │   └── Support/
    │       └── EncryptionTest.php
    └── TestCase.php
```

## 3. Patterns et Bonnes Pratiques

### 3.1 Repository Pattern avec Query Builders

```php
// app/Domain/Catalog/QueryBuilders/ProductQueryBuilder.php
class ProductQueryBuilder extends Builder
{
    public function active(): self
    {
        return $this->where('is_active', true);
    }
    
    public function inStock(): self
    {
        return $this->whereHas('skus', function ($query) {
            $query->where('stock_quantity', '>', 0);
        });
    }
    
    public function withCategory(): self
    {
        return $this->with(['category' => function ($query) {
            $query->select('id', 'name', 'slug');
        }]);
    }
    
    public function search(string $term): self
    {
        return $this->whereRaw(
            "to_tsvector('french', name || ' ' || COALESCE(description, '')) @@ plainto_tsquery('french', ?)",
            [$term]
        );
    }
}
```

### 3.2 Action Classes

```php
// app/Domain/Order/Actions/CreateOrderAction.php
class CreateOrderAction
{
    public function __construct(
        private OrderService $orderService,
        private StockService $stockService,
        private PaymentService $paymentService
    ) {}
    
    public function execute(OrderData $data): Order
    {
        return DB::transaction(function () use ($data) {
            // Réserver le stock
            $this->stockService->reserveItems($data->items);
            
            // Créer la commande
            $order = $this->orderService->create($data);
            
            // Initialiser le paiement
            $paymentUrl = $this->paymentService->initializePayment($order);
            
            // Déclencher l'événement
            event(new OrderCreated($order));
            
            return $order;
        });
    }
}
```

### 3.3 Data Transfer Objects

```php
// app/Domain/Order/Data/OrderData.php
class OrderData extends Data
{
    public function __construct(
        public string $customerName,
        public string $customerPhone,
        public ?string $customerEmail,
        public string $deliveryMethod,
        public ?string $deliveryAddress,
        public array $items,
        public ?string $notes = null
    ) {}
    
    public static function rules(): array
    {
        return [
            'customerName' => ['required', 'string', 'max:255'],
            'customerPhone' => ['required', 'string', 'regex:/^[0-9]{10}$/'],
            'customerEmail' => ['nullable', 'email'],
            'deliveryMethod' => ['required', Rule::in(['pickup', 'delivery'])],
            'deliveryAddress' => ['required_if:deliveryMethod,delivery'],
            'items' => ['required', 'array', 'min:1'],
            'items.*.sku_id' => ['required', 'exists:product_skus,id'],
            'items.*.quantity' => ['required', 'numeric', 'min:0.001'],
        ];
    }
}
```

## 4. Sécurité

### 4.1 Middleware de Sécurité

```php
// app/Http/Middleware/SecurityHeaders.php
class SecurityHeaders
{
    public function handle($request, Closure $next)
    {
        $response = $next($request);
        
        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', 'DENY');
        $response->headers->set('X-XSS-Protection', '1; mode=block');
        $response->headers->set('Referrer-Policy', 'strict-origin-when-cross-origin');
        $response->headers->set('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');
        
        if (app()->environment('production')) {
            $response->headers->set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
        }
        
        return $response;
    }
}
```

### 4.2 Chiffrement des Données Sensibles

```php
// app/Support/Traits/HasEncryptedAttributes.php
trait HasEncryptedAttributes
{
    protected array $encrypted = [];
    
    public function getAttribute($key)
    {
        $value = parent::getAttribute($key);
        
        if (in_array($key, $this->encrypted) && !is_null($value)) {
            return Crypt::decryptString($value);
        }
        
        return $value;
    }
    
    public function setAttribute($key, $value)
    {
        if (in_array($key, $this->encrypted) && !is_null($value)) {
            $value = Crypt::encryptString($value);
        }
        
        return parent::setAttribute($key, $value);
    }
}
```

### 4.3 Validation des Webhooks

```php
// app/Http/Middleware/ValidateWebhookSignature.php
class ValidateWebhookSignature
{
    public function handle($request, Closure $next, string $gateway)
    {
        $signature = $request->header('X-Webhook-Signature');
        $payload = $request->getContent();
        
        $secret = config("payment.gateways.{$gateway}.webhook_secret");
        $expectedSignature = hash_hmac('sha256', $payload, $secret);
        
        if (!hash_equals($expectedSignature, $signature)) {
            Log::warning('Invalid webhook signature', [
                'gateway' => $gateway,
                'ip' => $request->ip()
            ]);
            
            abort(401, 'Invalid signature');
        }
        
        return $next($request);
    }
}
```

## 5. Performance et Cache

### 5.1 Cache Strategy

```php
// app/Domain/Catalog/Services/ProductService.php
class ProductService
{
    private const CACHE_TTL = 3600; // 1 heure
    
    public function getFeaturedProducts(): Collection
    {
        return Cache::remember('featured_products', self::CACHE_TTL, function () {
            return Product::query()
                ->active()
                ->inStock()
                ->with(['skus', 'category'])
                ->where('is_featured', true)
                ->limit(8)
                ->get();
        });
    }
    
    public function clearCache(): void
    {
        Cache::tags(['products'])->flush();
    }
}
```

### 5.2 Queue Jobs

```php
// app/Jobs/ProcessOrderNotification.php
class ProcessOrderNotification implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;
    
    public $tries = 3;
    public $backoff = [60, 180, 600]; // Retry après 1min, 3min, 10min
    
    public function __construct(
        public Order $order
    ) {}
    
    public function handle(NotificationService $notificationService): void
    {
        $notificationService->sendOrderConfirmation($this->order);
    }
    
    public function failed(Throwable $exception): void
    {
        Log::error('Failed to send order notification', [
            'order_id' => $this->order->id,
            'error' => $exception->getMessage()
        ]);
    }
}
```

## 6. Tests

### 6.1 Structure des Tests

```php
// tests/Feature/Shop/CheckoutTest.php
class CheckoutTest extends TestCase
{
    use RefreshDatabase;
    
    /** @test */
    public function customer_can_checkout_with_valid_cart()
    {
        // Arrange
        $products = ProductSku::factory()->count(3)->create([
            'stock_quantity' => 10
        ]);
        
        $cartItems = $products->map(fn($sku) => [
            'sku_id' => $sku->id,
            'quantity' => 2
        ])->toArray();
        
        // Act
        $response = $this->postJson('/api/checkout', [
            'customer_name' => 'John Doe',
            'customer_phone' => '0123456789',
            'delivery_method' => 'pickup',
            'items' => $cartItems
        ]);
        
        // Assert
        $response->assertStatus(200)
            ->assertJsonStructure([
                'order_id',
                'payment_url'
            ]);
        
        $this->assertDatabaseHas('orders', [
            'customer_name' => encrypt('John Doe'),
            'status' => OrderStatus::PENDING
        ]);
    }
}
```

## 7. Configuration et Variables d'Environnement

### 7.1 Configuration Sécurité

```php
// config/security.php
return [
    'encryption' => [
        'customer_fields' => ['name', 'phone', 'email', 'delivery_address'],
    ],
    
    'rate_limiting' => [
        'api' => '60,1', // 60 requêtes par minute
        'checkout' => '5,1', // 5 tentatives par minute
        'webhook' => '100,1', // 100 webhooks par minute
    ],
    
    'passwords' => [
        'min_length' => 12,
        'require_uppercase' => true,
        'require_numeric' => true,
        'require_special' => true,
    ],
    
    'sessions' => [
        'timeout' => 120, // 2 heures
        'encrypt' => true,
        'same_site' => 'strict',
    ],
];
```

### 7.2 Variables d'Environnement

Configuration centralisée pour tous les services. **Cette section est la référence unique pour toutes les variables d'environnement du projet.**

```env
#===========================================
# APPLICATION
#===========================================
APP_NAME="MonEpice&Riz"
APP_ENV=production              # local, staging, production
APP_DEBUG=false                 # true uniquement en développement
APP_URL=https://monepiceriz.com # URL de production
APP_KEY=                        # Généré par: php artisan key:generate

#===========================================
# SUPABASE DATABASE
# Voir: docs/supabase.md#configuration-initiale
#===========================================
DB_CONNECTION=pgsql
# Utiliser le pooler pour la production (meilleure performance)
DATABASE_URL=postgres://postgres.[project-ref]:[password]@[region].pooler.supabase.com:5432/postgres?pgbouncer=true&connection_limit=10
# Configuration alternative (direct)
DB_HOST=db.[project-ref].supabase.co
DB_PORT=5432                    # 6543 pour le pooler
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=your_supabase_password
DB_SCHEMA=laravel               # Schéma dédié pour la sécurité

# Supabase Services
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...  # Clé publique
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Clé privée (backend uniquement)
SUPABASE_STORAGE_BUCKET=products
SUPABASE_USE_POOLER=true
SUPABASE_POOL_MODE=session      # session ou transaction

#===========================================
# REDIS (Cache & Queue)
#===========================================
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=redis_password_here
REDIS_PORT=6379
REDIS_CACHE_DB=0               # DB pour le cache
REDIS_SESSION_DB=1             # DB pour les sessions
REDIS_QUEUE_DB=2               # DB pour les queues

#===========================================
# SESSION & CACHE
#===========================================
SESSION_DRIVER=redis
SESSION_LIFETIME=120           # Minutes
SESSION_ENCRYPT=true
SESSION_SAME_SITE=strict       # Protection CSRF

CACHE_DRIVER=redis
CACHE_PREFIX=monepiceriz_cache

#===========================================
# QUEUE
#===========================================
QUEUE_CONNECTION=redis
QUEUE_RETRY_AFTER=90          # Secondes avant retry
QUEUE_BLOCK_FOR=1             # Polling interval

#===========================================
# CINETPAY PAYMENT
# Voir: docs/cinetpay.md#configuration
#===========================================
CINETPAY_API_KEY=12912847765bc0db748fdd44.40081707
CINETPAY_SITE_ID=445160
CINETPAY_SECRET_KEY=your_secret_key_for_webhooks
CINETPAY_MODE=TEST            # TEST ou PRODUCTION
CINETPAY_NOTIFY_URL=https://monepiceriz.com/api/cinetpay/notify
CINETPAY_RETURN_URL=https://monepiceriz.com/paiement/retour
CINETPAY_CANCEL_URL=https://monepiceriz.com/paiement/annulation
CINETPAY_CURRENCY=XOF         # Franc CFA

#===========================================
# YANGO DELIVERY
#===========================================
YANGO_API_KEY=your_yango_api_key
YANGO_API_URL=https://api.yango.com/v1
YANGO_WEBHOOK_SECRET=your_webhook_secret
YANGO_MIN_ORDER_AMOUNT=3000   # Montant minimum en F CFA

#===========================================
# SECURITY
#===========================================
BCRYPT_ROUNDS=12              # Augmenter pour plus de sécurité
ENCRYPTION_KEY=${APP_KEY}     # Utilise la clé Laravel
SECURE_COOKIES=true           # HTTPS uniquement
TRUSTED_PROXIES=*             # Pour Cloudflare ou load balancer

#===========================================
# MONITORING & LOGS
#===========================================
SENTRY_LARAVEL_DSN=https://xxxx@xxx.ingest.sentry.io/xxxx
SENTRY_ENVIRONMENT=${APP_ENV}
SENTRY_TRACES_SAMPLE_RATE=0.1 # 10% des transactions

LOG_CHANNEL=stack
LOG_LEVEL=error               # debug, info, notice, warning, error
LOG_SLACK_WEBHOOK_URL=        # Optionnel: alertes Slack

#===========================================
# MAIL (Notifications)
#===========================================
MAIL_MAILER=smtp
MAIL_HOST=smtp.mailgun.org
MAIL_PORT=587
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=noreply@monepiceriz.com
MAIL_FROM_NAME="${APP_NAME}"

#===========================================
# DÉVELOPPEMENT LOCAL
# Décommenter ces lignes en local uniquement
#===========================================
# APP_DEBUG=true
# APP_ENV=local
# CINETPAY_MODE=TEST
# DB_SSL_MODE=disable
# DEBUGBAR_ENABLED=true
```

## 8. Checklist de Déploiement

### 8.1 Sécurité
- [ ] HTTPS configuré avec certificat SSL valide
- [ ] Headers de sécurité configurés
- [ ] CORS configuré correctement
- [ ] Rate limiting activé
- [ ] Firewall configuré (ports 80, 443 uniquement)
- [ ] Fail2ban installé pour protection brute force
- [ ] Variables d'environnement sécurisées
- [ ] Permissions fichiers correctes (755 dossiers, 644 fichiers)
- [ ] Debug mode désactivé en production

### 8.2 Base de Données
- [ ] PostgreSQL 16+ installé
- [ ] Utilisateur DB avec privilèges minimaux
- [ ] Connexions SSL obligatoires
- [ ] Backups automatiques configurés
- [ ] Monitoring des performances activé
- [ ] Index créés et optimisés

### 8.3 Application
- [ ] PHP 8.2+ avec extensions requises
- [ ] Composer dependencies à jour
- [ ] NPM packages à jour
- [ ] Assets compilés (npm run build)
- [ ] Cache configuré (config, routes, views)
- [ ] Queue workers configurés avec Supervisor
- [ ] Cron job pour Laravel scheduler
- [ ] Logs rotation configurée

### 8.4 Monitoring
- [ ] Error tracking (Sentry/Bugsnag)
- [ ] Uptime monitoring
- [ ] Performance monitoring (New Relic/Datadog)
- [ ] Alertes configurées
- [ ] Logs centralisés

### 8.5 Tests
- [ ] Tests unitaires passent
- [ ] Tests d'intégration passent
- [ ] Tests de charge effectués
- [ ] Test de paiement en production
- [ ] Test de livraison Yango
- [ ] Plan de rollback préparé

## 9. Maintenance et Évolution

### 9.1 Tâches Régulières
- Mise à jour des dépendances (mensuelle)
- Audit de sécurité (mensuel)
- Optimisation des requêtes lentes (hebdomadaire)
- Nettoyage des logs et données obsolètes (mensuel)
- Review des failed jobs (quotidien)

### 9.2 Évolutions Futures (v2)
- Comptes clients avec historique
- Programme de fidélité
- Recommandations personnalisées
- Multi-langue (Français/Anglais)
- Application mobile
- Synchronisation Odoo
- Analytics avancés
- Export comptable