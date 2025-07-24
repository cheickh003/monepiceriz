# MonEpice&Riz - Plateforme E-commerce

## Description
MonEpice&Riz est une plateforme e-commerce moderne pour la vente en ligne de produits d'épicerie avec support des produits à poids variable, paiement mobile et livraison intégrée.

## 🚧 État du Développement (24/07/2025)

- **Phase 0** : ✅ Complétée (Fondations et configuration)
- **Phase 1** : 🚧 En cours (Backend terminé, Frontend à faire)
  - ✅ Authentification 2FA admin
  - ✅ CRUD Catégories et Produits
  - ✅ Service Storage Supabase
  - ✅ Seeders avec données démo
  - ⏳ Interface utilisateur (React/Inertia)

👉 **Pour plus de détails, voir [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md)**

## 🚀 Installation

### Prérequis
- PHP 8.2 ou supérieur
- Composer 2.x
- Node.js 18.x ou supérieur
- SQLite (développement) ou PostgreSQL (production)
- Redis (optionnel, pour le cache)

### Étapes d'installation

1. **Cloner le repository**
```bash
git clone [url-du-repo]
cd monepiceriz
```

2. **Installer les dépendances PHP**
```bash
composer install
```

3. **Installer les dépendances JavaScript**
```bash
npm install
```

4. **Configuration de l'environnement**
```bash
cp .env.example .env
php artisan key:generate
```

5. **Créer la base de données SQLite**
```bash
touch database/database.sqlite
```

6. **Lancer les migrations et seeders**
```bash
php artisan migrate:fresh --seed
```

7. **Compiler les assets**
```bash
npm run dev
```

8. **Lancer le serveur de développement**
```bash
php artisan serve
```

L'application sera accessible à l'adresse : http://localhost:8000

## 👤 Comptes de test

### Administrateur
- Email : admin@monepiceriz.com
- Mot de passe : admin123

### Manager
- Email : manager@monepiceriz.com
- Mot de passe : manager123

## 📁 Structure du projet

```
monepiceriz/
├── app/
│   ├── Domain/          # Logique métier (DDD)
│   │   ├── Catalog/     # Produits, catégories
│   │   ├── Order/       # Commandes
│   │   ├── Payment/     # Paiements
│   │   └── Shipping/    # Livraison
│   ├── Http/
│   │   └── Controllers/
│   │       └── Admin/   # Controllers admin
│   ├── Services/        # Services métier
│   └── Traits/          # Traits réutilisables
├── database/
│   ├── migrations/      # Migrations SQL
│   └── seeders/        # Données de test
├── resources/
│   ├── js/             # Components React
│   └── views/          # Vues Blade
└── docs/               # Documentation
```

## 🛠️ Technologies utilisées

### Backend
- **Laravel 11** - Framework PHP
- **Laravel Fortify** - Authentification avec 2FA
- **Inertia.js** - SPA sans API
- **Spatie Packages** - Utilitaires Laravel

### Frontend
- **React** - Interface utilisateur
- **TypeScript** - Typage statique
- **Tailwind CSS** - Styles utilitaires
- **Shadcn/ui** - Composants UI

### Base de données
- **SQLite** - Développement local
- **PostgreSQL** - Production (Supabase)

### Services externes
- **Supabase** - Base de données et stockage
- **CinetPay** - Paiement mobile
- **Yango** - Service de livraison

## 📋 Fonctionnalités principales

### Pour les clients
- Navigation par catégories
- Recherche de produits
- Panier d'achat
- Checkout simplifié (guest)
- Paiement mobile sécurisé
- Suivi de livraison

### Pour l'administration
- Tableau de bord
- Gestion des catégories
- Gestion des produits et SKUs
- Gestion des commandes
- Ajustement des poids (produits variables)
- Rapports et statistiques

## 🔒 Sécurité

- Authentification 2FA pour l'admin
- Protection CSRF
- Validation des entrées
- Chiffrement des données sensibles
- Row Level Security (PostgreSQL)
- Rate limiting sur les API

## 📚 Documentation

- [Plan d'implémentation](docs/task.md)
- [Phase 0 - Fondations](docs/phases/phase0-foundations.md)
- [Phase 1 - Core Shop](docs/phases/phase1-core-shop.md)
- [État d'implémentation](IMPLEMENTATION_STATUS.md)

## 🤝 Contribution

Ce projet est privé. Pour toute contribution, merci de contacter l'équipe de développement.

## 📝 License

Propriétaire - MonEpice&Riz © 2025