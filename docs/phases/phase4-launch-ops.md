# Phase 4 : Lancement et Opérations Post-Lancement

**Durée estimée :** Continu après le lancement  
**Objectif :** Mettre le site en production et assurer son bon fonctionnement continu.

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Préparation au lancement](#préparation-au-lancement)
3. [Déploiement production](#déploiement-production)
4. [Monitoring et alertes](#monitoring-et-alertes)
5. [Support et maintenance](#support-et-maintenance)
6. [Évolutions futures](#évolutions-futures)

## Vue d'ensemble

La Phase 4 marque la transition vers la production et établit les processus pour maintenir et faire évoluer la plateforme.

### Livrables attendus
- [ ] Site en production sur monepiceriz.com
- [ ] Monitoring et alertes configurés
- [ ] Équipe formée à l'utilisation
- [ ] Documentation support complète
- [ ] Plan de maintenance établi

## Préparation au lancement

### P4.1 - Checklist de déploiement

#### Infrastructure
```markdown
## Serveur o2Switch
- [ ] Compte o2Switch actif
- [ ] Domaine monepiceriz.com configuré
- [ ] SSL Let's Encrypt installé
- [ ] PHP 8.2+ configuré
- [ ] Extensions PHP requises installées
- [ ] Composer installé
- [ ] Node.js 18+ installé
- [ ] Redis installé et configuré
- [ ] Supervisor configuré

## Base de données
- [ ] Supabase production créé
- [ ] Connexions SSL configurées
- [ ] Utilisateur avec privilèges minimaux
- [ ] Backups automatiques activés
- [ ] Monitoring des performances

## Services tiers
- [ ] CinetPay en mode PRODUCTION
- [ ] Yango API production
- [ ] SMTP pour emails configuré
- [ ] CDN pour assets (optionnel)
```

#### Sécurité finale
```bash
# Script de vérification sécurité
#!/bin/bash

echo "Vérification sécurité pré-production..."

# Vérifier les permissions
find . -type d -exec chmod 755 {} \;
find . -type f -exec chmod 644 {} \;
chmod -R 775 storage bootstrap/cache

# Vérifier .env
if [ -f .env ]; then
    if grep -q "APP_DEBUG=true" .env; then
        echo "⚠️  ERREUR: APP_DEBUG doit être false en production!"
        exit 1
    fi
    
    if grep -q "APP_ENV=local" .env; then
        echo "⚠️  ERREUR: APP_ENV doit être 'production'!"
        exit 1
    fi
fi

# Vérifier les dépendances
composer audit
npm audit --production

echo "✅ Vérification terminée"
```

### P4.2 - Configuration DNS et SSL

#### Configuration DNS (chez le registrar)
```
Type    Nom     Valeur                          TTL
A       @       IP_SERVEUR_O2SWITCH            300
A       www     IP_SERVEUR_O2SWITCH            300
MX      @       mx1.o2switch.net (priorité 10) 3600
TXT     @       "v=spf1 include:o2switch.net ~all" 3600
```

#### SSL avec Certbot
```bash
# Installation Let's Encrypt
sudo certbot --nginx -d monepiceriz.com -d www.monepiceriz.com

# Auto-renouvellement
sudo certbot renew --dry-run
```

### P4.3 - Déploiement Production

#### Script de déploiement
```bash
#!/bin/bash
# deploy.sh

set -e

echo "🚀 Déploiement MonEpice&Riz Production"

# Mode maintenance
php artisan down --message="Mise à jour en cours..." --retry=60

# Pull latest code
git pull origin main

# Backup base de données
php artisan backup:run --only-db

# Installation des dépendances
composer install --no-dev --optimize-autoloader
npm ci
npm run build

# Migrations
php artisan migrate --force

# Optimisations Laravel
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

# Restart queue workers
php artisan queue:restart
php artisan horizon:terminate

# Clear CDN cache si applicable
# curl -X POST "https://api.cloudflare.com/..."

# Sortir du mode maintenance
php artisan up

echo "✅ Déploiement terminé avec succès!"
```

#### Configuration Nginx
```nginx
server {
    listen 443 ssl http2;
    server_name monepiceriz.com www.monepiceriz.com;
    root /home/monepiceriz/public_html/public;

    ssl_certificate /etc/letsencrypt/live/monepiceriz.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/monepiceriz.com/privkey.pem;

    add_header X-Frame-Options "SAMEORIGIN";
    add_header X-Content-Type-Options "nosniff";
    add_header X-XSS-Protection "1; mode=block";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    index index.php;

    charset utf-8;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location = /favicon.ico { access_log off; log_not_found off; }
    location = /robots.txt  { access_log off; log_not_found off; }

    error_page 404 /index.php;

    location ~ \.php$ {
        fastcgi_pass unix:/var/run/php/php8.2-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        include fastcgi_params;
    }

    location ~ /\.(?!well-known).* {
        deny all;
    }
    
    # Cache des assets
    location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}

# Redirection HTTP vers HTTPS
server {
    listen 80;
    server_name monepiceriz.com www.monepiceriz.com;
    return 301 https://$server_name$request_uri;
}
```

## Monitoring et alertes

### P4.4 - Monitoring Infrastructure

#### Configuration Sentry
```php
// config/sentry.php
return [
    'dsn' => env('SENTRY_LARAVEL_DSN'),
    'traces_sample_rate' => env('SENTRY_TRACES_SAMPLE_RATE', 0.1),
    'profiles_sample_rate' => env('SENTRY_PROFILES_SAMPLE_RATE', 0.1),
    'send_default_pii' => false,
    'before_send' => function (\Sentry\Event $event, ?\Sentry\EventHint $hint): ?\Sentry\Event {
        // Filtrer les données sensibles
        $event->setRequest($event->getRequest()->withCookies([]));
        return $event;
    },
];
```

#### UptimeRobot
```yaml
# Configuration des monitors
monitors:
  - name: "MonEpice&Riz - Homepage"
    url: "https://monepiceriz.com"
    interval: 5 # minutes
    
  - name: "MonEpice&Riz - API Health"
    url: "https://monepiceriz.com/api/health"
    interval: 5
    
  - name: "MonEpice&Riz - Admin"
    url: "https://monepiceriz.com/admin"
    interval: 10
    
alerts:
  - email: "tech@monepiceriz.com"
  - sms: "+225XXXXXXXXXX"
  - slack: "webhook_url"
```

#### Health Check Endpoint
```php
// app/Http/Controllers/HealthController.php
class HealthController extends Controller
{
    public function __invoke()
    {
        $checks = [
            'database' => $this->checkDatabase(),
            'redis' => $this->checkRedis(),
            'storage' => $this->checkStorage(),
            'services' => $this->checkExternalServices(),
        ];
        
        $healthy = collect($checks)->every(fn($check) => $check['status'] === 'ok');
        
        return response()->json([
            'status' => $healthy ? 'healthy' : 'unhealthy',
            'timestamp' => now()->toIso8601String(),
            'checks' => $checks
        ], $healthy ? 200 : 503);
    }
    
    private function checkDatabase(): array
    {
        try {
            DB::select('SELECT 1');
            return ['status' => 'ok', 'message' => 'Database connection OK'];
        } catch (\Exception $e) {
            return ['status' => 'error', 'message' => $e->getMessage()];
        }
    }
}
```

### P4.5 - Stratégie de Backup

#### Backups automatiques
```php
// config/backup.php
return [
    'backup' => [
        'name' => 'monepiceriz',
        'source' => [
            'files' => [
                'include' => [
                    base_path(),
                ],
                'exclude' => [
                    base_path('vendor'),
                    base_path('node_modules'),
                ],
            ],
            'databases' => ['pgsql'],
        ],
        'destination' => [
            'disks' => ['local', 's3'],
        ],
        'notifications' => [
            'mail' => [
                'to' => 'backup@monepiceriz.com',
            ],
        ],
    ],
    'cleanup' => [
        'strategy' => \Spatie\Backup\Tasks\Cleanup\Strategies\DefaultStrategy::class,
        'default_strategy' => [
            'keep_all_backups_for_days' => 7,
            'keep_daily_backups_for_days' => 16,
            'keep_weekly_backups_for_weeks' => 8,
            'keep_monthly_backups_for_months' => 4,
            'keep_yearly_backups_for_years' => 2,
        ],
    ],
];
```

#### Cron pour backups
```cron
# Backup quotidien à 3h du matin
0 3 * * * cd /home/monepiceriz/public_html && php artisan backup:run --only-db >> /dev/null 2>&1

# Backup complet hebdomadaire
0 4 * * 0 cd /home/monepiceriz/public_html && php artisan backup:run >> /dev/null 2>&1

# Nettoyage des vieux backups
0 5 * * * cd /home/monepiceriz/public_html && php artisan backup:clean >> /dev/null 2>&1
```

## Support et maintenance

### P4.6 - Formation de l'équipe

#### Guide utilisateur admin
```markdown
# Guide d'utilisation - Administration MonEpice&Riz

## 1. Connexion
1. Aller sur https://monepiceriz.com/admin
2. Entrer votre email et mot de passe
3. Scanner le QR code avec Google Authenticator

## 2. Gestion des produits
### Ajouter un produit
1. Cliquer sur "Produits" > "Nouveau"
2. Remplir les informations
3. Uploader les images
4. Définir le prix et stock
5. Sauvegarder

### Produits à poids variable
- Cocher "Produit au poids"
- Entrer le prix au kg
- Le système gère automatiquement la pesée

## 3. Gestion des commandes
### Workflow standard
1. Nouvelle commande → Status "En attente"
2. Paiement confirmé → Status "Confirmée"
3. En préparation → Status "En préparation"
4. Prête → Status "Prête"
5. Récupérée/Livrée → Status "Complétée"

### Ajustement du poids
1. Ouvrir la commande
2. Cliquer sur "Ajuster poids"
3. Entrer le poids réel
4. Le système recalcule automatiquement
```

#### Vidéos de formation
- Introduction au panneau admin (10 min)
- Gestion des produits (15 min)
- Traitement des commandes (20 min)
- Gestion des produits variables (10 min)
- Rapports et statistiques (10 min)

### P4.7 - Support niveau 1

#### FAQ Client
```markdown
## Questions Fréquentes

### Comment passer commande ?
1. Parcourez notre catalogue
2. Ajoutez les produits au panier
3. Validez votre panier
4. Choisissez retrait ou livraison
5. Payez en ligne
6. Recevez la confirmation

### Quel est le montant minimum pour la livraison ?
3000 F CFA

### Quels moyens de paiement acceptez-vous ?
- Orange Money
- MTN Money
- Moov Money
- Carte bancaire

### Comment fonctionnent les produits au poids ?
Le prix affiché est indicatif. Après pesée en magasin, nous ajustons le montant exact.
```

#### Procédures de support
```php
// app/Support/TicketCategories.php
enum TicketCategory: string
{
    case ORDER_ISSUE = 'Problème de commande';
    case PAYMENT_ISSUE = 'Problème de paiement';
    case DELIVERY_ISSUE = 'Problème de livraison';
    case PRODUCT_QUESTION = 'Question produit';
    case OTHER = 'Autre';
    
    public function getSLA(): int
    {
        return match($this) {
            self::PAYMENT_ISSUE => 2, // heures
            self::ORDER_ISSUE => 4,
            self::DELIVERY_ISSUE => 4,
            self::PRODUCT_QUESTION => 24,
            self::OTHER => 48,
        };
    }
}
```

### P4.8 - Analytics

#### Configuration Google Analytics 4
```javascript
// resources/js/analytics.js
export function initAnalytics() {
    // GA4
    window.dataLayer = window.dataLayer || []
    function gtag(){dataLayer.push(arguments)}
    gtag('js', new Date())
    gtag('config', 'G-XXXXXXXXXX', {
        page_location: window.location.href,
        page_path: window.location.pathname,
        page_title: document.title
    })
    
    // Events e-commerce
    window.trackPurchase = (order) => {
        gtag('event', 'purchase', {
            transaction_id: order.order_number,
            value: order.total_amount,
            currency: 'XOF',
            items: order.items.map(item => ({
                item_id: item.sku,
                item_name: item.name,
                price: item.price,
                quantity: item.quantity
            }))
        })
    }
}
```

#### Dashboard de monitoring
```php
// app/Http/Controllers/Admin/DashboardController.php
class DashboardController extends Controller
{
    public function index()
    {
        $stats = Cache::remember('dashboard_stats', 300, function () {
            return [
                'orders_today' => Order::whereDate('created_at', today())->count(),
                'revenue_today' => Order::whereDate('created_at', today())
                    ->where('payment_status', 'paid')
                    ->sum('total_amount'),
                'pending_orders' => Order::where('status', 'pending')->count(),
                'low_stock_products' => ProductSku::whereRaw('stock_quantity <= low_stock_threshold')->count(),
                'top_products' => $this->getTopProducts(),
                'revenue_chart' => $this->getRevenueChart(),
            ];
        });
        
        return Inertia::render('Admin/Dashboard', compact('stats'));
    }
}
```

### P4.9 - Plan de maintenance

#### Maintenance préventive
```yaml
# Schedule de maintenance
daily:
  - Clear expired sessions
  - Clean temporary files
  - Check disk space
  - Verify backups

weekly:
  - Update dependencies (dev)
  - Security scan
  - Performance review
  - Database optimization

monthly:
  - Update dependencies (prod)
  - SSL certificate check
  - Full security audit
  - Load testing

quarterly:
  - PHP version update
  - Framework update
  - Infrastructure review
  - Disaster recovery test
```

#### Procédure de mise à jour
```bash
#!/bin/bash
# update-procedure.sh

# 1. Notification utilisateurs
php artisan notification:send-maintenance-notice

# 2. Backup complet
php artisan backup:run

# 3. Mode maintenance
php artisan down --message="Maintenance planifiée" --retry=60

# 4. Updates
composer update
npm update
npm run build

# 5. Tests
php artisan test
npm run test

# 6. Deploy si tests OK
./deploy.sh

# 7. Vérification post-deploy
curl -f https://monepiceriz.com/api/health || exit 1

# 8. Sortie maintenance
php artisan up
```

### P4.10 - Roadmap V2

#### Fonctionnalités prévues
```markdown
## Version 2.0 - Q2 2025
### Comptes clients
- Création de compte
- Historique des commandes
- Adresses sauvegardées
- Liste de favoris

### Programme de fidélité
- Points de fidélité
- Niveaux (Bronze, Argent, Or)
- Récompenses
- Parrainages

### Améliorations catalogue
- Recommandations personnalisées
- Bundles de produits
- Ventes flash
- Précommandes

## Version 2.1 - Q3 2025
### Intégration Odoo
- Synchronisation stocks temps réel
- Import automatique produits
- Export comptable

### Application mobile
- App React Native
- Notifications push
- Mode hors ligne
- Scanner code-barres

## Version 3.0 - Q4 2025
### Marketplace
- Vendeurs tiers
- Gestion multi-stocks
- Commission automatique
- Dashboard vendeur
```

## Checklist post-lancement

### Jour J
- [ ] DNS propagé
- [ ] SSL actif
- [ ] Site accessible
- [ ] Paiements fonctionnels
- [ ] Emails envoyés
- [ ] Monitoring actif

### Semaine 1
- [ ] Aucune erreur critique
- [ ] Performance stable
- [ ] Premières commandes traitées
- [ ] Feedback utilisateurs collecté

### Mois 1
- [ ] Analyse des métriques
- [ ] Optimisations identifiées
- [ ] Plan d'amélioration
- [ ] Formation complétée

## KPIs à suivre

```yaml
business:
  - Nombre de commandes/jour
  - Panier moyen
  - Taux de conversion
  - Taux d'abandon panier
  - NPS (Net Promoter Score)

technical:
  - Uptime (cible: 99.9%)
  - Temps de réponse (cible: <500ms)
  - Taux d'erreur (cible: <1%)
  - Core Web Vitals

support:
  - Tickets/jour
  - Temps de résolution
  - Satisfaction client
```

## Contacts d'urgence

```yaml
urgences:
  - Responsable technique: +225 XX XX XX XX
  - Support o2Switch: support@o2switch.fr
  - CinetPay urgences: +225 XX XX XX XX
  - Yango API support: api-support@yango.com
```

## Notes d'implémentation

```
[Date] - [Développeur] - [Note]
22/07/2025 - Initialisation - Documentation de la Phase 4 créée
```