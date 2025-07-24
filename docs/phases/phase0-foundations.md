# Phase 0 : Pré-production et Fondations

**Durée estimée :** 1 semaine  
**Objectif :** Mettre en place tous les outils, comptes et la base du projet avant d'écrire la moindre ligne de code métier.

## Table des matières
1. [Vue d'ensemble](#vue-densemble)
2. [Tâches détaillées](#tâches-détaillées)
3. [Configuration des services](#configuration-des-services)
4. [Structure du projet](#structure-du-projet)
5. [Checklist de validation](#checklist-de-validation)

## Vue d'ensemble

La Phase 0 est cruciale pour le succès du projet. Elle établit les fondations techniques et organisationnelles sur lesquelles tout le développement reposera.

### Livrables attendus
- [ ] Fichier `.env.example` avec toutes les variables
- [ ] Projet Laravel fonctionnel connecté à Supabase
- [ ] Dépôt Git initialisé avec structure de branches
- [ ] Base de données avec tables principales
- [ ] Maquettes Figma validées

## Tâches détaillées

### P0.1 - Configuration des Services Tiers

#### Supabase
1. **Créer un projet Supabase**
   ```
   - Nom du projet : monepiceriz-production
   - Région : Europe West (Paris)
   - Mot de passe : [Générer un mot de passe fort]
   ```

2. **Configurer le schéma Laravel**
   ```sql
   -- Exécuter dans le SQL Editor de Supabase
   CREATE SCHEMA IF NOT EXISTS laravel;
   CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
   CREATE EXTENSION IF NOT EXISTS "pgcrypto";
   CREATE EXTENSION IF NOT EXISTS "pg_trgm";
   
   -- Configuration du search_path
   ALTER DATABASE postgres SET search_path TO laravel, public, extensions;
   ```

3. **Créer le bucket Storage pour les images**
   ```sql
   INSERT INTO storage.buckets (id, name, public)
   VALUES ('products', 'products', true);
   ```

#### CinetPay
1. **Créer un compte marchand**
   - S'inscrire sur [www.cinetpay.com](https://www.cinetpay.com)
   - Valider le compte marchand
   - Noter l'API Key et le Site ID

2. **Configuration du mode test**
   - Activer le mode test dans l'espace marchand
   - Configurer les URLs de retour

#### Yango API
1. **Demander l'accès API**
   - Contacter Yango Business
   - Obtenir les credentials API
   - Documentation des endpoints disponibles

### P0.2 - Initialisation du Projet Laravel

```bash
# Installation Laravel 11
composer create-project laravel/laravel:^11.0 .

# Installation Breeze avec Inertia et React TypeScript
composer require laravel/breeze --dev
php artisan breeze:install react --typescript

# Installation des dépendances front-end
npm install
npm install -D @types/react @types/react-dom

# Installation Tailwind et Shadcn/ui dependencies
npm install tailwindcss-animate class-variance-authority clsx tailwind-merge
npm install lucide-react @radix-ui/react-dialog @radix-ui/react-dropdown-menu
npm install @radix-ui/react-label @radix-ui/react-select @radix-ui/react-slot

# Installation des packages backend
composer require guzzlehttp/guzzle
composer require doctrine/dbal
composer require laravel/horizon
composer require predis/predis
composer require spatie/laravel-data
composer require spatie/laravel-query-builder
```

### P0.3 - Mise en place du Git

1. **Créer le fichier .gitignore**
   ```gitignore
   /node_modules
   /public/build
   /public/hot
   /public/storage
   /storage/*.key
   /vendor
   .env
   .env.backup
   .env.production
   .phpunit.result.cache
   Homestead.json
   Homestead.yaml
   auth.json
   npm-debug.log
   yarn-error.log
   /.fleet
   /.idea
   /.vscode
   .DS_Store
   Thumbs.db
   ```

2. **Initialiser Git et créer les branches**
   ```bash
   git init
   git add .
   git commit -m "Initial commit: MonEpice&Riz e-commerce project"
   git branch develop
   git checkout develop
   ```

### P0.4 - Migrations Initiales

Créer toutes les migrations basées sur le schéma défini dans `structure.md`:

1. **Users (Personnel administratif)**
2. **Categories**
3. **Products**
4. **Product SKUs**
5. **Product Attributes**
6. **Customers**
7. **Orders**
8. **Order Items**
9. **Audit Logs**
10. **Payment Logs**

### P0.5 - Conception UI/UX

1. **Design System**
   - Palette de couleurs
   - Typographie
   - Composants Shadcn/ui
   - Grille et espacement

2. **Wireframes des pages clés**
   - Page d'accueil
   - Liste des produits
   - Détail produit
   - Panier
   - Checkout
   - Dashboard admin

## Configuration des services

### Variables d'environnement (.env.example)

```env
#===========================================
# APPLICATION
#===========================================
APP_NAME="MonEpice&Riz"
APP_ENV=local
APP_DEBUG=true
APP_URL=http://localhost

#===========================================
# SUPABASE DATABASE
#===========================================
DB_CONNECTION=pgsql
DATABASE_URL=
DB_HOST=
DB_PORT=5432
DB_DATABASE=postgres
DB_USERNAME=postgres
DB_PASSWORD=
DB_SCHEMA=laravel

# Supabase Services
SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_KEY=
SUPABASE_STORAGE_BUCKET=products

#===========================================
# REDIS (Cache & Queue)
#===========================================
REDIS_HOST=127.0.0.1
REDIS_PASSWORD=null
REDIS_PORT=6379

#===========================================
# CINETPAY PAYMENT
#===========================================
CINETPAY_API_KEY=
CINETPAY_SITE_ID=
CINETPAY_SECRET_KEY=
CINETPAY_MODE=TEST

#===========================================
# YANGO DELIVERY
#===========================================
YANGO_API_KEY=
YANGO_API_URL=
YANGO_WEBHOOK_SECRET=
YANGO_MIN_ORDER_AMOUNT=3000
```

## Structure du projet

```
monepiceriz/
├── app/
│   ├── Domain/
│   │   ├── Catalog/
│   │   ├── Order/
│   │   ├── Payment/
│   │   └── Shipping/
│   ├── Http/
│   ├── Infrastructure/
│   └── Support/
├── config/
│   ├── cinetpay.php
│   ├── supabase.php
│   ├── security.php
│   └── shop.php
├── database/
│   ├── migrations/
│   └── seeders/
├── resources/
│   ├── js/
│   │   ├── Components/
│   │   ├── Layouts/
│   │   └── Pages/
│   └── css/
└── [autres fichiers]
```

## Checklist de validation

### Services tiers
- [ ] Projet Supabase créé et configuré
- [ ] Schéma Laravel créé dans Supabase
- [ ] Bucket storage configuré
- [ ] Compte CinetPay validé
- [ ] API Key et Site ID CinetPay obtenus
- [ ] Accès API Yango obtenu

### Projet Laravel
- [ ] Laravel 11 installé
- [ ] Inertia.js avec React TypeScript configuré
- [ ] Tailwind CSS et dépendances installés
- [ ] Connexion Supabase testée
- [ ] Structure de dossiers créée

### Git et documentation
- [ ] Repository Git initialisé
- [ ] Branches main et develop créées
- [ ] .gitignore configuré
- [ ] .env.example complet
- [ ] Documentation à jour

### Base de données
- [ ] Toutes les migrations créées
- [ ] Migrations exécutées avec succès
- [ ] Index et contraintes vérifiés
- [ ] RLS configuré sur les tables sensibles

### Design
- [ ] Design system défini
- [ ] Wireframes créés
- [ ] Composants UI documentés

## Prochaines étapes

Une fois la Phase 0 complétée et validée, nous pourrons passer à la [Phase 1 : Développement du Cœur de la Boutique](./phase1-core-shop.md).

## Notes d'implémentation

```
[Date] - [Développeur] - [Note]
22/07/2025 - Initialisation - Documentation de la Phase 0 créée
```