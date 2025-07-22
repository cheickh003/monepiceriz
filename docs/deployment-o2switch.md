# Guide de Déploiement o2Switch - MonEpice&Riz

**Version:** 1.0.0  
**Dernière mise à jour:** 2025-07-22  
**Documentation parente:** [structure.md](./structure.md)

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Prérequis o2Switch](#prérequis-o2switch)
3. [Build en local](#build-en-local)
4. [Préparation des fichiers](#préparation-des-fichiers)
5. [Configuration o2Switch](#configuration-o2switch)
6. [Upload et installation](#upload-et-installation)
7. [Post-déploiement](#post-déploiement)
8. [Maintenance](#maintenance)
9. [Troubleshooting](#troubleshooting)

## Vue d'ensemble

o2Switch est un hébergeur mutualisé français qui offre :
- PHP 8.2+ avec Composer préinstallé
- Accès SSH après autorisation IP
- Node.js multi-version (pour build uniquement)
- Base de données MySQL/MariaDB (pas PostgreSQL natif)
- Certificat SSL Let's Encrypt gratuit

**⚠️ IMPORTANT:** o2Switch n'a pas PostgreSQL natif. Nous utiliserons Supabase comme base de données externe.

## Prérequis o2Switch

### 1. Compte o2Switch actif
- Hébergement unique illimité
- Domaine configuré
- Accès cPanel

### 2. Autorisation SSH
1. Se connecter au cPanel
2. Aller dans "Autorisation SSH"
3. Ajouter votre IP publique
4. Attendre la validation (immédiate)

### 3. Configuration locale
- PHP 8.2+
- Node.js 18+
- Composer 2.x
- Git

## Build en local

**⚠️ IMPORTANT:** Le build DOIT être fait en local car le terminal cPanel a des limitations mémoire.

### 1. Cloner le projet
```bash
git clone [votre-repo]
cd monepiceriz
```

### 2. Installer les dépendances PHP
```bash
composer install --optimize-autoloader --no-dev
```

### 3. Configuration environnement
```bash
cp .env.example .env.production
```

Éditer `.env.production` :
```env
APP_NAME="MonEpice&Riz"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://monepiceriz.com

# Supabase (externe)
DATABASE_URL=postgres://[vos-credentials-supabase]
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_ANON_KEY=[votre-cle]
SUPABASE_SERVICE_KEY=[votre-cle]

# o2Switch paths
APP_PATH=/home/[username]/public_html
ASSET_URL=https://monepiceriz.com
```

### 4. Build des assets
```bash
# Installer les dépendances Node
npm install

# Build pour production
npm run build

# Générer la clé Laravel
php artisan key:generate --env=production

# Optimiser Laravel
php artisan config:cache --env=production
php artisan route:cache --env=production
php artisan view:cache --env=production
```

### 5. Nettoyer pour l'upload
```bash
# Supprimer node_modules (pas nécessaire en production)
rm -rf node_modules

# Supprimer les fichiers de dev
rm -rf tests
rm -rf .git
rm .gitignore
rm README.md
rm phpunit.xml
rm vite.config.js
rm package.json
rm package-lock.json
```

## Préparation des fichiers

### Structure finale pour o2Switch
```
monepiceriz/
├── app/
├── bootstrap/
├── config/
├── database/
├── public/           # Sera le document root
│   ├── build/       # Assets compilés par Vite
│   ├── index.php
│   └── .htaccess
├── resources/
├── routes/
├── storage/         # Permissions 755
├── vendor/          # Dépendances PHP
├── .env.production  # Renommer en .env sur le serveur
└── artisan
```

### Créer une archive
```bash
# Créer un zip sans node_modules et .git
zip -r monepiceriz-deploy.zip . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "*.log" \
  -x "storage/logs/*" \
  -x "storage/framework/cache/*" \
  -x "storage/framework/sessions/*" \
  -x "storage/framework/views/*"
```

## Configuration o2Switch

### 1. Connexion SSH
```bash
ssh [username]@[serveur].o2switch.net -p 22
```

### 2. Structure des dossiers
```bash
cd ~
# Structure o2Switch
# /home/[username]/
#   ├── public_html/     # Document root principal
#   ├── laravel_app/     # Application Laravel (hors web)
#   └── tmp/
```

### 3. Préparer l'installation
```bash
# Créer le dossier pour Laravel
mkdir ~/laravel_app

# Nettoyer public_html
cd ~/public_html
rm -rf *
```

## Upload et installation

### 1. Upload via FTP/SFTP
Utiliser FileZilla ou similaire :
- Hôte : [serveur].o2switch.net
- Port : 22 (SFTP)
- Identifiants : ceux du cPanel

Upload `monepiceriz-deploy.zip` dans `~/laravel_app/`

### 2. Extraction et configuration
```bash
cd ~/laravel_app
unzip monepiceriz-deploy.zip
rm monepiceriz-deploy.zip

# Renommer le fichier env
mv .env.production .env

# Permissions correctes
chmod -R 755 storage
chmod -R 755 bootstrap/cache
```

### 3. Créer les liens symboliques
```bash
# Supprimer le public_html existant
rm -rf ~/public_html

# Créer un lien symbolique vers public/
ln -s ~/laravel_app/public ~/public_html

# Vérifier
ls -la ~/public_html
```

### 4. Configuration .htaccess
Créer/éditer `~/public_html/.htaccess` :
```apache
<IfModule mod_rewrite.c>
    <IfModule mod_negotiation.c>
        Options -MultiViews -Indexes
    </IfModule>

    RewriteEngine On

    # Force HTTPS
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

    # Handle Authorization Header
    RewriteCond %{HTTP:Authorization} .
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]

    # Redirect Trailing Slashes If Not A Folder...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_URI} (.+)/$
    RewriteRule ^ %1 [L,R=301]

    # Send Requests To Front Controller...
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>

# Security Headers
Header set X-Content-Type-Options "nosniff"
Header set X-Frame-Options "DENY"
Header set X-XSS-Protection "1; mode=block"
Header set Referrer-Policy "strict-origin-when-cross-origin"

# PHP Configuration
php_value upload_max_filesize 10M
php_value post_max_size 10M
php_value max_execution_time 300
php_value max_input_time 300
```

### 5. Créer le storage public
```bash
cd ~/laravel_app
php artisan storage:link
```

## Post-déploiement

### 1. Vérifier l'installation
- Visiter https://monepiceriz.com
- Vérifier les logs : `tail -f ~/laravel_app/storage/logs/laravel.log`

### 2. Configurer les crons
Dans cPanel > Cron Jobs, ajouter :
```bash
* * * * * /usr/local/bin/php /home/[username]/laravel_app/artisan schedule:run >> /dev/null 2>&1
```

### 3. Configuration des queues
Pour les jobs asynchrones, créer un cron :
```bash
* * * * * /usr/local/bin/php /home/[username]/laravel_app/artisan queue:work --stop-when-empty >> /dev/null 2>&1
```

### 4. SSL Let's Encrypt
Dans cPanel > SSL/TLS > Manage SSL Sites :
1. Sélectionner le domaine
2. Activer AutoSSL
3. Forcer HTTPS dans .htaccess

## Maintenance

### Mise à jour de l'application

#### Option 1 : Via SSH (recommandé)
```bash
cd ~/laravel_app

# Mettre en maintenance
php artisan down

# Pull des changements (si Git est configuré)
git pull origin main

# Installer les dépendances
composer install --optimize-autoloader --no-dev

# Migrations
php artisan migrate --force

# Clear caches
php artisan cache:clear
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Sortir de maintenance
php artisan up
```

#### Option 2 : Upload manuel
1. Build en local
2. Upload uniquement les fichiers modifiés
3. Exécuter les commandes ci-dessus via SSH

### Backup
```bash
# Backup des fichiers
tar -czf ~/backup-$(date +%Y%m%d).tar.gz ~/laravel_app --exclude=vendor --exclude=node_modules

# Les backups DB sont gérés par Supabase
```

## Troubleshooting

### Erreur 500
```bash
# Vérifier les logs
tail -n 50 ~/laravel_app/storage/logs/laravel.log

# Vérifier les permissions
chmod -R 755 ~/laravel_app/storage
chmod -R 755 ~/laravel_app/bootstrap/cache

# Régénérer l'autoloader
cd ~/laravel_app
composer dump-autoload
```

### Erreur "Out of memory" lors du build
- Toujours builder en local
- Utiliser `--max-old-space-size` pour Node :
  ```bash
  NODE_OPTIONS="--max-old-space-size=4096" npm run build
  ```

### Assets non chargés
```bash
# Vérifier le lien symbolique
ls -la ~/public_html/storage

# Recréer si nécessaire
cd ~/laravel_app
php artisan storage:link
```

### Connexion Supabase échoue
- Vérifier que l'IP du serveur o2Switch n'est pas bloquée dans Supabase
- Tester la connexion :
  ```bash
  cd ~/laravel_app
  php artisan tinker
  >>> DB::connection()->getPdo();
  ```

### Performance lente
1. Activer OPcache dans cPanel
2. Utiliser Redis externe (RedisLabs) pour le cache
3. Optimiser les images via Supabase Transform
4. Activer la compression Gzip dans .htaccess

## Scripts utiles

### deploy.sh (à exécuter en local)
```bash
#!/bin/bash
echo "🚀 Déploiement MonEpice&Riz vers o2Switch"

# Build
echo "📦 Build des assets..."
npm run build

# Optimisations Laravel
echo "⚡ Optimisation Laravel..."
php artisan config:cache --env=production
php artisan route:cache --env=production
php artisan view:cache --env=production

# Création de l'archive
echo "🗜️ Création de l'archive..."
zip -r deploy-$(date +%Y%m%d-%H%M%S).zip . \
  -x "node_modules/*" \
  -x ".git/*" \
  -x "*.log" \
  -x "tests/*" \
  -x ".env" \
  -x "storage/logs/*" \
  -x "storage/framework/*/*"

echo "✅ Archive prête pour l'upload!"
```

### health-check.php (monitoring)
Créer `~/public_html/health.php` :
```php
<?php
// Health check endpoint
require __DIR__.'/../laravel_app/vendor/autoload.php';
$app = require_once __DIR__.'/../laravel_app/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Http\Kernel::class);

try {
    // Test DB
    $db = DB::connection()->getPdo();
    
    // Test cache
    Cache::put('health_check', time(), 60);
    
    http_response_code(200);
    echo json_encode([
        'status' => 'healthy',
        'timestamp' => now()->toIso8601String(),
        'checks' => [
            'database' => 'connected',
            'cache' => 'working'
        ]
    ]);
} catch (Exception $e) {
    http_response_code(503);
    echo json_encode([
        'status' => 'unhealthy',
        'error' => $e->getMessage()
    ]);
}
```

## Checklist de déploiement

### Avant le déploiement
- [ ] Tests passent en local
- [ ] Build de production réussi
- [ ] Variables d'environnement vérifiées
- [ ] Backup de l'existant (si mise à jour)

### Pendant le déploiement
- [ ] Mode maintenance activé
- [ ] Upload des fichiers
- [ ] Permissions correctes
- [ ] Liens symboliques créés
- [ ] Cache vidé et régénéré

### Après le déploiement
- [ ] Site accessible en HTTPS
- [ ] Logs sans erreurs
- [ ] Paiement test réussi
- [ ] Crons configurés
- [ ] Monitoring actif

## Support

- **o2Switch:** support@o2switch.fr
- **Documentation Laravel:** [laravel.com/docs](https://laravel.com/docs)
- **Bugs projet:** Voir [bugs.md](./bugs.md)